/**
 * LÓGICA DE LOGIN
 */
window.btnindex = async function () {
    const regField = document.getElementById("matricula");
    const passField = document.getElementById("senha");

    if (!regField?.value || !passField?.value) {
        mostrarToast("Por favor, preencha todos os campos.");
        return;
    }

    const loginData = {
        registration: String(regField.value),
        password: passField.value
    };

    try {
        const response = await apiFetch("/user/login", {
            method: "POST",
            body: JSON.stringify(loginData)
        });

        if (response && response.ok) {
            const data = await response.json();

            // Salva Token
            if (data.token) localStorage.setItem(CONFIG.TOKEN_KEY, data.token);

            // Decodifica para pegar dados extras se existirem, senão usa o retorno do body
            const payload = data.token ? CONFIG.decodeToken(data.token) : null;
            const permission = String(payload?.permission || data.permission || "TECHNICIAN")
                .toUpperCase().replace("ROLE_", "");
            const name = payload?.name || data.name || "Usuário";

            // Persistência local
            localStorage.setItem("userName", name);
            localStorage.setItem("userPermission", permission);
            localStorage.setItem("userRegistration", loginData.registration);

            // Redirecionamento (Respeita o DEV_MODE via CONFIG)
            CONFIG.redirectByPermission();
        } else {
            mostrarToast("Matrícula ou senha incorretos.");
        }
    } catch (error) {
        mostrarToast("Erro ao conectar com o servidor.");
    }
};

/**
 * INTERFACE
 */
window.togglePassword = function () {
    const passwordField = document.getElementById("senha");
    const eyeLine = document.getElementById("eyeLine");

    if (passwordField) {
        const isPass = passwordField.type === "password";
        passwordField.type = isPass ? "text" : "password";
        if (eyeLine) eyeLine.style.display = isPass ? "block" : "none";
    }
};