📌 Tela Inicial (LandingPage)
├── Hero Section (nome, logo, chamada)
├── PlanoSection.jsx
│   ├── Lista de planos (com botão "Quero este plano")
│   └── Modal com detalhes e botão aderir
├── EsportesSection.jsx
│   ├── Galeria de imagens dos esportes
│   └── Modal para imagem expandida
└── Rodapé (contato, redes sociais)

🔐 Autenticação
├── LoginPage
│   ├── E-mail e senha
│   └── Google Sign-in
├── CadastroPage
│   ├── Nome, e-mail, telefone, senha
│   └── Validação
└── Recuperação de Senha

🏁 Após login
├── 🚫 Se comum → redireciona para LandingPage
└── ✅ Se admin → redireciona para PainelAdm

📊 PainelAdm (Dashboard Geral)
├── Card: total de alunos
├── Card: planos ativos
├── Card: faturamento mensal
└── Acesso para:
    ├── ➤ Planos
    ├── ➤ Usuários
    ├── ➤ Pagamentos
    ├── ➤ Frequência
    └── ➤ Avisos

🧾 Planos (PlanosPage)
├── Listagem de planos
│   ├── Editar
│   └── Deletar
└── Criar novo plano

🧑‍💼 Usuários (UsuariosPage)
├── Tabela com:
│   ├── Nome, e-mail, telefone
│   ├── Plano ativo
│   ├── Data de entrada
│   └── Botões: editar, deletar
└── Filtros por plano e nome

💳 Pagamentos (PagamentosPage)
├── Registro manual de pagamento
├── Histórico por usuário
└── Status: pago/pendente

📅 Frequência (FrequenciaPage)
├── Registrar presença
├── Ver histórico por aluno
└── Filtro por período

📢 Avisos (AvisosPage)
├── Criar aviso
├── Editar aviso
└── Lista de avisos visíveis aos alunos


DEPENDENCIAS PRINCIPAIS

npm install react@19.1.0
npm install react-dom@19.1.0
npm install react-router-dom@7.6.3
npm install react-bootstrap@2.10.10
npm install bootstrap@5.3.7
npm install firebase@11.10.0
npm install firebase-admin@13.4.0

Dependências de desenvolvimento

npm install --save-dev @eslint/js@9.30.1
npm install --save-dev eslint@9.30.1
npm install --save-dev eslint-plugin-react-hooks@5.2.0
npm install --save-dev eslint-plugin-react-refresh@0.4.20

npm install --save-dev @types/react@19.1.8
npm install --save-dev @types/react-dom@19.1.6

npm install --save-dev @vitejs/plugin-react@4.6.0
npm install --save-dev vite@7.0.3

npm install --save-dev @rollup/plugin-alias@5.1.1
npm install --save-dev globals@16.3.0

npm install --save-dev react-scripts@0.0.0