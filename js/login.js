(function () {
  const DEFAULT_AVATAR_URL = "images/avatar.jpg?v=20260305av";
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
      loginAvatar.style.opacity = "1";
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
