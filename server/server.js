const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const HOST = process.env.HOST || "0.0.0.0";
const PORT = Number(process.env.PORT || 8080);
const ROOT_DIR = path.resolve(__dirname, "..");
const DATA_DIR = path.join(__dirname, "data");
const BACKUP_DIR = path.join(DATA_DIR, "backups");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const PENDING_FILE = path.join(DATA_DIR, "pending.json");
const ADMIN_PHOTO_FILE = path.join(DATA_DIR, "admin_photo.json");

const DEFAULT_USERS = [
  { usuario: "T33", senha: "123456", nome: "T33", perfil: "ADMIN", setores: ["TODOS"], ativo: true },
  { usuario: "ENFERMAGEM", senha: "123456", nome: "ENFERMAGEM", perfil: "ENFERMEIRA_SETOR", setores: ["TODOS"], ativo: true }
];

const sessions = new Map();

function normalizarTexto(valor) {
  return String(valor || "").trim().toUpperCase();
}

function normalizarSetores(setores) {
  const lista = Array.isArray(setores) ? setores : [];
  const limpos = Array.from(new Set(lista.map((s) => String(s || "").trim()).filter(Boolean)));
  return limpos.length ? limpos : ["TODOS"];
}

function garantirArquivos() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
  if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, JSON.stringify(DEFAULT_USERS, null, 2), "utf8");
  if (!fs.existsSync(PENDING_FILE)) fs.writeFileSync(PENDING_FILE, JSON.stringify([], null, 2), "utf8");
  if (!fs.existsSync(ADMIN_PHOTO_FILE)) fs.writeFileSync(ADMIN_PHOTO_FILE, JSON.stringify({ foto: "" }, null, 2), "utf8");
}

function lerJson(file, fallback) {
  try {
    const data = fs.readFileSync(file, "utf8");
    return JSON.parse(data);
  } catch (_e) {
    return fallback;
  }
}

function salvarJson(file, data) {
  try {
    if (fs.existsSync(file)) {
      const base = path.basename(file, ".json");
      const stamp = new Date().toISOString().replace(/[:.]/g, "-");
      const backup = path.join(BACKUP_DIR, `${base}_${stamp}.json`);
      fs.copyFileSync(file, backup);
    }
  } catch (_e) {
    // Se falhar backup, ainda salva o dado principal.
  }
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
}

function parseBody(req) {
  return new Promise((resolve) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1024 * 1024) req.destroy();
    });
    req.on("end", () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (_e) {
        resolve({});
      }
    });
  });
}

function sendJson(res, status, data) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(data));
}

function getToken(req) {
  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer ")) return "";
  return auth.slice(7).trim();
}

function getSession(req) {
  const token = getToken(req);
  if (!token) return null;
  const sess = sessions.get(token);
  if (!sess) return null;
  if (Date.now() - sess.createdAt > 1000 * 60 * 60 * 12) {
    sessions.delete(token);
    return null;
  }
  return sess;
}

function requireAdmin(req, res) {
  const sess = getSession(req);
  if (!sess || sess.perfil !== "ADMIN") {
    sendJson(res, 403, { erro: "Acesso negado." });
    return null;
  }
  return sess;
}

function toPublicUser(u) {
  return {
    usuario: normalizarTexto(u.usuario),
    nome: String(u.nome || u.usuario),
    perfil: normalizarTexto(u.perfil || "CONSULTA"),
    setores: normalizarSetores(u.setores),
    ativo: Boolean(u.ativo)
  };
}

function countActiveAdmins(users) {
  return users.filter((u) => normalizarTexto(u.perfil) === "ADMIN" && Boolean(u.ativo)).length;
}

async function handleApi(req, res, pathname) {
  if (req.method === "GET" && pathname === "/api/health") {
    return sendJson(res, 200, { ok: true });
  }

  if (req.method === "GET" && pathname === "/api/public/admin-photo") {
    const payload = lerJson(ADMIN_PHOTO_FILE, { foto: "" });
    return sendJson(res, 200, { foto: String(payload.foto || "") });
  }

  if (req.method === "POST" && pathname === "/api/login") {
    const body = await parseBody(req);
    const usuario = normalizarTexto(body.usuario);
    const senha = String(body.senha || "");
    const users = lerJson(USERS_FILE, DEFAULT_USERS);
    const found = users.find((u) => normalizarTexto(u.usuario) === usuario && String(u.senha || "") === senha && Boolean(u.ativo));
    if (!found) return sendJson(res, 401, { erro: "Usuario ou senha invalidos." });
    const token = crypto.randomUUID();
    const sess = {
      token,
      usuario: normalizarTexto(found.usuario),
      nome: String(found.nome || found.usuario),
      perfil: normalizarTexto(found.perfil || "CONSULTA"),
      setores: normalizarSetores(found.setores),
      createdAt: Date.now()
    };
    sessions.set(token, sess);
    return sendJson(res, 200, sess);
  }

  if (req.method === "POST" && pathname === "/api/logout") {
    const token = getToken(req);
    if (token) sessions.delete(token);
    return sendJson(res, 200, { ok: true });
  }

  if (req.method === "GET" && pathname === "/api/admin-photo") {
    const sess = getSession(req);
    if (!sess || sess.perfil !== "ADMIN" || normalizarTexto(sess.usuario) !== "T33") {
      return sendJson(res, 403, { erro: "Acesso negado." });
    }
    const payload = lerJson(ADMIN_PHOTO_FILE, { foto: "" });
    return sendJson(res, 200, { foto: String(payload.foto || "") });
  }

  if (req.method === "POST" && pathname === "/api/admin-photo") {
    const sess = getSession(req);
    if (!sess || sess.perfil !== "ADMIN" || normalizarTexto(sess.usuario) !== "T33") {
      return sendJson(res, 403, { erro: "Acesso negado." });
    }
    const body = await parseBody(req);
    const foto = String(body.foto || "");
    if (foto && !foto.startsWith("data:image/")) {
      return sendJson(res, 400, { erro: "Formato de foto invalido." });
    }
    if (foto.length > 2_000_000) {
      return sendJson(res, 400, { erro: "Foto muito grande." });
    }
    salvarJson(ADMIN_PHOTO_FILE, { foto });
    return sendJson(res, 200, { ok: true });
  }

  if (req.method === "POST" && pathname === "/api/register") {
    const body = await parseBody(req);
    const nome = String(body.nome || "").trim();
    const usuario = normalizarTexto(body.usuario);
    const senha = String(body.senha || "");
    const perfil = normalizarTexto(body.perfil || "CONSULTA");
    const setores = normalizarSetores(body.setores);
    if (!nome || !usuario || !senha) {
      return sendJson(res, 400, { erro: "Preencha nome, usuario e senha." });
    }
    const users = lerJson(USERS_FILE, DEFAULT_USERS);
    if (users.some((u) => normalizarTexto(u.usuario) === usuario)) {
      return sendJson(res, 400, { erro: "Usuario ja cadastrado." });
    }
    const pending = lerJson(PENDING_FILE, []);
    if (pending.some((p) => normalizarTexto(p.usuario) === usuario)) {
      return sendJson(res, 400, { erro: "Ja existe solicitacao pendente para este usuario." });
    }
    pending.push({
      id: crypto.randomUUID(),
      criadoEm: new Date().toISOString(),
      nome,
      usuario,
      senha,
      perfil,
      setores
    });
    salvarJson(PENDING_FILE, pending);
    return sendJson(res, 201, { ok: true });
  }

  if (req.method === "GET" && pathname === "/api/users") {
    if (!requireAdmin(req, res)) return;
    const users = lerJson(USERS_FILE, DEFAULT_USERS).map(toPublicUser);
    return sendJson(res, 200, { usuarios: users });
  }

  if (req.method === "POST" && pathname === "/api/users") {
    if (!requireAdmin(req, res)) return;
    const body = await parseBody(req);
    const users = lerJson(USERS_FILE, DEFAULT_USERS);
    const usuario = normalizarTexto(body.usuario);
    if (!usuario) return sendJson(res, 400, { erro: "Usuario obrigatorio." });
    const nome = String(body.nome || "").trim() || usuario;
    const perfil = normalizarTexto(body.perfil || "CONSULTA");
    const senha = String(body.senha || "");
    const ativo = Boolean(body.ativo);
    const setores = normalizarSetores(body.setores);
    const idx = users.findIndex((u) => normalizarTexto(u.usuario) === usuario);
    if (idx >= 0) {
      const old = users[idx];
      // Conta principal protegida para nao perder acesso administrativo.
      if (normalizarTexto(old.usuario) === "T33") {
        users[idx] = {
          ...old,
          nome,
          perfil: "ADMIN",
          senha: senha || old.senha,
          ativo: true,
          setores: ["TODOS"]
        };
      } else {
        users[idx] = { ...old, nome, perfil, senha: senha || old.senha, ativo, setores };
      }
      if (countActiveAdmins(users) < 1) return sendJson(res, 400, { erro: "Deve existir ao menos 1 ADMIN ativo." });
      salvarJson(USERS_FILE, users);
      return sendJson(res, 200, { ok: true });
    }
    if (!senha) return sendJson(res, 400, { erro: "Senha obrigatoria para novo usuario." });
    users.push({ usuario, nome, perfil, senha, ativo, setores });
    if (countActiveAdmins(users) < 1) return sendJson(res, 400, { erro: "Deve existir ao menos 1 ADMIN ativo." });
    salvarJson(USERS_FILE, users);
    return sendJson(res, 201, { ok: true });
  }

  if (req.method === "DELETE" && pathname.startsWith("/api/users/")) {
    const sess = requireAdmin(req, res);
    if (!sess) return;
    const usuario = decodeURIComponent(pathname.slice("/api/users/".length));
    const alvo = normalizarTexto(usuario);
    if (!alvo) return sendJson(res, 400, { erro: "Usuario invalido." });
    if (alvo === "T33") return sendJson(res, 400, { erro: "Conta T33 protegida. Remocao bloqueada." });
    if (alvo === normalizarTexto(sess.usuario)) return sendJson(res, 400, { erro: "Nao e permitido remover o proprio usuario logado." });
    const users = lerJson(USERS_FILE, DEFAULT_USERS);
    const nova = users.filter((u) => normalizarTexto(u.usuario) !== alvo);
    if (nova.length === users.length) return sendJson(res, 404, { erro: "Usuario nao encontrado." });
    if (countActiveAdmins(nova) < 1) return sendJson(res, 400, { erro: "Deve existir ao menos 1 ADMIN ativo." });
    salvarJson(USERS_FILE, nova);
    return sendJson(res, 200, { ok: true });
  }

  if (req.method === "GET" && pathname === "/api/pending") {
    if (!requireAdmin(req, res)) return;
    const pendencias = lerJson(PENDING_FILE, []);
    return sendJson(res, 200, { pendencias });
  }

  if (req.method === "POST" && pathname.startsWith("/api/pending/") && pathname.endsWith("/approve")) {
    if (!requireAdmin(req, res)) return;
    const id = pathname.slice("/api/pending/".length, -"/approve".length);
    const pendencias = lerJson(PENDING_FILE, []);
    const idx = pendencias.findIndex((p) => p.id === id);
    if (idx < 0) return sendJson(res, 404, { erro: "Pendencia nao encontrada." });
    const p = pendencias[idx];
    const users = lerJson(USERS_FILE, DEFAULT_USERS);
    if (users.some((u) => normalizarTexto(u.usuario) === normalizarTexto(p.usuario))) {
      return sendJson(res, 400, { erro: "Usuario ja existe." });
    }
    users.push({
      usuario: normalizarTexto(p.usuario),
      senha: String(p.senha || ""),
      nome: String(p.nome || p.usuario),
      perfil: normalizarTexto(p.perfil || "CONSULTA"),
      setores: normalizarSetores(p.setores),
      ativo: true
    });
    salvarJson(USERS_FILE, users);
    pendencias.splice(idx, 1);
    salvarJson(PENDING_FILE, pendencias);
    return sendJson(res, 200, { ok: true });
  }

  if (req.method === "POST" && pathname.startsWith("/api/pending/") && pathname.endsWith("/reject")) {
    if (!requireAdmin(req, res)) return;
    const id = pathname.slice("/api/pending/".length, -"/reject".length);
    const pendencias = lerJson(PENDING_FILE, []);
    const nova = pendencias.filter((p) => p.id !== id);
    salvarJson(PENDING_FILE, nova);
    return sendJson(res, 200, { ok: true });
  }

  sendJson(res, 404, { erro: "Rota nao encontrada." });
}

function mimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".html": return "text/html; charset=utf-8";
    case ".css": return "text/css; charset=utf-8";
    case ".js": return "application/javascript; charset=utf-8";
    case ".json": return "application/json; charset=utf-8";
    case ".svg": return "image/svg+xml";
    case ".png": return "image/png";
    case ".jpg":
    case ".jpeg": return "image/jpeg";
    case ".webmanifest": return "application/manifest+json; charset=utf-8";
    default: return "application/octet-stream";
  }
}

function serveStatic(res, pathname) {
  let safePath = pathname === "/" ? "/login.html" : pathname;
  if (safePath === "/equipe-t33" || safePath === "/equipe-t33/" || safePath === "/equipe-t33/login") {
    safePath = "/login.html";
  }
  if (safePath === "/equipe-t33/register") {
    safePath = "/register.html";
  }
  if (safePath === "/equipe-t33/splash") {
    safePath = "/splash.html";
  }
  const filePath = path.normalize(path.join(ROOT_DIR, safePath));
  if (!filePath.startsWith(ROOT_DIR)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404);
    return res.end("Not found");
  }
  res.writeHead(200, { "Content-Type": mimeType(filePath), "Cache-Control": "no-cache" });
  fs.createReadStream(filePath).pipe(res);
}

garantirArquivos();
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname.startsWith("/api/")) {
    return handleApi(req, res, url.pathname);
  }
  return serveStatic(res, url.pathname);
});

server.listen(PORT, HOST, () => {
  console.log(`T33 server ativo em http://${HOST}:${PORT}`);
});
