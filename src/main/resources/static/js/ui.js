/**
 * js/ui.js
 * Interface, Modais, Sidebar e Controle de Acesso
 */

// ESCUTA GLOBAL DA TECLA ENTER
document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        const focusedElement = document.activeElement;
        if (focusedElement.id === 'matricula' || focusedElement.id === 'senha') {
            event.preventDefault();
            if (typeof btnindex === "function") btnindex();
        }
        if (focusedElement.id === 'quilometragem-inicial' || focusedElement.id === 'observacoes') {
            event.preventDefault();
            if (typeof salvarVeiculoInfo === "function") salvarVeiculoInfo();
        }
    }
});

// CARREGAMENTO INICIAL, SIDEBAR E TRAVA DE SEGURANÇA POR PERFIL
document.addEventListener('DOMContentLoaded', () => {
    const rawPermission = localStorage.getItem("userPermission") || "";
    const permission = rawPermission.trim().toUpperCase();
    const currentPage = window.location.pathname;

    const gestorPages = [
        "telainicial-gestor.html",
        "relatorios.html",
        "configuracoes-gestor.html",
        "cadastrousuarios.html",
        "cadastroveiculos.html",
        "historicochamados.html"
    ];

    const technicianPages = [
        "telainicial.html",
        "chamados.html",
        "configuracoes-tecnico.html"
    ];

    // Trava de segurança por perfil
    if (permission) {
        // Usando endsWith para evitar conflito entre chamados.html e historicochamados.html
        const isGestorPage = gestorPages.some(page => currentPage.endsWith(page));
        const isTechnicianPage = technicianPages.some(page => currentPage.endsWith(page));

        if (isGestorPage && permission !== "ADMINISTRATOR" && permission !== "ROLE_ADMINISTRATOR") {
            window.location.href = "telainicial.html";
            return;
        }

        // Técnico só acessa tela de técnico, mas o ADMINISTRATOR tem passe livre em todas
        if (isTechnicianPage && permission !== "TECHNICIAN" && permission !== "ADMINISTRATOR" && permission !== "ROLE_ADMINISTRATOR") {
            window.location.href = "telainicial-gestor.html";
            return;
        }
    }

    // Só chama a função se ela existir na página atual
    if (typeof carregarDadosTelaInicial === "function") {
        carregarDadosTelaInicial();
    }

    // Configuração da Sidebar
    const btnMenu = document.getElementById("btnmenu");
    const sidebar = document.getElementById("sidebar");
    const overlaySidebar = document.getElementById("overlayBlurSidebar");

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

    const btnClose = document.getElementById("btnx");
    if (btnClose) btnClose.onclick = closeSidebar;
    if (overlaySidebar) overlaySidebar.onclick = closeSidebar;

    document.querySelectorAll(".sobreposicao").forEach(overlay => {
        overlay.addEventListener("click", event => {
            if (event.target === overlay) {
                fecharTodosModais();
            }
        });
    });

    // --------------------------------------------------------
    // LÓGICA DO POPUP DE ABASTECIMENTO
    // --------------------------------------------------------
    window.abrirPopupAbastecimento = () => {
        const popup = document.getElementById("popupAbastecimento");
        if (popup) popup.style.display = "flex";
    };

    const popupAbs = document.getElementById('popupAbastecimento');
    const popupConf = document.getElementById('popupConfirmacao');
    const popupSuc = document.getElementById('popupSucesso');
    const btnSalvarAbs = document.getElementById('btn-salvar-abastecimento');
    const btnVoltar = document.getElementById("btn-voltar");
    const btnCancelaConf = document.getElementById('btn-cancelar-confirmacao');
    const btnConfirmaFin = document.getElementById('btn-confirmar-final');
    const btnFechaSuc = document.getElementById('btn-fechar-sucesso');

    // Botão Voltar (do formulário)
    if (btnVoltar) {
        btnVoltar.onclick = () => popupAbs.style.display = "none";
    }

    // Botão Salvar (Valida e abre Confirmação)
    if (btnSalvarAbs) {
        btnSalvarAbs.onclick = () => {
            const camposIds = ['litros-abastecimento', 'preco-litro', 'km-veiculo', 'nf-abastecimento', 'data-abastecimento', 'hora-abastecimento', 'troca-oleo'];
            let algumVazio = false;

            camposIds.forEach(id => {
                const input = document.getElementById(id);
                if (!input || input.value.trim() === "") {
                    if (input) input.style.borderColor = "red";
                    algumVazio = true;
                } else {
                    if (input) input.style.borderColor = "#252020";
                }
            });

            if (algumVazio) {
                mostrarToast("Preencha todos os campos!");
                return; // PARA AQUI se estiver vazio
            }

            // Se estiver tudo ok, troca de popup
            popupAbs.style.display = 'none';
            popupConf.style.display = 'flex';
        };
    }

    // Botão Cancelar (na confirmação)
    if (btnCancelaConf) {
        btnCancelaConf.onclick = () => {
            popupConf.style.display = 'none';
            popupAbs.style.display = 'flex';
        };
    }

    // Botão Confirmar Final (Envia e mostra Sucesso)
    if (btnConfirmaFin) {
        btnConfirmaFin.onclick = async () => {
            const serviceId = localStorage.getItem("activeServiceId");
            const litros = document.getElementById("litros-abastecimento")?.value;
            const data = document.getElementById("data-abastecimento")?.value;
            const hora = document.getElementById("hora-abastecimento")?.value;

            if (!serviceId) {
                mostrarToast("Nenhum serviço ativo.");
                return;
            }

            try {
                // Usa apiFetch se disponível, senão usa fetch padrão
                const fetchFn = typeof apiFetch !== "undefined" ? apiFetch : fetch;
                const url = typeof apiFetch !== "undefined" ? `/service/${serviceId}/fuel` : `http://localhost:8080/service/${serviceId}/fuel`;

                const response = await fetchFn(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        amount: parseFloat(litros),
                        date: data,
                        time: hora
                    })
                });

                if (response && response.ok) {
                    mostrarToast1("Abastecimento registrado!");
                    if (popupAbs) popupAbs.style.display = "none";
                    if (popupConf) popupConf.style.display = 'none';
                    if (popupSuc) popupSuc.style.display = 'flex';
                } else {
                    mostrarToast("Erro ao salvar abastecimento.");
                }
            } catch (error) {
                console.error("Erro na API:", error);
                mostrarToast("Erro de conexão.");
            }
        };
    }

    // Botão Fechar Sucesso
    if (btnFechaSuc) {
        btnFechaSuc.onclick = () => {
            if (popupSuc) popupSuc.style.display = 'none';
        };
    }
});

// MODAIS GERAIS
window.abrirModalConfirmacao = () => {
    const modal = document.getElementById("modalConfirmacao");
    if (modal) modal.style.display = "flex";
};

window.fecharTodosModais = () => {
    ["modalConfirmacao", "modalDetalhesVeiculo", "popupAbastecimento", "modalAvisoCheckout"].forEach(id => {
        const element = document.getElementById(id);
        if (element) element.style.display = "none";
    });

    const sidebar = document.getElementById("sidebar");
    const overlaySidebar = document.getElementById("overlayBlurSidebar");
    if (sidebar) sidebar.style.width = "0";
    if (overlaySidebar) overlaySidebar.classList.remove("active");
};

// CARREGAR DADOS TELA INICIAL (NOME E VEICULO)
window.carregarDadosTelaInicial = function () {
    const userName = localStorage.getItem('userName');

    if (userName) {
        const technGreeting = document.getElementById('boas-vindas-titulo');
        const mangGreeting = document.getElementById('nome-usuario-logado');
        if (technGreeting) technGreeting.textContent = `Bem vindo, ${userName}!`;
        if (mangGreeting) mangGreeting.textContent = userName;
    }

    const vehicleData = localStorage.getItem("selectedVehicle");
    const postCheckin = document.getElementById("secao-pos-checkin");
    const infoDados = document.getElementById("info-veiculo-dados");
    const btnCheckin = document.getElementById("container-checkin-botao");

    // SE NÃO HOUVER VEÍCULO NO STORAGE
    if (!vehicleData || vehicleData === "null") {
        if (btnCheckin) btnCheckin.style.setProperty('display', 'block', 'important');
        if (infoDados) infoDados.style.setProperty('display', 'none', 'important');
        if (postCheckin) postCheckin.style.setProperty('display', 'none', 'important');
        return;
    }

    // SE HOUVER VEÍCULO NO STORAGE
    try {
        const vehicle = JSON.parse(vehicleData);
        if (btnCheckin) btnCheckin.style.setProperty('display', 'none', 'important');
        if (infoDados) infoDados.style.setProperty('display', 'block', 'important');
        if (postCheckin) postCheckin.style.setProperty('display', 'block', 'important');

        if (document.getElementById("display-modelo")) document.getElementById("display-modelo").textContent = vehicle.model;
        if (document.getElementById("display-placa")) document.getElementById("display-placa").textContent = vehicle.licensePlate;
        if (document.getElementById("display-prefixo")) document.getElementById("display-prefixo").textContent = vehicle.prefix;

        const kmInput = document.getElementById("quilometragem-inicial");
        const obsInput = document.getElementById("observacoes");
        if (kmInput) kmInput.value = localStorage.getItem("km") || "";
        if (obsInput) obsInput.value = localStorage.getItem("obs") || "";
    } catch (e) {
        localStorage.removeItem("selectedVehicle");
    }
};

// FUNÇÕES PARA MOSTRAR TOASTS
window.mostrarToast = function (mensagem) {
    const toast = document.getElementById("toast-aviso");
    if (toast) {
        toast.innerText = mensagem;
        toast.style.display = "block";
        toast.classList.remove("toast-hidden");
        // Esconde após 3 segundos
        setTimeout(() => {
            toast.classList.add("toast-hidden");
            setTimeout(() => { toast.style.display = "none"; }, 500);
        }, 3000);
    }
};

window.mostrarToast1 = function (mensagem) {
    const toast = document.getElementById("toast-aviso1");
    if (toast) {
        toast.innerText = mensagem;
        toast.style.display = "block";
        toast.classList.remove("toast-hidden1");
        // Esconde após 3 segundos
        setTimeout(() => {
            toast.classList.add("toast-hidden1");
            setTimeout(() => { toast.style.display = "none"; }, 500);
        }, 3000);
    }
};