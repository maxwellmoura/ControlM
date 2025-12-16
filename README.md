# ControlM

Aplicação React + Firebase para gestão de academia: cadastro/login, adesão a planos, edição de dados, solicitações via WhatsApp e painel administrativo para gerenciar usuários e planos.

## Requisitos
- Node.js 18+
- Conta Firebase com Authentication e Firestore

## Configuração
1. Crie um arquivo `.env` na raiz com suas credenciais do Firebase:
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
VITE_FIREBASE_VAPID_KEY=...
```
2. Instale dependências: `npm install`
3. Regras do Firestore/Storage: os arquivos `firestore.rules` e `storage.rules` já estão no repo; faça deploy com `firebase deploy --only firestore:rules,storage:rules`.
4. Admins: defina a custom claim `admin: true` para usuários via `src/config/setAdmin.cjs` usando variáveis de ambiente (`FIREBASE_ADMIN_CREDENTIAL_BASE64` ou `FIREBASE_ADMIN_CREDENTIAL_JSON`).

## Scripts
- `npm run dev` — ambiente de desenvolvimento
- `npm run build` — build de produção
- `npm run preview` — pré-visualização do build

## Uso
- Rotas principais: `/inicio` (login), `/cadastro`, `/` (home/planos), `/editar-cadastro`, `/painel` (admin).
- Painel admin exige claim `admin: true`; sem ela, as regras bloqueiam leitura/escrita.

## Estrutura
- `src/components` — telas e componentes (login, cadastro, painel, planos)
- `src/services` — integrações com Firebase (auth, admin, planos)
- `src/config` — inicialização do Firebase e scripts auxiliares

## Observações
- A única linha de comentário mantida no código é a instrução para trocar o número de WhatsApp do administrador em `src/components/EditarCadastro.jsx`.
