/**
 * js/vehicle.js
 * Responsável por: Cadastro, Listagem, Filtros e Seleção de Veículos.
 */

// ===================================================================
// UTILS
// ===================================================================
const traduzirCategoria = (cat) => {
    if (!cat) return 'PASSEIO';
    cat = cat.toLowerCase();
    if (cat === 'passenger') return 'PASSEIO';
    if (cat === 'utility') return 'UTILITÁRIO';
    return cat.toUpperCase();
};

// ===================================================================
// 1. CADASTRO DE VEÍCULOS
// ===================================================================

// Busca os modelos (Tipos de Carro) cadastrados para preencher o <select>
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

// Envia os dados do formulário para registrar uma nova viatura física
window.cadastrarVeiculo = async function () {
    const prefixo = document.getElementById("cad-prefixo")?.value;
    const placa = document.getElementById("cad-placa")?.value;
    const cor = document.getElementById("cad-cor")?.value;
    const tipoId = document.getElementById("cad-tipo")?.value;

    if (!prefixo || !placa || !tipoId) {
        window.mostrarToast("Por favor, preencha o Prefixo, Placa e selecione o Modelo.");
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
            } else {
                window.mostrarToast("Veículo cadastrado!", "toast-aviso1");
            }
            limparFormulario();
        } else if (response) {
            const erro = await response.json();
            window.mostrarToast("Erro no cadastro: " + (erro.error || "Verifique os dados."));
        }
    } catch (error) {
        console.error("Erro na requisição:", error);
        window.mostrarToast("Falha ao conectar com o servidor.");
    }
};

function limparFormulario() {
    ["cad-prefixo", "cad-placa", "cad-cor", "cad-tipo"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });
}

// ===================================================================
// 2. LISTAGEM DE VEÍCULOS DISPONÍVEIS
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
                // Filtra para exibir apenas veículos que não estão em uso ou manutenção
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
                btn.textContent = `Viatura ${v.prefix} - ${modelo}`;

                // Ao clicar, o veículo é selecionado temporariamente
                btn.onclick = () => selecionarVeiculo(
                    `Viatura ${v.prefix}`, modelo, marca, categoria, v.prefix, v.licensePlate, kmAtual
                );

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
// 3. SELEÇÃO DE VEÍCULO
// ===================================================================
let tempVehicle = {};

window.abrirModalConfirmacao = function() {
    const modal = document.getElementById("modalConfirmacao");
    if (modal) {
        modal.style.display = "flex";
        carregarVeiculosDisponiveis(); // Recarrega a lista para garantir dados frescos
    }
};

window.selecionarVeiculo = (title, model, brand, type, prefix, licensePlate, currentKm) => {
    // Guarda na variável temporária antes da confirmação final
    tempVehicle = { title, model, brand, type, prefix, licensePlate, currentKm };

    // Atualiza o DOM do Modal de Detalhes
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

// Confirma o uso do veículo e prepara o painel lateral de Check-in
window.confirmarVeiculo = () => {
    localStorage.setItem("selectedVehicle", JSON.stringify(tempVehicle));

    const inputKm = document.getElementById("quilometragem-inicial");
    const inputData = document.getElementById("data-inicial");
    const inputHora = document.getElementById("horario-inicial");

    // Preenche KM automaticamente e seta Data/Hora atuais
    if (inputKm) inputKm.value = tempVehicle.currentKm;
    const agora = new Date();
    if (inputData) inputData.value = new Date(agora.getTime() - (agora.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    if (inputHora) inputHora.value = agora.toTimeString().split(' ')[0].substring(0, 5);

    // Esconde o botão de selecionar e mostra os inputs do check-in
    const secaoPosCheckin = document.getElementById('secao-pos-checkin');
    const infoVeiculoDados = document.getElementById('info-veiculo-dados');
    const containerCheckinBotao = document.getElementById('container-checkin-botao');

    if (secaoPosCheckin) secaoPosCheckin.style.display = 'block';
    if (infoVeiculoDados) infoVeiculoDados.style.display = 'block';
    if (containerCheckinBotao) containerCheckinBotao.style.display = 'none';

    // Exibe os dados do veículo selecionado na sidebar
    if (document.getElementById('display-modelo')) document.getElementById('display-modelo').textContent = tempVehicle.model;
    if (document.getElementById('display-placa')) document.getElementById('display-placa').textContent = tempVehicle.licensePlate;
    if (document.getElementById('display-prefixo')) document.getElementById('display-prefixo').textContent = tempVehicle.prefix;

    const modalDet = document.getElementById("modalDetalhesVeiculo");
    if (modalDet) modalDet.style.display = "none";
};

// ===================================================================
// 4. SISTEMA DE FILTROS DO MODAL
// ===================================================================
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
// 5. INICIALIZAÇÃO DE EVENTOS DOM
// ===================================================================
document.addEventListener("DOMContentLoaded", () => {
    // Carrega dados base dependendo de qual tela o usuário está
    if (document.getElementById("cad-tipo")) carregarTiposVeiculo();
    if (document.getElementById("listaVeiculos")) carregarVeiculosDisponiveis();

    // Configuração dos botões de cadastro (Tela do Gestor)
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