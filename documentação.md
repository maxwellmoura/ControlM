Documentação do Projeto ControlM

O projeto ControlM é uma aplicação web para gerenciamento de academias, desenvolvida com React, Firebase Authentication, Firestore, Bootstrap, e jsPDF com jspdf-autotable. A aplicação permite que usuários se cadastrem, façam login, adiram a planos, editem dados, solicitem extensões de planos via WhatsApp e que administradores gerenciem usuários e planos, gerando relatórios em PDF. Esta documentação detalha cada arquivo, suas funcionalidades e funções, com foco em clareza para manutenção e expansão.
Visão Geral
ControlM é uma aplicação de interface única (SPA) que utiliza React Router para navegação, Firebase para autenticação e armazenamento, e jsPDF para relatórios. É compatível com o plano gratuito do Firebase (Spark), utilizando apenas leituras/escritas no Firestore e autenticação no cliente.
Funcionalidades Principais

Autenticação: Login com e-mail/senha ou Google; cadastro de novos usuários.
Gerenciamento de Usuários: Edição de dados pessoais (nome, e-mail, telefone); administração de usuários (visualizar, editar, excluir).
Gerenciamento de Planos: Adesão a múltiplos planos com datas de adesão e expiração; administração de planos (criar, editar, excluir).
Solicitação de Extensão: Usuários podem solicitar extensão de planos via WhatsApp.
Relatórios: Relatórios em PDF com dados dos usuários; download de listas de adeptos em .txt.
Exibição de Esportes: Lista de esportes com imagens, descrições e horários.
Navegação Protegida: Painel administrativo acessível apenas a administradores.

Estrutura do Projeto
Os arquivos são organizados em componentes (React) e serviços (Firebase). Abaixo está a descrição de cada arquivo, suas funcionalidades e funções.
Arquivo: App.jsx
Descrição: Componente principal que configura as rotas da aplicação usando React Router. Protege o painel administrativo com PrivateRoute.Funcionalidades:

Define rotas para:
/inicio e /admin: Página de login.
/: Página inicial com esportes e planos.
/cadastro: Página de cadastro.
/painel: Painel administrativo (protegido).
/editar-cadastro: Edição de perfil e planos.
\*: Redireciona para login.

Utiliza BrowserRouter e Routes para navegação.Funções:
App(): Retorna o componente com as rotas configuradas.Dependências:
react-router-dom (BrowserRouter, Routes, Route)
Componentes: LoginPage, Cadastro, PainelAdm, LandingPage, EditarCadastro, PrivateRoute

Arquivo: plansAcess.js
Descrição: Serviço para gerenciar planos no Firestore, interagindo com a coleção Planos.Funcionalidades:

Obter, adicionar, atualizar e excluir planos.
Listar usuários que aderiram a um plano.Funções:
obterPlanos(): Retorna lista de planos { id, text, value }.
adicionarPlano(dados): Adiciona um plano com text e value.
atualizarPlano(id, dados): Atualiza um plano existente.
excluirPlano(id): Remove um plano.
setPlansAcess(dados): Define um plano com ID específico (não usado).
obterUsuariosPorPlano(nomePlano): Retorna usuários que aderiram ao plano { id, nome, adesoes, fotoUrl, telefone }.Dependências:
firebase/firestore (collection, addDoc, getDocs, doc, updateDoc, deleteDoc, setDoc)
../config/firebaseConfig (db)

Arquivo: authService.js
Descrição: Serviço para gerenciar autenticação e dados de usuários no Firestore.Funcionalidades:

Adicionar e atualizar dados de usuários na coleção Usuarios.
Verificar status de administrador.Funções:
adicionarUsuario(dadosUsuario): Adiciona usuário com uid, nome, email, etc.
atualizarUsuario(idUsuario, dadosUsuario): Atualiza dados do usuário.
verificarAdmin(): Verifica se o usuário é administrador.Dependências:
firebase/auth (getAuth)
firebase/firestore (collection, addDoc, updateDoc, doc)
../config/firebaseConfig (db)

Arquivo: adminService.js
Descrição: Serviço com funções administrativas para gerenciar usuários e planos.Funcionalidades:

Carregar usuários e planos.
Calcular valor total e data de vencimento dos planos.
Formatar datas e telefones.
Excluir usuários e planos.Funções:
formatarDataLocal(date): Formata data para YYYY-MM-DD.
formatarDataParaExibicao(dataString): Formata data para DD/MM/YYYY.
calcularDiasAteVencimento(dataExpiracao): Calcula dias até a expiração.
carregarUsuarios(): Carrega lista de usuários { id, nome, email, planos, ehAdmin, telefone, criadoEm }.
carregarPlanos(): Carrega planos e adeptos { planos, adeptosPorPlano }.
calcularValorTotalPlanos(planosUsuario, planos): Calcula soma dos valores dos planos.
obterDataVencimentoMaisRecente(planosUsuario): Retorna data de expiração mais recente com classe de cor.
contarAdeptosPlano(planoNome, adeptosPorPlano): Conta adeptos de um plano.
listarAdeptosPlano(planoNome, adeptosPorPlano): Lista adeptos de um plano.
excluirUsuario(id): Exclui um usuário após confirmação.
adicionarPlano(dados): Adiciona um novo plano.
atualizarPlano(id, dados): Atualiza um plano existente.
excluirPlano(id): Exclui um plano após confirmação.
formatarTelefone(telefone): Formata telefone (ex.: (11) 99999-9999).
verificarAdmin(auth, navigate): Verifica se o usuário é administrador.Dependências:
firebase/firestore (collection, getDocs, doc, deleteDoc, updateDoc, addDoc, getDoc)
../config/firebaseConfig (db)
../services/plansAcess (obterUsuariosPorPlano)

Arquivo: PrivateRoute.jsx
Descrição: Componente que protege rotas para administradores.Funcionalidades:

Verifica se o usuário está logado e é administrador.
Redireciona não administradores para / com alerta.
Exibe "Carregando..." durante verificação.Funções:
verificarUsuario() (em useEffect): Monitora autenticação e status de admin.Dependências:
react (useState, useEffect)
react-router-dom (useNavigate)
firebase/auth (getAuth, onAuthStateChanged)
react-bootstrap (Alert)
../authService (verificarAdmin)

Arquivo: plansActions.js
Descrição: Encapsula chamadas para plansAcess.js.Funcionalidades:

Adicionar, definir e atualizar planos.Funções:
addDoc(body): Adiciona plano e retorna ID.
setDoc(body): Define plano (não usado).
updateDoc(id, dados): Atualiza plano.Dependências:
../services/plansAcess (addPlansAcess, setPlansAcess, updatePlansAcess)

Arquivo: setAdmin.cjs
Descrição: Script Node.js para definir usuário como administrador.Funcionalidades:

Configura privilégios de administrador.Funções:
definirAdmin(uid): Define claim admin: true para o usuário.Dependências:
firebase-admin
../src/config/serviceAccountKey.jsonUso:node setAdmin.cjs <UID>

Arquivo: getAdminStatus.js
Descrição: Verifica status de administrador do usuário atual.Funcionalidades:

Retorna se o usuário é administrador.Funções:
getAdminStatus(): Verifica claim admin: true.Dependências:
firebase/auth (getAuth)

Arquivo: firebaseConfig.js
Descrição: Configura Firebase para a aplicação.Funcionalidades:

Inicializa Firebase com credenciais.
Exporta auth e db.Variáveis:
firebaseConfig: Credenciais do Firebase.
app: Instância do Firebase.
auth: Instância de autenticação.
db: Instância do Firestore.Dependências:
firebase/app (initializeApp)
firebase/auth (getAuth)
firebase/firestore (getFirestore)

Arquivo: PlanoSection.jsx
Descrição: Exibe planos disponíveis e permite adesão.Funcionalidades:

Lista planos em cartões (máximo 4 por linha).
Permite adesão a planos para usuários logados.
Exibe mensagens de erro.Funções:
carregarPlanos(): Carrega planos do Firestore.
aderirPlano(plano): Adiciona plano ao usuário.
dividirPlanos(): Divide planos em linhas.Dependências:
react (useState, useEffect)
firebase/auth (getAuth)
firebase/firestore (doc, updateDoc, getDoc)
react-bootstrap (Button, Card)
../services/plansAcess (getPlansAcess)
../config/firebaseConfig (db)

Arquivo: PlanosList.jsx
Descrição: Gerencia planos e exibe usuários aderidos (para administradores).Funcionalidades:

Lista planos com nome, valor, adesões.
Permite adicionar, editar, excluir planos.
Exibe modal com usuários aderidos.
Permite download de lista de usuários (.txt).Funções:
carregarPlanos(): Carrega planos com contagem de adesões.
adicionarPlano(novo): Adiciona plano.
atualizarPlano(dados): Atualiza plano.
excluirPlano(id): Exclui plano.
abrirModalUsuarios(plano): Abre modal com usuários.
fecharModalUsuarios(): Fecha modal.
baixarListaUsuarios(): Gera arquivo .txt com nomes.Dependências:
react (useEffect, useState)
react-router-dom (useNavigate)
firebase/firestore (doc, getDoc)
react-bootstrap (Modal, Button, Table)
../services/plansAcess (getPlansAcess, addPlansAcess, updatePlansAcess, deletePlansAcess, obterUsuariosPorPlano)
../config/firebaseConfig (db)
./PlanoForm

Arquivo: PlanoForm.jsx
Descrição: Formulário para adicionar/editar planos.Funcionalidades:

Campos para nome e valor.
Suporta modo de edição.
Envia dados via callback (onSubmit).Funções:
handleChange(e): Atualiza estado do formulário.
handleSubmit(e): Envia dados e limpa formulário.Dependências:
react (useState, useEffect)
react-bootstrap (Form, Button)

Arquivo: PainelAdm.jsx
Descrição: Painel administrativo para gerenciar usuários e planos.Funcionalidades:

Lista usuários com nome, e-mail, telefone, planos, status de admin, vencimento e valor total.
Permite editar/excluir usuários (exceto administradores).
Exibe modais para detalhes de planos e adeptos.
Gera relatório em PDF.
Gerencia planos (criar, editar, excluir).Funções:
carregarUsuarios(): Carrega usuários.
carregarPlanos(): Carrega planos e adeptos.
calcularValorTotalPlanos(planosUsuario): Calcula valor total.
obterDataVencimentoMaisRecente(planosUsuario): Retorna data de expiração mais recente.
contarAdeptosPlano(planoNome, adeptosPorPlano): Conta adeptos.
listarAdeptosPlano(planoNome, adeptosPorPlano): Lista adeptos.
excluirUsuario(id): Exclui usuário.
abrirEdicaoUsuario(usuario): Abre modal de edição.
abrirEdicaoPlano(plano): Abre formulário de edição.
abrirDetalhesPlanos(usuario): Abre modal de planos.
abrirAdeptosPlano(planoNome): Abre modal de adeptos.
handleSalvarPlano(dados): Adiciona/atualiza plano.
gerarRelatorioPDF(): Gera PDF com dados dos usuários.Dependências:
react (useState, useEffect)
react-router-dom (useNavigate)
firebase/firestore (collection, getDocs, doc, deleteDoc)
react-bootstrap (Modal, Button, Form, Table)
jspdf, jspdf-autotable
../config/firebaseConfig (db)
../services/adminService
./PlanoForm, ./Header, ./Footer, ./UserTable, ./UserEditModal, ./UserPlansModal, ./PlanAdeptosModal

Arquivo: UserEditModal.jsx
Descrição: Modal para edição de dados de usuários no painel administrativo.Funcionalidades:

Edita nome, e-mail, telefone, planos e status de administrador.
Permite adicionar/remover planos.Funções:
adicionarPlanoFormulario(): Adiciona novo plano ao formulário.
atualizarPlanoFormulario(index, campo, valor): Atualiza plano no formulário.
removerPlanoFormulario(index): Remove plano do formulário.
salvarUsuario(): Salva alterações no Firestore.Dependências:
react (useState, useEffect)
react-bootstrap (Modal, Button, Form)
firebase/firestore (doc, updateDoc)
../services/adminService (formatarDataLocal)
../config/firebaseConfig (db)

Arquivo: UserPlansModal.jsx
Descrição: Modal para exibir detalhes dos planos de um usuário.Funcionalidades:

Mostra nome, data de adesão e expiração dos planos.Funções:
Nenhuma função específica: Renderiza tabela com dados.Dependências:
react
react-bootstrap (Modal, Table)

Arquivo: PlanAdeptosModal.jsx
Descrição: Modal para exibir adeptos de um plano.Funcionalidades:

Lista usuários que aderiram ao plano com número de adesões.Funções:
Nenhuma função específica: Renderiza tabela com dados.Dependências:
react
react-bootstrap (Modal, Table)

Arquivo: LoginPage.jsx
Descrição: Página para login com e-mail/senha ou Google.Funcionalidades:

Login com e-mail/senha ou Google (popup).
Cria documento no Firestore para novos usuários.
Redireciona conforme status de administrador.Funções:
verificarLogin() (em useEffect): Verifica autenticação.
emailValido(email): Valida e-mail.
loginComEmail(evento): Faz login com e-mail/senha.
loginComGoogle(): Faz login com Google.
irParaCadastro(): Navega para /cadastro.Dependências:
react (useState, useEffect)
react-router-dom (useNavigate)
firebase/auth (getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider)
firebase/firestore (doc, getDoc, setDoc)
react-bootstrap
../config/firebaseConfig (db)

Arquivo: LandingPage.jsx
Descrição: Página inicial com seções de esportes e planos.Funcionalidades:

Combina Header, EsportesSection, PlanoSection, Footer.Funções:
Nenhuma função específica: Renderiza componentes.Dependências:
./Header, ./EsportesSection, ./PlanoSection, ./Footer

Arquivo: Header.jsx
Descrição: Cabeçalho com navegação dinâmica.Funcionalidades:

Exibe links: "Início", "Editar Cadastro", "Administrativo" (admins), "Sair" ou "Login".
Mostra logotipo.Funções:
verificarUsuario() (em useEffect): Verifica autenticação e status de admin.
sair(): Faz logout e redireciona.Dependências:
react (useState, useEffect)
react-router-dom (Link, useNavigate)
firebase/auth (getAuth, signOut)
react-bootstrap
../services/authService (verificarAdmin)

Arquivo: Footer.jsx
Descrição: Rodapé com informações de copyright.Funcionalidades:

Exibe texto fixo de copyright.Funções:
Nenhuma função específica.Dependências:
Nenhuma.

Arquivo: EsportesSection.jsx
Descrição: Exibe esportes disponíveis com imagens, descrições e horários.Funcionalidades:

Mostra cartões com informações de esportes.
Expande imagens em modal.Funções:
Nenhuma função específica: Usa estado imagemExpandida.Dependências:
react (useState)
react-bootstrap (Modal)
../assets/esportes (imagens)

Arquivo: EditarCadastro.jsx
Descrição: Página para usuários editarem dados e visualizarem planos.Funcionalidades:

Edita nome, e-mail, telefone.
Exibe tabela de planos ativos (nome, data de adesão, expiração).
Permite solicitar extensão de planos via WhatsApp.
Salva alterações no Firestore.Funções:
carregarDadosUsuario(): Carrega dados do usuário, incluindo planos.
salvarAlteracoes(evento): Salva alterações no Firestore.
solicitarExtensaoPlano(plano): Gera link de WhatsApp para extensão.
formatarDataParaExibicao(dataString): Formata data (importada de adminService).Dependências:
react (useState, useEffect)
react-router-dom (useNavigate)
firebase/auth (getAuth)
firebase/firestore (doc, getDoc, updateDoc)
react-bootstrap (Form, Button, Alert, Table)
../services/adminService (formatarDataParaExibicao, formatarTelefone)
../config/firebaseConfig (db)
./Header, ./Footer

Arquivo: Cadastro.jsx
Descrição: Página para cadastro de novos usuários.Funcionalidades:

Cria conta com nome, e-mail, telefone, senha.
Valida campos e verifica e-mail registrado.
Cria usuário no Firebase Authentication e Firestore.Funções:
validarEmail(email): Valida formato do e-mail.
validarTelefone(telefone): Valida formato do telefone.
handleCadastro(e): Gerencia cadastro.Dependências:
react (useState)
react-router-dom (useNavigate)
firebase/auth (getAuth, createUserWithEmailAndPassword, fetchSignInMethodsForEmail, updateProfile)
firebase/firestore (doc, setDoc)
react-bootstrap
../config/firebaseConfig (db)

Notas de Implementação

Compatibilidade com Spark: Usa apenas leituras/escritas no Firestore (50.000 leituras, 20.000 escritas por dia) e autenticação no cliente.
Segurança: Regras do Firestore garantem que usuários editem apenas seus dados e administradores acessem tudo.
Performance: Para >1.000 usuários/planos, considere paginação ou filtros.
Manutenção: Componentes reutilizáveis (PlanoForm, UserEditModal) e serviços modulares (adminService.js, plansAcess.js) facilitam expansões.

Como Usar a Documentação

Adicione ao Projeto: Salve como Documentação.md na raiz ou em /docs.
Consultar Funções: Use as seções para entender funções e dependências.
Expandir Funcionalidades: Baseie-se nas funções para adicionar recursos (ex.: filtros, notificações).

Próximos Passos

Testar Funcionalidades: Execute npm run dev e teste login, cadastro, edição, relatórios, solicitação de extensão.
Corrigir Erros: Se jspdf-autotable falhar, reinstale:npm run clean
npm install jspdf@2.5.1 jspdf-autotable@3.8.2

Adicionar Melhorias:
Filtros no painel (busca por nome).
Notificações de planos próximos do vencimento.
Upload de fotos (requer Firebase Storage, plano pago).

Se precisar de ajuda com testes, correções ou novas funcionalidades, entre em contato!
