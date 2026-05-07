package com.ipem.api.modules.service.service;

import com.ipem.api.modules.service.dto.DashboardMetricsDTO;
import com.ipem.api.modules.service.repository.RefuelingRepository;
import com.ipem.api.modules.user.model.enums.EmployeeStatus;
import com.ipem.api.modules.user.repository.UserRepository;
import com.ipem.api.modules.vehicle.model.enums.VehicleStatus;
import com.ipem.api.modules.vehicle.repository.CarRepository;
import org.springframework.stereotype.Service;

/**
 * Serviço responsável por consolidar as métricas gerais do sistema.
 * Agrega dados de veículos, usuários (técnicos) e abastecimentos para o Dashboard.
 */
@Service
public class DashboardService {

    private final CarRepository carRepository;
    private final UserRepository userRepository;
    private final RefuelingRepository refuelingRepository;

    public DashboardService(CarRepository carRepository, UserRepository userRepository, RefuelingRepository refuelingRepository) {
        this.carRepository = carRepository;
        this.userRepository = userRepository;
        this.refuelingRepository = refuelingRepository;
    }

    /**
     * Coleta e retorna os indicadores de desempenho (KPIs) atuais.
     * @return DashboardMetricsDTO contendo contagens de status e dados financeiros de combustível.
     */
    public DashboardMetricsDTO getMetrics() {
        // Coleta métricas de abastecimento (Soma financeira, média de preço e total de litros)
        // Nota: Se o repositório retornar null (sem registros no mês), o Java fará o unboxing para 0.0 em tipos primitivos double.
        double monthlyFuelSpend = refuelingRepository.sumMonthlyFuelSpend();
        double averagePricePerLiter = refuelingRepository.avgMonthlyPricePerLiter();
        double totalLitersRefueled = refuelingRepository.sumMonthlyLiters();

        // Coleta contagem de veículos por status
        // Usamos Long (Wrapper) para permitir a verificação de nulidade antes de converter para o DTO
        Long available = carRepository.countByStatus(VehicleStatus.AVAILABLE);
        Long maintenance = carRepository.countByStatus(VehicleStatus.MAINTENANCE);
        Long inUse = carRepository.countByStatus(VehicleStatus.IN_USE);

        // Retorna o DTO consolidado
        return new DashboardMetricsDTO(
                // Tratamento de segurança: se o count for nulo, define como 0
                available != null ? available : 0L,
                maintenance != null ? maintenance : 0L,
                inUse != null ? inUse : 0L,

                // Métricas de pessoal: Técnicos disponíveis vs. em serviço
                userRepository.countTechniciansByStatus(EmployeeStatus.AVAILABLE),
                userRepository.countTechniciansByStatus(EmployeeStatus.ON_DUTY),

                // Dados financeiros e de consumo
                monthlyFuelSpend,
                averagePricePerLiter,
                totalLitersRefueled
        );
    }
}