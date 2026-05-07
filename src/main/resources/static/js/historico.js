let chamadosHistorico = [];

function exibirErroNaTela(mensagem, detalhes = "") {
    const htmlErro = `
        <div style="background-color: #ffebee; border: 1px solid #f44336; color: #b71c1c; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: left; width: 100%;">
            <h3 style="margin-top: 0;">❌ Erro na API (Auditoria)</h3>
            <p><strong>Mensagem:</strong> ${mensagem}</p>
            ${detalhes ? `<p style="font-size: 13px; background: #fff; padding: 10px; border: 1px solid #ffcdd2; color: #333; font-family: monospace;">${detalhes}</p>` : ""}
        </div>
    `;
    const containerHistorico = document.getElementById("historicoLista");
    if (containerHistorico) containerHistorico.innerHTML = htmlErro;
}

async function inicializarHistorico() {
    try {
        const response = await apiFetch("/service/history");

        if (!response) return;

        if (!response.ok) {
            const erroTexto = await response.text();
            exibirErroNaTela(`Status HTTP: ${response.status} (${response.statusText})`, erroTexto);
            return;
        }

        const data = await response.json();

        chamadosHistorico = data.map(rev => {
            if (!rev.entity) return null;

            const isFinalizado = rev.entity.completionTime !== null;
            const statusStr = isFinalizado ? "finalizado" : "andamento";
            const statusLabelStr = isFinalizado ? "Finalizado" : "Em andamento";

            const rawDate = rev.revisionDate || rev.entity.departureTime || new Date();
            const dataAbertura = new Date(rawDate);

            const dia = String(dataAbertura.getDate()).padStart(2, '0');
            const mes = String(dataAbertura.getMonth() + 1).padStart(2, '0');
            const ano = dataAbertura.getFullYear();
            const horaStr = `${String(dataAbertura.getHours()).padStart(2, '0')}:${String(dataAbertura.getMinutes()).padStart(2, '0')}`;

            const rawPriority = rev.entity.priority || "MEDIUM";
            let prioLabel = "Média";
            let prioClass = "prioridade-baixa";

            if (rawPriority === "HIGH") {
                prioLabel = "Alta";
                prioClass = "prioridade-alta";
            } else if (rawPriority === "LOW") {
                prioLabel = "Baixa";
                prioClass = "prioridade-baixa";
            } else if (rawPriority === "SCHEDULED") {
                prioLabel = "Agendado";
                prioClass = "prioridade-baixa";
            }

            const tipoAuditoria = rev.revisionType === 'ADD' ? "Novo Registro" : "Modificação";

            return {
                id: rev.entity.id,
                matricula: rev.entity.user?.registration || "N/A",
                status: statusStr,
                statusLabel: statusLabelStr,
                title: rev.revisionType === 'ADD' ? "Abertura de Chamado" : "Atualização/Baixa",
                subtitle: `Viatura ${rev.entity.car?.prefix || "N/A"}`,
                priorityClass: prioClass,
                priorityLabel: prioLabel,
                tipoRegistro: tipoAuditoria,
                dia: dia,
                mes: mes,
                ano: ano,
                prefixo: rev.entity.car?.prefix,
                tecnico: rev.entity.user?.name || "Desconhecido",
                responsavel: rev.entity.user?.name || "Desconhecido",
                abertura: `${dia}/${mes}/${ano} às ${horaStr}`,
                local: rev.entity.destinationRequester || "Não informado",
                observacao: rev.entity.description || "Sem observações.",
                execucao: isFinalizado ? formatarData(rev.entity.completionTime) : "",
            };
        }).filter(item => item !== null); // Remove os que falharam no !rev.entity

        if (document.getElementById("historicoLista")) {
            renderizarChamados(chamadosHistorico);
            atualizarKpisHistorico(chamadosHistorico);
        }
    } catch (error) {
        exibirErroNaTela("Erro no JavaScript", error.message);
    }
}

function atualizarKpisHistorico(lista) {
    if (document.getElementById('kpi-total')) document.getElementById('kpi-total').textContent = lista.length;
    if (document.getElementById('kpi-finalizados')) document.getElementById('kpi-finalizados').textContent = lista.filter(c => c.status === 'finalizado').length;
    if (document.getElementById('kpi-andamento')) document.getElementById('kpi-andamento').textContent = lista.filter(c => c.status === 'andamento').length;
    if (document.getElementById('kpi-novos')) document.getElementById('kpi-novos').textContent = lista.filter(c => c.tipoRegistro === 'Novo Registro').length;
}

function formatarData(dataString) {
    if (!dataString) return "";
    return new Date(dataString).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

function montarDetalhe(label, value) {
    return `<div class="detalhe-bloco"><span class="detalhe-label">${label}</span><strong>${value || "Não há"}</strong></div>`;
}

function renderizarChamados(lista) {
    const container = document.getElementById("historicoLista");
    if (!container) return;

    if (!lista || lista.length === 0) {
        container.innerHTML = `<div class="nenhum-registro">Nenhuma auditoria encontrada.</div>`;
        return;
    }

    container.innerHTML = lista.map((chamado) => {
        const statusClass = chamado.status === "andamento" ? "status-andamento" : "status-finalizado";
        const itemClass = chamado.status === "andamento" ? "item-andamento" : "item-finalizado";

        let detalhes = montarDetalhe("Responsável", chamado.responsavel) +
            montarDetalhe("Registro", chamado.abertura) +
            montarDetalhe("Destino", chamado.local);

        if (chamado.status === "finalizado") {
            detalhes += montarDetalhe("Conclusão", chamado.execucao);
        }

        return `
        <article class="historico-item ${itemClass}">
            <div class="historico-item-topo">
                <div>
                    <div class="historico-header-linha">
                        <span class="historico-numero">Auditoria ID: ${chamado.id}</span>
                        <span class="status-chip ${statusClass}">${chamado.statusLabel}</span>
                    </div>
                    <h3>${chamado.title}</h3>
                    <p class="historico-subtitulo">${chamado.subtitle}</p>
                </div>
                <div class="historico-prioridade ${chamado.priorityClass}">${chamado.priorityLabel}</div>
            </div>
            <div class="historico-detalhes">${detalhes}</div>
            <p class="historico-observacao">${chamado.observacao}</p>
            <button type="button" class="btn-detalhes" onclick="abrirDetalhesChamado(${chamado.id})">Ver detalhes completos</button>
        </article>
        `;
    }).join("");
}

window.aplicarFiltrosHistorico = function () {
    const input = document.getElementById("filtroBusca");
    if (!input) return;
    const busca = input.value.trim().toLowerCase();

    const filtrados = chamadosHistorico.filter((c) => {
        if (!busca) return true;
        return (c.matricula || "").toLowerCase().includes(busca) ||
            (c.tecnico || "").toLowerCase().includes(busca) ||
            (c.prefixo || "").toLowerCase().includes(busca);
    });

    renderizarChamados(filtrados);
};

window.abrirDetalhesChamado = function (id) {
    const chamado = chamadosHistorico.find((item) => item.id === id);
    if (!chamado) return;

    document.getElementById("popupDetalhesTitulo").textContent = `${chamado.title} • ${chamado.statusLabel}`;
    document.getElementById("popupDetalhesConteudo").innerHTML = `
        <div class="popup-grid">
            ${montarDetalhe("Técnico", chamado.tecnico)}
            ${montarDetalhe("Matrícula", chamado.matricula)}
            ${montarDetalhe("Data de Registro", chamado.abertura)}
            ${montarDetalhe("Local/Destino", chamado.local)}
            ${montarDetalhe("Prioridade", chamado.priorityLabel)}
            ${montarDetalhe("Situação Atual", chamado.statusLabel)}
            ${chamado.status === "finalizado" ? montarDetalhe("Data de Conclusão", chamado.execucao) : ""}
        </div>
        <div class="popup-obs">
            <strong>Observação registrada no chamado:</strong>
            <p>${chamado.observacao}</p>
        </div>
    `;
    document.getElementById("popupChamadoDetalhes").style.display = "flex";
};

window.fecharPopupChamadoDetalhes = function () {
    document.getElementById("popupChamadoDetalhes").style.display = "none";
};

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("historicoLista")) {
        inicializarHistorico();
    }
});