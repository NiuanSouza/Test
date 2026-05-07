// Função principal de cadastro integrada com a API
window.cadastrarUsuario = async function () {
    const nameInput = document.getElementById("cadNome")?.value;
    const emailInput = document.getElementById("cadEmail")?.value;
    const registrationInput = document.getElementById("cadMatricula")?.value;
    const passwordInput = document.getElementById("cadSenha")?.value;

    if (!nameInput || !emailInput || !registrationInput || !passwordInput) {
        mostrarToast("Preencha todos os campos!");
        return;
    }

    // Payload compatível com RegisterDTO / backend Spring Boot
    const payload = {
        registration: registrationInput,
        name: nameInput,
        email: emailInput,
        password: passwordInput,
        permission: "TECHNICIAN" // Mantido em maiúsculo por padrão de Enums no Java
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
            if (popupSuc) popupSuc.style.display = 'flex';

            // Limpa os campos após sucesso
            ["cadNome", "cadEmail", "cadMatricula", "cadSenha"].forEach(id => {
                const field = document.getElementById(id);
                if (field) field.value = "";
            });

        } else if (response) {
            const errorMsg = await response.text();
            mostrarToast("Erro ao cadastrar: " + errorMsg);
        }
    } catch (error) {
        console.error("Connection error:", error);
        mostrarToast("Erro de conexão com o servidor.");
    }
};

// Gerenciamento de Eventos e Popups após o carregamento da página
document.addEventListener("DOMContentLoaded", () => {
    const popupConfirmacao = document.getElementById('popupConfirmacao');
    const popupSucesso = document.getElementById('popupSucesso');
    const btncadastrar = document.getElementById('btncadastrar');
    const btnCancelar = document.getElementById('btn-cancelar-confirmacao');
    const btnConfirmarFinal = document.getElementById('btn-confirmar-final');
    const btnFecharSucesso = document.getElementById('btn-fechar-sucesso');

    // 1. Abre a tela de confirmação
    if (btncadastrar) {
        btncadastrar.addEventListener('click', () => {
            if (popupConfirmacao) popupConfirmacao.style.display = 'flex';
        });
    }

    // 2. Cancela a ação
    if (btnCancelar) {
        btnCancelar.addEventListener('click', () => {
            if (popupConfirmacao) popupConfirmacao.style.display = 'none';
        });
    }

    // 3. Confirma a ação e dispara a API
    if (btnConfirmarFinal) {
        btnConfirmarFinal.onclick = (e) => {
            e.preventDefault(); // Bloqueia o refresh da página (essencial)
            cadastrarUsuario(); // CHAMA A API AQUI
        };
    }

    // 4. Fechar o popup de sucesso final
    if (btnFecharSucesso) {
        btnFecharSucesso.addEventListener('click', () => {
            if (popupSucesso) popupSucesso.style.display = 'none';
        });
    }
});

// Função para mostrar o Toast com Fallback
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
    } else {
        alert(mensagem); // Fallback caso o HTML não possua a div do Toast
    }
};