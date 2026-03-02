(function () {
  const form = document.getElementById("loginForm");
  const campoUsuario = document.getElementById("loginUsuario");
  const campoSenha = document.getElementById("loginSenha");
  const loginErro = document.getElementById("loginErro");
  const loginAvatar = document.getElementById("loginAvatar");
  const loginAvatarNome = document.getElementById("loginAvatarNome");
  const linkSistema = document.getElementById("linkSistema");
  const btnCopiarLink = document.getElementById("btnCopiarLink");

  if (!form || !campoUsuario || !campoSenha || !loginErro || !window.TASYAuth) {
    return;
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
      const foto = fotoAdmin;
      loginAvatar.src = foto || "images/avatar.svg";
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

  const IP_LOCAL_PREFERENCIAL = "192.168.0.75";
  function montarUrlLogin() {
    const protocolo = window.location.protocol === "https:" ? "https" : "http";
    const porta = window.location.port || "8080";
    const hostAtual = window.location.hostname || "";
    const hostLocal = hostAtual === "localhost" || hostAtual === "127.0.0.1" || hostAtual === "";
    const hostFinal = hostLocal ? IP_LOCAL_PREFERENCIAL : hostAtual;
    return `${protocolo}://${hostFinal}:${porta}/equipe-t33`;
  }

  const urlLogin = montarUrlLogin();
  if (linkSistema) {
    linkSistema.value = urlLogin;
  }
  if (btnCopiarLink) {
    btnCopiarLink.addEventListener("click", async () => {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(urlLogin);
        } else if (linkSistema) {
          linkSistema.focus();
          linkSistema.select();
          document.execCommand("copy");
        }
        loginErro.style.color = "#1d8f56";
        loginErro.textContent = "Link copiado com sucesso.";
      } catch (_erro) {
        loginErro.style.color = "#b13c3c";
        loginErro.textContent = "Nao foi possivel copiar automaticamente.";
      }
    });
  }

  campoUsuario.addEventListener("input", atualizarAvatarLogin);
  atualizarAvatarLogin();
})();
