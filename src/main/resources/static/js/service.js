/**
 * js/service.js
 * Responsável por: Check-in, Check-out, Abastecimento e Transições de UI do Chamado Ativo.
 */

// ===================================================================
// 1. CHECK-IN
// ===================================================================
window.salvarVeiculoInfo = async function () {
    const kmInput = document.getElementById("quilometragem-inicial")?.value;
    const dataInput = document.getElementById("data-inicial")?.value;
    const horaInput = document.getElementById("horario-inicial")?.value;
    const obsInput = document.getElementById("observacoes")?.value || "";

    const matricula = localStorage.getItem("userRegistration");
    const vehicleData = localStorage.getItem('selectedVehicle');

    if (!vehicleData || !matricula) {
        window.mostrarToast("Erro: Matrícula do usuário ou veículo não encontrados.");
        return;
    }

    if (!kmInput || !dataInput || !horaInput) {
        window.mostrarToast("Por favor, preencha KM, Data e Horário iniciais.");
        return;
    }

    const vehicle = JSON.parse(vehicleData);

    try {
        const response = await apiFetch("/service/start", {
            method: "POST",
            body: JSON.stringify({
                carPrefix: vehicle.prefix.trim(),
                userRegistration: matricula,
                recordKm: parseFloat(kmInput),
                note: obsInput,
                destinationRequester: "Não informado",
                priority: "MEDIUM"
            })
        });

        if (response && response.ok) {
            const data = await response.json();

            // Salva o ID do serviço gerado pelo Backend para uso no check-out/abastecimento
            const idServico = data.serviceId || data.id;
            localStorage.setItem("activeServiceId", idServico);
            localStorage.setItem("km", kmInput); // Salva o KM inicial para validação futura
            localStorage.setItem("obs", obsInput);

            // Exibe toast de sucesso (usando o toast-aviso1 configurado no seu CSS para verde)
            window.mostrarToast("Check-in confirmado no sistema!", "toast-aviso1");

            // Alterna a interface para o modo "Em Serviço"
            if (typeof transicaoPosCheckin === "function") transicaoPosCheckin();
        } else {
            const erro = await response.json();
            window.mostrarToast("Erro: " + (erro.error || "Falha no check-in"));
        }
    } catch (error) {
        console.error("Erro na API:", error);
        window.mostrarToast("Falha de conexão com o servidor.");
    }
};

// ===================================================================
// 2. CHECK-OUT
// ===================================================================
window.checkoutChamado = async () => {
    const serviceId = localStorage.getItem("activeServiceId");

    // Pega APENAS o valor do input final e o valor inicial salvo no check-in
    const inputFinal = document.getElementById("quilometragem-final")?.value;
    const kmInicialSalvo = parseFloat(localStorage.getItem("km")) || 0;

    if (!serviceId) {
        window.mostrarToast("Nenhum serviço ativo encontrado para fazer check-out.");
        return;
    }

    // 1ª Validação: Impede Check-out com campo vazio
    if (!inputFinal || inputFinal.trim() === "") {
        window.mostrarToast("Por favor, insira a quilometragem final de chegada.");
        return;
    }

    const kmFinalValue = parseFloat(inputFinal);

    // 2ª Validação: Impede Check-out se KM Final for menor que KM Inicial
    if (kmFinalValue < kmInicialSalvo) {
        window.mostrarToast(`Erro: A KM Final (${kmFinalValue}) não pode ser menor que a Inicial (${kmInicialSalvo}).`);
        return;
    }

    try {
        const response = await apiFetch(`/service/finalize/${serviceId}`, {
            method: "POST",
            body: JSON.stringify({
                recordKm: kmFinalValue
            })
        });

        if (response && response.ok) {
            // Limpa o estado da sessão de trabalho
            localStorage.removeItem("selectedVehicle");
            localStorage.removeItem("km");
            localStorage.removeItem("obs");
            localStorage.removeItem("activeServiceId");

            const popupSuc = document.getElementById("popupSucesso");
            const msgSucesso = document.getElementById("mensagem-sucesso");

            if (popupSuc) {
                if (msgSucesso) msgSucesso.textContent = "Check-out realizado com sucesso!";
                popupSuc.style.display = "flex";
                popupSuc.setAttribute("data-action", "checkout");
            } else {
                window.mostrarToast("Check-out realizado com sucesso!", "toast-aviso1");
                setTimeout(() => window.location.reload(), 2000);
            }
        } else {
            const erro = await response.json();
            window.mostrarToast("Erro: " + (erro.error || "Falha no check-out"));
        }
    } catch (error) {
        console.error("Erro na API de Checkout:", error);
        window.mostrarToast("Falha de conexão com o servidor.");
    }
};

// ===================================================================
// 3. ABASTECIMENTO
// ===================================================================
window.abrirPopupAbastecimento = function() {
    const popup = document.getElementById('popupAbastecimento');
    if (popup) popup.style.display = 'flex';
};

window.registrarAbastecimento = async function () {
    const serviceId = localStorage.getItem("activeServiceId");
    const litros = document.getElementById("litros-abastecimento")?.value;
    const preco = document.getElementById("preco-litro")?.value;
    const data = document.getElementById("data-abastecimento")?.value;
    const hora = document.getElementById("hora-abastecimento")?.value;

    if (!serviceId) {
        window.mostrarToast("Nenhum serviço ativo. Faça o check-in primeiro.");
        return;
    }

    if (!litros || !preco || !data || !hora) {
        window.mostrarToast("Preencha Litros, Preço, Data e Horário.");
        return;
    }

    const valorTotal = (parseFloat(litros) * parseFloat(preco)).toFixed(2);
    const dataHoraIso = `${data}T${hora}:00`;

    try {
        const response = await apiFetch(`/service/${serviceId}/fuel`, {
            method: 'POST',
            body: JSON.stringify({
                amount: parseFloat(litros),
                totalValue: parseFloat(valorTotal),
                date: dataHoraIso
            })
        });

        if (response && response.ok) {
            // Fecha os modais de abastecimento
            const popupConfAbs = document.getElementById('popupConfirmacaoAbs');
            const popupAbs = document.getElementById('popupAbastecimento');
            if (popupConfAbs) popupConfAbs.style.display = 'none';
            if (popupAbs) popupAbs.style.display = 'none';

            // Abre o popup genérico de sucesso
            const popupSuc = document.getElementById('popupSucesso');
            const msgSucesso = document.getElementById("mensagem-sucesso");

            if (popupSuc) {
                if (msgSucesso) msgSucesso.textContent = "Abastecimento registrado com sucesso!";
                popupSuc.style.display = 'flex';
                popupSuc.setAttribute("data-action", "abastecimento");
            } else {
                window.mostrarToast("Abastecimento registrado!", "toast-aviso1");
            }
        } else {
            const erro = await response.json();
            window.mostrarToast("Erro ao abastecer: " + (erro.error || ""));
        }
    } catch (error) {
        console.error("Erro na requisição de abastecimento:", error);
        window.mostrarToast("Falha ao conectar com o servidor.");
    }
};

// ===================================================================
// 4. CONTROLES DE INTERFACE (UI)
// ===================================================================

// Gerencia a ação do botão "OK" no popup de sucesso dinamicamente
window.fecharSucesso = function() {
    const popupSuc = document.getElementById('popupSucesso');
    if (!popupSuc) return;

    const action = popupSuc.getAttribute("data-action");
    popupSuc.style.display = 'none';

    if (action === "checkin") {
        // Apenas fecha o popup, o usuário continua na tela inicial com o painel alterado
    } else {
        // Checkout ou Abastecimento atualizam a tela
        window.location.reload();
    }
};

// Esconde botão de Check-in e exibe os botões de Check-out e Abastecimento
window.transicaoPosCheckin = function () {
    const IDsEsconder = ['grupo-km-inicial', 'btn-salvar-veiculo', 'btn-cancelar-veiculo'];
    IDsEsconder.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

    const IDsMostrar = ['grupo-km-final', 'btn-abs-veiculo', 'btn-checkout'];
    IDsMostrar.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'inline-block';
    });

    // AUTO-PREENCHIMENTO: Deixa a KM Inicial no campo final como ponto de partida
    const inputKmFinal = document.getElementById("quilometragem-final");
    const kmInicialSalvo = localStorage.getItem("km");
    if (inputKmFinal && kmInicialSalvo) {
        inputKmFinal.value = kmInicialSalvo;
    }
};

// Cancela o processo de check-in e limpa a seleção temporária
window.cancelarVeiculoInfo = function () {
    const secaoPosCheckin = document.getElementById('secao-pos-checkin');
    const infoVeiculoDados = document.getElementById('info-veiculo-dados');
    const containerCheckinBotao = document.getElementById('container-checkin-botao');

    if (secaoPosCheckin) secaoPosCheckin.style.display = 'none';
    if (infoVeiculoDados) infoVeiculoDados.style.display = 'none';
    if (containerCheckinBotao) containerCheckinBotao.style.display = 'block';

    localStorage.removeItem("selectedVehicle");
};