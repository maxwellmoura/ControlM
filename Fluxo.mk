📌 Tela Inicial (LandingPage)
├── Hero Section (nome, logo, chamada)
├── PlanoSection.jsx│   
├── Lista de planos (com botão "Quero este plano")
│   └── Modal com detalhes e botão aderir
├── EsportesSection.jsx│   
├── Galeria de imagens dos esportes
│   └── Modal para imagem expandida
└── Rodapé (contato, redes sociais) 

🔐 Autenticação
├── LoginPage│   
├── E-mail e senha│   
    └── Google Sign-in
├── CadastroPage│   
├── Nome, e-mail, telefone, senha│   
    └── Validação
    └── Recuperação de Senha  

🏁 Após login
├── 🚫 Se comum → redireciona para LandingPage
    └── ✅ Se admin → redireciona para PainelAdm  

📊 PainelAdm (Dashboard Geral)
├── Card: total de alunos
├── Card: planos ativos
├── Card: faturamento mensal
    └── Acesso para:    
    ├── ➤ Planos (PlanoForm, PlanosList)    
    ├── ➤ Relatório dos Alunos (PDF)   
    ├── ➤ Usuários (UserTable, UserEditModal)   
    ├── ➤ Pagamentos    
    ├── ➤ Frequência    
        └── ➤ Avisos

🧾 Planos (PlanosList)
├── Listagem de planos│   
├── Editar (PlanoForm)│   
├── Deletar│   
    └── Visualizar adeptos (PlanAdeptosModal)
    └── Criar novo plano (PlanoForm)

🧑‍💼 Usuários (UserTable)
├── Tabela com:│   
├── Nome, e-mail, telefone│   
├── Plano ativo (clicável para UserPlansModal)│   
├── Data de entrada│   
├── Data de vencimento (colorida: verde >15 dias, amarelo 5-15 dias, vermelho <5 dias)│   
├── Valor total dos planos│   
    └── Botões: editar (UserEditModal), deletar
    └── Filtros por plano e nome  

💳 Pagamentos (PagamentosPage
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

📝 Editar Cadastro (EditarCadastro)
├── Formulário: nome, e-mail, telefone
├── Tabela de planos ativos:│   
├── Nome do plano│   
├── Data de adesão│   
├── Data de expiração│   
    └── Botão: Solicitar Extensão (abre WhatsApp com mensagem pré-formatada)
    └── Salvar alterações