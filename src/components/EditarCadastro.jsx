import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { formatarDataParaExibicao } from '../services/adminService';
import Header from './Header';
import Footer from './Footer';
import { Form, Button, Table } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function EditarCadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [planos, setPlanos] = useState([]);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const navigate = useNavigate();
  const auth = getAuth();

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
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('Erro ao salvar alterações:', error);
      setErro('Erro ao salvar alterações.');
    }
  }

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