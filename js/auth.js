(function () {
  const DEFAULT_AVATAR_URL = "/images/avatar.svg?v=20260302f";
  const SESSION_KEY = "tasy_auth_session_v1";
  const USERS_KEY = "tasy_auth_users_v1";
  const PENDING_KEY = "tasy_auth_pending_v1";
  const TOKEN_KEY = "tasy_auth_token_v1";
  const ADMIN_PHOTO_KEY = "tasy_admin_t33_photo_v1";
  const API_BASE = "/api";
  const DEFAULT_USERS = [
    { usuario: "T33", senha: "123456", nome: "T33", perfil: "ADMIN", setores: ["TODOS"], ativo: true },
    { usuario: "TESTET33", senha: "123456", nome: "TESTET33", perfil: "ENFERMEIRA_SETOR", setores: ["TODOS"], ativo: true }
  ];
  const ALLOWED_USERS = new Set(["T33", "TESTET33"]);

  function normalizarTexto(valor) {
    return String(valor || "").trim().toUpperCase();
  }

  function normalizarSetores(setores) {
    const lista = Array.isArray(setores) ? setores : [];
    const limpos = Array.from(new Set(lista.map((s) => String(s || "").trim()).filter(Boolean)));
    return limpos.length ? limpos : ["TODOS"];
  }

  function usuarioPermitido(usuario) {
    return ALLOWED_USERS.has(normalizarTexto(usuario));
  }

  function requestSync(method, path, body) {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open(method, `${API_BASE}${path}`, false);
      xhr.setRequestHeader("Content-Type", "application/json");
      const token = localStorage.getItem(TOKEN_KEY) || "";
      if (token) {
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      }
      xhr.send(body ? JSON.stringify(body) : null);
      const data = xhr.responseText ? JSON.parse(xhr.responseText) : {};
      return { ok: xhr.status >= 200 && xhr.status < 300, status: xhr.status, data };
    } catch (_erro) {
      return { ok: false, status: 0, data: {} };
    }
  }

  function serverDisponivel() {
    const ret = requestSync("GET", "/health");
    return ret.ok && ret.data?.ok === true;
  }

  function carregarUsuariosLocal() {
    const bruto = localStorage.getItem(USERS_KEY);
    if (!bruto) {
      localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
      return [...DEFAULT_USERS];
    }
    try {
      const lista = JSON.parse(bruto);
      if (!Array.isArray(lista) || !lista.length) {
        localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
        return [...DEFAULT_USERS];
      }
      const filtrados = lista.filter((u) => usuarioPermitido(u?.usuario));
      if (filtrados.length !== lista.length) {
        salvarUsuariosLocal(filtrados);
      }
      return filtrados;
    } catch (_erro) {
      localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
      return [...DEFAULT_USERS];
    }
  }

  function salvarUsuariosLocal(lista) {
    localStorage.setItem(USERS_KEY, JSON.stringify(lista));
  }

  function carregarPendenciasLocal() {
    const bruto = localStorage.getItem(PENDING_KEY);
    if (!bruto) {
      localStorage.setItem(PENDING_KEY, JSON.stringify([]));
      return [];
    }
    try {
      const lista = JSON.parse(bruto);
      return Array.isArray(lista) ? lista : [];
    } catch (_erro) {
      localStorage.setItem(PENDING_KEY, JSON.stringify([]));
      return [];
    }
  }

  function salvarPendenciasLocal(lista) {
    localStorage.setItem(PENDING_KEY, JSON.stringify(lista));
  }

  function obterSessao() {
    const bruto = localStorage.getItem(SESSION_KEY);
    if (!bruto) return null;
    try {
      return JSON.parse(bruto);
    } catch (_erro) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
  }

  function definirSessao(sessao) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessao));
  }

  function limparSessao() {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(TOKEN_KEY);
  }

  function contarAdminsAtivos(lista) {
    return lista.filter((u) => normalizarTexto(u.perfil) === "ADMIN" && Boolean(u.ativo)).length;
  }

  function autenticarLocal(usuario, senha) {
    const lista = carregarUsuariosLocal();
    const user = normalizarTexto(usuario);
    const pass = String(senha || "");
    const encontrado = lista.find((u) => normalizarTexto(u.usuario) === user && String(u.senha || "") === pass && Boolean(u.ativo));
    if (!encontrado) {
      return null;
    }
    const sessao = {
      usuario: normalizarTexto(encontrado.usuario),
      nome: String(encontrado.nome || encontrado.usuario),
      perfil: normalizarTexto(encontrado.perfil || "CONSULTA"),
      setores: normalizarSetores(encontrado.setores),
      loginEm: new Date().toISOString()
    };
    definirSessao(sessao);
    return sessao;
  }

  function autenticar(usuario, senha) {
    if (serverDisponivel()) {
      const ret = requestSync("POST", "/login", { usuario, senha });
      if (!ret.ok) return null;
      const sessao = {
        usuario: ret.data.usuario,
        nome: ret.data.nome,
        perfil: ret.data.perfil,
        setores: normalizarSetores(ret.data.setores),
        loginEm: new Date().toISOString()
      };
      if (ret.data.token) {
        localStorage.setItem(TOKEN_KEY, ret.data.token);
      }
      definirSessao(sessao);
      return sessao;
    }
    return autenticarLocal(usuario, senha);
  }

  function aplicarUsuarioTela() {
    const sessao = obterSessao();
    const elUsuario = document.getElementById("usuarioLogado");
    if (elUsuario && sessao) {
      elUsuario.textContent = `Usuario: ${sessao.nome} (${sessao.perfil})`;
    }
    aplicarFotoAdminTela(sessao);
  }

  function aplicarFotoAdminTela(sessao) {
    const box = document.getElementById("adminFotoBox");
    const preview = document.getElementById("adminFotoPreview");
    const input = document.getElementById("adminFotoInput");
    const botaoFoto = box?.querySelector(".admin-foto-btn");
    if (!box || !preview || !input) {
      return;
    }

    const usuario = normalizarTexto(sessao?.usuario);
    const perfil = normalizarTexto(sessao?.perfil);
    const podeEditar = perfil === "ADMIN" && usuario === "T33";
    // Foto sempre visivel para usuarios logados (T33 e TESTET33),
    // upload liberado somente para T33 ADM.
    box.style.display = "inline-flex";
    if (botaoFoto) {
      botaoFoto.style.display = podeEditar ? "inline-flex" : "none";
    }
    input.disabled = !podeEditar;
    preview.src = localStorage.getItem(ADMIN_PHOTO_KEY) || DEFAULT_AVATAR_URL;
    if (serverDisponivel()) {
      const ret = requestSync("GET", "/admin-photo");
      if (ret.ok && typeof ret.data?.foto === "string" && ret.data.foto) {
        preview.src = ret.data.foto;
        localStorage.setItem(ADMIN_PHOTO_KEY, ret.data.foto);
      }
    }
    if (!podeEditar) {
      return;
    }
    if (input.dataset.bound === "1") {
      return;
    }
    input.dataset.bound = "1";
    input.addEventListener("change", (event) => {
      const arquivo = event.target.files && event.target.files[0];
      if (!arquivo) {
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const foto = e.target?.result || DEFAULT_AVATAR_URL;
        preview.src = foto;
        localStorage.setItem(ADMIN_PHOTO_KEY, String(foto));
        if (serverDisponivel()) {
          requestSync("POST", "/admin-photo", { foto: String(foto) });
        }
      };
      reader.readAsDataURL(arquivo);
    });
  }

  function protegerPaginaSistema() {
    const pagina = window.location.pathname.split("/").pop() || "";
    if (pagina.toLowerCase() !== "t33.html") return;
    const sessao = obterSessao();
    if (!sessao) {
      window.location.replace("login.html");
      return;
    }
    aplicarUsuarioTela();
  }

  function controlarAcessoLogin() {
    const pagina = window.location.pathname.split("/").pop() || "";
    const emLogin = pagina.toLowerCase() === "login.html" || pagina === "";
    if (!emLogin) return;
    const sessao = obterSessao();
    if (sessao) {
      window.location.replace("T33.html");
    }
  }

  function controlarSplashAbertura() {
    // Sequencia atual: acesso direto pelo login.
    return;
  }

  function registrarLogout() {
    const btnLogout = document.getElementById("btnLogout");
    if (!btnLogout) return;
    btnLogout.addEventListener("click", () => {
      if (serverDisponivel()) requestSync("POST", "/logout", {});
      limparSessao();
      window.location.replace(`${window.location.origin}/login.html?nocache=1`);
    });
  }

  function registrarServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    });
  }

  function listarUsuarios() {
    if (serverDisponivel()) {
      const ret = requestSync("GET", "/users");
      return ret.ok && Array.isArray(ret.data?.usuarios) ? ret.data.usuarios : [];
    }
    if (!eAdminT33()) {
      return [];
    }
    return carregarUsuariosLocal().map((u) => ({
      usuario: normalizarTexto(u.usuario),
      nome: String(u.nome || u.usuario),
      perfil: normalizarTexto(u.perfil || "CONSULTA"),
      setores: normalizarSetores(u.setores),
      ativo: Boolean(u.ativo)
    }));
  }

  function salvarUsuario(payload) {
    if (serverDisponivel()) {
      const ret = requestSync("POST", "/users", payload || {});
      return ret.ok ? { ok: true } : { ok: false, erro: ret.data?.erro || "Falha ao salvar usuario." };
    }

    const lista = carregarUsuariosLocal();
    const sessao = obterSessao();
    if (!eAdminT33()) return { ok: false, erro: "Acesso permitido somente para T33 ADM." };
    const usuario = normalizarTexto(payload?.usuario);
    if (!usuario) return { ok: false, erro: "Usuario obrigatorio." };
    if (!usuarioPermitido(usuario)) return { ok: false, erro: "Somente usuarios T33 e TESTET33 sao permitidos." };
    const nome = String(payload?.nome || "").trim() || usuario;
    const perfil = normalizarTexto(payload?.perfil || "CONSULTA");
    const senha = String(payload?.senha || "");
    const ativo = Boolean(payload?.ativo);
    const setores = normalizarSetores(payload?.setores);
    const idx = lista.findIndex((u) => normalizarTexto(u.usuario) === usuario);
    if (idx >= 0) {
      const antigo = lista[idx];
      const copia = [...lista];
      // Conta principal protegida para evitar perda de acesso do ADM T33.
      if (normalizarTexto(antigo.usuario) === "T33") {
        copia[idx] = {
          ...antigo,
          nome,
          perfil: "ADMIN",
          senha: senha || antigo.senha,
          setores: ["TODOS"],
          ativo: true
        };
      } else {
        copia[idx] = { ...antigo, nome, perfil, senha: senha || antigo.senha, setores, ativo };
      }
      if (contarAdminsAtivos(copia) < 1) return { ok: false, erro: "Deve existir ao menos 1 ADMIN ativo." };
      salvarUsuariosLocal(copia);
      return { ok: true };
    }
    if (!senha) return { ok: false, erro: "Senha obrigatoria para novo usuario." };
    const novaLista = [...lista, { usuario, nome, perfil, senha, setores, ativo }];
    if (contarAdminsAtivos(novaLista) < 1) return { ok: false, erro: "Deve existir ao menos 1 ADMIN ativo." };
    salvarUsuariosLocal(novaLista);
    return { ok: true };
  }

  function removerUsuario(usuarioAlvo) {
    if (serverDisponivel()) {
      const ret = requestSync("DELETE", `/users/${encodeURIComponent(usuarioAlvo || "")}`);
      return ret.ok ? { ok: true } : { ok: false, erro: ret.data?.erro || "Falha ao remover usuario." };
    }
    const sessao = obterSessao();
    if (!eAdminT33()) return { ok: false, erro: "Acesso permitido somente para T33 ADM." };
    const alvo = normalizarTexto(usuarioAlvo);
    if (!alvo) return { ok: false, erro: "Usuario invalido." };
    if (alvo === "T33" || alvo === "TESTET33") return { ok: false, erro: "Conta protegida. Remocao bloqueada." };
    if (alvo === normalizarTexto(sessao.usuario)) return { ok: false, erro: "Nao e permitido remover o proprio usuario." };
    const lista = carregarUsuariosLocal();
    const novaLista = lista.filter((u) => normalizarTexto(u.usuario) !== alvo);
    if (novaLista.length === lista.length) return { ok: false, erro: "Usuario nao encontrado." };
    if (contarAdminsAtivos(novaLista) < 1) return { ok: false, erro: "Deve existir ao menos 1 ADMIN ativo." };
    salvarUsuariosLocal(novaLista);
    return { ok: true };
  }

  function listarPendencias() {
    if (serverDisponivel()) {
      const ret = requestSync("GET", "/pending");
      return ret.ok && Array.isArray(ret.data?.pendencias) ? ret.data.pendencias : [];
    }
    if (!eAdminT33()) {
      return [];
    }
    return carregarPendenciasLocal();
  }

  function registrarSolicitacao(payload) {
    if (serverDisponivel()) {
      const ret = requestSync("POST", "/register", payload || {});
      return ret.ok ? { ok: true } : { ok: false, erro: ret.data?.erro || "Falha ao registrar solicitacao." };
    }
    const pendencias = carregarPendenciasLocal();
    const item = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      criadoEm: new Date().toISOString(),
      nome: String(payload?.nome || "").trim(),
      usuario: normalizarTexto(payload?.usuario),
      senha: String(payload?.senha || ""),
      perfil: normalizarTexto(payload?.perfil || "CONSULTA"),
      setores: normalizarSetores(payload?.setores)
    };
    if (!item.nome || !item.usuario || !item.senha) return { ok: false, erro: "Preencha nome, usuario e senha." };
    if (!usuarioPermitido(item.usuario)) return { ok: false, erro: "Cadastro permitido somente para T33 e TESTET33." };
    pendencias.push(item);
    salvarPendenciasLocal(pendencias);
    return { ok: true };
  }

  function aprovarPendencia(id) {
    if (serverDisponivel()) {
      const ret = requestSync("POST", `/pending/${encodeURIComponent(id)}/approve`, {});
      return ret.ok ? { ok: true } : { ok: false, erro: ret.data?.erro || "Falha ao aprovar." };
    }
    const sessao = obterSessao();
    if (!eAdminT33()) return { ok: false, erro: "Acesso permitido somente para T33 ADM." };
    const pendencias = carregarPendenciasLocal();
    const idx = pendencias.findIndex((p) => p.id === id);
    if (idx < 0) return { ok: false, erro: "Pendencia nao encontrada." };
    const p = pendencias[idx];
    const ret = salvarUsuario({
      nome: p.nome,
      usuario: p.usuario,
      senha: p.senha,
      perfil: p.perfil,
      setores: p.setores,
      ativo: true
    });
    if (!ret.ok) return ret;
    pendencias.splice(idx, 1);
    salvarPendenciasLocal(pendencias);
    return { ok: true };
  }

  function reprovarPendencia(id) {
    if (serverDisponivel()) {
      const ret = requestSync("POST", `/pending/${encodeURIComponent(id)}/reject`, {});
      return ret.ok ? { ok: true } : { ok: false, erro: ret.data?.erro || "Falha ao reprovar." };
    }
    const sessao = obterSessao();
    if (!eAdminT33()) return { ok: false, erro: "Acesso permitido somente para T33 ADM." };
    const pendencias = carregarPendenciasLocal();
    const nova = pendencias.filter((p) => p.id !== id);
    salvarPendenciasLocal(nova);
    return { ok: true };
  }

  function eAdmin() {
    return normalizarTexto(obterSessao()?.perfil) === "ADMIN";
  }

  function eAdminT33() {
    const sessao = obterSessao();
    if (!sessao) return false;
    return normalizarTexto(sessao.perfil) === "ADMIN" && normalizarTexto(sessao.usuario) === "T33";
  }

  function obterFotoAdminExibicao() {
    if (serverDisponivel()) {
      const ret = requestSync("GET", "/public/admin-photo");
      if (ret.ok && typeof ret.data?.foto === "string" && ret.data.foto) {
        localStorage.setItem(ADMIN_PHOTO_KEY, ret.data.foto);
        return ret.data.foto;
      }
    }
    return localStorage.getItem(ADMIN_PHOTO_KEY) || "";
  }

  window.TASYAuth = {
    autenticar,
    obterSessao,
    limparSessao,
    listarUsuarios,
    salvarUsuario,
    removerUsuario,
    listarPendencias,
    registrarSolicitacao,
    aprovarPendencia,
    reprovarPendencia,
    eAdmin,
    eAdminT33,
    obterFotoAdminExibicao
  };

  carregarUsuariosLocal();
  controlarSplashAbertura();
  controlarAcessoLogin();
  protegerPaginaSistema();
  registrarLogout();
  registrarServiceWorker();
})();
