window.salvarVeiculoInfo = async function () {
    const kmInput = document.getElementById("quilometragem-inicial")?.value;
    const obsInput = document.getElementById("observacoes")?.value;
    const destinoInput = document.getElementById("destino-requisitante")?.value || "Não informado";

    const matricula = localStorage.getItem("userRegistration");
    const vehicleData = localStorage.getItem('selectedVehicle');

    if (!vehicleData || !matricula) {
        mostrarToast("Erro: Matrícula do usuário ou veículo não encontrados.");
        return;
    }

    if (!kmInput || kmInput.trim() === "") {
        mostrarToast("Por favor, insira a quilometragem inicial.");
        return;
    }

    const vehicle = JSON.parse(vehicleData);

    try {
        const response = await apiFetch("/service/start", {
            method: "POST",
            body: JSON.stringify({
                carPrefix: vehicle.prefix,
                userRegistration: matricula,
                recordKm: parseFloat(kmInput),
                note: obsInput,
                destinationRequester: destinoInput,
                priority: "MEDIUM"
            })
        });

        if (response && response.ok) {
            const data = await response.json();

            // O Java retorna "serviceId" no Map.of
            const idServico = data.serviceId || data.id;
            localStorage.setItem("activeServiceId", idServico);
            localStorage.setItem("km", kmInput);
            localStorage.setItem("obs", obsInput);

            mostrarToast1("Check-in confirmado no sistema!");

            if (typeof transicaoPosCheckin === "function") {
                transicaoPosCheckin();
            } else if (typeof carregarDadosTelaInicial === "function") {
                carregarDadosTelaInicial();
            }
        } else {
            const erro = await response.json();
            mostrarToast("Erro: " + (erro.error || "Falha no check-in"));
        }
    } catch (error) {
        console.error("Erro na API:", error);
        mostrarToast("Falha de conexão com o servidor.");
    }
};

window.checkoutChamado = async () => {
    const serviceId = localStorage.getItem("activeServiceId");

    const inputFinal = document.getElementById("quilometragem-final")?.value;
    const inputInicial = document.getElementById("quilometragem-inicial")?.value;
    const kmFinalValue = inputFinal || inputInicial;

    if (!serviceId) {
        mostrarToast("Nenhum serviço ativo encontrado para fazer check-out.");
        return;
    }

    if (!kmFinalValue || kmFinalValue.trim() === "") {
        mostrarToast("Por favor, insira a quilometragem de chegada.");
        return;
    }

    try {
        // CORREÇÃO: Envia 'recordKm' para preencher o DTO no Java
        const response = await apiFetch(`/service/finalize/${serviceId}`, {
            method: "POST",
            body: JSON.stringify({
                recordKm: parseFloat(kmFinalValue)
            })
        });

        if (response && response.ok) {
            localStorage.removeItem("selectedVehicle");
            localStorage.removeItem("km");
            localStorage.removeItem("obs");
            localStorage.removeItem("activeServiceId");

            const modal = document.getElementById("modalAvisoCheckout") || document.getElementById("popupSucesso");
            if (modal) {
                modal.style.display = "flex";
            } else {
                mostrarToast1("Check-out realizado com sucesso!");
                setTimeout(finalizarCheckout, 2000);
            }
        } else {
            const erro = await response.json();
            mostrarToast("Erro: " + (erro.error || "Falha no check-out"));
        }
    } catch (error) {
        console.error("Erro na API de Checkout:", error);
        mostrarToast("Falha de conexão com o servidor.");
    }
};

// --- FINALIZAR E RECARREGAR ---
window.finalizarCheckout = () => {
    window.location.reload();
};

// --- FUNÇÕES DE TOAST ---
function mostrarToast(mensagem) {
    const toast = document.getElementById("toast-aviso");
    if (toast) {
        toast.innerText = mensagem;
        toast.style.display = "block";
        toast.classList.remove("toast-hidden");
        setTimeout(() => {
            toast.classList.add("toast-hidden");
            setTimeout(() => { toast.style.display = "none"; }, 500);
        }, 3000);
    } else {
        alert(mensagem);
    }
}

function mostrarToast1(mensagem) {
    const toast = document.getElementById("toast-aviso1");
    if (toast) {
        toast.innerText = mensagem;
        toast.style.display = "block";
        toast.classList.remove("toast-hidden1");
        setTimeout(() => {
            toast.classList.add("toast-hidden1");
            setTimeout(() => { toast.style.display = "none"; }, 500);
        }, 3000);
    } else {
        alert(mensagem);
    }
}