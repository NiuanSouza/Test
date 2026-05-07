/**
 * BASIC.JS - Núcleo do Sistema
 * Responsável por: Autenticação, Comunicação API, UI de Erros e Toasts.
 */

const CONFIG = {
    // Configurações de Ambiente
    API_URL: "http://localhost:8080",
    TOKEN_KEY: "auth_token",

    /** * MODO DESENVOLVEDOR (DEV_MODE)
     * Se true: impede redirecionamentos automáticos para a tela de login.
     * Útil para estilizar páginas sem precisar logar repetidamente.
     */
    DEV_MODE: false,

    /**
     * Valida a sessão atual do usuário.
     * Executada automaticamente ao carregar o script.
     */
    checkAuth: function () {
        if (this.DEV_MODE) {
            console.warn("⚠️ [DEV MODE] Redirecionamentos de segurança desativados.");
            return localStorage.getItem(this.TOKEN_KEY);
        }

        const token = localStorage.getItem(this.TOKEN_KEY);
        const path = window.location.pathname;
        const isLoginPage = path.endsWith("index.html") || path === "/" || path === "";

        // Verifica se o usuário não tem token ou se ele expirou
        if (!token || this.isTokenExpired(token)) {
            this.handleLogout(isLoginPage);
            return null;
        }

        // Se estiver logado e tentar acessar a tela de login, redireciona para a home
        if (isLoginPage) {
            this.redirectByPermission();
        }

        return token;
    },

    /**
     * Verifica a validade temporal do JWT (Margem de segurança de 10s).
     */
    isTokenExpired: function (token) {
        try {
            const payload = this.decodeToken(token);
            if (!payload || !payload.exp) return true;

            // exp está em segundos, Date.now() em milissegundos
            const expirationTime = (payload.exp * 1000) - 10000;
            return Date.now() >= expirationTime;
        } catch (e) {
            return true;
        }
    },

    /**
     * Decodifica o payload do JWT tratando caracteres especiais (UTF-8).
     */
    decodeToken: function (token) {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) return null;

            // Corrige caracteres base64url e decodifica para string
            const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64).split('').map(c => {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join('')
            );

            return JSON.parse(jsonPayload);
        } catch (e) {
            console.error("Erro ao decodificar token:", e);
            return null;
        }
    },

    /**
     * Lógica centralizada de redirecionamento baseada em permissão.
     */
    redirectByPermission: function () {
        const rawPermission = localStorage.getItem("userPermission") || "";
        const permission = rawPermission.trim().toUpperCase().replace("ROLE_", "");

        const destination = (permission === "ADMINISTRATOR")
            ? "telainicial-gestor.html"
            : "telainicial.html";

        window.location.href = destination;
    },

    /**
     * Finaliza a sessão limpando dados locais.
     */
    handleLogout: function (isLoginPage = false) {
        localStorage.clear();
        if (!isLoginPage && !this.DEV_MODE) {
            window.location.href = "index.html";
        }
    },

    /**
     * Injeta o CSS necessário para os componentes globais (Toast e Erros).
     */
    injectGlobalStyles: function() {
        if (document.getElementById("basic-global-styles")) return;
        const style = document.createElement("style");
        style.id = "basic-global-styles";
        style.innerHTML = `
            /* Estilo do Container de Erro */
            .error-container-global {
                background-color: #ffebee;
                border: 1px solid #f44336;
                color: #b71c1c;
                padding: 20px;
                border-radius: 8px;
                margin: 20px auto;
                text-align: left;
                width: 95%;
                max-width: 1200px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                animation: basicFadeIn 0.3s ease-out;
            }
            .error-details { 
                font-size: 12px; background: #fff; padding: 10px; 
                border: 1px solid #ffcdd2; color: #333; 
                font-family: monospace; overflow-x: auto; margin-top: 10px;
            }
            @keyframes basicFadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
            
            /* Classes de ocultação para Toasts */
            .toast-hidden, .toast-hidden1 { opacity: 0; transition: opacity 0.5s ease; }
        `;
        document.head.appendChild(style);
    }
};

/**
 * FETCH WRAPPER - Padroniza requisições para a API.
 */
async function apiFetch(endpoint, options = {}) {
    const token = localStorage.getItem(CONFIG.TOKEN_KEY);
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
        const response = await fetch(`${CONFIG.API_URL}${endpoint}`, { ...options, headers });

        // Trata expiração de sessão (401/403)
        if ([401, 403].includes(response.status)) {
            console.warn("Sessão inválida. Redirecionando...");
            CONFIG.handleLogout(window.location.pathname.endsWith("index.html"));
            return null;
        }

        return response;
    } catch (error) {
        console.error("Erro de conexão na API:", error);
        throw error;
    }
}

/**
 * SISTEMA DE TOAST GLOBAL
 * @param {string} mensagem - Texto a ser exibido
 * @param {string} toastId - ID do elemento HTML (default: toast-aviso)
 */
window.mostrarToast = function (mensagem, toastId = "toast-aviso") {
    const toast = document.getElementById(toastId);
    if (!toast) {
        alert(mensagem); // Fallback caso o HTML não tenha o elemento toast
        return;
    }

    toast.innerText = mensagem;
    toast.style.display = "block";
    toast.classList.remove("toast-hidden", "toast-hidden1");

    setTimeout(() => {
        toast.classList.add(toastId === "toast-aviso1" ? "toast-hidden1" : "toast-hidden");
        setTimeout(() => {
            toast.style.display = "none";
        }, 500);
    }, 3000);
};

/**
 * EXIBIÇÃO DE ERRO NA INTERFACE
 * Substitui o conteúdo de um container por uma mensagem de erro estilizada.
 */
window.exibirErro = function (mensagem, detalhes = "", seletor = ".dashboard-grid, .main-content, #app") {
    const htmlErro = `
        <div class="error-container-global">
            <h3 style="margin-top:0">❌ Ops! Algo deu errado</h3>
            <p><strong>Mensagem:</strong> ${mensagem}</p>
            ${detalhes ? `<div class="error-details">${detalhes}</div>` : ""}
        </div>
    `;

    // Tenta encontrar o melhor lugar para exibir o erro
    const container = document.querySelector(seletor);
    if (container) {
        container.innerHTML = htmlErro;
        // Se o container for um grid, forçamos display block para a mensagem não quebrar
        if (getComputedStyle(container).display === "grid") container.style.display = "block";
    } else {
        document.body.insertAdjacentHTML('afterbegin', htmlErro);
    }

    window.mostrarToast(mensagem);
};

/**
 * INICIALIZAÇÃO
 */
(function init() {
    CONFIG.injectGlobalStyles();
    CONFIG.checkAuth();

    // Expõe logout globalmente
    window.btnlogout = () => CONFIG.handleLogout(false);
})();