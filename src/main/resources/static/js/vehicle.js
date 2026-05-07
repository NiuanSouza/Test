/**
 * js/vehicle.js
 * Unificação de Cadastro, Seleção, Filtros, Atualização de Veículos e Abastecimento
 */

const traduzirCategoria = (cat) => {
    if (!cat) return 'PASSEIO';
    cat = cat.toLowerCase();
    if (cat === 'passenger') return 'PASSEIO';
    if (cat === 'utility') return 'UTILITÁRIO';
    return cat.toUpperCase();
};

// ===================================================================
// 1. CADASTRO E CARREGAMENTO DE TIPOS
// ===================================================================
async function carregarTiposVeiculo() {
    const selectTipo = document.getElementById("cad-tipo");
    if (!selectTipo) return;
    try {
        const response = await apiFetch("/vehicle/types");
        if (response && response.ok) {
            const tipos = await response.json();
            selectTipo.innerHTML = '<option value="" disabled selected>Selecione um modelo...</option>';
            tipos.forEach(tipo => {
                const categoriaPt = traduzirCategoria(tipo.category);
                const option = document.createElement("option");
                option.value = tipo.id;
                option.textContent = `${tipo.brand} ${tipo.model} (${tipo.year}) - ${categoriaPt}`;
                selectTipo.appendChild(option);
            });
        } else {
            selectTipo.innerHTML = '<option value="" disabled>Erro ao carregar tipos.</option>';
        }
    } catch (error) {
        console.error("Erro ao carregar tipos de veículo:", error);
        if (selectTipo) selectTipo.innerHTML = '<option value="" disabled>Servidor offline.</option>';
    }
}

window.cadastrarVeiculo = async function () {
    const prefixo = document.getElementById("cad-prefixo")?.value;
    const placa = document.getElementById("cad-placa")?.value;
    const cor = document.getElementById("cad-cor")?.value;
    const tipoId = document.getElementById("cad-tipo")?.value;
    if (!prefixo || !placa || !tipoId) {
        if (typeof mostrarToast === "function") mostrarToast("Por favor, preencha o Prefixo, Placa e selecione o Modelo.");
        return;
    }
    const payload = {
        prefix: prefixo.trim(),
        licensePlate: placa.trim(),
        color: cor || "Não informada",
        available: true,
        currentKm: 0.0,
        type: { id: parseInt(tipoId) }
    };
    try {
        const response = await apiFetch("/vehicle/register", { method: "POST", body: JSON.stringify(payload) });
        if (response && response.ok) {
            const popupConf = document.getElementById('popupConfirmacao');
            const popupSuc = document.getElementById('popupSucesso');
            const msgSucesso = document.getElementById("mensagem-sucesso");
            if (popupConf) popupConf.style.display = 'none';
            if (msgSucesso) msgSucesso.textContent = "Veículo cadastrado com sucesso!";
            if (popupSuc) {
                popupSuc.style.display = 'flex';
                popupSuc.setAttribute("data-action", "cadastro");
            }
            limparFormulario();
        } else if (response) {
            const erro = await response.json();
            if (typeof mostrarToast === "function") mostrarToast("Erro no cadastro: " + (erro.error || "Verifique os dados."));
        }
    } catch (error) {
        console.error("Erro na requisição:", error);
        if (typeof mostrarToast === "function") mostrarToast("Falha ao conectar com o servidor.");
    }
};

function limparFormulario() {
    ["cad-prefixo", "cad-placa", "cad-cor", "cad-tipo"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });
}

// ===================================================================
// 2. SELEÇÃO E FILTROS DE VEÍCULOS
// ===================================================================
let tempVehicle = {};

// Função necessária para o botão "Selecionar Veículo" do seu HTML
window.abrirModalConfirmacao = function() {
    const modal = document.getElementById("modalConfirmacao");
    if (modal) {
        modal.style.display = "flex";
        carregarVeiculosDisponiveis(); // Atualiza a lista ao abrir
    }
};

window.selecionarVeiculo = (title, model, brand, type, prefix, licensePlate, currentKm) => {
    tempVehicle = { title, model, brand, type, prefix, licensePlate, currentKm };
    if (document.getElementById("fotoVeiculo")) document.getElementById("fotoVeiculo").src = "img/carro 1.jpg";
    if (document.getElementById("modeloVeiculo")) document.getElementById("modeloVeiculo").textContent = model;
    if (document.getElementById("marcaVeiculo")) document.getElementById("marcaVeiculo").textContent = brand;
    if (document.getElementById("tipoVeiculo")) document.getElementById("tipoVeiculo").textContent = type;
    if (document.getElementById("placaVeiculo")) document.getElementById("placaVeiculo").textContent = licensePlate;
    if (document.getElementById("prefixoVeiculo")) document.getElementById("prefixoVeiculo").textContent = prefix;
    if (document.getElementById("quilometragem")) document.getElementById("quilometragem").textContent = (currentKm || 0) + " km";

    if (document.getElementById("modalConfirmacao")) document.getElementById("modalConfirmacao").style.display = "none";
    if (document.getElementById("modalDetalhesVeiculo")) document.getElementById("modalDetalhesVeiculo").style.display = "flex";
};

window.voltarParaVeiculos = () => {
    if (document.getElementById("modalDetalhesVeiculo")) document.getElementById("modalDetalhesVeiculo").style.display = "none";
    if (document.getElementById("modalConfirmacao")) document.getElementById("modalConfirmacao").style.display = "flex";
};

window.confirmarVeiculo = () => {
    localStorage.setItem("selectedVehicle", JSON.stringify(tempVehicle));
    const inputKm = document.getElementById("quilometragem-inicial");
    const inputData = document.getElementById("data-inicial");
    const inputHora = document.getElementById("horario-inicial");
    if (inputKm) inputKm.value = tempVehicle.currentKm;
    const agora = new Date();
    if (inputData) inputData.value = new Date(agora.getTime() - (agora.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    if (inputHora) inputHora.value = agora.toTimeString().split(' ')[0].substring(0, 5);

    const secaoPosCheckin = document.getElementById('secao-pos-checkin');
    const infoVeiculoDados = document.getElementById('info-veiculo-dados');
    const containerCheckinBotao = document.getElementById('container-checkin-botao');
    if (secaoPosCheckin) secaoPosCheckin.style.display = 'block';
    if (infoVeiculoDados) infoVeiculoDados.style.display = 'block';
    if (containerCheckinBotao) containerCheckinBotao.style.display = 'none';

    if (document.getElementById('display-modelo')) document.getElementById('display-modelo').textContent = tempVehicle.model;
    if (document.getElementById('display-placa')) document.getElementById('display-placa').textContent = tempVehicle.licensePlate;
    if (document.getElementById('display-prefixo')) document.getElementById('display-prefixo').textContent = tempVehicle.prefix;

    const modalDet = document.getElementById("modalDetalhesVeiculo");
    if (modalDet) modalDet.style.display = "none";
};

window.abrirModalFiltro = function () {
    const modal = document.getElementById('modalFiltroAvancado');
    if (modal) modal.style.display = 'flex';
};

window.fecharModalFiltro = function () {
    const modal = document.getElementById('modalFiltroAvancado');
    if (modal) modal.style.display = 'none';
};

window.aplicarFiltros = function () {
    const pesquisa = document.getElementById('inputPesquisa')?.value.toUpperCase() || "";
    const tipo = document.getElementById('filtroTipo')?.value.toUpperCase() || "TODOS";
    const marca = document.getElementById('filtroMarca')?.value.toUpperCase() || "TODOS";
    const botoes = document.querySelectorAll('.btn-veiculo');
    botoes.forEach(btn => {
        const txtBotao = btn.textContent.toUpperCase();
        const vTipo = (btn.getAttribute('data-tipo') || "").toUpperCase();
        const vMarca = (btn.getAttribute('data-marca') || "").toUpperCase();
        const batePesquisa = txtBotao.includes(pesquisa);
        const bateTipo = (tipo === "TODOS" || vTipo === tipo);
        const bateMarca = (marca === "TODOS" || vMarca === marca);
        if (batePesquisa && bateTipo && bateMarca) {
            btn.style.display = "block";
        } else {
            btn.style.display = "none";
        }
    });
    fecharModalFiltro();
};

window.filtrarVeiculos = () => aplicarFiltros();

// ===================================================================
// 2.5 BUSCAR VEÍCULOS DISPONÍVEIS DO BACK-END
// ===================================================================
async function carregarVeiculosDisponiveis() {
    const listaVeiculos = document.getElementById("listaVeiculos");
    if (!listaVeiculos) return;
    listaVeiculos.innerHTML = '<p style="text-align:center; padding: 20px;">Carregando veículos...</p>';
    try {
        const response = await apiFetch("/vehicle");
        if (response && response.ok) {
            const veiculos = await response.json();
            listaVeiculos.innerHTML = '';
            let veiculosLivres = 0;
            veiculos.forEach(v => {
                if (v.available === false || String(v.available) === "false" || v.vehicleStatus === "IN_USE" || v.vehicleStatus === "MAINTENANCE") {
                    return;
                }
                veiculosLivres++;
                const marca = v.type ? v.type.brand : 'Desconhecida';
                const modelo = v.type ? v.type.model : 'Desconhecido';
                const categoria = traduzirCategoria(v.type ? v.type.category : '');
                const kmAtual = (v.currentKm !== undefined && v.currentKm !== null) ? v.currentKm : 0;
                const btn = document.createElement("button");
                btn.className = "btn-veiculo";
                btn.setAttribute("data-tipo", categoria.toUpperCase());
                btn.setAttribute("data-marca", marca.toUpperCase());
                btn.onclick = () => selecionarVeiculo(
                    `Viatura ${v.prefix}`, modelo, marca, categoria, v.prefix, v.licensePlate, kmAtual
                );
                btn.textContent = `Viatura ${v.prefix} - ${modelo}`;
                listaVeiculos.appendChild(btn);
            });
            if (veiculosLivres === 0) {
                listaVeiculos.innerHTML = '<p style="text-align:center; padding: 20px;">Nenhum veículo disponível no momento.</p>';
            }
        } else {
            listaVeiculos.innerHTML = '<p style="text-align:center; padding: 20px; color: red;">Erro ao carregar veículos.</p>';
        }
    } catch (error) {
        console.error("Erro ao buscar veículos:", error);
        listaVeiculos.innerHTML = '<p style="text-align:center; padding: 20px; color: red;">Falha de conexão com o servidor.</p>';
    }
}

// ===================================================================
// 3. CHECK-IN E ABASTECIMENTO COM O BACKEND
// ===================================================================
window.salvarVeiculoInfo = async function () {
    const km = document.getElementById("quilometragem-inicial")?.value;
    const data = document.getElementById("data-inicial")?.value;
    const hora = document.getElementById("horario-inicial")?.value;
    const notes = document.getElementById("observacoes")?.value || "";
    if (!km || !data || !hora) {
        if (typeof mostrarToast === "function") mostrarToast("Preencha KM, Data e Horário!");
        return;
    }
    const vehicle = JSON.parse(localStorage.getItem('selectedVehicle'));
    if (!vehicle || !vehicle.prefix) {
        if (typeof mostrarToast === "function") mostrarToast("Nenhum veículo selecionado.");
        return;
    }
    try {
        const response = await apiFetch(`/vehicle/${vehicle.prefix.trim()}/update-data`, {
            method: 'PATCH',
            body: JSON.stringify({ mileage: parseFloat(km), observations: notes })
        });
        if (response && response.ok) {
            localStorage.setItem("km", km);
            localStorage.setItem("obs", notes);
            const msgSucesso = document.getElementById("mensagem-sucesso");
            if (msgSucesso) msgSucesso.textContent = "Check-in realizado com sucesso!";
            const popupSuc = document.getElementById('popupSucesso');
            if (popupSuc) {
                popupSuc.style.display = 'flex';
                popupSuc.setAttribute("data-action", "checkin");
            }
        } else {
            const erro = await response.json();
            if (typeof mostrarToast === "function") mostrarToast("Erro no check-in: " + (erro.error || ""));
        }
    } catch (error) {
        console.error("Erro ao fazer check-in:", error);
        if (typeof mostrarToast === "function") mostrarToast("Falha ao conectar com o servidor.");
    }
};

window.abrirPopupAbastecimento = function() {
    const popup = document.getElementById('popupAbastecimento');
    if (popup) popup.style.display = 'flex';
};

window.registrarAbastecimento = async function () {
    const litros = document.getElementById("litros-abastecimento")?.value;
    const preco = document.getElementById("preco-litro")?.value;
    const data = document.getElementById("data-abastecimento")?.value;
    const hora = document.getElementById("hora-abastecimento")?.value;
    if (!litros || !preco || !data || !hora) {
        if (typeof mostrarToast === "function") mostrarToast("Preencha todos os campos obrigatórios.");
        return;
    }
    const vehicle = JSON.parse(localStorage.getItem('selectedVehicle'));
    if (!vehicle || !vehicle.prefix) {
        if (typeof mostrarToast === "function") mostrarToast("Nenhum veículo selecionado.");
        return;
    }
    const valorTotal = (parseFloat(litros) * parseFloat(preco)).toFixed(2);
    const dataHoraIso = `${data}T${hora}:00`;
    try {
        const response = await apiFetch(`/vehicle/${vehicle.prefix}/fuel`, {
            method: 'POST',
            body: JSON.stringify({ value: parseFloat(valorTotal), date: dataHoraIso })
        });
        if (response && response.ok) {
            document.getElementById('popupConfirmacaoAbs').style.display = 'none';
            const msgSucesso = document.getElementById("mensagem-sucesso");
            if (msgSucesso) msgSucesso.textContent = "Abastecimento registrado com sucesso!";
            const popupSuc = document.getElementById('popupSucesso');
            if (popupSuc) {
                popupSuc.style.display = 'flex';
                popupSuc.setAttribute("data-action", "abastecimento");
            }
        } else {
            const erro = await response.json();
            if (typeof mostrarToast === "function") mostrarToast("Erro ao abastecer: " + (erro.error || ""));
        }
    } catch (error) {
        console.error("Erro na requisição de abastecimento:", error);
        if (typeof mostrarToast === "function") mostrarToast("Falha ao conectar com o servidor.");
    }
};

window.fecharSucesso = function() {
    const popupSuc = document.getElementById('popupSucesso');
    if (!popupSuc) return;
    const action = popupSuc.getAttribute("data-action");
    popupSuc.style.display = 'none';
    if (action === "checkin") {
        window.location.href = "telainicial.html";
    } else {
        window.location.reload();
    }
};

window.transicaoPosCheckin = function () {
    const IDs = ['grupo-km-inicial', 'btn-salvar-veiculo', 'btn-cancelar-veiculo'];
    IDs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    const IDsShow = ['grupo-km-final', 'btn-abs-veiculo', 'btn-checkout'];
    IDsShow.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'inline-block';
    });
};

window.cancelarVeiculoInfo = function () {
    const secaoPosCheckin = document.getElementById('secao-pos-checkin');
    const infoVeiculoDados = document.getElementById('info-veiculo-dados');
    const containerCheckinBotao = document.getElementById('container-checkin-botao');
    if (secaoPosCheckin) secaoPosCheckin.style.display = 'none';
    if (infoVeiculoDados) infoVeiculoDados.style.display = 'none';
    if (containerCheckinBotao) containerCheckinBotao.style.display = 'block';
};

// ===================================================================
// 4. INICIALIZAÇÃO E VÍNCULO DE EVENTOS
// ===================================================================
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("cad-tipo")) carregarTiposVeiculo();
    if (document.getElementById("listaVeiculos")) carregarVeiculosDisponiveis();
    const btnFecharSucesso = document.querySelector('#popupSucesso button');
    if (btnFecharSucesso) {
        btnFecharSucesso.onclick = () => window.fecharSucesso();
    }
    const popupConfirmacaoCad = document.getElementById('popupConfirmacao');
    const btncadastrar = document.getElementById('btncadastrar');
    const btnConfirmarFinal = document.getElementById('btn-confirmar-final');
    if (btncadastrar && popupConfirmacaoCad) {
        btncadastrar.addEventListener('click', () => {
            popupConfirmacaoCad.style.display = 'flex';
        });
    }
    if (btnConfirmarFinal) {
        btnConfirmarFinal.onclick = (e) => {
            e.preventDefault();
            cadastrarVeiculo();
        };
    }
});

if (typeof window.mostrarToast === "undefined") {
    window.mostrarToast = function (mensagem) {
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
    };
}