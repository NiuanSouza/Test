package com.ipem.api.modules.service.service;

import com.ipem.api.modules.service.dto.CheckInOutRequestDTO;
import com.ipem.api.modules.service.dto.ServiceReportEntryDTO;
import com.ipem.api.modules.service.dto.ServiceReportMonthDTO;
import com.ipem.api.modules.service.model.Service;
import com.ipem.api.modules.service.model.Record;
import com.ipem.api.modules.service.model.Refueling;
import com.ipem.api.modules.service.model.enums.Priority;
import com.ipem.api.modules.service.model.enums.RecordType;
import com.ipem.api.modules.service.repository.RecordRepository;
import com.ipem.api.modules.service.repository.RefuelingRepository;
import com.ipem.api.modules.service.repository.ServiceRepository;
import com.ipem.api.modules.user.repository.UserRepository;
import com.ipem.api.modules.vehicle.model.enums.VehicleStatus;
import com.ipem.api.modules.vehicle.repository.CarRepository;
import jakarta.persistence.EntityManager;
import org.hibernate.envers.AuditReader;
import org.hibernate.envers.AuditReaderFactory;
import org.hibernate.envers.DefaultRevisionEntity;
import org.hibernate.envers.RevisionType;
import org.hibernate.envers.query.AuditEntity;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Camada de serviço (Regra de Negócio) para a gestão de Chamados da Frota.
 * Responsável por controlar check-ins, check-outs, abastecimentos,
 * geração de relatórios mensais e auditoria do histórico (Envers).
 */
@org.springframework.stereotype.Service
public class ServiceService {

    private final ServiceRepository serviceRepository;
    private final CarRepository carRepository;
    private final UserRepository userRepository;
    private final RecordRepository recordRepository;
    private final RefuelingRepository refuelingRepository;
    private final EntityManager entityManager;

    /**
     * Injeção de dependências via construtor (Melhor prática do Spring, garante imutabilidade).
     */
    public ServiceService(ServiceRepository serviceRepository, CarRepository carRepository,
                          UserRepository userRepository, RecordRepository recordRepository,
                          RefuelingRepository refuelingRepository, EntityManager entityManager) {
        this.serviceRepository = serviceRepository;
        this.carRepository = carRepository;
        this.userRepository = userRepository;
        this.recordRepository = recordRepository;
        this.refuelingRepository = refuelingRepository;
        this.entityManager = entityManager;
    }

    /**
     * INICIAR SERVIÇO (Check-in)
     * Registra a saída de um veículo.
     * @param dto DTO contendo os dados iniciais informados pelo técnico.
     * @return O serviço criado e persistido no banco.
     */
    @Transactional
    public Service startService(CheckInOutRequestDTO dto) {
        // Valida se o carro e o usuário existem no banco de dados
        var car = carRepository.findById(dto.carPrefix())
                .orElseThrow(() -> new RuntimeException("Veículo não encontrado."));
        var user = userRepository.findById(dto.userRegistration())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado."));

        // Monta a nova entidade usando o padrão Builder
        Service newService = Service.builder()
                .car(car)
                .user(user)
                .departureTime(LocalDateTime.now()) // Carimba a hora atual de saída
                .departureKm(dto.recordKm())
                .description(dto.note())
                .priority(dto.priority() != null ? dto.priority() : Priority.MEDIUM)
                .build();

        newService.setIsActive(true); // Marca o serviço como "Em Andamento"
        return serviceRepository.save(newService);
    }

    /**
     * FINALIZAR SERVIÇO (Check-out)
     * Registra o retorno de um veículo e o libera no sistema.
     * @param serviceId ID do chamado a ser encerrado.
     * @param kmFinal Quilometragem de chegada.
     * @return O serviço atualizado e encerrado.
     */
    @Transactional
    public Service finishService(Long serviceId, Float kmFinal) {
        // Recupera o serviço ativo
        Service service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Serviço não encontrado."));

        // Preenche os dados de conclusão
        service.setArrivalTime(LocalDateTime.now());
        service.setCompletionTime(LocalDateTime.now());
        service.setArrivalKm(kmFinal);
        service.setIsActive(false); // Remove o status de "Em andamento"

        // Atualiza a viatura: Registra a nova KM e libera o status dela
        var car = service.getCar();
        car.setCurrentKm(kmFinal);
        car.setVehicleStatus(VehicleStatus.AVAILABLE);
        carRepository.save(car);

        return serviceRepository.save(service);
    }

    /**
     * REGISTRO DE ABASTECIMENTO VINCULADO AO SERVIÇO
     * Cria um registro duplo: Um "Record" genérico na linha do tempo do serviço
     * e uma entidade "Refueling" contendo os dados financeiros.
     */
    @Transactional
    public void registerFuel(Long serviceId, Double liters, Double totalValue, String dateString) {
        Service service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Serviço ativo não encontrado."));

        // Converte a data enviada pelo Frontend ou usa a data atual como fallback
        LocalDateTime fuelDate = dateString != null ? LocalDateTime.parse(dateString) : LocalDateTime.now();

        // 1. Cria o evento genérico na linha do tempo do serviço
        Record record = new Record();
        record.setService(service);
        record.setRecordType(RecordType.REFUELING);
        record.setRecordDate(fuelDate);
        record.setRecordKm(service.getCar() != null ? service.getCar().getCurrentKm() : 0f);
        record.setNote("Abastecimento em serviço");
        record = recordRepository.save(record);

        // 2. Cria o registro financeiro e volumétrico do abastecimento
        Refueling fuel = new Refueling();
        fuel.setRecord(record); // Vincula o abastecimento ao evento criado acima
        fuel.setLiters(liters.floatValue());
        fuel.setTotalAmount(totalValue);

        // Calcula dinamicamente o preço do litro para o Dashboard não quebrar
        if (liters != null && liters > 0) {
            fuel.setPricePerLiter(totalValue / liters);
        }

        refuelingRepository.save(fuel);
    }

    /**
     * GERAÇÃO DE RELATÓRIOS MENSAIS
     * Vasculha o banco retroativamente para agrupar os chamados mês a mês.
     * @param months Quantos meses para trás devem ser gerados.
     * @return Lista de relatórios formatados para a tabela do Frontend.
     */
    public List<ServiceReportMonthDTO> getMonthlyServiceReports(int months) {
        var formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        var monthNameFormatter = DateTimeFormatter.ofPattern("MMMM", new Locale("pt", "BR"));
        var reports = new ArrayList<ServiceReportMonthDTO>();

        // Loop que anda de trás para frente (Ex: de 6 meses atrás até o mês 0 [atual])
        for (int offset = months - 1; offset >= 0; offset--) {
            YearMonth yearMonth = YearMonth.now().minusMonths(offset);

            // Define a janela de tempo: Dia 1 às 00:00 até o último dia do mês
            var start = yearMonth.atDay(1).atStartOfDay();
            var end = yearMonth.atEndOfMonth().plusDays(1).atStartOfDay();

            // Busca os chamados que ocorreram nesta janela de tempo
            var services = serviceRepository.findByDepartureTimeBetweenAndIsActiveTrue(start, end);

            // Cálculos de KPIs daquele mês
            int totalCalls = services.size();
            int completedCalls = (int) services.stream().filter(s -> s.getCompletionTime() != null).count();
            int openCalls = totalCalls - completedCalls;

            // Transforma "maio" em "Maio"
            String monthLabel = yearMonth.format(monthNameFormatter);
            monthLabel = monthLabel.substring(0, 1).toUpperCase() + monthLabel.substring(1);

            boolean isCurrentMonth = yearMonth.equals(YearMonth.now());

            // Gera um texto de status amigável sobre o fechamento do mês
            String status = isCurrentMonth
                    ? openCalls > 0 ? String.format("O mês de %s ainda não foi fechado", monthLabel) : String.format("O mês de %s foi fechado", monthLabel)
                    : openCalls > 0 ? String.format("Mês de %s com %d chamados em aberto", monthLabel, openCalls) : String.format("Mês de %s fechado", monthLabel);

            // Converte a lista de Entidades do banco para a lista de DTOs do Frontend
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
                        service.getCompletionTime() != null ? "Finalizado" : "Em andamento",
                        service.getDepartureKm(),
                        service.getArrivalKm(),
                        service.getDestinationRequester()
                ));
            }
            // Adiciona o mês processado à lista final
            reports.add(new ServiceReportMonthDTO(monthLabel, yearMonth.getYear(), totalCalls, completedCalls, openCalls, isCurrentMonth, status, entries));
        }
        return reports;
    }

    /**
     * HISTÓRICO DE AUDITORIA (Envers)
     * Busca os últimos registros criados/alterados na tabela 'service_aud'.
     * @return Lista de mapas contendo os dados da auditoria (data, tipo, entidade).
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getServiceAuditHistory() {
        AuditReader auditReader = AuditReaderFactory.get(entityManager);

        // Cria a query para buscar as revisões da entidade Service
        List<?> revisions = auditReader.createQuery()
                .forRevisionsOfEntity(Service.class, false, true)
                .addOrder(AuditEntity.revisionNumber().desc()) // Ordem Decrescente (Mais recentes no topo)
                .setMaxResults(100) // Limite de performance
                .getResultList();

        List<Map<String, Object>> historyList = new ArrayList<>();

        for (Object item : revisions) {
            Object[] revision = (Object[]) item;

            // Posição 0: A entidade com os dados naquele momento do tempo
            Service entity = (Service) revision[0];
            // Posição 1: O objeto de revisão (contém data e hora da alteração)
            DefaultRevisionEntity revisionEntity = (DefaultRevisionEntity) revision[1];
            // Posição 2: O tipo de revisão (ADD, MOD, DEL)
            RevisionType revisionType = (RevisionType) revision[2];

            Map<String, Object> dto = new HashMap<>();
            Map<String, Object> entityData = new HashMap<>();

            // Preenchimento manual de dados para evitar problemas de proxy do Hibernate
            entityData.put("id", entity.getId());
            entityData.put("departureTime", entity.getDepartureTime());
            entityData.put("completionTime", entity.getCompletionTime());
            entityData.put("destinationRequester", entity.getDestinationRequester());
            entityData.put("description", entity.getDescription());

            if (entity.getPriority() != null) {
                entityData.put("priority", entity.getPriority().name());
            }

            if (entity.getCar() != null) {
                entityData.put("car", Map.of("prefix", entity.getCar().getPrefix()));
            }

            if (entity.getUser() != null) {
                entityData.put("user", Map.of(
                        "registration", entity.getUser().getRegistration(),
                        "name", entity.getUser().getName()
                ));
            }

            // Anexa os metadados da auditoria junto com os dados da entidade
            dto.put("entity", entityData);
            dto.put("revisionType", revisionType.name());
            dto.put("revisionDate", revisionEntity.getRevisionDate());

            historyList.add(dto);
        }
        return historyList;
    }

    /**
     * BUSCA DE SERVIÇO ATIVO DO USUÁRIO
     * Usado na inicialização do Frontend para restaurar a tela do técnico
     * caso ele tenha um serviço não finalizado.
     */
    public Service findActiveServiceByUser(String registration) {
        return serviceRepository.findByUserRegistrationAndIsActiveTrue(registration).orElse(null);
    }
}