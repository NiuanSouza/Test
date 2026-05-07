package com.ipem.api.modules.service.service;

import com.ipem.api.modules.service.dto.DashboardMetricsDTO;
import com.ipem.api.modules.service.dto.ServiceReportEntryDTO;
import com.ipem.api.modules.service.dto.ServiceReportMonthDTO;
import com.ipem.api.modules.service.repository.RefuelingRepository;
import com.ipem.api.modules.service.repository.ServiceRepository;
import com.ipem.api.modules.user.model.enums.EmployeeStatus;
import com.ipem.api.modules.user.repository.UserRepository;
import com.ipem.api.modules.vehicle.model.enums.VehicleStatus;
import com.ipem.api.modules.vehicle.repository.CarRepository;
import jakarta.persistence.EntityManager;
import org.hibernate.envers.AuditReader;
import org.hibernate.envers.AuditReaderFactory;
import org.hibernate.envers.DefaultRevisionEntity;
import org.hibernate.envers.RevisionType;
import org.hibernate.envers.query.AuditEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Serviço de Inteligência e Analítica.
 * Centraliza métricas, relatórios gerenciais e histórico de auditoria.
 */
@Service
public class DashboardService {

    private final CarRepository carRepository;
    private final UserRepository userRepository;
    private final RefuelingRepository refuelingRepository;
    private final ServiceRepository serviceRepository;
    private final EntityManager entityManager;

    public DashboardService(CarRepository carRepository, UserRepository userRepository,
                            RefuelingRepository refuelingRepository, ServiceRepository serviceRepository,
                            EntityManager entityManager) {
        this.carRepository = carRepository;
        this.userRepository = userRepository;
        this.refuelingRepository = refuelingRepository;
        this.serviceRepository = serviceRepository;
        this.entityManager = entityManager;
    }

    /**
     * Consolida os KPIs principais para os cards do Dashboard.
     */
    public DashboardMetricsDTO getMetrics() {
        Double spend = refuelingRepository.sumMonthlyFuelSpend();
        Double avgPrice = refuelingRepository.avgMonthlyPricePerLiter();
        Double liters = refuelingRepository.sumMonthlyLiters();

        return new DashboardMetricsDTO(
                Optional.ofNullable(carRepository.countByStatus(VehicleStatus.AVAILABLE)).orElse(0L),
                Optional.ofNullable(carRepository.countByStatus(VehicleStatus.MAINTENANCE)).orElse(0L),
                Optional.ofNullable(carRepository.countByStatus(VehicleStatus.IN_USE)).orElse(0L),
                userRepository.countTechniciansByStatus(EmployeeStatus.AVAILABLE),
                userRepository.countTechniciansByStatus(EmployeeStatus.ON_DUTY),
                Optional.ofNullable(spend).orElse(0.0),
                Optional.ofNullable(avgPrice).orElse(0.0),
                Optional.ofNullable(liters).orElse(0.0)
        );
    }

    /**
     * Recupera a linha do tempo de alterações (Auditoria) dos serviços.
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getServiceAuditHistory() {
        AuditReader auditReader = AuditReaderFactory.get(entityManager);

        List<?> revisions = auditReader.createQuery()
                .forRevisionsOfEntity(com.ipem.api.modules.service.model.Service.class, false, true)
                .addOrder(AuditEntity.revisionNumber().desc())
                .setMaxResults(100)
                .getResultList();

        List<Map<String, Object>> historyList = new ArrayList<>();

        for (Object item : revisions) {
            Object[] revision = (Object[]) item;
            com.ipem.api.modules.service.model.Service entity = (com.ipem.api.modules.service.model.Service) revision[0];
            DefaultRevisionEntity revisionEntity = (DefaultRevisionEntity) revision[1];
            RevisionType revisionType = (RevisionType) revision[2];

            Map<String, Object> dto = new HashMap<>();
            Map<String, Object> entityData = new HashMap<>();

            entityData.put("id", entity.getId());
            entityData.put("departureTime", entity.getDepartureTime());
            entityData.put("completionTime", entity.getCompletionTime());
            entityData.put("description", entity.getDescription());

            if (entity.getCar() != null) entityData.put("car", Map.of("prefix", entity.getCar().getPrefix()));
            if (entity.getUser() != null) entityData.put("user", Map.of("name", entity.getUser().getName(), "registration", entity.getUser().getRegistration()));

            dto.put("entity", entityData);
            dto.put("revisionType", revisionType.name());
            dto.put("revisionDate", revisionEntity.getRevisionDate());

            historyList.add(dto);
        }
        return historyList;
    }

    /**
     * Gera os dados para os relatórios mensais.
     */
    public List<ServiceReportMonthDTO> getMonthlyServiceReports(int months) {
        var formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        var reports = new ArrayList<ServiceReportMonthDTO>();

        for (int offset = months - 1; offset >= 0; offset--) {
            YearMonth yearMonth = YearMonth.now().minusMonths(offset);
            var start = yearMonth.atDay(1).atStartOfDay();
            var end = yearMonth.atEndOfMonth().plusDays(1).atStartOfDay();

            var services = serviceRepository.findByDepartureTimeBetweenAndIsActiveTrue(start, end);

            var entries = new ArrayList<ServiceReportEntryDTO>();
            for (var s : services) {
                entries.add(new ServiceReportEntryDTO(
                        s.getId(),
                        s.getCar() != null ? s.getCar().getPrefix() : "",
                        s.getUser() != null ? s.getUser().getRegistration() : "",
                        s.getUser() != null ? s.getUser().getName() : "",
                        s.getDescription(),
                        s.getDepartureTime() != null ? formatter.format(s.getDepartureTime()) : "",
                        s.getArrivalTime() != null ? formatter.format(s.getArrivalTime()) : "",
                        s.getCompletionTime() != null ? formatter.format(s.getCompletionTime()) : "",
                        s.getCompletionTime() != null ? "Finalizado" : "Aberto",
                        s.getDepartureKm(),
                        s.getArrivalKm(),
                        s.getDestinationRequester()
                ));
            }
            reports.add(new ServiceReportMonthDTO(yearMonth.getMonth().name(), yearMonth.getYear(), services.size(), 0, 0, false, "", entries));
        }
        return reports;
    }
}