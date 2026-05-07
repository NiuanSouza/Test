/**
 * js/dashboard.js
 * Responsável por: Carregar KPIs (métricas) e Resumo do Histórico na tela inicial do Gestor.
 */

// ===================================================================
// 1. CARREGAR MÉTRICAS (KPIs)
// ===================================================================
async function carregarMetricasDashboard() {
    try {
        const response = await apiFetch("/dashboard/metrics");
        if (!response) return; // basic.js já lidou com token expirado/redirect

        if (!response.ok) {
            const erroTexto = await response.text();
            // Usa o UI de erro global do basic.js
            window.exibirErro(`Status HTTP: ${response.status}`, erroTexto, ".quadros-container");
            return;
        }

        const metricas = await response.json();

        // Funções auxiliares para formatação
        const formatarMoeda = (valor) => `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        const formatarNumero = (valor) => valor.toLocaleString('pt-BR');

        // Mapeia os IDs do HTML diretamente com as chaves do JSON
        const mapaMetricas = {
            "val-disponiveis": metricas.availableCars,
            "val-manutencao": metricas.maintenanceCars,
            "val-uso": metricas.inUseCars,
            "val-tecnicos-disp": metricas.availableTechnicians,
            "val-tecnicos-serv": metricas.onDutyTechnicians,
            "val-gasto-mensal": metricas.monthlyFuelSpend !== undefined ? formatarMoeda(metricas.monthlyFuelSpend) : undefined,
            "val-preco-litro": metricas.averagePricePerLiter !== undefined ? formatarMoeda(metricas.averagePricePerLiter) : undefined,
            "val-litros": metricas.totalLitersRefueled !== undefined ? `${formatarNumero(metricas.totalLitersRefueled)} L` : undefined
        };

        // Aplica todos os valores no DOM em um único loop seguro
        Object.entries(mapaMetricas).forEach(([id, valor]) => {
            if (valor !== undefined) {
                const el = document.getElementById(id);
                if (el) el.textContent = valor;
            }
        });

    } catch (error) {
        window.exibirErro("Falha de Comunicação", error.message, ".quadros-container");
    }
}

// ===================================================================
// 2. CARREGAR RESUMO DE HISTÓRICO (Últimas 5 auditorias)
// ===================================================================
async function carregarResumoHistorico() {
    const container = document.getElementById("chamados-recentes-lista");
    if (!container) return;

    try {
        const response = await apiFetch("/dashboard/history");
        if (!response) return;

        if (!response.ok) {
            container.innerHTML = `<div class="nenhum-registro" style="color:red;">Erro ${response.status} ao carregar histórico.</div>`;
            return;
        }

        const data = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
            container.innerHTML = `<div class="nenhum-registro">Nenhum chamado registrado no histórico.</div>`;
            return;
        }

        // Atualiza pequenos contadores da UI (se existirem na tela)
        const ativos = data.filter(rev => rev.entity && rev.entity.completionTime === null).length;
        const concluidos = data.filter(rev => rev.entity && rev.entity.completionTime !== null).length;

        if (document.getElementById("resumo-ativos")) document.getElementById("resumo-ativos").textContent = ativos;
        if (document.getElementById("resumo-concluidos")) document.getElementById("resumo-concluidos").textContent = concluidos;

        // Renderiza apenas as 5 atualizações mais recentes
        const recentesHtml = data.slice(0, 5).map(rev => {
            if (!rev.entity) return "";

            const isFinalizado = rev.entity.completionTime !== null;
            const statusStr = isFinalizado ? "finalizado" : "andamento";
            const statusLabelStr = isFinalizado ? "Finalizado" : "Em andamento";

            // Puxa a data oficial do Envers mapeada no Java
            const dataAbertura = new Date(rev.revisionDate || rev.entity.departureTime || new Date());
            const horaStr = `${String(dataAbertura.getHours()).padStart(2, '0')}:${String(dataAbertura.getMinutes()).padStart(2, '0')}`;

            const titulo = rev.revisionType === 'ADD' ? "Abertura de Chamado" : "Atualização de Chamado";
            const prefixo = rev.entity.car?.prefix || "N/A";
            const tecnico = rev.entity.user?.name || "N/A";
            const destino = rev.entity.destinationRequester || "Local não informado";

            return `
                <article class="item-chamado item-${statusStr}">
                    <div class="item-chamado-principal">
                        <div class="item-chamado-topo">
                            <span class="chamado-numero">N° ${rev.entity.id}</span>
                            <span class="status-chip status-${statusStr}">${statusLabelStr}</span>
                        </div>
                        <h3>${titulo}</h3>
                        <div class="dados-veiculo">Viatura ${prefixo} | Técnico: ${tecnico}</div>
                        <div class="meta-chamado">
                            <span>${destino}</span>
                            <span>Horário: ${horaStr}</span>
                        </div>
                    </div>
                    <button class="btn-status status-${statusStr}" onclick="window.location.href='historicochamados.html'">Ver histórico</button>
                </article>
            `;
        }).join("");

        container.innerHTML = recentesHtml;

    } catch (error) {
        console.error("Erro ao carregar resumo de histórico:", error);
        container.innerHTML = `<div class="nenhum-registro" style="color:red;">Falha ao comunicar com o servidor.</div>`;
    }
}

// ===================================================================
// 3. INICIALIZAÇÃO
// ===================================================================
document.addEventListener("DOMContentLoaded", () => {
    // Garante que estas funções pesadas de banco de dados só rodem na tela do Gestor
    const isTelaGestor = document.querySelector(".dashboard-gestor") || window.location.pathname.includes("telainicial-gestor.html");

    if (isTelaGestor) {
        carregarMetricasDashboard();
        carregarResumoHistorico();
    }
});