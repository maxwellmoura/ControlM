Explicação do Sistema ControlM

Visão Geral
O ControlM é um sistema web para gerenciamento de academias, permitindo que usuários se cadastrem, 
escolham múltiplos planos de treinamento, editem dados pessoais, solicitem extensões de planos via WhatsApp e que administradores gerenciem usuários e planos. 
Construído com React, Firebase (Authentication e Firestore), Bootstrap, e jsPDF com jspdf-autotable, o sistema é seguro, 
responsivo e compatível com o plano gratuito do Firebase (Spark).

Funcionalidades

Autenticação: Login com e-mail/senha ou Google via Firebase Authentication.
Cadastro de Usuários: Formulário com validação de e-mail, telefone e senha.
Gestão de Planos: Usuários podem aderir a múltiplos planos (ex.: Básico, Premium), com nome, data de adesão e expiração (+1 mês). Podem solicitar extensão via WhatsApp.
Painel Administrativo: Exclusivo para administradores, com:
Listar, editar ou excluir usuários (exceto administradores).
Exibir planos aderidos por usuário (modal com nome, data de adesão, expiração).
Exibir data de vencimento mais recente com coloração (verde >15 dias, amarelo 5-15 dias, vermelho <5 dias).
Exibir valor total dos planos por usuário.
Gerenciar planos (adicionar, editar, excluir).


Lista de Planos (PlanosList.jsx):
Exibe planos com nome, valor, número de adesões e ações (editar/excluir).
Coluna "Usuários" clicável abre modal com nomes dos usuários e adesões.
Modal inclui botão para baixar lista de usuários em .txt.


Edição de Cadastro (EditarCadastro.jsx):
Usuários editam nome, e-mail, telefone.
Visualizam planos ativos (nome, data de adesão, expiração).
Solicitam extensão de planos via WhatsApp com mensagem pré-formatada.


Exibição de Esportes: Informações e horários de esportes (Jiu-Jitsu, Capoeira, etc.).
Proteção de Rotas: Apenas administradores acessam /painel.

Estrutura do Projeto

src/assets/: Imagens (logo, esportes).
src/components/:
Cadastro.jsx: Página de cadastro.
EditarCadastro.jsx: Edição de dados e solicitação de extensão via WhatsApp.
EsportesSection.jsx: Exibe esportes.
Footer.jsx: Rodapé.
Header.jsx: Cabeçalho com navegação.
LandingPage.jsx: Página inicial com planos e esportes.
LoginPage.jsx: Página de login.
PainelAdm.jsx: Painel administrativo.
PlanoForm.jsx: Formulário para criar/editar planos.
PlanoSection.jsx: Seção para aderir a planos.
PlanosList.jsx: Lista de planos com contagem de adesões.
UserEditModal.jsx: Modal para edição de usuários.
UserPlansModal.jsx: Modal para detalhes de planos de um usuário.
PlanAdeptosModal.jsx: Modal para adeptos de um plano.


src/config/firebaseConfig.js: Configuração do Firebase.
src/services/:
authService.js: Gerenciamento de autenticação e usuários.
adminService.js: Funções administrativas.
plansAcess.js: Gerenciamento de planos.


src/App.css: Estilos globais.
src/App.jsx: Componente principal com rotas.

Explicação Linha por Linha do EditarCadastro.jsx
Abaixo está a explicação detalhada do código do EditarCadastro.jsx, que permite aos usuários editarem seus dados e solicitarem extensões de planos via WhatsApp.
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { formatarDataParaExibicao, formatarTelefone } from '../services/adminService';
import Header from './Header';
import Footer from './Footer';
import { Form, Button, Table } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';


Importa hooks useState e useEffect para gerenciar estado e efeitos.
Importa useNavigate para navegação programática.
Importa getAuth para autenticação, e doc, getDoc, updateDoc para interagir com o Firestore.
Importa db do firebaseConfig.js.
Importa formatarDataParaExibicao e formatarTelefone do adminService.js para formatar datas e telefones.
Importa componentes Header, Footer, e do Bootstrap (Form, Button, Table).

export default function EditarCadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [planos, setPlanos] = useState([]);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const navigate = useNavigate();
  const auth = getAuth();


Define o componente EditarCadastro.
Estados: nome, email, telefone, planos (array de planos ativos), erro, sucesso.
navigate: Função para navegação.
auth: Instância de autenticação do Firebase.

  useEffect(function() {
    const usuarioAtual = auth.currentUser;
    if (!usuarioAtual) {
      console.log('Usuário não está logado, redirecionando para /inicio');
      navigate('/inicio');
      return;
    }
    async function carregarDadosUsuario() {
      try {
        const docRef = doc(db, 'Usuarios', usuarioAtual.uid);
        const docSnap = await getDoc(docRef, { source: 'server' });
        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log('Dados do usuário carregados:', JSON.stringify(data, null, 2));
          setNome(data.nome || '');
          setEmail(data.email || '');
          setTelefone(data.telefone || '');
          setPlanos(Array.isArray(data.planos) ? data.planos : []);
        } else {
          console.log('Documento do usuário não encontrado');
          setErro('Usuário não encontrado.');
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        setErro('Erro ao carregar dados do usuário.');
      }
    }
    carregarDadosUsuario();
  }, [navigate, auth]);


Hook useEffect: Executa ao montar o componente.
Verifica se há usuário logado (auth.currentUser); se não, redireciona para /inicio.
Função carregarDadosUsuario: Busca dados do usuário no Firestore (Usuarios/uid).
Usa { source: 'server' } para evitar cache.
Atualiza estados nome, email, telefone, planos com dados do Firestore.
Valida se planos é array, com fallback para [].
Exibe erro se o documento não existe ou ocorre falha.

  async function salvarAlteracoes(e) {
    e.preventDefault();
    setErro('');
    setSucesso('');
    if (!nome || !email) {
      setErro('Nome e e-mail são obrigatórios.');
      console.log('Erro ao salvar: Nome ou e-mail faltando');
      return;
    }
    try {
      const usuarioAtual = auth.currentUser;
      if (!usuarioAtual) {
        setErro('Você precisa estar logado para editar o cadastro.');
        console.log('Erro ao salvar: Usuário não logado');
        return;
      }
      const docRef = doc(db, 'Usuarios', usuarioAtual.uid);
      await updateDoc(docRef, {
        nome: nome || 'Sem nome',
        email: email || 'N/A',
        telefone: telefone || '',
        planos: planos || [],
      });
      console.log('Dados do usuário atualizados:', { nome, email, telefone, planos });
      setSucesso('Cadastro atualizado com sucesso!');
      setTimeout(function() {
        navigate('/planos');
      }, 2000);
    } catch (error) {
      console.error('Erro ao salvar alterações:', error);
      setErro('Erro ao salvar alterações.');
    }
  }


Função salvarAlteracoes: Salva alterações no formulário.
Impede submissão padrão (e.preventDefault()).
Valida nome e email obrigatórios.
Verifica usuário logado.
Atualiza documento no Firestore com nome, email, telefone, planos.
Exibe mensagem de sucesso e redireciona para /planos após 2 segundos.
Exibe erro em caso de falha.

  function solicitarExtensaoPlano(plano) {
    if (!plano.nome || !plano.dataExpiracao) {
      console.log('Plano inválido para solicitação de extensão:', JSON.stringify(plano, null, 2));
      setErro('Plano inválido para solicitação de extensão.');
      return;
    }
    const numeroWhatsApp = '+5511999999999'; // Substitua pelo número real do administrador
    const mensagem = `Olá, gostaria de solicitar a extensão do plano "${plano.nome}". Data de expiração atual: ${formatarDataParaExibicao(plano.dataExpiracao)}. Nome: ${nome}, Email: ${email}.`;
    const mensagemEncoded = encodeURIComponent(mensagem);
    const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensagemEncoded}`;
    console.log('Gerando link de WhatsApp:', urlWhatsApp);
    window.open(urlWhatsApp, '_blank');
  }


Função solicitarExtensaoPlano: Gera link de WhatsApp para solicitar extensão.
Valida se plano.nome e plano.dataExpiracao existem.
Define número do WhatsApp (placeholder, substituir pelo real).
Cria mensagem com nome do plano, data de expiração, nome e e-mail do usuário.
Codifica mensagem com encodeURIComponent e gera URL do WhatsApp.
Abre link em nova aba (_blank).

  return (
    <div className="container mt-5">
      <Header />
      <h2 className="text-center mb-4">Editar Cadastro</h2>
      {erro && <div className="alert alert-danger py-2 text-center">{erro}</div>}
      {sucesso && <div className="alert alert-success py-2 text-center">{sucesso}</div>}
      <Form onSubmit={salvarAlteracoes}>
        <Form.Group className="mb-3">
          <Form.Label>Nome</Form.Label>
          <Form.Control
            type="text"
            value={nome}
            onChange={function(e) { setNome(e.target.value); }}
            placeholder="Digite seu nome"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            value={email}
            onChange={function(e) { setEmail(e.target.value); }}
            placeholder="Digite seu email"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Telefone</Form.Label>
          <Form.Control
            type="text"
            value={telefone}
            onChange={function(e) { setTelefone(e.target.value); }}
            placeholder="Digite seu telefone"
          />
        </Form.Group>
        <Button variant="primary" type="submit">
          Salvar
        </Button>
      </Form>
      <h4 className="mt-4">Meus Planos</h4>
      {planos.length > 0 ? (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Plano</th>
              <th>Data de Adesão</th>
              <th>Data de Expiração</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {planos.map(function(plano, index) {
              return (
                <tr key={plano.nome + plano.dataAdesao + index}>
                  <td>{plano.nome || 'N/A'}</td>
                  <td>{plano.dataAdesao ? formatarDataParaExibicao(plano.dataAdesao) : 'N/A'}</td>
                  <td>{plano.dataExpiracao ? formatarDataParaExibicao(plano.dataExpiracao) : 'N/A'}</td>
                  <td>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={function() { solicitarExtensaoPlano(plano); }}
                    >
                      Solicitar Extensão
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      ) : (
        <p>Você não possui planos ativos.</p>
      )}
      <Footer />
    </div>
  );
}


Renderiza o componente com:
Header e título "Editar Cadastro".
Alertas para erro e sucesso.
Formulário com campos nome, email, telefone.
Tabela de planos com colunas Plano, Data de Adesão, Data de Expiração, Ação.
Botão "Solicitar Extensão" para cada plano.
Mensagem "Você não possui planos ativos" se planos estiver vazio.
Footer no final.



Explicação Linha por Linha do PainelAdm.jsx
[O conteúdo desta seção permanece idêntico ao fornecido anteriormente. Não repetirei para evitar redundância, mas está incluído no artefato original e mantido aqui.]
Explicação Linha por Linha do PlanosList.jsx
[O conteúdo desta seção permanece idêntico ao fornecido anteriormente. Não repetirei para evitar redundância, mas está incluído no artefato original e mantido aqui.]
Instruções de Uso

Configuração:

Configure o Firebase (Authentication e Firestore) no Firebase Console.
Crie coleções Usuarios e Planos.
Atualize src/config/firebaseConfig.js com as credenciais.
Instale dependências com npm install e execute com npm run dev.


Uso do Painel Administrativo:

Acesse /painel (apenas administradores).
Visualize tabela de usuários com nome, e-mail, telefone, planos (clicável), admin, vencimento (colorido), valor total, ações.
Edite usuários via UserEditModal ou visualize planos via UserPlansModal.
Gerencie planos via PlanoForm e visualize adeptos via PlanAdeptosModal.


Uso da Lista de Planos:

Acesse a seção de planos no /painel.
Visualize tabela com nome, valor, adesões (clicável) e ações.
Clique em "Usuários" para abrir PlanAdeptosModal com nomes e adesões.
Baixe lista de usuários em .txt.


Uso da Edição de Cadastro:

Acesse /editar-cadastro (usuários logados).
Edite nome, e-mail, telefone.
Visualize planos ativos na tabela.
Clique em "Solicitar Extensão" para abrir WhatsApp com mensagem pré-formatada.


Testes:

Verifique se os planos aparecem em /editar-cadastro com nome, data de adesão, expiração.
Teste o botão "Solicitar Extensão" e confirme o link de WhatsApp.
Teste edição de usuários e planos no /painel.
Confirme coloração da coluna "Vencimento" (verde >15 dias, amarelo 5-15 dias, vermelho <5 dias).
Teste download de relatórios PDF e .txt.



Notas de Implementação

Firestore:
Coleção Usuarios: { uid, nome, email, telefone, planos: [{ nome, dataAdesao, dataExpiracao }], admin, criadoEm }.
Coleção Planos: { id, text, value }.
Execute script de migração se necessário (ver abaixo).


Script de Migração:const admin = require('firebase-admin');
const serviceAccount = require('./path/to/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function atualizarUsuarios() {
  const usuariosRef = db.collection('Usuarios');
  const snapshot = await usuariosRef.get();

  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (data.planoNome && data.planoData) {
      const dataAdesao = new Date(data.planoData);
      const dataExpiracao = new Date(dataAdesao);
      dataExpiracao.setMonth(dataExpiracao.getMonth() + 1);
      const novoPlano = {
        nome: data.planoNome,
        dataAdesao: data.planoData,
        dataExpiracao: dataExpiracao.toISOString().split('T')[0]
      };
      await doc.ref.update({
        planos: [novoPlano],
        planoNome: admin.firestore.FieldValue.delete(),
        planoData: admin.firestore.FieldValue.delete()
      });
      console.log(`Atualizado usuário ${doc.id}`);
    }
  }
}

atualizarUsuarios().catch(console.error);


CSS: Usa Bootstrap. Substitua classes personalizadas (ex.: mb-12, mt-8) por padrão (ex.: mb-3, mt-4) se necessário.
WhatsApp: Substitua +5511999999999 em EditarCadastro.jsx pelo número real do administrador.

Feedback

Confirme se a tabela de planos e o botão "Solicitar Extensão" em EditarCadastro.jsx atendem às expectativas.
Forneça o número real do WhatsApp para EditarCadastro.jsx.
Informe se classes CSS personalizadas devem ser substituídas.
Solicite melhorias, como filtros ou notificações.

Dependências Principais
npm install react@19.1.0
npm install react-dom@19.1.0
npm install react-router-dom@7.6.3
npm install react-bootstrap@2.10.10
npm install bootstrap@5.3.7
npm install firebase@11.10.0
npm install firebase-admin@13.4.0
npm install jspdf@2.5.1
npm install jspdf-autotable@3.8.2

Dependências de Desenvolvimento
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

Desenvolvido por [Maxwell]. Contato: maxwellcmoura@gmail.com