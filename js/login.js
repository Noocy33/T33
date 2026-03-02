(function () {
  const form = document.getElementById("loginForm");
  const campoUsuario = document.getElementById("loginUsuario");
  const campoSenha = document.getElementById("loginSenha");
  const loginErro = document.getElementById("loginErro");
  const loginAvatar = document.getElementById("loginAvatar");
  const loginAvatarNome = document.getElementById("loginAvatarNome");

  if (!form || !campoUsuario || !campoSenha || !loginErro || !window.TASYAuth) {
    return;
  }

  function montarSrcAvatar(url) {
    const base = String(url || "").trim();
    if (!base) {
      return "images/avatar.svg";
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
      loginAvatar.src = "images/avatar.svg";
      loginAvatarNome.textContent = "Bem-vindo";
      return;
    }

    if (usuario === "T33") {
      loginAvatar.src = montarSrcAvatar(fotoAdmin);
      loginAvatarNome.textContent = "Administrador T33";
      return;
    }

    loginAvatar.src = "images/avatar.svg";
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
  window.addEventListener("focus", atualizarAvatarLogin);
  atualizarAvatarLogin();
})();
