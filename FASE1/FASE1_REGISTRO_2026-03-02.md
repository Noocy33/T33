# FASE 1 - Registro de Atualizacoes (02/03/2026)

## Projeto
Sistema T33 - Dimensionamento de Enfermagem (modelo TASY)

## Escopo consolidado no dia
- Interface TASY alinhada para PC e celular.
- Fluxo de login, splash e tela principal revisado.
- Ajustes de permissao para T33 ADM e usuario operacional.
- Gestao de Acesso restrita ao T33 ADM.
- Correcoes em botoes (Editar/Reiniciar/Remover/Confirmar).
- Filtros e tabelas sincronizados com o setor.
- Ajustes de SCP e controle diario.
- Exportacao CSV/PDF mantida.
- Ajustes de cache para reduzir tela antiga.

## Decisoes funcionais aplicadas
- Splash de abertura com 3 segundos.
- Avatar no login/splash/topo com fallback.
- Avatar fixo para os 8 tecnicos na Escala de Tecnico de Enfermagem.
- Opcao de solicitar cadastro ativa no login para uso em diferentes maquinas.
- Link de logout retorna para `login.html?nocache=1`.

## Usuarios de referencia
- T33 (ADMIN)
- TESTET33 (ENFERMEIRA_SETOR)

## Links operacionais
- `https://equipet33.onrender.com/login.html`
- `https://equipet33.onrender.com/T33.html`
- `https://equipet33.onrender.com/equipe-t33`

## Observacao
Este arquivo registra a fase 1 e serve como historico de entrega para supervisao.
