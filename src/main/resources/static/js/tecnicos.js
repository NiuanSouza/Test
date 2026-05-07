let tecnicosAtuais = [];
let tecnicoEditandoMatricula = null;

const traducaoStatus = {
    "AVAILABLE": "Ativo",
    "ON_DUTY": "Em Serviço",
    "DISMISSED": "Inativo"
};

const traducaoPerfil = {
    "TECHNICIAN": "Técnico",
    "ADMINISTRATOR": "Gestor"
};

function traduzirParaBackend(statusUI) {
    switch (statusUI) {
        case "Ativo":
        case "AVAILABLE":
            return "AVAILABLE";
        case "Em Serviço":
        case "ON_DUTY":
            return "ON_DUTY";
        case "Inativo":
        case "Suspenso":
        case "DISMISSED":
            return "DISMISSED";
        default:
            return "AVAILABLE";
    }
}

async function buscarTecnicosDaAPI() {
    try {
        const response = await apiFetch("/user/technicians", { method: "GET" });

        if (response && response.ok) {
            const data = await response.json();
            tecnicosAtuais = data.map(u => ({
                registration: u.registration,
                name: u.name,
                email: u.email,
                phone: u.phone || "Não informado",
                setor: u.setor || "Operacional",
                perfil: u.permission || "TECHNICIAN",
                status: u.employeeStatus || "AVAILABLE"
            }));
            renderizarTecnicos(tecnicosAtuais);
        } else {
            console.error("Erro ao buscar técnicos. Status:", response?.status);
        }
    } catch (error) {
        console.error("Erro de conexão ao carregar técnicos:", error);
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
        const statusPT = traducaoStatus[tecnico.status] || "Ativo";
        const perfilPT = traducaoPerfil[tecnico.perfil] || "Técnico";

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

window.abrirEditarTecnico = function (matricula) {
    tecnicoEditandoMatricula = matricula;
    const tecnico = tecnicosAtuais.find(t => t.registration === matricula);
    if (!tecnico) return;

    document.getElementById("editarNome").value = tecnico.name;
    document.getElementById("editarEmail").value = tecnico.email;
    document.getElementById("editarMatricula").value = tecnico.registration;
    document.getElementById("editarTelefone").value = tecnico.phone !== "Não informado" ? tecnico.phone : "";

    if (document.getElementById("editarSetor")) document.getElementById("editarSetor").value = tecnico.setor;

    const statusAtualUI = traducaoStatus[tecnico.status] || "Ativo";
    const selectStatus = document.getElementById("editarStatus");
    if (selectStatus) selectStatus.value = statusAtualUI;

    const popup = document.getElementById("popupEditarTecnico");
    if (popup) popup.style.display = "flex";
};

window.fecharPopupEditarTecnico = function () {
    const popup = document.getElementById("popupEditarTecnico");
    if (popup) popup.style.display = "none";
};

window.salvarAlteracoesTecnico = async function () {
    const nome = document.getElementById("editarNome").value.trim();
    const email = document.getElementById("editarEmail").value.trim();
    const statusSelecionadoUI = document.getElementById("editarStatus").value;

    if (!nome || !email) {
        mostrarToast("Nome e E-mail são campos obrigatórios.");
        return;
    }

    const payload = {
        name: nome,
        email: email,
        phone: document.getElementById("editarTelefone").value.trim(),
        employeeStatus: traduzirParaBackend(statusSelecionadoUI)
    };

    try {
        const response = await apiFetch(`/user/update/${tecnicoEditandoMatricula}`, {
            method: "PATCH",
            body: JSON.stringify(payload)
        });

        if (response && response.ok) {
            mostrarToast("Técnico atualizado com sucesso!");
            fecharPopupEditarTecnico();
            buscarTecnicosDaAPI();
        } else {
            const errorData = await response.json();
            mostrarToast("Erro ao salvar: " + (errorData.error || "Erro desconhecido"));
        }
    } catch (error) {
        console.error("Erro na requisição de atualização:", error);
        mostrarToast("Erro de conexão com o servidor.");
    }
};

window.aplicarFiltroTecnicos = function () {
    const termo = document.getElementById("filtroBuscaTecnico")?.value.trim().toLowerCase() || "";

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

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("tecnicosTabelaCorpo")) {
        buscarTecnicosDaAPI();
    }
});