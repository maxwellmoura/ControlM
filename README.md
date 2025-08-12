ControlM - Sistema de Gerenciamento de Academia
ControlM é uma aplicação web para gerenciamento de academias, permitindo que usuários se cadastrem, façam login, adiram a planos esportivos, editem seus dados, solicitem extensões de planos via WhatsApp e que administradores gerenciem usuários e planos, além de gerar relatórios em PDF. Construída com React, Firebase (Authentication e Firestore), Bootstrap e jsPDF com jspdf-autotable, a aplicação é compatível com o plano gratuito do Firebase (Spark).
Índice

Visão Geral
Funcionalidades
Pré-requisitos
Instalação
Uso
Estrutura de Arquivos
Contribuição
Licença

Visão Geral
ControlM é uma aplicação de interface única (SPA) que facilita o gerenciamento de academias. Usuários podem se cadastrar, escolher múltiplos planos (ex.: Jiu-Jitsu, Kickboxer), editar seus dados e solicitar extensões de planos via WhatsApp, enquanto administradores têm acesso a um painel para gerenciar usuários e planos, além de gerar relatórios detalhados. A aplicação é otimizada para o plano gratuito do Firebase, garantindo baixo custo e escalabilidade.
Funcionalidades

Autenticação:
Login com e-mail/senha ou Google.
Cadastro de novos usuários com validação de campos.


Gerenciamento de Usuários:
Usuários podem editar nome, e-mail, telefone e visualizar planos ativos.
Administradores podem visualizar, editar e excluir usuários.


Gerenciamento de Planos:
Usuários podem aderir a múltiplos planos com datas de adesão e expiração.
Usuários podem solicitar extensão de planos via WhatsApp.
Administradores podem criar, editar e excluir planos.
Visualização de usuários por plano com contagem de adesões.


Relatórios:
Geração de relatórios em PDF com dados dos usuários (nome, e-mail, telefone, planos, status de admin, vencimento e valor total).
Download de listas de usuários por plano em formato .txt.


Esportes:
Exibição de esportes disponíveis (ex.: Jiu-Jitsu Kids, Capoeira) com imagens, descrições e horários.


Navegação Segura:
Painel administrativo protegido para administradores (via PrivateRoute).



Pré-requisitos

Node.js (v16 ou superior)
npm (v8 ou superior)
Conta Firebase (plano Spark gratuito)
Chave de serviço Firebase (para configurar administradores, armazenada em src/config/serviceAccountKey.json)

Instalação

Clone o Repositório:git clone https://github.com/seu-usuario/controlm.git
cd controlm


Instale as Dependências:npm install


Configure o Firebase:
Crie um projeto no Firebase Console.
Ative Authentication (métodos: e-mail/senha e Google).
Ative Firestore Database e configure as regras (exemplo abaixo).
Copie as credenciais do Firebase para src/config/firebaseConfig.js:const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_PROJETO.firebaseapp.com",
  projectId: "SEU_PROJETO",
  storageBucket: "SEU_PROJETO.firebasestorage.app",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SEU_APP_ID",
  measurementId: "SEU_MEASUREMENT_ID"
};


Para administradores, gere uma chave de serviço no Firebase Console e salve em src/config/serviceAccountKey.json.


Configure as Regras do Firestore:rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /Usuarios/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read, write: if request.auth != null && get(/databases/$(database)/documents/Usuarios/$(request.auth.uid)).data.admin == true;
    }
    match /Planos/{planoId} {
      allow read: if true;
      allow write: if request.auth != null && get(/databases/$(database)/documents/Usuarios/$(request.auth.uid)).data.admin == true;
    }
  }
}


Inicie a Aplicação:npm run dev

Acesse em http://localhost:5173.

Uso

Acessar a Aplicação:
Abra o navegador em http://localhost:5173/inicio para a página de login.
Faça login com e-mail/senha ou Google.


Como Usuário:
Navegue até a página inicial (/) para ver esportes e aderir a planos.
Acesse /editar-cadastro para atualizar dados pessoais, visualizar planos ativos e solicitar extensões via WhatsApp.


Como Administrador:
Execute node setAdmin.cjs <SEU_UID> para definir um usuário como administrador.
Acesse /painel para gerenciar usuários e planos.
Gere relatórios em PDF ou listas de usuários por plano em .txt.


Resolução de Problemas:
Se encontrar erros com jspdf-autotable, limpe o cache e reinstale:npm run clean
npm install jspdf@2.5.1 jspdf-autotable@3.8.2





Estrutura de Arquivos
controlm/
├── src/
│   ├── assets/                # Imagens dos esportes
│   ├── components/            # Componentes React
│   │   ├── Cadastro.jsx       # Página de cadastro
│   │   ├── EditarCadastro.jsx # Edição de perfil e solicitação de extensão de planos
│   │   ├── EsportesSection.jsx # Exibição de esportes
│   │   ├── Footer.jsx         # Rodapé
│   │   ├── Header.jsx         # Cabeçalho com navegação
│   │   ├── LandingPage.jsx    # Página inicial
│   │   ├── LoginPage.jsx      # Página de login
│   │   ├── PainelAdm.jsx      # Painel administrativo
│   │   ├── PlanoForm.jsx      # Formulário para adicionar/editar planos
│   │   ├── PlanoSection.jsx   # Exibição e adesão a planos
│   │   ├── PlanosList.jsx     # Lista de planos com contagem de adesões
│   │   ├── UserEditModal.jsx  # Modal para edição de usuários
│   │   ├── UserPlansModal.jsx # Modal para detalhes de planos de um usuário
│   │   └── PlanAdeptosModal.jsx # Modal para adeptos de um plano
│   ├── config/                # Configurações do Firebase
│   │   ├── firebaseConfig.js  # Credenciais do Firebase
│   │   └── serviceAccountKey.json # Chave para admin (não versionada)
│   ├── services/              # Serviços de backend
│   │   ├── authService.js     # Gerenciamento de autenticação
│   │   ├── adminService.js    # Funções administrativas
│   │   ├── plansAcess.js     # Gerenciamento de planos
│   │   └── dataAcess/         # Rotas protegidas
│   │       └── PrivateRoute.jsx
│   ├── App.jsx                # Configuração de rotas
│   ├── App.css                # Estilos gerais
│   ├── getAdminStatus.js      # Verifica status de administrador
│   ├── plansActions.js        # Ações para planos
│   └── setAdmin.cjs           # Script para configurar administradores
├── package.json               # Dependências e scripts
├── README.md                  # Este arquivo
├── Fluxo.mk                   # Fluxo da aplicação
├── Documentação.md            # Documentação detalhada
└── Explicação.mk              # Explicação linha por linha

Contribuição

Faça um fork do repositório.
Crie uma branch para sua feature:git checkout -b minha-feature


Commit suas alterações:git commit -m "Adiciona minha feature"


Envie para o repositório remoto:git push origin minha-feature


Abra um Pull Request.

Por favor, siga as convenções de código (ESLint configurado) e teste localmente antes de enviar.
Licença
© 2025 ControlM - Todos os direitos reservados.
Desenvolvido com 💪 para gerenciar academias de forma simples e eficiente!