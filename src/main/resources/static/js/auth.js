/**
 * js/auth.js
 * Responsável por: Autenticação de usuários (Login) e manipulação visual da tela de entrada.
 */

// ===================================================================
// 1. LÓGICA DE LOGIN COM O BACKEND
// ===================================================================
window.btnindex = async function () {
    const regField = document.getElementById("matricula");
    const passField = document.getElementById("senha");

    // Validação inicial e sanitização (trim remove espaços em branco acidentais)
    if (!regField?.value.trim() || !passField?.value) {
        window.mostrarToast("Por favor, preencha todos os campos.");
        return;
    }

    const loginData = {
        registration: String(regField.value.trim()),
        password: passField.value
    };

    try {
        const response = await apiFetch("/user/login", {
            method: "POST",
            body: JSON.stringify(loginData)
        });

        if (response && response.ok) {
            const data = await response.json();

            // Salva o Token JWT usando a constante global do basic.js
            if (data.token) {
                localStorage.setItem(CONFIG.TOKEN_KEY, data.token);
            }

            // Decodifica o payload do token para extrair as roles e o nome,
            // fazendo fallback para o body da requisição, caso o backend envie fora do token
            const payload = data.token ? CONFIG.decodeToken(data.token) : null;
            const permission = String(payload?.permission || data.permission || "TECHNICIAN")
                .toUpperCase().replace("ROLE_", "");
            const name = payload?.name || data.name || "Usuário";

            // Persistência local da sessão do usuário
            localStorage.setItem("userName", name);
            localStorage.setItem("userPermission", permission);
            localStorage.setItem("userRegistration", loginData.registration);

            // Redirecionamento centralizado (respeitando as regras e o DEV_MODE do basic.js)
            CONFIG.redirectByPermission();

        } else if (response) {
            // Tenta extrair a mensagem de erro específica vinda do Spring Boot
            const errorData = await response.json().catch(() => ({}));
            const mensagem = errorData.error || errorData.message || "Matrícula ou senha incorretos.";
            window.mostrarToast(mensagem);
        }
    } catch (error) {
        console.error("Erro no Login:", error);
        window.mostrarToast("Erro ao conectar com o servidor.");
    }
};

// ===================================================================
// 2. INTERFACE (Manipulação DOM)
// ===================================================================
window.togglePassword = function () {
    const passwordField = document.getElementById("senha");
    const eyeLine = document.getElementById("eyeLine"); // Linha diagonal sobre o ícone do olho

    if (passwordField) {
        // Alterna entre texto legível e asteriscos de senha
        const isPass = passwordField.type === "password";
        passwordField.type = isPass ? "text" : "password";

        // Exibe ou oculta o "risco" no ícone do olho para indicar visibilidade
        if (eyeLine) {
            eyeLine.style.display = isPass ? "block" : "none";
        }
    }
};

// Adiciona listener para permitir login teclando "Enter" (opcional caso falte no ui.js)
document.addEventListener('DOMContentLoaded', () => {
    const passField = document.getElementById("senha");
    if (passField) {
        passField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                window.btnindex();
            }
        });
    }
});