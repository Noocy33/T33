# Publicar T33 para acesso no celular (5G)

## Objetivo
Deixar o sistema acessível por URL pública (`https://...`) para funcionar fora do Wi-Fi local.

## 1) Subir código no GitHub
No CMD, dentro do projeto:

```cmd
cd /d C:\Users\sarar\.vscode\T33
git init
git add .
git commit -m "T33 pronto para deploy"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/t33.git
git push -u origin main
```

## 2) Publicar no Render
1. Acesse `https://render.com` e faça login.
2. Clique em **New +** -> **Blueprint**.
3. Conecte seu repositório GitHub `t33`.
4. O Render vai ler o arquivo `render.yaml`.
5. Clique em **Apply** para publicar.

## 3) Testar URL pública
Depois do deploy, o Render gera algo como:

`https://t33-dimensionamento.onrender.com/login.html`

Abra esse link no celular em 5G.

## 4) Login ADM
- Usuário: `T33`
- Senha: `123456`

## 5) Importante (dados)
Atualmente o sistema salva usuários/foto/pendências em arquivos (`server/data`).
Em serviços free, isso pode ser reiniciado em alguns cenários.
Para produção estável, o próximo passo é migrar para banco (PostgreSQL).

## 6) FASE 1 (entregue em 02/03/2026)
- Splash ajustada para 3 segundos.
- Avatar revisado em login/splash/topo.
- Avatar fixo nos 8 tecnicos da Escala de Tecnico de Enfermagem.
- Gestao de Acesso consolidada para administracao do T33.
- Solicitacao de cadastro ativa no login para PC e celular.
- Backup salvo na pasta do projeto:
  - `BACKUP_FASE1_2026-03-02`
  - `BACKUP_FASE1_2026-03-02.zip`
