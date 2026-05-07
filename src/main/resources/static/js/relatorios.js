/**
 * js/tecnicos.js
 * Responsável por: Listagem, filtro e edição de Técnicos (Tela do Gestor).
 */

// ===================================================================
// 1. ESTADO GLOBAL E DICIONÁRIOS
// ===================================================================
let tecnicosAtuais = [];
let tecnicoEditandoMatricula = null;

const TRANSLATION = {
    STATUS: {
        "AVAILABLE": "Ativo",
        "ON_DUTY": "Em Serviço",
        "DISMISSED": "Inativo"
    },
    PERFIL: {
        "TECHNICIAN": "Técnico",
        "ADMINISTRATOR": "Gestor"
    }
};

// Converte a label da interface de volta para o ENUM do backend
function getBackendStatus(statusUI) {
    const mapaInverso = {
        "Ativo": "AVAILABLE",
        "Em Serviço": "ON_DUTY",
        "Inativo": "DISMISSED",
        "Suspenso": "DISMISSED"
    };
    return mapaInverso[statusUI] || "AVAILABLE";
}

// ===================================================================
// 2. BUSCA E RENDERIZAÇÃO
// ===================================================================
async function buscarTecnicosDaAPI() {
    const corpoTabela = document.getElementById("tecnicosTabelaCorpo");
    if (corpoTabela) {
        corpoTabela.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 20px;">Carregando técnicos...</td></tr>`;
    }

    try {
        const response = await apiFetch("/user/technicians", { method: "GET" });
        if (!response) return; // basic.js trata redirecionamento se token for inválido

        if (response.ok) {
            const data = await response.json();
            tecnicosAtuais = data.map(u => ({
                registration: u.registration,
                name: u.name,
                email: u.email,
                phone: u.phone || "Não informado",
                setor: u.setor || "Operacional", // Assumindo setor default se não existir no back
                perfil: u.permission || "TECHNICIAN",
                status: u.employeeStatus || "AVAILABLE"
            }));

            renderizarTecnicos(tecnicosAtuais);
        } else {
            const errorMsg = await response.text();
            if (corpoTabela) corpoTabela.innerHTML = `<tr><td colspan="7" style="text-align:center; color:red;">Erro ao carregar técnicos.</td></tr>`;
            console.error("Erro na busca de técnicos:", errorMsg);
        }
    } catch (error) {
        console.error("Erro de conexão ao carregar técnicos:", error);
        window.mostrarToast("Falha de comunicação com o servidor.");
        if (corpoTabela) corpoTabela.innerHTML = `<tr><td colspan="7" style="text-align:center; color:red;">Sem conexão com o servidor.</td></tr>`;
    }
}

function renderizarTecnicos(lista) {
    const corpo = document.getElementById("tecnicosTabelaCorpo");
    if (!corpo) return;

    if (!lista || lista.length === 0) {
        corpo.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 32px 0; color: #4a5c7f;">Nenhum técnico encontrado.</td></tr>`;
        return;
    }

    corpo.innerHTML = lista.map(tecnico => {
        const statusPT = TRANSLATION.STATUS[tecnico.status] || "Ativo";
        const perfilPT = TRANSLATION.PERFIL[tecnico.perfil] || "Técnico";

        return `
            <tr>
                <td>${tecnico.name}</td>
                <td>${tecnico.registration}</td>
                <td>${tecnico.email}</td>
                <td>${tecnico.setor}</td>
                <td>${perfilPT}</td>
                <td><span class="status-badge status-${tecnico.status}">${statusPT}</span></td>
                <td>
                    <button class="btn-tecnico-editar" type="button" onclick="abrirEditarTecnico('${tecnico.registration}')">
                        Editar
                    </button>
                </td>
            </tr>
        `;
    }).join("");
}

// ===================================================================
// 3. EDIÇÃO DE TÉCNICOS (UI e Integração)
// ===================================================================
window.abrirEditarTecnico = function (matricula) {
    tecnicoEditandoMatricula = matricula;
    const tecnico = tecnicosAtuais.find(t => t.registration === matricula);

    if (!tecnico) return;

    // Função de segurança para não quebrar caso o HTML não tenha o ID
    const preencherCampo = (id, valor) => {
        const el = document.getElementById(id);
        if (el) el.value = valor;
    };

    preencherCampo("editarNome", tecnico.name);
    preencherCampo("editarEmail", tecnico.email);
    preencherCampo("editarMatricula", tecnico.registration);
    preencherCampo("editarTelefone", tecnico.phone !== "Não informado" ? tecnico.phone : "");
    preencherCampo("editarSetor", tecnico.setor);

    // Ajusta o Select do Status
    const statusAtualUI = TRANSLATION.STATUS[tecnico.status] || "Ativo";
    preencherCampo("editarStatus", statusAtualUI);

    const popup = document.getElementById("popupEditarTecnico");
    if (popup) popup.style.display = "flex";
};

window.fecharPopupEditarTecnico = function () {
    const popup = document.getElementById("popupEditarTecnico");
    if (popup) popup.style.display = "none";
    tecnicoEditandoMatricula = null; // Limpa o estado
};

window.salvarAlteracoesTecnico = async function () {
    const nome = document.getElementById("editarNome")?.value.trim();
    const email = document.getElementById("editarEmail")?.value.trim();
    const statusSelecionadoUI = document.getElementById("editarStatus")?.value;

    if (!nome || !email) {
        window.mostrarToast("Nome e E-mail são campos obrigatórios.");
        return;
    }

    const payload = {
        name: nome,
        email: email,
        phone: document.getElementById("editarTelefone")?.value.trim() || null,
        employeeStatus: getBackendStatus(statusSelecionadoUI)
    };

    try {
        const response = await apiFetch(`/user/update/${tecnicoEditandoMatricula}`, {
            method: "PATCH",
            body: JSON.stringify(payload)
        });

        if (response && response.ok) {
            window.mostrarToast("Técnico atualizado com sucesso!", "toast-aviso1");
            window.fecharPopupEditarTecnico();
            buscarTecnicosDaAPI(); // Recarrega a tabela com os novos dados
        } else if (response) {
            // Tenta pegar o JSON ou o texto do erro
            const errorData = await response.json().catch(() => ({}));
            const mensagem = errorData.error || errorData.message || "Verifique os dados informados.";
            window.mostrarToast("Erro ao salvar: " + mensagem);
        }
    } catch (error) {
        console.error("Erro na requisição de atualização:", error);
        window.mostrarToast("Erro de conexão com o servidor.");
    }
};

// ===================================================================
// 4. SISTEMA DE FILTROS LOCAIS
// ===================================================================
window.aplicarFiltroTecnicos = function () {
    const termo = document.getElementById("filtroBuscaTecnico")?.value.trim().toLowerCase() || "";

    if (!termo) {
        renderizarTecnicos(tecnicosAtuais);
        return;
    }

    const filtrados = tecnicosAtuais.filter(t => {
        return [t.name, t.registration, t.email, t.setor].some(campo =>
            (campo || "").toLowerCase().includes(termo)
        );
    });

    renderizarTecnicos(filtrados);
};

window.limparFiltroTecnicos = function () {
    const campo = document.getElementById("filtroBuscaTecnico");
    if (campo) campo.value = "";
    renderizarTecnicos(tecnicosAtuais);
};

// ===================================================================
// 5. INICIALIZAÇÃO
// ===================================================================
document.addEventListener("DOMContentLoaded", () => {
    // Só faz a requisição se a tabela de técnicos existir na página atual
    if (document.getElementById("tecnicosTabelaCorpo")) {
        buscarTecnicosDaAPI();
    }
});