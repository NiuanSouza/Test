let relatoriosDoBanco = [];
let selectedReportIndex = 0;

window.addEventListener("DOMContentLoaded", () => {
    // Garante que a interface do usuário seja atualizada se a função existir no ui.js
    if (typeof carregarDadosTelaInicial === "function") {
        carregarDadosTelaInicial();
    }
    carregarRelatoriosDaAPI();
});

async function carregarRelatoriosDaAPI() {
    try {
        // Utiliza o apiFetch (do basic.js) para garantir que a requisição vá com o Token JWT
        const response = await apiFetch("/service/reports", { method: "GET" });

        if (response && response.ok) {
            relatoriosDoBanco = await response.json();
            inicializarRelatorios();
        } else {
            console.error("Erro ao buscar relatórios. Status:", response?.status);
            mostrarErroNaTabela("Falha ao carregar os dados do servidor.");
        }
    } catch (error) {
        console.error("Erro de conexão com a API:", error);
        mostrarErroNaTabela("Erro de conexão. Verifique se o back-end está rodando.");
    }
}

function inicializarRelatorios() {
    if (!document.getElementById("months-list")) return;

    if (!relatoriosDoBanco || relatoriosDoBanco.length === 0) {
        mostrarErroNaTabela("Nenhum relatório encontrado no banco de dados.");
        return;
    }

    renderizarMeses();
    // Seleciona sempre o primeiro mês retornado pela API por padrão
    selecionarRelatorio(0);
}

function renderizarMeses() {
    const container = document.getElementById("months-list");
    container.innerHTML = "";

    relatoriosDoBanco.forEach((month, index) => {
        const button = document.createElement("button");
        button.textContent = `${month.monthLabel} ${month.year}`;
        button.className = index === selectedReportIndex ? "periodo active" : "periodo";
        button.onclick = () => selecionarRelatorio(index);
        container.appendChild(button);
    });
}

function selecionarRelatorio(index) {
    selectedReportIndex = index;
    renderizarMeses(); // Re-renderiza para atualizar a classe "active"

    const report = relatoriosDoBanco[selectedReportIndex];
    mostrarStatus(report.status);
    atualizarResumo(report.totalCalls, report.completedCalls, report.openCalls);
    atualizarTabela(report.entries);

    // Altera o texto do botão de exportação dependendo se o mês fechou ou não
    const btnExport = document.querySelector(".btn-gerar");
    if (btnExport) {
        btnExport.textContent = report.isCurrentMonth ? "Gerar relatório parcial" : "Exportar CSV";
        // Adiciona a chamada visual do Toast ao clicar no botão
        btnExport.onclick = () => exportCsvForSelectedMonth();
    }
}

function mostrarStatus(text) {
    // Seleciona o primeiro 'strong' dentro do primeiro 'article' dos KPIs
    const statusElement = document.querySelector(".relatorios-kpis article:nth-child(1) strong");
    if (statusElement) statusElement.textContent = text;
}

function atualizarResumo(total, completed, open) {
    const kpis = document.querySelectorAll(".relatorios-kpis article strong");
    if (kpis.length >= 4) {
        kpis[1].textContent = total;
        kpis[2].textContent = completed;
        kpis[3].textContent = open;
    }
}

function atualizarTabela(entries) {
    const tbody = document.querySelector(".relatorios-table tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    if (!entries || entries.length === 0) {
        mostrarErroNaTabela("Nenhum chamado registrado neste mês.");
        return;
    }

    entries.forEach(entry => {
        const row = document.createElement("tr");

        let statusClass = "status-indicar"; // Laranja/Aberto por padrão
        if (entry.status === "Finalizado") {
            statusClass = "status-finalizado"; // Verde
        } else if (entry.status === "Em andamento") {
            statusClass = "status-andamento"; // Azul
        }

        row.innerHTML = `
            <td>${entry.id}</td>
            <td>${entry.carPrefix || "-"}</td>
            <td>${entry.userName || entry.userRegistration || "-"}</td>
            <td>${entry.description || "-"}</td>
            <td>${entry.departureTime || "-"}</td>
            <td>${entry.completionTime || "-"}</td>
            <td><span class="status-chip ${statusClass}">${entry.status || "-"}</span></td>
        `;
        tbody.appendChild(row);
    });
}

function mostrarErroNaTabela(mensagem) {
    const tbody = document.querySelector(".relatorios-table tbody");
    if (tbody) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#67717b; padding:28px 0;">${mensagem}</td></tr>`;
    }
}

window.exportCsvForSelectedMonth = function () {
    // Usa o Toast visual de sucesso já presente no seu sistema
    if (typeof mostrarToast1 === "function") {
        mostrarToast1("Exportação habilitada para uma futura integração.");
    } else {
        alert("Exportação habilitada para uma futura integração.");
    }
};