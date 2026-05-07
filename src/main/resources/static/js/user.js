/**
 * js/user.js (ou cadusuarios.js)
 * Responsável por: Cadastro de novos usuários (Técnicos) no sistema.
 */

// ===================================================================
// 1. INTEGRAÇÃO COM A API: CADASTRAR USUÁRIO
// ===================================================================
window.cadastrarUsuario = async function () {
    const nameInput = document.getElementById("cadNome")?.value;
    const emailInput = document.getElementById("cadEmail")?.value;
    const registrationInput = document.getElementById("cadMatricula")?.value;
    const passwordInput = document.getElementById("cadSenha")?.value;

    if (!nameInput || !emailInput || !registrationInput || !passwordInput) {
        window.mostrarToast("Preencha todos os campos obrigatórios!");
        return;
    }

    // Payload compatível com o RegisterDTO do backend Spring Boot
    const payload = {
        registration: registrationInput.trim(),
        name: nameInput.trim(),
        email: emailInput.trim(),
        password: passwordInput,
        permission: "TECHNICIAN" // Mantido em maiúsculo pelo padrão do Enum no Java
    };

    try {
        const response = await apiFetch("/user/register", {
            method: "POST",
            body: JSON.stringify(payload)
        });

        if (response && response.ok) {
            // Sucesso: Troca os modais visuais
            const popupConf = document.getElementById('popupConfirmacao');
            const popupSuc = document.getElementById('popupSucesso');

            if (popupConf) popupConf.style.display = 'none';
            if (popupSuc) {
                popupSuc.style.display = 'flex';
            } else {
                window.mostrarToast("Usuário cadastrado com sucesso!", "toast-aviso1");
            }

            limparFormularioUsuario();
        } else if (response) {
            // Tenta extrair a mensagem de erro formatada do Spring Boot
            const erro = await response.json().catch(() => ({}));
            const mensagemErro = erro.error || erro.message || "Verifique os dados informados.";
            window.mostrarToast("Erro ao cadastrar: " + mensagemErro);
        }
    } catch (error) {
        console.error("Erro na requisição de cadastro:", error);
        window.mostrarToast("Falha de conexão com o servidor.");
    }
};

// ===================================================================
// 2. FUNÇÕES AUXILIARES DE UI
// ===================================================================
function limparFormularioUsuario() {
    ["cadNome", "cadEmail", "cadMatricula", "cadSenha"].forEach(id => {
        const field = document.getElementById(id);
        if (field) field.value = "";
    });
}

// ===================================================================
// 3. INICIALIZAÇÃO DE EVENTOS DOM (Popups e Botões)
// ===================================================================
document.addEventListener("DOMContentLoaded", () => {
    const popupConfirmacao = document.getElementById('popupConfirmacao');
    const popupSucesso = document.getElementById('popupSucesso');

    const btnCadastrar = document.getElementById('btncadastrar');
    const btnCancelarConf = document.getElementById('btn-cancelar-confirmacao');
    const btnConfirmarFinal = document.getElementById('btn-confirmar-final');
    const btnFecharSucesso = document.getElementById('btn-fechar-sucesso');

    // Abre a tela de confirmação antes de salvar
    if (btnCadastrar && popupConfirmacao) {
        btnCadastrar.addEventListener('click', () => {
            popupConfirmacao.style.display = 'flex';
        });
    }

    // Cancela a ação e fecha o modal
    if (btnCancelarConf && popupConfirmacao) {
        btnCancelarConf.addEventListener('click', () => {
            popupConfirmacao.style.display = 'none';
        });
    }

    // Confirma a ação e dispara a requisição para a API
    if (btnConfirmarFinal) {
        btnConfirmarFinal.addEventListener('click', (e) => {
            e.preventDefault(); // Bloqueia o refresh da página (essencial em formulários)
            window.cadastrarUsuario();
        });
    }

    // Fecha o popup de sucesso final
    if (btnFecharSucesso && popupSucesso) {
        btnFecharSucesso.addEventListener('click', () => {
            popupSucesso.style.display = 'none';
        });
    }
});