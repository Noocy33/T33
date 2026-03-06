(() => {
  const DEFAULT_AVATAR_URL = "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256' viewBox='0 0 256 256'%3E%3Crect width='256' height='256' rx='28' fill='%231d4e80'/%3E%3Ccircle cx='128' cy='96' r='46' fill='%23c8d8e9'/%3E%3Cpath d='M52 214c10-34 41-57 76-57s66 23 76 57' fill='%23c8d8e9'/%3E%3Crect x='80' y='176' width='96' height='50' rx='14' fill='%23123b61'/%3E%3Ctext x='128' y='211' text-anchor='middle' font-family='Segoe UI, Arial, sans-serif' font-size='34' font-weight='700' fill='%23ffffff'%3ET33%3C/text%3E%3C/svg%3E";
  const STORAGE_KEY = "tasy_dimensionamento_v2";
  const STORAGE_ESCALA_MODO = "tasy_escala_modo_compacto";
  const TECNICOS_INICIAIS = 0;
  const MAX_TECNICOS = 10;
  const setoresUTI = new Set(["UTI 1", "UTI 2"]);
  const setoresCentroCirurgico = new Set(["CENTRO CIRURGICO"]);
  const setoresMaternidade = new Set(["MATERNIDADE", "ALOJAMENTO", "PSGO"]);
  const setoresPediatria = new Set(["PEDIATRIA", "UTI PEDIATRICA", "UTI NEONATAL"]);
  const setoresCME = new Set(["CME"]);
  const setoresHipodermia = new Set(["HIPODERMIA"]);
  const setoresBox = new Set(["BOX"]);
  const setoresTrauma = new Set(["TRAUMA"]);
  const setoresHemodialise = new Set(["HEMODIALISE"]);
  const setoresClinica = new Set(["CLINICA 1", "CLINICA 2", "CLINICA 3", "CLINICA 4", "PS.VERDE", "H.R"]);

  const assistUTI = ["SSVV", "DIETA V.O", "SNE", "NPP", "NPT", "V.M"];
  const assistCentroCirurgico = ["SSVV", "RPA INICIO", "RPA TERMINO", "DEXTRO"];
  const assistMaternidade = [
    "SSVV",
    "DEXTRO",
    "TESTE DO CORACAO",
    "TESTE DO PEZINHO",
    "AMAMENTAMENTO",
    "AG. LAQUE",
    "CUIDADOS RN"
  ];
  const assistPediatria = [
    "SSVV",
    "DIETA V.O",
    "SNE",
    "NPP",
    "NPT",
    "PESO",
    "ALTURA",
    "CONTROLE TERMICO",
    "FOTOTERAPIA"
  ];
  const assistCME = [
    "LIMPEZA",
    "PREPARO",
    "ESTERILIZACAO",
    "ARMAZENAMENTO DE MATERIAIS",
    "CONTROLE DE QUALIDADE",
    "RASTREABILIDADE",
    "BIOSSEGURANCA"
  ];
  const assistHipodermia = [
    "IM",
    "SC",
    "APLICACAO VACINAS",
    "TESTES RAPIDOS",
    "ESTOQUE DE INSUMOS"
  ];
  const assistBox = ["SSVV", "PUNCAO VENOSA", "SOROTERAPIA", "ADMINISTRACAO DE MEDICACAO DE URGENCIA"];
  const assistTrauma = ["SSVV", "PROTOCOLO ABCDE", "IMOBILIZACAO", "CONTROLE HEMORRAGICOS", "EXAMES", "CIRURGIA"];
  const assistHemodialise = ["SSVV", "FAV", "RENAL CRONICO"];
  const assistClinica = ["SSVV", "CURATIVOS", "LPP", "EXAMES", "DEXTRO", "DIETA V.O", "NPT", "NPP", "VM", "CNO2", "PALIATIVOS"];

  const corpoTecnicos = document.getElementById("corpoTecnicos");
  const template = document.getElementById("tplTecnico");
  const btnAdicionarTecnico = document.getElementById("btnAdicionarTecnico");
  const btnModoEscala = document.getElementById("btnModoEscala");
  const filtroSetor = document.getElementById("filtroSetor");
  const menuItems = document.querySelectorAll(".menu-item");
  const tasyBreadcrumb = document.getElementById("tasyBreadcrumb");
  const grafSetores = document.getElementById("grafSetores");
  const grafStatus = document.getElementById("grafStatus");
  const grafDonut = document.getElementById("grafDonut");
  const grafDonutTexto = document.getElementById("grafDonutTexto");
  const grafControleDonut = document.getElementById("grafControleDonut");
  const grafControleTexto = document.getElementById("grafControleTexto");
  const grafControleLegenda = document.getElementById("grafControleLegenda");
  const grafSCPDonut = document.getElementById("grafSCPDonut");
  const grafSCPTexto = document.getElementById("grafSCPTexto");
  const grafSCPLegenda = document.getElementById("grafSCPLegenda");
  const setorSupervisao = document.getElementById("setorSupervisao");
  const secGestaoAcesso = document.getElementById("secGestaoAcesso");
  const corpoUsuarios = document.getElementById("corpoUsuarios");
  const admNome = document.getElementById("admNome");
  const admUsuario = document.getElementById("admUsuario");
  const admSenha = document.getElementById("admSenha");
  const admPerfil = document.getElementById("admPerfil");
  const admSetores = document.getElementById("admSetores");
  const admAtivo = document.getElementById("admAtivo");
  const btnSalvarUsuario = document.getElementById("btnSalvarUsuario");
  const btnNovoUsuario = document.getElementById("btnNovoUsuario");
  const btnAtualizarPendencias = document.getElementById("btnAtualizarPendencias");
  const msgSemPermissao = document.getElementById("msgSemPermissao");
  const blocoGestao = document.getElementById("blocoGestao");
  const blocoGestaoAcoes = document.getElementById("blocoGestaoAcoes");
  const blocoGestaoTabela = document.getElementById("blocoGestaoTabela");
  const blocoPendenciasTabela = document.getElementById("blocoPendenciasTabela");
  const corpoPendencias = document.getElementById("corpoPendencias");
  const admLinkPublicoWrap = document.getElementById("admLinkPublicoWrap");
  const admLinkPublico = document.getElementById("admLinkPublico");
  const btnCopiarLinkAdm = document.getElementById("btnCopiarLinkAdm");
  const itemMenuGestao = document.querySelector('.menu-item[data-modulo="GESTAO DE ACESSO"]');
  const sessaoAtual = window.TASYAuth?.obterSessao?.() || null;
  const toastAcao = document.getElementById("toastAcao");
  const storyFlorence = document.getElementById("storyFlorence");
  const paineisModulo = {
    "DIMENSIONAMENTO DE ENFERMAGEM": document.getElementById("secIndicadores"),
    "GESTAO DE ACESSO": document.getElementById("secGestaoAcesso"),
    "GRAFICO EQUIPE DE ENFERMAGEM": document.getElementById("secGraficoEquipe"),
    "TABELA PRINCIPAL": document.getElementById("secEnfermagem"),
    "TABELA CONTROLE DIARIO": document.getElementById("secControleDiario"),
    SCP: document.getElementById("secSCPPanel")
  };
  const breadcrumbPorModulo = {
    "DIMENSIONAMENTO DE ENFERMAGEM": "TASY / DIMENSIONAMENTO DE ENFERMAGEM",
    "GESTAO DE ACESSO": "TASY / GESTAO DE ACESSO",
    "GRAFICO EQUIPE DE ENFERMAGEM": "TASY / GRAFICO EQUIPE DE ENFERMAGEM",
    "TABELA PRINCIPAL": "TASY / ESCALA DE TECNICO DE ENFERMAGEM",
    "TABELA CONTROLE DIARIO": "TASY / CONTROLE DIARIO",
    SCP: "TASY / SCP"
  };

  function ordenarSecoesConformeMenu() {
    const layout = document.querySelector(".layout");
    if (!layout) {
      return;
    }
    const ordem = [
      paineisModulo["DIMENSIONAMENTO DE ENFERMAGEM"],
      paineisModulo["TABELA PRINCIPAL"],
      paineisModulo.SCP,
      paineisModulo["GRAFICO EQUIPE DE ENFERMAGEM"],
      paineisModulo["TABELA CONTROLE DIARIO"],
      paineisModulo["GESTAO DE ACESSO"]
    ].filter(Boolean);
    const rodape = layout.querySelector(".tasy-footer");
    ordem.forEach((secao) => {
      layout.appendChild(secao);
    });
    if (rodape) {
      layout.appendChild(rodape);
    }
  }

  function aplicarAvatarFixoTecnicos() {
    document.querySelectorAll("#corpoTecnicos .foto-previa").forEach((img) => {
      img.src = DEFAULT_AVATAR_URL;
    });
  }

  function obterBasePublicaEquipeT33() {
    try {
      const { protocol, hostname, port } = window.location;
      if (!hostname) {
        return window.location.origin || "";
      }
      const hostRender = hostname.toLowerCase().endsWith(".onrender.com");
      if (hostRender) {
        return `${protocol}//${hostname}`;
      }
      const usarPorta = Boolean(port) && port !== "80" && port !== "443";
      return `${protocol}//${hostname}${usarPorta ? `:${port}` : ""}`;
    } catch (_erro) {
      return window.location.origin || "";
    }
  }

  function larguraLeitoPorSetor(_setor) {
    // Padrao unico solicitado: leitos com ate 4 digitos em todas as opcoes.
    return 4;
  }

  function normalizarCodigosLeito(valor, limite = null, largura = 3) {
    const texto = String(valor || "").trim();
    const porSeparador = texto
      .split(/[^0-9]+/)
      .map((t) => t.trim())
      .filter(Boolean);

    // Se vier sem separador, quebra em blocos conforme largura do setor.
    const tokens = porSeparador.length > 1
      ? porSeparador
      : (texto.replace(/\D/g, "").match(new RegExp(`\\d{1,${largura}}`, "g")) || []);

    const completos = tokens
      .map((g) => g.slice(0, largura))
      .filter((g) => g.length === largura)
      .map((g) => g.padStart(largura, "0"));
    if (typeof limite === "number") {
      return completos.slice(0, limite);
    }
    return completos;
  }

  // Mantem digitacao livre (sem limite de tamanho por codigo), removendo apenas caracteres invalidos.
  function formatarCodigosEmDigitacao(valor, limite = null, largura = 3) {
    const texto = String(valor || "");
    const limpo = texto.replace(/[^\d\s\n]/g, "");
    const lista = limpo
      .split(/\s+/)
      .filter(Boolean);
    return (typeof limite === "number" ? lista.slice(0, limite) : lista).join(" ");
  }

  function limparSomenteDigitosEspacos(valor) {
    return String(valor || "").replace(/[^\d\s\n]/g, "");
  }

  function formatarLeitosEmQuadro(valor, largura = 3) {
    const grupos = normalizarCodigosLeito(valor, null, largura);
    const linhas = [];
    for (let i = 0; i < grupos.length; i += 3) {
      linhas.push(grupos.slice(i, i + 3).join(" "));
    }
    return linhas.join("\n");
  }

  function formatarLeitosEmQuadroDigitacao(valor, largura = 3) {
    return String(valor || "").replace(/[^\d\s\n]/g, "");
  }

  function contarCodigosLivres(valor) {
    return String(valor || "")
      .split(/[^0-9]+/)
      .map((t) => t.trim())
      .filter(Boolean).length;
  }

  function formatarDuracaoHHMMSS(segundosTotal) {
    const total = Math.max(Number(segundosTotal) || 0, 0);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = Math.floor(total % 60);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function obterConfigCategoriaSCP(categoria) {
    const chave = String(categoria || "").trim().toUpperCase();
    const unidadePorCategoria = {
      INTENSIVO: 2,
      SEMI: 3,
      ALTA: 4,
      INTER: 6,
      MIN: 8
    };
    const unidade = Number(unidadePorCategoria[chave] || 0);
    const SEGUNDOS_POR_UNIDADE = 825; // 13m45s
    return {
      unidade,
      tempoSegundos: unidade * SEGUNDOS_POR_UNIDADE
    };
  }

  function atualizarSomaTecnico(tr) {
    const categoria = tr.querySelector(".campo-scp-categoria")?.value || "";
    const pacientes = Number(tr.querySelector(".campo-scp-pacientes")?.value || 0);
    const campoSoma = tr.querySelector(".campo-scp-soma-tecnico");
    if (!campoSoma) {
      return;
    }
    const cfg = obterConfigCategoriaSCP(categoria);
    const soma = Math.max(pacientes, 0) * cfg.tempoSegundos;
    campoSoma.value = formatarDuracaoHHMMSS(soma);
  }

  function atualizarSomaTodosTecnicos() {
    document.querySelectorAll("#corpoTecnicos tr").forEach((tr) => atualizarSomaTecnico(tr));
  }

  function limitarDigitacaoLeitos(valor, largura = 3) {
    return String(valor || "").replace(/[^\d\s\n]/g, "");
  }

  function aplicarFormatoControleDiario() {
    const idsLeitos4 = [
      "altasHospitalar",
      "banhosTotal",
      "leitosDisponivel",
      "leitosLaboratorio",
      "leitosTomografia",
      "leitosCC"
    ];
    idsLeitos4.forEach((id) => {
      const campo = document.getElementById(id);
      if (!campo) {
        return;
      }
      campo.value = limparSomenteDigitosEspacos(campo.value);
    });
  }

  function navegarModulo(modulo) {
    if (modulo === "GESTAO DE ACESSO" && !window.TASYAuth?.eAdminT33?.()) {
      modulo = "DIMENSIONAMENTO DE ENFERMAGEM";
    }

    menuItems.forEach((item) => {
      item.classList.toggle("ativo", item.dataset.modulo === modulo);
    });

    if (tasyBreadcrumb) {
      tasyBreadcrumb.textContent = breadcrumbPorModulo[modulo] || `TASY / ${modulo}`;
    }

    const mostrarTudo = modulo === "DIMENSIONAMENTO DE ENFERMAGEM";
    Object.entries(paineisModulo).forEach(([chave, painel]) => {
      if (!painel) {
        return;
      }
      if (chave === "DIMENSIONAMENTO DE ENFERMAGEM") {
        // Filtro por setor sempre visivel, em qualquer modulo do menu inicial.
        painel.style.display = "";
      } else {
        painel.style.display = mostrarTudo || chave === modulo ? "" : "none";
      }
    });

    const destino = paineisModulo[modulo];
    if (destino) {
      destino.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    try {
      const menuAtivo = document.querySelector(".tasy-menu .menu-item.ativo");
      if (menuAtivo && typeof menuAtivo.scrollIntoView === "function") {
        menuAtivo.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    } catch (_e) {
      // Sem impacto funcional.
    }

  }

  function criarAssistenciaHtml(lista) {
    return lista
      .map((item) => `<label><input type="checkbox" value="${item}"> ${item}</label>`)
      .join("");
  }

  function assistenciaPorSetor(setor) {
    if (setoresUTI.has(setor)) {
      return [...assistUTI];
    }
    if (setoresCentroCirurgico.has(setor)) {
      return [...assistCentroCirurgico];
    }
    if (setoresMaternidade.has(setor)) {
      return [...assistMaternidade];
    }
    if (setoresPediatria.has(setor)) {
      return [...assistPediatria];
    }
    if (setoresCME.has(setor)) {
      return [...assistCME];
    }
    if (setoresHipodermia.has(setor)) {
      return [...assistHipodermia];
    }
    if (setoresBox.has(setor)) {
      return [...assistBox];
    }
    if (setoresTrauma.has(setor)) {
      return [...assistTrauma];
    }
    if (setoresHemodialise.has(setor)) {
      return [...assistHemodialise];
    }
    if (setoresClinica.has(setor)) {
      return [...assistClinica];
    }
    return ["SSVV"];
  }

  function criarLinhaTecnico(indice) {
    const clone = template.content.cloneNode(true);
    const tr = clone.querySelector("tr");
    const nome = clone.querySelector(".campo-colaborador");
    const setor = clone.querySelector(".campo-setor");
    const assistencia = clone.querySelector(".bloco-assistencia");
    const fotoPrevia = clone.querySelector(".foto-previa");

    nome.value = `TECNICO ${indice}`;
    nome.dataset.defaultValue = nome.value;
    nome.addEventListener("focus", () => {
      nome.select();
    });
    nome.addEventListener("click", () => {
      nome.select();
    });
    assistencia.innerHTML = criarAssistenciaHtml(assistenciaPorSetor(setor.value));
    atualizarConfigLeitosPorSetor(tr, setor.value);
    if (fotoPrevia) {
      fotoPrevia.src = DEFAULT_AVATAR_URL;
    }

    const atualizarPorSetor = () => {
      assistencia.innerHTML = criarAssistenciaHtml(assistenciaPorSetor(setor.value));
      atualizarConfigLeitosPorSetor(tr, setor.value);
      aplicarFiltros();
      atualizarStatus();
      salvarEstado();
    };
    setor.addEventListener("change", atualizarPorSetor);
    setor.addEventListener("input", atualizarPorSetor);

    corpoTecnicos.appendChild(clone);
  }

  function montarTecnicos() {
    for (let i = 1; i <= TECNICOS_INICIAIS; i += 1) {
      criarLinhaTecnico(i);
    }
    aplicarAvatarFixoTecnicos();
  }

  function adicionarTecnico() {
    const totalAtual = document.querySelectorAll("#corpoTecnicos tr").length;
    if (totalAtual >= MAX_TECNICOS) {
      mostrarToastAcao("Limite maximo de 10 tecnicos atingido.");
      return;
    }
    criarLinhaTecnico(totalAtual + 1);
    aplicarAvatarFixoTecnicos();
    processarAtualizacaoGeral();
    mostrarToastAcao("Tecnico adicionado.");
  }

  function limparLinhaTecnico(tr) {
    const setor = tr.querySelector(".campo-setor")?.value || "CLINICA 1";
    tr.querySelectorAll("input[type='text'], textarea").forEach((campo) => {
      if (campo.classList.contains("campo-colaborador")) {
        campo.value = campo.dataset.defaultValue || "";
        return;
      }
      if (campo.classList.contains("campo-descanso")) {
        campo.value = "1 hora";
        return;
      }
      campo.value = "";
    });
    tr.querySelectorAll("input[type='checkbox']").forEach((check) => {
      check.checked = false;
    });
    const assistencia = tr.querySelector(".bloco-assistencia");
    if (assistencia) {
      assistencia.innerHTML = criarAssistenciaHtml(assistenciaPorSetor(setor));
    }
    const scpCategoria = tr.querySelector(".campo-scp-categoria");
    const scpPacientes = tr.querySelector(".campo-scp-pacientes");
    if (scpCategoria) {
      scpCategoria.value = "";
    }
    if (scpPacientes) {
      scpPacientes.value = "0";
    }
    const somaTecnico = tr.querySelector(".campo-scp-soma-tecnico");
    if (somaTecnico) {
      somaTecnico.value = "00:00:00";
    }
    setLinhaBloqueio(tr, false);
  }

  function renumerarTecnicos() {
    const linhas = Array.from(document.querySelectorAll("#corpoTecnicos tr"));
    linhas.forEach((tr, idx) => {
      const campoNome = tr.querySelector(".campo-colaborador");
      if (!campoNome) {
        return;
      }
      const novoPadrao = `TECNICO ${idx + 1}`;
      const valorAtual = String(campoNome.value || "").trim();
      const valorPadraoAntigo = String(campoNome.dataset.defaultValue || "").trim();
      if (!valorAtual || valorAtual === valorPadraoAntigo) {
        campoNome.value = novoPadrao;
      }
      campoNome.dataset.defaultValue = novoPadrao;
    });
  }

  function removerLinhaTecnico(tr) {
    tr.remove();
    renumerarTecnicos();
  }

  function definirModoEscala(compacto) {
    document.body.classList.toggle("escala-compacta", Boolean(compacto));
    if (btnModoEscala) {
      btnModoEscala.textContent = compacto ? "Modo: Compacto" : "Modo: Normal";
    }
    localStorage.setItem(STORAGE_ESCALA_MODO, compacto ? "1" : "0");
  }

  function alternarModoEscala() {
    const ativo = document.body.classList.contains("escala-compacta");
    definirModoEscala(!ativo);
  }

  let toastTimer = null;
  function mostrarToastAcao(mensagem) {
    if (!toastAcao) {
      return;
    }
    toastAcao.textContent = mensagem;
    toastAcao.classList.add("ativo");
    if (toastTimer) {
      clearTimeout(toastTimer);
    }
    toastTimer = setTimeout(() => {
      toastAcao.classList.remove("ativo");
    }, 1600);
  }

  const FRASE_FLORENCE = "A enfermagem e uma arte; e, para realiza-la como arte, requer devocao tao exclusiva e preparo tao rigoroso quanto a obra de qualquer pintor ou escultor.";
  let storyTimer = null;
  function mostrarStoryFlorence() {
    if (!storyFlorence) {
      return;
    }
    storyFlorence.textContent = FRASE_FLORENCE;
    storyFlorence.classList.add("ativa");
    if (storyTimer) {
      clearTimeout(storyTimer);
      storyTimer = null;
    }
  }

  function ocultarStoryFlorence() {
    if (!storyFlorence) {
      return;
    }
    storyFlorence.classList.remove("ativa");
  }

  function atualizarConfigLeitosPorSetor(tr, setor) {
    const campoLeitos = tr.querySelector(".campo-leitos");
    if (!campoLeitos) {
      return;
    }
    const largura = larguraLeitoPorSetor(setor);
    campoLeitos.placeholder = "1001 1002 1003\n2001 2002 2003\n3001 3002 3003";
    campoLeitos.removeAttribute("maxLength");
    campoLeitos.value = formatarLeitosEmQuadroDigitacao(campoLeitos.value, largura);
  }

  function setLinhaBloqueio(tr, bloquear) {
    tr.classList.toggle("status-confirmado", bloquear);
    tr.classList.toggle("linha-bloqueada", bloquear);

    tr.querySelectorAll("input, select, textarea").forEach((campo) => {
      if (campo.classList.contains("campo-descanso")) {
        campo.disabled = bloquear;
        return;
      }
      if (campo.classList.contains("foto-input")) {
        campo.disabled = bloquear;
        return;
      }
      campo.disabled = bloquear;
    });

    const btnOk = tr.querySelector(".ok");
    const btnRemove = tr.querySelector(".remove");
    const btnReset = tr.querySelector(".reset");
    if (btnOk) {
      btnOk.disabled = bloquear;
      btnOk.textContent = bloquear ? "Confirmado" : "Confirmar";
      btnOk.title = bloquear ? "Linha confirmada" : "Confirmar linha";
    }
    if (btnRemove) {
      btnRemove.disabled = false;
      btnRemove.title = "Remover tecnico";
    }
    if (btnReset) {
      btnReset.disabled = false;
      btnReset.title = bloquear ? "Desbloquear para editar" : "Reiniciar status da linha";
    }
  }

  function calcularSCP() {
    const totais = {
      INTENSIVO: 0,
      SEMI: 0,
      ALTA: 0,
      INTER: 0,
      MIN: 0
    };
    const linhas = Array.from(document.querySelectorAll("#corpoTecnicos tr"));
    linhas.forEach((tr) => {
      const categoria = String(tr.querySelector(".campo-scp-categoria")?.value || "").trim().toUpperCase();
      const pacientes = Number(tr.querySelector(".campo-scp-pacientes")?.value || 0);
      if (!categoria || !Object.prototype.hasOwnProperty.call(totais, categoria)) {
        return;
      }
      totais[categoria] += Math.max(pacientes, 0);
    });

    const mapa = [
      { id: "scpInt", totalId: "scpIntTotal", somaId: "scpIntSoma", chave: "INTENSIVO", unidade: 2 },
      { id: "scpSemi", totalId: "scpSemiTotal", somaId: "scpSemiSoma", chave: "SEMI", unidade: 3 },
      { id: "scpAlta", totalId: "scpAltaTotal", somaId: "scpAltaSoma", chave: "ALTA", unidade: 4 },
      { id: "scpInter", totalId: "scpInterTotal", somaId: "scpInterSoma", chave: "INTER", unidade: 6 },
      { id: "scpMin", totalId: "scpMinTotal", somaId: "scpMinSoma", chave: "MIN", unidade: 8 }
    ];

    atualizarSomaTodosTecnicos();

    let somaSegundos = 0;
    let somaPacientes = 0;
    mapa.forEach((item) => {
      const qtd = Number(totais[item.chave] || 0);
      const tempoSegundos = item.unidade * 825;
      const somaCategoria = qtd * tempoSegundos;
      somaSegundos += somaCategoria;
      somaPacientes += qtd;
      const campoQtd = document.getElementById(item.id);
      const campoTotal = document.getElementById(item.totalId);
      const campoSoma = document.getElementById(item.somaId);
      if (campoQtd) {
        campoQtd.value = String(qtd);
      }
      if (campoTotal) {
        campoTotal.value = formatarDuracaoHHMMSS(tempoSegundos);
      }
      if (campoSoma) {
        campoSoma.value = formatarDuracaoHHMMSS(somaCategoria);
      }
    });

    document.getElementById("somaTotalSCP").value = formatarDuracaoHHMMSS(somaSegundos);

    const statusCargaSCP = document.getElementById("statusCargaSCP");
    if (statusCargaSCP) {
      const faixaAbaixo = 5 * 3600 + 29 * 60;
      const faixaAdeqIni = 5 * 3600 + 30 * 60;
      const faixaAdeqFim = 6 * 3600;
      const faixaAtencaoIni = 6 * 3600 + 60;
      const faixaAtencaoFim = 6 * 3600 + 30 * 60;
      let status = "ABAIXO";
      let classe = "abaixo";

      if (somaSegundos >= faixaAdeqIni && somaSegundos <= faixaAdeqFim) {
        status = "ADEQUADA";
        classe = "adequada";
      } else if (somaSegundos >= faixaAtencaoIni && somaSegundos <= faixaAtencaoFim) {
        status = "ATENCAO";
        classe = "atencao";
      } else if (somaSegundos > faixaAtencaoFim) {
        status = "SOBRECARGA";
        classe = "sobrecarga";
      } else if (somaSegundos > faixaAbaixo) {
        status = "ATENCAO";
        classe = "atencao";
      }

      statusCargaSCP.className = `status-carga ${classe}`;
      statusCargaSCP.textContent = `Status: ${status} (${formatarDuracaoHHMMSS(somaSegundos)})`;
    }

    if (grafSCPTexto) {
      grafSCPTexto.textContent = `${somaPacientes} pacientes`;
    }
    atualizarGraficoSCP();
  }

  function atualizarGraficoSCP() {
    if (!grafSCPDonut || !grafSCPTexto || !grafSCPLegenda) {
      return;
    }

    const itens = [
      { nome: "Intensivo", valor: Number(document.getElementById("scpInt")?.value || 0), cor: "#6a1b9a" },
      { nome: "Semi-intensivo", valor: Number(document.getElementById("scpSemi")?.value || 0), cor: "#e53935" },
      { nome: "Alta dependencia", valor: Number(document.getElementById("scpAlta")?.value || 0), cor: "#ffd600" },
      { nome: "Intermediarios", valor: Number(document.getElementById("scpInter")?.value || 0), cor: "#1e88e5" },
      { nome: "Minimo", valor: Number(document.getElementById("scpMin")?.value || 0), cor: "#2e7d32" }
    ];

    const total = itens.reduce((acc, it) => acc + Math.max(it.valor, 0), 0);
    if (total <= 0) {
      grafSCPDonut.style.background = "conic-gradient(#d9e6f5 0deg, #d9e6f5 360deg)";
      grafSCPTexto.textContent = "0 pacientes";
    } else {
      let angIni = 0;
      const partes = itens
        .filter((it) => it.valor > 0)
        .map((it) => {
          const ang = (it.valor / total) * 360;
          const inicio = angIni;
          const fim = angIni + ang;
          angIni = fim;
          return `${it.cor} ${inicio}deg ${fim}deg`;
        });
      grafSCPDonut.style.background = `conic-gradient(${partes.join(", ")})`;
      grafSCPTexto.textContent = `${total} pacientes`;
    }

    grafSCPLegenda.innerHTML = "";
    itens.forEach((it) => {
      const item = document.createElement("div");
      item.className = "graf-legenda-item";
      item.innerHTML = `
        <span class="graf-legenda-cor" style="background:${it.cor}"></span>
        <span>${it.nome}: ${it.valor}</span>
      `;
      grafSCPLegenda.appendChild(item);
    });
  }

  function distribuirBanhos() {
    const totalBanhos = contarCodigosLivres(document.getElementById("banhosTotal").value);

    let totalLeitos = 0;
    document.querySelectorAll(".campo-leitos").forEach((campo) => {
      const tr = campo.closest("tr");
      const setor = tr?.querySelector(".campo-setor")?.value || "";
      const largura = larguraLeitoPorSetor(setor);
      totalLeitos += normalizarCodigosLeito(campo.value, 9, largura).length;
    });

    let resultado = "";
    if (totalLeitos > 0 && totalBanhos > 0) {
      const porLeito = totalBanhos / totalLeitos;
      resultado = `${porLeito.toFixed(2)} banho/leito`;
    }

    document.getElementById("distribuicaoBanho").value = resultado;
  }

  function aplicarFiltros() {
    const linhas = Array.from(document.querySelectorAll("#corpoTecnicos tr"));
    const setorFiltro = filtroSetor?.value || "TODOS";

    // Mantem sempre os tecnicos visiveis para supervisao.
    linhas.forEach((tr) => {
      tr.style.display = "";
    });

    // Quando selecionar um setor no filtro, replica para toda a tabela principal.
    if (setorFiltro !== "TODOS") {
      linhas.forEach((tr) => {
        const setorLinha = tr.querySelector(".campo-setor");
        const assistencia = tr.querySelector(".bloco-assistencia");
        if (!setorLinha || !assistencia) {
          return;
        }
        setorLinha.value = setorFiltro;
        assistencia.innerHTML = criarAssistenciaHtml(assistenciaPorSetor(setorFiltro));
        atualizarConfigLeitosPorSetor(tr, setorFiltro);
      });
    }
  }

  function atualizarSetorSupervisao() {
    if (!setorSupervisao || !filtroSetor) {
      return;
    }
    setorSupervisao.textContent = filtroSetor.value || "TODOS";
  }

  function setoresSelecionadosNoCadastro() {
    if (!admSetores) {
      return ["TODOS"];
    }
    const valores = Array.from(admSetores.selectedOptions).map((op) => op.value);
    return valores.length ? valores : ["TODOS"];
  }

  function marcarSetoresCadastro(setores) {
    if (!admSetores) {
      return;
    }
    const lista = Array.isArray(setores) ? setores : ["TODOS"];
    Array.from(admSetores.options).forEach((op) => {
      op.selected = lista.includes(op.value);
    });
  }

  function limparFormularioUsuario() {
    if (!admNome || !admUsuario || !admSenha || !admPerfil || !admSetores || !admAtivo) {
      return;
    }
    admNome.value = "";
    admUsuario.value = "";
    admSenha.value = "";
    admPerfil.value = "CONSULTA";
    marcarSetoresCadastro(["TODOS"]);
    admAtivo.checked = true;
    admUsuario.disabled = false;
  }

  function renderUsuarios() {
    if (!corpoUsuarios || !window.TASYAuth?.listarUsuarios) {
      return;
    }
    const usuarios = window.TASYAuth.listarUsuarios();
    corpoUsuarios.innerHTML = "";
    usuarios.forEach((u) => {
      const protegido = String(u.usuario || "").toUpperCase() === "T33";
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${u.usuario}</td>
        <td>${u.nome}</td>
        <td>${u.perfil}</td>
        <td>${(u.setores || []).join(", ")}</td>
        <td>${u.ativo ? "SIM" : "NAO"}</td>
        <td class="acoes-linha">
          <button type="button" class="ok" data-editar="${u.usuario}">Editar</button>
          ${protegido
            ? '<button type="button" class="remove" disabled title="Conta protegida">Protegido</button>'
            : `<button type="button" class="remove" data-remover="${u.usuario}">Remover</button>`}
        </td>
      `;
      corpoUsuarios.appendChild(tr);
    });
  }

  function renderPendencias() {
    if (!corpoPendencias || !window.TASYAuth?.listarPendencias) {
      return;
    }
    const pendencias = window.TASYAuth.listarPendencias();
    corpoPendencias.innerHTML = "";
    pendencias.forEach((p) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${String(p.criadoEm || "").slice(0, 19).replace("T", " ")}</td>
        <td>${p.nome || ""}</td>
        <td>${p.usuario || ""}</td>
        <td>${p.perfil || ""}</td>
        <td>${(p.setores || []).join(", ")}</td>
        <td class="acoes-linha">
          <button type="button" class="ok" data-aprovar="${p.id}">Aprovar</button>
          <button type="button" class="remove" data-reprovar="${p.id}">Reprovar</button>
        </td>
      `;
      corpoPendencias.appendChild(tr);
    });
  }

  function aplicarPermissaoSetores() {
    if (!sessaoAtual || !filtroSetor) {
      return;
    }
    const setores = Array.isArray(sessaoAtual.setores) ? sessaoAtual.setores : ["TODOS"];
    const permiteTodos = window.TASYAuth?.eAdmin?.() || setores.includes("TODOS");
    if (permiteTodos) {
      return;
    }
    Array.from(filtroSetor.options).forEach((op) => {
      if (op.value === "TODOS") {
        op.style.display = "none";
        return;
      }
      op.style.display = setores.includes(op.value) ? "" : "none";
    });
    const primeiro = setores.find((s) => s !== "TODOS") || setores[0];
    if (primeiro) {
      filtroSetor.value = primeiro;
    }
  }

  function iniciarGestaoAcesso() {
    const adminT33 = Boolean(window.TASYAuth?.eAdminT33?.());

    if (admLinkPublicoWrap) {
      admLinkPublicoWrap.style.display = adminT33 ? "" : "none";
    }
    if (adminT33 && admLinkPublico) {
      admLinkPublico.value = `${obterBasePublicaEquipeT33()}/equipe-t33`;
    }
    if (adminT33 && btnCopiarLinkAdm && admLinkPublico) {
      btnCopiarLinkAdm.addEventListener("click", async () => {
        const link = admLinkPublico.value;
        try {
          if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(link);
          } else {
            admLinkPublico.focus();
            admLinkPublico.select();
            document.execCommand("copy");
          }
          mostrarToastAcao("Link Equipe T33 copiado.");
        } catch (_erro) {
          mostrarToastAcao("Nao foi possivel copiar o link.");
        }
      });
    }

    if (!adminT33) {
      if (msgSemPermissao) {
        msgSemPermissao.style.display = "";
        msgSemPermissao.textContent = "Acesso permitido somente para T33 ADM.";
      }
      if (blocoGestao) blocoGestao.style.display = "none";
      if (blocoGestaoAcoes) blocoGestaoAcoes.style.display = "none";
      if (blocoGestaoTabela) blocoGestaoTabela.style.display = "none";
      if (blocoPendenciasTabela) blocoPendenciasTabela.style.display = "none";
      if (itemMenuGestao) itemMenuGestao.style.display = "none";
      return;
    }

    if (msgSemPermissao) msgSemPermissao.style.display = "none";
    if (blocoGestao) blocoGestao.style.display = "";
    if (blocoGestaoAcoes) blocoGestaoAcoes.style.display = "";
    if (blocoGestaoTabela) blocoGestaoTabela.style.display = "";
    if (blocoPendenciasTabela) blocoPendenciasTabela.style.display = "";
    renderUsuarios();
    renderPendencias();
    limparFormularioUsuario();

    if (btnNovoUsuario) {
      btnNovoUsuario.addEventListener("click", limparFormularioUsuario);
    }

    if (btnSalvarUsuario) {
      btnSalvarUsuario.addEventListener("click", () => {
        const payload = {
          nome: admNome?.value || "",
          usuario: admUsuario?.value || "",
          senha: admSenha?.value || "",
          perfil: admPerfil?.value || "CONSULTA",
          setores: setoresSelecionadosNoCadastro(),
          ativo: Boolean(admAtivo?.checked)
        };
        const ret = window.TASYAuth.salvarUsuario(payload);
        if (!ret?.ok) {
          window.alert(ret?.erro || "Falha ao salvar usuario.");
          return;
        }
        renderUsuarios();
        limparFormularioUsuario();
      });
    }

    if (btnAtualizarPendencias) {
      btnAtualizarPendencias.addEventListener("click", renderPendencias);
    }

    if (corpoUsuarios) {
      corpoUsuarios.addEventListener("click", (event) => {
        const alvo = event.target instanceof HTMLElement ? event.target : event.target?.parentElement;
        if (!alvo) {
          return;
        }
        const btnAcao = alvo.closest("button");
        if (!btnAcao) {
          return;
        }

        const usuarioEditar = btnAcao.getAttribute("data-editar");
        if (usuarioEditar) {
          const usuarios = window.TASYAuth.listarUsuarios();
          const user = usuarios.find((u) => u.usuario === usuarioEditar);
          if (!user) {
            return;
          }
          admNome.value = user.nome;
          admUsuario.value = user.usuario;
          admUsuario.disabled = true;
          admSenha.value = "";
          admPerfil.value = user.perfil;
          marcarSetoresCadastro(user.setores);
          admAtivo.checked = Boolean(user.ativo);
          mostrarToastAcao(`Editando usuario ${user.usuario}.`);
          return;
        }

        const usuarioRemover = btnAcao.getAttribute("data-remover");
        if (usuarioRemover) {
          const confirma = window.confirm(`Remover usuario ${usuarioRemover}?`);
          if (!confirma) {
            return;
          }
          const ret = window.TASYAuth.removerUsuario(usuarioRemover);
          if (!ret?.ok) {
            window.alert(ret?.erro || "Falha ao remover usuario.");
            return;
          }
          renderUsuarios();
          limparFormularioUsuario();
        }
      });
    }

    if (corpoPendencias) {
      corpoPendencias.addEventListener("click", (event) => {
        const alvo = event.target instanceof HTMLElement ? event.target : event.target?.parentElement;
        if (!alvo) {
          return;
        }
        const btnAcao = alvo.closest("button");
        if (!btnAcao) {
          return;
        }
        const idAprovar = btnAcao.getAttribute("data-aprovar");
        if (idAprovar) {
          const ret = window.TASYAuth.aprovarPendencia(idAprovar);
          if (!ret?.ok) {
            window.alert(ret?.erro || "Falha ao aprovar.");
            return;
          }
          renderPendencias();
          renderUsuarios();
          return;
        }
        const idReprovar = btnAcao.getAttribute("data-reprovar");
        if (idReprovar) {
          const ret = window.TASYAuth.reprovarPendencia(idReprovar);
          if (!ret?.ok) {
            window.alert(ret?.erro || "Falha ao reprovar.");
            return;
          }
          renderPendencias();
        }
      });
    }
  }

  function mostrarTodosTecnicos() {
    if (filtroSetor) {
      filtroSetor.value = "TODOS";
    }
    aplicarFiltros();
    atualizarSetorSupervisao();
    atualizarStatus();
  }

  function renderBarras(el, itens, classe = "") {
    if (!el) {
      return;
    }
    el.innerHTML = "";

    if (!itens.length) {
      el.innerHTML = "<div class='graf-label'>Sem dados</div>";
      return;
    }

    const max = Math.max(...itens.map((i) => i.valor), 1);
    itens.forEach((item) => {
      const pct = Math.max((item.valor / max) * 100, item.valor > 0 ? 3 : 0);
      const linha = document.createElement("div");
      linha.className = "graf-linha";
      linha.innerHTML = `
        <div class="graf-label" title="${item.label}">${item.label}</div>
        <div class="graf-track"><div class="graf-fill ${classe || item.classe || ""}" style="width:${pct}%"></div></div>
        <div class="graf-valor">${item.valor}</div>
      `;
      el.appendChild(linha);
    });
  }

  function atualizarGraficosEquipe(linhasBase = null) {
    const linhas = linhasBase || Array.from(document.querySelectorAll("#corpoTecnicos tr"));
    const mapaSetor = new Map();
    let confirmados = 0;

    linhas.forEach((tr) => {
      const setor = tr.querySelector(".campo-setor")?.value || "SEM SETOR";
      mapaSetor.set(setor, (mapaSetor.get(setor) || 0) + 1);
      if (tr.classList.contains("status-confirmado")) {
        confirmados += 1;
      }
    });

    const porSetor = Array.from(mapaSetor.entries())
      .map(([label, valor]) => ({ label, valor }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 10);

    const pendentes = Math.max(linhas.length - confirmados, 0);
    const porStatus = [
      { label: "Confirmados", valor: confirmados, classe: "ok" },
      { label: "Pendentes", valor: pendentes, classe: "pendente" }
    ];

    renderBarras(grafSetores, porSetor);
    renderBarras(grafStatus, porStatus);
    renderDonutStatus(confirmados, pendentes);
  }

  function renderDonutStatus(confirmados, pendentes) {
    if (!grafDonut || !grafDonutTexto) {
      return;
    }
    const total = confirmados + pendentes;
    const pct = total > 0 ? (confirmados / total) * 100 : 0;
    const ang = (pct / 100) * 360;

    grafDonut.style.background = `conic-gradient(
      #258b50 0deg,
      #258b50 ${ang}deg,
      #deba4f ${ang}deg,
      #deba4f 360deg
    )`;
    grafDonutTexto.textContent = `${pct.toFixed(0)}% confirmados`;
  }

  function atualizarGraficoControleDiario() {
    if (!grafControleDonut || !grafControleTexto || !grafControleLegenda) {
      return;
    }
    const itens = [
      {
        nome: "Altas hospitalar",
        valor: contarCodigosLivres(document.getElementById("altasHospitalar")?.value || ""),
        cor: "#e53935"
      },
      {
        nome: "Banhos",
        valor: contarCodigosLivres(document.getElementById("banhosTotal")?.value || ""),
        cor: "#fb8c00"
      },
      {
        nome: "Leitos disponivel",
        valor: contarCodigosLivres(document.getElementById("leitosDisponivel")?.value || ""),
        cor: "#43a047"
      },
      {
        nome: "Distribuicao por tecnico",
        valor: (document.getElementById("distribuicaoBanho")?.value || "").trim() ? 1 : 0,
        cor: "#1e88e5"
      },
      {
        nome: "Laboratorios",
        valor: contarCodigosLivres(document.getElementById("leitosLaboratorio")?.value || ""),
        cor: "#00897b"
      },
      {
        nome: "Tomografia",
        valor: contarCodigosLivres(document.getElementById("leitosTomografia")?.value || ""),
        cor: "#6d4c41"
      },
      {
        nome: "C.C",
        valor: contarCodigosLivres(document.getElementById("leitosCC")?.value || ""),
        cor: "#546e7a"
      }
    ];

    const total = itens.reduce((acc, it) => acc + it.valor, 0);
    if (total <= 0) {
      grafControleDonut.style.background = "conic-gradient(#d9e6f5 0deg, #d9e6f5 360deg)";
      grafControleTexto.textContent = "0 registros";
    } else {
      let angIni = 0;
      const partes = itens
        .filter((it) => it.valor > 0)
        .map((it) => {
          const ang = (it.valor / total) * 360;
          const inicio = angIni;
          const fim = angIni + ang;
          angIni = fim;
          return `${it.cor} ${inicio}deg ${fim}deg`;
        });
      grafControleDonut.style.background = `conic-gradient(${partes.join(", ")})`;
      grafControleTexto.textContent = `${total} registros`;
    }

    grafControleLegenda.innerHTML = "";
    itens.forEach((it) => {
      const item = document.createElement("div");
      item.className = "graf-legenda-item";
      item.innerHTML = `
        <span class="graf-legenda-cor" style="background:${it.cor}"></span>
        <span>${it.nome}: ${it.valor}</span>
      `;
      grafControleLegenda.appendChild(item);
    });
  }

  function obterLinhasFiltradas() {
    const linhas = Array.from(document.querySelectorAll("#corpoTecnicos tr"));
    return linhas.filter((tr) => tr.style.display !== "none");
  }

  function atualizarStatus() {
    const filtradas = obterLinhasFiltradas();
    const base = filtradas;
    atualizarGraficosEquipe(base);
    atualizarGraficoControleDiario();
  }

  function capturarEstado() {
    const tecnicos = Array.from(document.querySelectorAll("#corpoTecnicos tr")).map((tr) => ({
      matricula: tr.querySelector(".campo-matricula")?.value || "",
      colaborador: tr.querySelector(".campo-colaborador")?.value || "",
      setor: tr.querySelector(".campo-setor")?.value || "",
      leitos: tr.querySelector(".campo-leitos")?.value || "",
      scpCategoria: tr.querySelector(".campo-scp-categoria")?.value || "",
      scpPacientes: tr.querySelector(".campo-scp-pacientes")?.value || "0",
      descanso: tr.querySelector(".campo-descanso")?.value || "1 hora",
      obs: tr.querySelector(".campo-obs")?.value || "",
      confirmado: tr.classList.contains("status-confirmado"),
      foto: DEFAULT_AVATAR_URL,
      atribuicoes: Array.from(tr.querySelectorAll(".bloco-atrib input:checked")).map((i) => i.value),
      assistencia: Array.from(tr.querySelectorAll(".bloco-assistencia input:checked")).map((i) => i.value)
    }));

    return {
      meta: {
        filtroSetor: filtroSetor?.value || "TODOS"
      },
      resumo: {
        altasHospitalar: document.getElementById("altasHospitalar").value || "",
        banhosTotal: document.getElementById("banhosTotal").value || "",
        leitosDisponivel: document.getElementById("leitosDisponivel").value || "",
        leitosLaboratorio: document.getElementById("leitosLaboratorio").value || "",
        leitosTomografia: document.getElementById("leitosTomografia").value || "",
        leitosCC: document.getElementById("leitosCC").value || "",
        funcaoExtra: document.getElementById("funcaoExtra").value || ""
      },
      scp: {
        scpInt: document.getElementById("scpInt").value || "0",
        scpSemi: document.getElementById("scpSemi").value || "0",
        scpAlta: document.getElementById("scpAlta").value || "0",
        scpInter: document.getElementById("scpInter").value || "0",
        scpMin: document.getElementById("scpMin").value || "0"
      },
      tecnicos
    };
  }

  function salvarEstado() {
    const payload = capturarEstado();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }

  function processarAtualizacaoGeral() {
    aplicarFormatoControleDiario();
    calcularSCP();
    distribuirBanhos();
    aplicarFiltros();
    atualizarStatus();
    salvarEstado();
  }

  function focarProximoCampo(atual) {
    const campos = Array.from(
      document.querySelectorAll("input, select, textarea, button")
    ).filter((el) => {
      const desabilitado = el.disabled || el.readOnly;
      const invisivel = el.offsetParent === null;
      return !desabilitado && !invisivel && el.tabIndex !== -1;
    });

    const idx = campos.indexOf(atual);
    if (idx >= 0 && idx + 1 < campos.length) {
      campos[idx + 1].focus();
    }
  }

  function restaurarEstado() {
    const bruto = localStorage.getItem(STORAGE_KEY);
    if (!bruto) {
      return;
    }

    try {
      const estado = JSON.parse(bruto);
      if (filtroSetor) filtroSetor.value = estado.meta?.filtroSetor || "TODOS";

      document.getElementById("altasHospitalar").value = estado.resumo?.altasHospitalar || "";
      document.getElementById("banhosTotal").value = estado.resumo?.banhosTotal || "";
      document.getElementById("leitosDisponivel").value = estado.resumo?.leitosDisponivel || "";
      document.getElementById("leitosLaboratorio").value = estado.resumo?.leitosLaboratorio || "";
      document.getElementById("leitosTomografia").value = estado.resumo?.leitosTomografia || "";
      document.getElementById("leitosCC").value = estado.resumo?.leitosCC || "";
      document.getElementById("funcaoExtra").value = estado.resumo?.funcaoExtra || "";

      const tecnicosSalvos = Array.isArray(estado.tecnicos) ? estado.tecnicos : [];
      const totalDesejado = Math.min(Math.max(tecnicosSalvos.length, TECNICOS_INICIAIS), MAX_TECNICOS);
      let totalAtual = document.querySelectorAll("#corpoTecnicos tr").length;
      while (totalAtual < totalDesejado) {
        criarLinhaTecnico(totalAtual + 1);
        totalAtual += 1;
      }

      const linhas = Array.from(document.querySelectorAll("#corpoTecnicos tr"));
      linhas.forEach((tr, idx) => {
        const src = estado.tecnicos?.[idx];
        if (!src) {
          return;
        }

        tr.querySelector(".campo-colaborador").value = src.colaborador || `TECNICO ${idx + 1}`;
        tr.querySelector(".campo-matricula").value = src.matricula || "";
        tr.querySelector(".campo-setor").value = src.setor || "CLINICA 1";
        const setorAtual = tr.querySelector(".campo-setor").value;
        const largura = larguraLeitoPorSetor(setorAtual);
        tr.querySelector(".campo-leitos").value = formatarLeitosEmQuadro(src.leitos || "", largura);
        tr.querySelector(".campo-scp-categoria").value = src.scpCategoria || "";
        tr.querySelector(".campo-scp-pacientes").value = src.scpPacientes || "0";
        tr.querySelector(".campo-descanso").value = src.descanso || "1 hora";
        tr.querySelector(".campo-obs").value = src.obs || "";
        atualizarConfigLeitosPorSetor(tr, setorAtual);

        tr.querySelector(".bloco-assistencia").innerHTML = criarAssistenciaHtml(
          assistenciaPorSetor(tr.querySelector(".campo-setor").value)
        );

        tr.querySelectorAll(".bloco-atrib input").forEach((check) => {
          check.checked = (src.atribuicoes || []).includes(check.value);
        });
        tr.querySelectorAll(".bloco-assistencia input").forEach((check) => {
          check.checked = (src.assistencia || []).includes(check.value);
        });

        setLinhaBloqueio(tr, Boolean(src.confirmado));
        atualizarSomaTecnico(tr);
      });
      aplicarAvatarFixoTecnicos();
    } catch (_error) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  function exportarCSV() {
    const linhas = [];
    linhas.push([
      "Matricula",
      "Colaborador",
      "Setor",
      "Leitos",
      "Atribuicoes",
      "Assistencia",
      "Descanso",
      "Obs"
    ]);

    document.querySelectorAll("#corpoTecnicos tr").forEach((tr) => {
      const matricula = tr.querySelector(".campo-matricula")?.value || "";
      const colaborador = tr.querySelector(".campo-colaborador")?.value || "";
      const setor = tr.querySelector(".campo-setor")?.value || "";
      const leitos = tr.querySelector(".campo-leitos")?.value || "";
      const atribuicoes = Array.from(tr.querySelectorAll(".bloco-atrib input:checked"))
        .map((i) => i.value)
        .join(" | ");
      const assistencia = Array.from(tr.querySelectorAll(".bloco-assistencia input:checked"))
        .map((i) => i.value)
        .join(" | ");
      const descanso = tr.querySelector(".campo-descanso")?.value || "";
      const obs = tr.querySelector(".campo-obs")?.value || "";

      linhas.push([matricula, colaborador, setor, leitos, atribuicoes, assistencia, descanso, obs]);
    });

    linhas.push([]);
    linhas.push(["Altas hospitalar", document.getElementById("altasHospitalar").value || ""]);
    linhas.push(["Banhos total", document.getElementById("banhosTotal").value || "0"]);
    linhas.push(["Leitos disponivel", document.getElementById("leitosDisponivel").value || ""]);
    linhas.push(["Laboratorios", document.getElementById("leitosLaboratorio").value || ""]);
    linhas.push(["Tomografia", document.getElementById("leitosTomografia").value || ""]);
    linhas.push(["C.C", document.getElementById("leitosCC").value || ""]);
    linhas.push(["Distribuicao banho", document.getElementById("distribuicaoBanho").value || ""]);
    linhas.push(["Soma total SCP", document.getElementById("somaTotalSCP").value || "0 h"]);
    linhas.push(["Funcao extra", document.getElementById("funcaoExtra").value || ""]);

    const csv = linhas
      .map((linha) => linha.map((col) => `"${String(col).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const setorArquivo = (filtroSetor?.value || "TODOS").replace(/[^a-zA-Z0-9]+/g, "_");
    a.download = `dimensionamento_tasy_${setorArquivo}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function reiniciarSistema() {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  }

  montarTecnicos();
  definirModoEscala(false);
  restaurarEstado();
  aplicarPermissaoSetores();
  if (!localStorage.getItem(STORAGE_KEY)) {
    mostrarTodosTecnicos();
  } else {
    aplicarFiltros();
    atualizarSetorSupervisao();
  }
  calcularSCP();
  distribuirBanhos();
  atualizarStatus();

  document.querySelectorAll(".scp-qty").forEach((campo) => {
    campo.addEventListener("input", () => {
      calcularSCP();
      salvarEstado();
    });
  });

  if (corpoTecnicos) {
    corpoTecnicos.addEventListener("click", (event) => {
      const alvo = event.target;
      if (!(alvo instanceof HTMLElement)) {
        return;
      }
      const btn = alvo.closest("button");
      if (!btn) {
        return;
      }
      const tr = btn.closest("tr");
      if (!tr) {
        return;
      }

      if (btn.classList.contains("ok")) {
        setLinhaBloqueio(tr, true);
        processarAtualizacaoGeral();
        mostrarToastAcao("Linha confirmada.");
        return;
      }
      if (btn.classList.contains("reset")) {
        setLinhaBloqueio(tr, false);
        processarAtualizacaoGeral();
        mostrarToastAcao("Linha reiniciada para edicao.");
        return;
      }
      if (btn.classList.contains("remove")) {
        removerLinhaTecnico(tr);
        processarAtualizacaoGeral();
        mostrarToastAcao("Tecnico removido.");
      }
    });
  }

  document.getElementById("banhosTotal").addEventListener("input", () => {
    distribuirBanhos();
    salvarEstado();
  });

  document.addEventListener("input", (event) => {
    if (event.target.classList.contains("campo-leitos")) {
      // Mantem digitacao totalmente livre durante o input (inclusive espaco).
      distribuirBanhos();
      salvarEstado();
    }

    if (
      event.target.classList.contains("campo-matricula") ||
      event.target.classList.contains("campo-colaborador") ||
      event.target.classList.contains("campo-scp-pacientes") ||
      event.target.classList.contains("campo-obs") ||
      event.target.id === "altasHospitalar" ||
      event.target.id === "leitosDisponivel" ||
      event.target.id === "leitosLaboratorio" ||
      event.target.id === "leitosTomografia" ||
      event.target.id === "leitosCC" ||
      event.target.id === "funcaoExtra"
    ) {
      aplicarFiltros();
      atualizarStatus();
      salvarEstado();
    }

    if (event.target.id === "banhosTotal") {
      distribuirBanhos();
      salvarEstado();
    }

    if (event.target.id === "altasHospitalar") {
      salvarEstado();
    }

    if (
      event.target.id === "leitosLaboratorio" ||
      event.target.id === "leitosTomografia" ||
      event.target.id === "leitosCC"
    ) {
      salvarEstado();
    }
  });

  document.addEventListener("change", (event) => {
    if (event.target.classList.contains("campo-leitos")) {
      // Ao finalizar, remove apenas caracteres invalidos (sem bloquear espaco).
      event.target.value = limparSomenteDigitosEspacos(event.target.value);
      distribuirBanhos();
      salvarEstado();
      return;
    }

    if (
      event.target.id === "altasHospitalar" ||
      event.target.id === "banhosTotal" ||
      event.target.id === "leitosDisponivel" ||
      event.target.id === "leitosLaboratorio" ||
      event.target.id === "leitosTomografia" ||
      event.target.id === "leitosCC"
    ) {
      event.target.value = limparSomenteDigitosEspacos(event.target.value);
      salvarEstado();
      return;
    }
    if (event.target.matches(".bloco-atrib input, .bloco-assistencia input")) {
      salvarEstado();
    }
    if (event.target.classList.contains("campo-scp-categoria")) {
      calcularSCP();
      salvarEstado();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") {
      return;
    }

    const alvo = event.target;

    // Em textarea comum, mantem quebra de linha.
    if (alvo instanceof HTMLTextAreaElement && !alvo.classList.contains("campo-leitos")) {
      processarAtualizacaoGeral();
      return;
    }

    // No quadro de leitos, permite Enter para descer linha e sincroniza estado.
    if (alvo.classList.contains("campo-leitos")) {
      setTimeout(processarAtualizacaoGeral, 0);
      return;
    }

    // Campos de entrada comuns: Enter confirma digitacao e avanca foco.
    event.preventDefault();
    processarAtualizacaoGeral();
    focarProximoCampo(alvo);
  });

  const atualizarPorFiltroSetor = () => {
    aplicarFiltros();
    atualizarSetorSupervisao();
    atualizarStatus();
    salvarEstado();
  };
  filtroSetor.addEventListener("change", atualizarPorFiltroSetor);
  filtroSetor.addEventListener("input", atualizarPorFiltroSetor);
  menuItems.forEach((item) => {
    item.addEventListener("click", () => navegarModulo(item.dataset.modulo || "DIMENSIONAMENTO DE ENFERMAGEM"));
  });
  document.querySelectorAll(".simbolo-enf").forEach((el) => {
    el.setAttribute("title", FRASE_FLORENCE);
    el.addEventListener("mouseenter", mostrarStoryFlorence);
    el.addEventListener("mouseleave", ocultarStoryFlorence);
    el.addEventListener("click", () => {
      mostrarStoryFlorence();
      storyTimer = setTimeout(ocultarStoryFlorence, 2600);
    });
    el.addEventListener("touchstart", () => {
      mostrarStoryFlorence();
      storyTimer = setTimeout(ocultarStoryFlorence, 2600);
    }, { passive: true });
  });
  iniciarGestaoAcesso();
  ordenarSecoesConformeMenu();
  navegarModulo("DIMENSIONAMENTO DE ENFERMAGEM");

  document.getElementById("btnExportarCsv").addEventListener("click", exportarCSV);
  document.getElementById("btnImprimir").addEventListener("click", () => window.print());
  document.getElementById("btnReiniciarSistema").addEventListener("click", reiniciarSistema);
  if (btnAdicionarTecnico) {
    btnAdicionarTecnico.addEventListener("click", adicionarTecnico);
  }
  if (btnModoEscala) {
    btnModoEscala.addEventListener("click", alternarModoEscala);
  }
})();
