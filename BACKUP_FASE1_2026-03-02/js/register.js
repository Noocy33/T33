(function () {
  const form = document.getElementById("registerForm");
  const nome = document.getElementById("cadNome");
  const usuario = document.getElementById("cadUsuario");
  const senha = document.getElementById("cadSenha");
  const perfil = document.getElementById("cadPerfil");
  const setores = document.getElementById("cadSetores");
  const msg = document.getElementById("cadMsg");

  function setoresSelecionados() {
    const vals = Array.from(setores?.selectedOptions || []).map((op) => op.value);
    return vals.length ? vals : ["TODOS"];
  }

  if (!form || !nome || !usuario || !senha || !perfil || !setores || !msg || !window.TASYAuth) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    msg.textContent = "";
    const ret = window.TASYAuth.registrarSolicitacao({
      nome: nome.value,
      usuario: usuario.value,
      senha: senha.value,
      perfil: perfil.value,
      setores: setoresSelecionados()
    });
    if (!ret?.ok) {
      msg.textContent = ret?.erro || "Falha ao enviar solicitacao.";
      return;
    }
    msg.style.color = "#1d8f56";
    msg.textContent = "Solicitacao enviada. Aguarde aprovacao do ADMIN.";
    form.reset();
  });
})();
