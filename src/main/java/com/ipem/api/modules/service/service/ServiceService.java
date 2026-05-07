package com.ipem.api.modules.service.service;

import com.ipem.api.modules.service.dto.CheckInOutRequestDTO;
import com.ipem.api.modules.service.dto.ServiceReportEntryDTO;
import com.ipem.api.modules.service.dto.ServiceReportMonthDTO;
import com.ipem.api.modules.service.model.Service;
import com.ipem.api.modules.service.model.enums.Priority;
import com.ipem.api.modules.service.repository.ServiceRepository;
import com.ipem.api.modules.user.repository.UserRepository;
import com.ipem.api.modules.vehicle.model.enums.VehicleStatus;
import com.ipem.api.modules.vehicle.repository.CarRepository;
import jakarta.persistence.EntityManager;
import org.hibernate.envers.AuditReader;
import org.hibernate.envers.AuditReaderFactory;
import org.hibernate.envers.RevisionType;
import org.hibernate.envers.query.AuditEntity;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Camada de serviço para regras de negócio relacionadas a Atendimentos.
 */
@org.springframework.stereotype.Service
public class ServiceService {

    private final ServiceRepository serviceRepository;
    private final CarRepository carRepository;
    private final UserRepository userRepository;
    private final EntityManager entityManager; // Necessário para consultas de auditoria

    public ServiceService(ServiceRepository serviceRepository, CarRepository carRepository,
                          UserRepository userRepository, EntityManager entityManager) {
        this.serviceRepository = serviceRepository;
        this.carRepository = carRepository;
        this.userRepository = userRepository;
        this.entityManager = entityManager;
    }

    /**
     * Inicia um serviço: valida veículo/usuário, cria o registro e define status como ativo.
     */
    @Transactional
    public Service startService(CheckInOutRequestDTO dto) {
        var car = carRepository.findById(dto.carPrefix())
                .orElseThrow(() -> new RuntimeException("Veículo não encontrado: " + dto.carPrefix()));

        var user = userRepository.findById(dto.userRegistration())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado: " + dto.userRegistration()));

        Service newService = Service.builder()
                .car(car)
                .user(user)
                .departureTime(LocalDateTime.now())
                .departureKm(dto.recordKm())
                .description(dto.note())
                .priority(dto.priority() != null ? dto.priority() : Priority.MEDIUM)
                .isActive(true) // Define o serviço como em andamento
                .build();

        // Opcional: car.setVehicleStatus(VehicleStatus.IN_USE);

        return serviceRepository.save(newService);
    }

    /**
     * Finaliza o serviço: registra KM final, data de chegada e libera o veículo.
     */
    @Transactional
    public Service finishService(Long serviceId, Float kmFinal) {
        Service service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Serviço não encontrado: " + serviceId));

        service.setArrivalTime(LocalDateTime.now());
        service.setCompletionTime(LocalDateTime.now());
        service.setArrivalKm(kmFinal);
        service.setIsActive(false); // Marca como finalizado

        // Atualiza os dados do veículo associado
        var car = service.getCar();
        car.setCurrentKm(kmFinal);
        car.setVehicleStatus(VehicleStatus.AVAILABLE); // Torna o carro disponível novamente

        carRepository.save(car);
        return serviceRepository.save(service);
    }

    /**
     * Gera uma lista de relatórios mensais baseada em um intervalo de meses.
     */
    public List<ServiceReportMonthDTO> getMonthlyServiceReports(int months) {
        var formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        var monthNameFormatter = DateTimeFormatter.ofPattern("MMMM", new Locale("pt", "BR"));
        var reports = new ArrayList<ServiceReportMonthDTO>();

        // Itera retroativamente pelos meses solicitados
        for (int offset = months - 1; offset >= 0; offset--) {
            YearMonth yearMonth = YearMonth.now().minusMonths(offset);
            var start = yearMonth.atDay(1).atStartOfDay();
            var end = yearMonth.atEndOfMonth().plusDays(1).atStartOfDay();

            // Busca serviços iniciados naquele intervalo de tempo
            var services = serviceRepository.findByDepartureTimeBetween(start, end);

            int totalCalls = services.size();
            int completedCalls = (int) services.stream().filter(s -> s.getCompletionTime() != null).count();
            int openCalls = totalCalls - completedCalls;

            // Formata o nome do mês (ex: "Janeiro")
            String monthLabel = yearMonth.format(monthNameFormatter);
            monthLabel = monthLabel.substring(0, 1).toUpperCase() + monthLabel.substring(1);

            boolean isCurrentMonth = yearMonth.equals(YearMonth.now());
            String status = isCurrentMonth
                    ? (openCalls > 0 ? "Mês de " + monthLabel + " ainda em aberto" : "Mês de " + monthLabel + " fechado")
                    : (openCalls > 0 ? monthLabel + " com pendências" : monthLabel + " fechado");

            // Converte entidades para DTOs de relatório
            var entries = new ArrayList<ServiceReportEntryDTO>();
            for (var service : services) {
                entries.add(new ServiceReportEntryDTO(
                        service.getId(),
                        service.getCar() != null ? service.getCar().getPrefix() : "",
                        service.getUser() != null ? service.getUser().getRegistration() : "",
                        service.getUser() != null ? service.getUser().getName() : "",
                        service.getDescription(),
                        service.getDepartureTime() != null ? formatter.format(service.getDepartureTime()) : "",
                        service.getArrivalTime() != null ? formatter.format(service.getArrivalTime()) : "",
                        service.getCompletionTime() != null ? formatter.format(service.getCompletionTime()) : "",
                        service.getCompletionTime() != null ? "Finalizado" : "Aberto",
                        service.getDepartureKm(),
                        service.getArrivalKm(),
                        service.getDestinationRequester()
                ));
            }

            reports.add(new ServiceReportMonthDTO(monthLabel, yearMonth.getYear(), totalCalls, completedCalls, openCalls, isCurrentMonth, status, entries));
        }
        return reports;
    }

    /**
     * Consulta as tabelas de auditoria (Envers) para ver quem alterou o quê no Service.
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAttendanceAuditHistory() {
        AuditReader auditReader = AuditReaderFactory.get(entityManager);

        List<?> revisions = auditReader.createQuery()
                .forRevisionsOfEntity(Service.class, false, true)
                .addOrder(AuditEntity.revisionNumber().desc())
                .setMaxResults(100)
                .getResultList();

        List<Map<String, Object>> historyList = new ArrayList<>();

        for (Object item : revisions) {
            Object[] revision = (Object[]) item;
            Service entity = (Service) revision[0];
            RevisionType revisionType = (RevisionType) revision[2];

            Map<String, Object> dto = new HashMap<>();

            Map<String, Object> entityData = new HashMap<>();
            entityData.put("id", entity.getId());
            entityData.put("departureTime", entity.getDepartureTime());
            entityData.put("completionTime", entity.getCompletionTime());
            entityData.put("destinationRequester", entity.getDestinationRequester());
            entityData.put("description", entity.getDescription());

            if (entity.getPriority() != null) {
                entityData.put("priority", entity.getPriority().name());
            }
            entityData.put("expectedCompletionTime", entity.getExpectedCompletionTime());

            if (entity.getCar() != null) {
                entityData.put("car", Map.of("prefix", entity.getCar().getPrefix()));
            }

            if (entity.getUser() != null) {
                entityData.put("user", Map.of(
                        "registration", entity.getUser().getRegistration(),
                        "name", entity.getUser().getName()
                ));
            }

            dto.put("entity", entityData);
            dto.put("revisionType", revisionType.name());

            historyList.add(dto);
        }

        return historyList;
    }

    /**
     * Busca no banco o registro ativo vinculado à matrícula do usuário.
     */
    public Service findActiveServiceByUser(String registration) {
        return serviceRepository.findByUserRegistrationAndIsActiveTrue(registration).orElse(null);
    }
}