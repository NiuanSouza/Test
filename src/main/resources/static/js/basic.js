/**
 * js/basic.js - Núcleo do Sistema (SIVA)
 * Responsável por: Autenticação, Comunicação API, Injeção de Estilos, UI de Erros e Toasts.
 */

const CONFIG = Object.freeze({
    // Configurações de Ambiente
    API_URL: "http://localhost:8080",
    TOKEN_KEY: "auth_token",

    /** * MODO DESENVOLVEDOR (DEV_MODE)
     * Se true: impede redirecionamentos automáticos de segurança para a tela de login.
     */
    DEV_MODE: false,

    /**
     * Valida a sessão atual do usuário e protege as rotas no client-side.
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

        // Se não tem token ou expirou, limpa tudo e joga pro login
        if (!token || this.isTokenExpired(token)) {
            this.handleLogout(isLoginPage);
            return null;
        }

        // Se estiver logado e tentar acessar a tela de login, redireciona pro dashboard correto
        if (isLoginPage) {
            this.redirectByPermission();
        }

        return token;
    },

    /**
     * Verifica a validade temporal do JWT (Aplica margem de segurança de 10 segundos).
     */
    isTokenExpired: function (token) {
        try {
            const payload = this.decodeToken(token);
            if (!payload || !payload.exp) return true;

            const expirationTime = (payload.exp * 1000) - 10000;
            return Date.now() >= expirationTime;
        } catch (e) {
            return true; // Na dúvida, expira a sessão por segurança
        }
    },

    /**
     * Decodifica o payload do JWT tratando caracteres especiais (UTF-8).
     */
    decodeToken: function (token) {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) return null;

            // Corrige caracteres base64url e decodifica para string padrão
            const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64).split('').map(c => {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join('')
            );

            return JSON.parse(jsonPayload);
        } catch (e) {
            console.error("Erro ao decodificar token JWT:", e);
            return null;
        }
    },

    /**
     * Lógica centralizada de roteamento baseada na Role do usuário.
     */
    redirectByPermission: function () {
        const rawPermission = localStorage.getItem("userPermission") || "";
        const permission = rawPermission.trim().toUpperCase().replace("ROLE_", "");

        const destination = (permission === "ADMINISTRATOR")
            ? "telainicial-gestor.html"
            : "telainicial.html";

        window.location.replace(destination); // Usamos replace para não gerar histórico de voltar ao login
    },

    /**
     * Finaliza a sessão limpando os dados locais de forma segura.
     */
    handleLogout: function (isLoginPage = false) {
        localStorage.clear();
        if (!isLoginPage && !this.DEV_MODE) {
            window.location.href = "index.html";
        }
    },

    /**
     * Injeta o CSS necessário para os componentes globais (Toast e Container de Erros) dinamicamente.
     */
    injectGlobalStyles: function() {
        if (document.getElementById("basic-global-styles")) return;
        const style = document.createElement("style");
        style.id = "basic-global-styles";
        style.innerHTML = `
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
            @keyframes basicFadeIn { 
                from { opacity: 0; transform: translateY(-10px); } 
                to { opacity: 1; transform: translateY(0); } 
            }
            .toast-hidden, .toast-hidden1 { 
                opacity: 0 !important; 
                transition: opacity 0.5s ease; 
                pointer-events: none;
            }
        `;
        document.head.appendChild(style);
    }
});

/**
 * ===================================================================
 * FETCH WRAPPER GLOBAL
 * Centraliza e padroniza as requisições para a API do Spring Boot.
 * ===================================================================
 */
window.apiFetch = async function (endpoint, options = {}) {
    const token = localStorage.getItem(CONFIG.TOKEN_KEY);
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${CONFIG.API_URL}${endpoint}`, { ...options, headers });

        // Trata interceptação de segurança do Spring Security (Expirou ou Inválido)
        if ([401, 403].includes(response.status)) {
            console.warn(`Sessão inválida ou sem permissão (${response.status}). Redirecionando...`);
            CONFIG.handleLogout(window.location.pathname.endsWith("index.html"));
            return null;
        }

        return response;
    } catch (error) {
        console.error("Erro Crítico de Conexão na API:", error);
        throw error;
    }
};

/**
 * ===================================================================
 * SISTEMA DE TOAST GLOBAL
 * Controle visual de mensagens não intrusivas.
 * ===================================================================
 * @param {string} mensagem - Texto a ser exibido
 * @param {string} toastId - ID do elemento HTML (Padrão: toast-aviso, Sucesso: toast-aviso1)
 */
let toastTimeout; // Variável global para gerenciar cliques rápidos

window.mostrarToast = function (mensagem, toastId = "toast-aviso") {
    const toast = document.getElementById(toastId);

    if (!toast) {
        alert(mensagem); // Fallback de emergência
        return;
    }

    // Limpa timeout anterior caso o usuário clique várias vezes
    clearTimeout(toastTimeout);

    // Reseta classes para reiniciar a animação nativa
    const classOculta = toastId === "toast-aviso1" ? "toast-hidden1" : "toast-hidden";

    toast.innerText = mensagem;
    toast.style.display = "block";
    toast.classList.remove(classOculta);

    // Força reflow do navegador para reiniciar a transição visual
    void toast.offsetWidth;

    // Agenda o desaparecimento
    toastTimeout = setTimeout(() => {
        toast.classList.add(classOculta);
        setTimeout(() => {
            if (toast.classList.contains(classOculta)) toast.style.display = "none";
        }, 500);
    }, 3000);
};

/**
 * ===================================================================
 * UI DE ERROS CRÍTICOS
 * Substitui um container da tela por uma mensagem de erro vermelha detalhada.
 * ===================================================================
 */
window.exibirErro = function (mensagem, detalhes = "", seletor = ".dashboard-grid, .main-content, #app") {
    const htmlErro = `
        <div class="error-container-global">
            <h3 style="margin-top:0; display:flex; align-items:center; gap:8px;">
                ⚠️ Falha na Operação
            </h3>
            <p style="margin-bottom:0;"><strong>Causa:</strong> ${mensagem}</p>
            ${detalhes ? `<div class="error-details">${detalhes}</div>` : ""}
        </div>
    `;

    // Tenta encontrar o melhor lugar na tela atual para ancorar o erro
    const container = document.querySelector(seletor);
    if (container) {
        container.innerHTML = htmlErro;

        // Proteção para grids quebrando a visualização
        if (window.getComputedStyle(container).display === "grid") {
            container.style.display = "block";
        }
    } else {
        // Se a tela não tiver nenhum dos seletores, injeta direto no body
        document.body.insertAdjacentHTML('afterbegin', htmlErro);
    }

    // Dispara o toast padrão em conjunto para avisar caso o bloco fique fora do scroll
    window.mostrarToast(mensagem);
};

/**
 * ===================================================================
 * ROTINA DE INICIALIZAÇÃO
 * Rodada imediatamente ao carregar qualquer página que importe o script.
 * ===================================================================
 */
(function init() {
    CONFIG.injectGlobalStyles();
    CONFIG.checkAuth();

    // Expõe ação de logout para os botões do header
    window.btnlogout = () => CONFIG.handleLogout(false);
})();