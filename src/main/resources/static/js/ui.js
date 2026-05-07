/**
 * js/ui.js
 * Responsável por: Controle de Acesso, Manipulação de Sidebars, Fechamento de Modais e Eventos Globais.
 */

// ===================================================================
// 1. ESCUTADORES GLOBAIS DE TECLADO (Ações via Enter)
// ===================================================================
document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        const focusedElement = document.activeElement;

        // Tela de Login
        if (focusedElement.id === 'matricula' || focusedElement.id === 'senha') {
            event.preventDefault();
            if (typeof btnindex === "function") btnindex();
        }

        // Tela Inicial (Check-in)
        if (focusedElement.id === 'quilometragem-inicial' || focusedElement.id === 'observacoes') {
            event.preventDefault();
            if (typeof salvarVeiculoInfo === "function") salvarVeiculoInfo();
        }
    }
});

// ===================================================================
// 2. INICIALIZAÇÃO DA PÁGINA (Controle de Acesso e Setup)
// ===================================================================
document.addEventListener('DOMContentLoaded', () => {

    // --- CONTROLE DE ACESSO POR PERFIL ---
    const rawPermission = localStorage.getItem("userPermission") || "";
    const permission = rawPermission.trim().toUpperCase();
    const currentPage = window.location.pathname;

    const gestorPages = [
        "telainicial-gestor.html", "relatorios.html", "configuracoes-gestor.html",
        "cadastrousuarios.html", "cadastroveiculos.html", "historicochamados.html"
    ];

    const technicianPages = [
        "telainicial.html", "chamados.html", "configuracoes-tecnico.html"
    ];

    if (permission) {
        const isGestorPage = gestorPages.some(page => currentPage.endsWith(page));
        const isTechnicianPage = technicianPages.some(page => currentPage.endsWith(page));

        // Se for página de gestor, e ele NÃO FOR gestor -> volta pro inicio do técnico
        if (isGestorPage && permission !== "ADMINISTRATOR" && permission !== "ROLE_ADMINISTRATOR") {
            window.location.href = "telainicial.html";
            return;
        }

        // Se for página de técnico, e ele NÃO FOR nem técnico nem gestor -> vai pro inicio do gestor
        if (isTechnicianPage && permission !== "TECHNICIAN" && permission !== "ADMINISTRATOR" && permission !== "ROLE_ADMINISTRATOR") {
            window.location.href = "telainicial-gestor.html";
            return;
        }
    }

    // --- CARREGAMENTO DE DADOS VISUAIS DA TELA ---
    if (typeof carregarDadosTelaInicial === "function") {
        carregarDadosTelaInicial();
    }

    // --- CONFIGURAÇÃO DA SIDEBAR ---
    const btnMenu = document.getElementById("btnmenu");
    const sidebar = document.getElementById("sidebar");
    const overlaySidebar = document.getElementById("overlayBlurSidebar");
    const btnClose = document.getElementById("btnx");

    const closeSidebar = () => {
        if (sidebar) sidebar.style.width = "0";
        if (overlaySidebar) overlaySidebar.classList.remove("active");
    };

    if (btnMenu && sidebar) {
        btnMenu.onclick = () => {
            sidebar.style.width = "250px";
            if (overlaySidebar) overlaySidebar.classList.add("active");
        };
    }

    if (btnClose) btnClose.onclick = closeSidebar;
    if (overlaySidebar) overlaySidebar.onclick = closeSidebar;

    // Fecha todos os modais ao clicar no overlay escuro de fundo
    document.querySelectorAll(".sobreposicao").forEach(overlay => {
        overlay.addEventListener("click", event => {
            if (event.target === overlay) {
                fecharTodosModais();
            }
        });
    });

    // --- CONFIGURAÇÃO DE FLUXO DOS POPUPS DE ABASTECIMENTO ---
    const popupAbs = document.getElementById('popupAbastecimento');
    const popupConf = document.getElementById('popupConfirmacaoAbs') || document.getElementById('popupConfirmacao');

    const btnSalvarAbs = document.getElementById('btn-salvar-abastecimento');
    const btnVoltarAbs = document.querySelector('#popupAbastecimento .btn-voltar');
    const btnCancelaConf = document.querySelector('#popupConfirmacaoAbs .btn-voltar') || document.querySelector('#popupConfirmacao .btn-voltar');

    // Botão Voltar (sai do formulário)
    if (btnVoltarAbs && popupAbs) {
        btnVoltarAbs.onclick = () => popupAbs.style.display = "none";
    }

    // Botão Salvar do Abastecimento: Valida e abre tela de confirmação (a API em si é disparada no service.js)
    if (btnSalvarAbs && popupAbs && popupConf) {
        btnSalvarAbs.onclick = () => {
            const camposIds = ['litros-abastecimento', 'preco-litro', 'data-abastecimento', 'hora-abastecimento'];
            let algumVazio = false;

            camposIds.forEach(id => {
                const input = document.getElementById(id);
                if (input) {
                    if (input.value.trim() === "") {
                        input.style.borderColor = "red";
                        algumVazio = true;
                    } else {
                        input.style.borderColor = "#252020";
                    }
                }
            });

            if (algumVazio) {
                window.mostrarToast("Preencha todos os campos obrigatórios!");
                return;
            }

            // Tudo validado, esconde form e mostra confirmação
            popupAbs.style.display = 'none';
            popupConf.style.display = 'flex';
        };
    }

    // Botão Cancelar (dentro da tela de confirmação)
    if (btnCancelaConf && popupAbs && popupConf) {
        btnCancelaConf.onclick = () => {
            popupConf.style.display = 'none';
            popupAbs.style.display = 'flex'; // Volta para o form sem perder os dados
        };
    }
});

// ===================================================================
// 3. FUNÇÕES GLOBAIS DE MANIPULAÇÃO DE UI (EXPOSTAS NO WINDOW)
// ===================================================================

window.fecharTodosModais = () => {
    ["modalConfirmacao", "modalDetalhesVeiculo", "popupAbastecimento", "popupConfirmacaoAbs", "modalAvisoCheckout"].forEach(id => {
        const element = document.getElementById(id);
        if (element) element.style.display = "none";
    });

    const sidebar = document.getElementById("sidebar");
    const overlaySidebar = document.getElementById("overlayBlurSidebar");
    if (sidebar) sidebar.style.width = "0";
    if (overlaySidebar) overlaySidebar.classList.remove("active");
};

// ===================================================================
// VERIFICA SERVIÇO NO BANCO E MONTA A TELA (Check-in vs Check-out)
// ===================================================================
window.carregarDadosTelaInicial = async function () {
    const userName = localStorage.getItem('userName');
    if (userName && document.getElementById('boas-vindas-titulo')) {
        document.getElementById('boas-vindas-titulo').textContent = `Bem vindo, ${userName}!`;
    }

    const postCheckin = document.getElementById("secao-pos-checkin");
    const infoDados = document.getElementById("info-veiculo-dados");
    const btnCheckin = document.getElementById("container-checkin-botao");

    try {
        const response = await apiFetch("/service/active");
        if (!response) return;

        if (response.ok) {
            const data = await response.json();

            if (data.active) {
                // Persiste dados no storage para uso nas outras funções do service.js
                localStorage.setItem("activeServiceId", data.serviceId);
                localStorage.setItem("km", data.departureKm);
                localStorage.setItem("obs", data.description);

                // Mostra/Esconde elementos da UI
                if (btnCheckin) btnCheckin.style.display = 'none';
                if (infoDados) infoDados.style.display = 'block';
                if (postCheckin) postCheckin.style.display = 'block';

                // Preenche dados do veículo
                document.getElementById("display-modelo").textContent = data.model;
                document.getElementById("display-placa").textContent = data.licensePlate;
                document.getElementById("display-prefixo").textContent = data.carPrefix;

                // Preenche KM e Observações
                if (document.getElementById("quilometragem-inicial"))
                    document.getElementById("quilometragem-inicial").value = data.departureKm;
                if (document.getElementById("observacoes"))
                    document.getElementById("observacoes").value = data.description;

                // ============================================================
                // CORREÇÃO DA DATA E HORÁRIO (Conversão de ISO para Input)
                // ============================================================
                if (data.departureTime) {
                    const dt = new Date(data.departureTime);

                    // Formata para YYYY-MM-DD
                    const dataFormatada = dt.toISOString().split('T')[0];
                    // Formata para HH:MM
                    const horaFormatada = dt.toTimeString().split(' ')[0].substring(0, 5);

                    if (document.getElementById("data-inicial"))
                        document.getElementById("data-inicial").value = dataFormatada;
                    if (document.getElementById("horario-inicial"))
                        document.getElementById("horario-inicial").value = horaFormatada;
                }

                // Transforma a tela para modo Checkout/Abastecimento
                if (typeof transicaoPosCheckin === "function") transicaoPosCheckin();

            } else {
                // Se não há serviço ativo, garante que a tela está limpa
                if (btnCheckin) btnCheckin.style.display = 'block';
                if (infoDados) infoDados.style.display = 'none';
                if (postCheckin) postCheckin.style.display = 'none';
            }
        }
    } catch (error) {
        console.error("Falha ao carregar dados iniciais:", error);
    }
};