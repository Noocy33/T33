(function () {
  const DEFAULT_AVATAR_URL = "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256' viewBox='0 0 256 256'%3E%3Crect width='256' height='256' rx='28' fill='%231d4e80'/%3E%3Ccircle cx='128' cy='96' r='46' fill='%23c8d8e9'/%3E%3Cpath d='M52 214c10-34 41-57 76-57s66 23 76 57' fill='%23c8d8e9'/%3E%3Crect x='80' y='176' width='96' height='50' rx='14' fill='%23123b61'/%3E%3Ctext x='128' y='211' text-anchor='middle' font-family='Segoe UI, Arial, sans-serif' font-size='34' font-weight='700' fill='%23ffffff'%3ET33%3C/text%3E%3C/svg%3E";
  const form = document.getElementById("loginForm");
  const campoUsuario = document.getElementById("loginUsuario");
  const campoSenha = document.getElementById("loginSenha");
  const loginErro = document.getElementById("loginErro");
  const loginAvatar = document.getElementById("loginAvatar");
  const loginAvatarNome = document.getElementById("loginAvatarNome");

  if (!form || !campoUsuario || !campoSenha || !loginErro || !window.TASYAuth) {
    return;
  }

  function removerLinkEquipeNoLogin() {
    const seletores = [
      "#admLinkPublicoWrap",
      "#admLinkPublico",
      "#btnCopiarLinkAdm",
      "a[href*='equipe-t33']"
    ];
    seletores.forEach((sel) => {
      document.querySelectorAll(sel).forEach((el) => {
        const bloco = el.closest("section, div, aside, p, label") || el;
        bloco.remove();
      });
    });

    document.querySelectorAll("body *").forEach((el) => {
      const txt = (el.textContent || "").trim().toUpperCase();
      if (!txt) return;
      if (txt.includes("LINK EQUIPE T33")) {
        const bloco = el.closest("section, div, aside, p, label") || el;
        bloco.remove();
      }
    });
  }

  function montarSrcAvatar(url) {
    const base = String(url || "").trim();
    if (!base) {
      return DEFAULT_AVATAR_URL;
    }
    if (base.startsWith("data:image/")) {
      return base;
    }
    const sep = base.includes("?") ? "&" : "?";
    return `${base}${sep}v=${Date.now()}`;
  }

  function atualizarAvatarLogin() {
    const fotoAdmin = window.TASYAuth.obterFotoAdminExibicao?.() || "";

    if (!loginAvatar || !loginAvatarNome) {
      return;
    }
    const usuario = String(campoUsuario.value || "").trim().toUpperCase();
    if (!usuario) {
      loginAvatar.src = DEFAULT_AVATAR_URL;
      loginAvatarNome.textContent = "Bem-vindo";
      return;
    }

    if (usuario === "T33" || usuario === "TESTET33") {
      loginAvatar.src = montarSrcAvatar(fotoAdmin);
      loginAvatarNome.textContent = usuario === "T33" ? "Administrador T33" : "Usuario TESTET33";
      loginAvatar.style.opacity = "1";
      return;
    }

    // Avatar reservado para T33 e TESTET33 no login.
    loginAvatar.src = DEFAULT_AVATAR_URL;
    loginAvatar.style.opacity = "0.35";
    loginAvatarNome.textContent = `Usuario: ${usuario}`;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    loginErro.textContent = "";

    const sessao = window.TASYAuth.autenticar(campoUsuario.value, campoSenha.value);
    if (!sessao) {
      loginErro.textContent = "Usuario ou senha invalidos.";
      campoSenha.focus();
      campoSenha.select();
      return;
    }

    window.location.replace("splash.html");
  });

  campoUsuario.addEventListener("input", atualizarAvatarLogin);
  removerLinkEquipeNoLogin();
  window.addEventListener("focus", atualizarAvatarLogin);
  atualizarAvatarLogin();
})();
