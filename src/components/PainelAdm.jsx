import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import {
  getPlansAccess,
  addPlansAccess,
  updatePlansAccess,
  deletePlansAccess,
} from '../services/plansAcess';
import { updateUserAccess } from '../../src/services/authService';
import PlanoForm from './PlanoForm';
import { db } from '../config/firebaseConfig';
import { Modal, Button, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './Header';
import Footer from './Footer'

export default function PainelAdm() {
  const [usuarios, setUsuarios] = useState([]);
  const [planos, setPlanos] = useState([]);
  const [editandoPlano, setEditandoPlano] = useState(null);
  const [editandoUsuario, setEditandoUsuario] = useState(null);
  const [formUsuario, setFormUsuario] = useState({
    nome: '',
    email: '',
    planoNome: '',
    planoData: '',
    admin: false,
  });
  const navigate = useNavigate();

  const carregarUsuarios = async () => {
    const snapshot = await getDocs(collection(db, 'Usuarios'));
    const lista = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    setUsuarios(lista);
  };

  const carregarPlanos = async () => {
    try {
      const dados = await getPlansAccess();
      setPlanos(dados);
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
    }
  };

  useEffect(() => {
    carregarUsuarios();
    carregarPlanos();
  }, []);

  const excluirUsuario = async (id) => {
    if (window.confirm('Deseja realmente excluir este usuário?')) {
      await deleteDoc(doc(db, 'Usuarios', id));
      carregarUsuarios();
    }
  };

  const abrirEdicaoUsuario = (usuario) => {
    setEditandoUsuario(usuario);
    setFormUsuario({
      nome: usuario.nome || '',
      email: usuario.email || '',
      planoNome: usuario.planoNome || '',
      planoData: usuario.planoData || '',
      admin: usuario.admin || false,
    });
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormUsuario(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const salvarEdicaoUsuario = async () => {
    try {
      await updateUserAccess(editandoUsuario.id, formUsuario);
      setEditandoUsuario(null);
      carregarUsuarios();
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      alert('Erro ao salvar as alterações.');
    }
  };

  const calcularDataFinal = (planoData) => {
    if (!planoData) return 'N/A';
    const data = new Date(planoData);
    data.setDate(data.getDate() + 30);
    return new Date().toLocaleDateString('pt-BR');
  };

  const getPrimeiroNome = (nomeCompleto) => {
    return nomeCompleto ? nomeCompleto.split(' ')[0] : 'Sem nome';
  };

  const adicionarPlano = async (novo) => {
    await addPlansAccess(novo);
    carregarPlanos();
  };

  const atualizarPlano = async (dados) => {
    await updatePlansAccess(editandoPlano.id, dados);
    setEditandoPlano(null);
    carregarPlanos();
  };

  const excluirPlano = async (id) => {
    if (window.confirm('Deseja realmente excluir este plano?')) {
      await deletePlansAccess(id);
      carregarPlanos();
    }
  };

  const voltar = () => navigate('/');

  return (
    
    <div className="container mt-5">
      <Header />
      <h2 className="text-center mb-4">Painel Administrativo - ControlM</h2>

      
      <h4 className="mt-4">Usuários Cadastrados</h4>
      <table className="table table-striped mt-3">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Plano Aderido</th>
            <th>Data de Adesão</th>
            <th>Data Final</th>
            <th>Admin</th>
            <th>Criado Em</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => (
            <tr key={usuario.id}>
              <td title={usuario.nome || 'Sem nome'}>
                {getPrimeiroNome(usuario.nome)}
              </td>
              <td>{usuario.email || 'N/A'}</td>
              <td>{usuario.planoNome || 'Nenhum'}</td>
              <td>{usuario.planoData || 'N/A'}</td>
              <td>{calcularDataFinal(usuario.planoData)}</td>
              <td>{usuario.admin ? 'Sim' : 'Não'}</td>
              <td>
                {usuario.criadoEm
                  ? new Date(usuario.criadoEm).toLocaleDateString('pt-BR')
                  : 'N/A'}
              </td>
              <td>
                <button
                  className="btn btn-sm btn-warning me-2"
                  onClick={() => abrirEdicaoUsuario(usuario)}
                >
                  Editar
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => excluirUsuario(usuario.id)}
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal para edição de usuário */}
      <Modal show={!!editandoUsuario} onHide={() => setEditandoUsuario(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Usuário</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nome Completo</Form.Label>
              <Form.Control
                type="text"
                name="nome"
                value={formUsuario.nome}
                onChange={handleFormChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formUsuario.email}
                onChange={handleFormChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Plano</Form.Label>
              <Form.Select
                name="planoNome"
                value={formUsuario.planoNome}
                onChange={handleFormChange}
              >
                <option value="">Nenhum</option>
                {planos.map((plano) => (
                  <option key={plano.id} value={plano.text}>
                    {plano.text}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Data de Adesão</Form.Label>
              <Form.Control
                type="date"
                name="planoData"
                value={formUsuario.planoData}
                onChange={handleFormChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Administrador"
                name="admin"
                checked={formUsuario.admin}
                onChange={handleFormChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setEditandoUsuario(null)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={salvarEdicaoUsuario}>
            Salvar
          </Button>
        </Modal.Footer>
      </Modal>

      <hr />

      {/* === PLANOS === */}
      <h4 className="mt-4">Gerenciar Planos</h4>
      <PlanoForm
        onSubmit={editandoPlano ? atualizarPlano : adicionarPlano}
        planoEditar={editandoPlano}
        cancelar={() => setEditandoPlano(null)}
      />

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Valor</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {planos.map((plano) => (
            <tr key={plano.id}>
              <td>{plano.text}</td>
              <td>R$ {plano.value}</td>
              <td>
                <button
                  className="btn btn-sm btn-warning me-2"
                  onClick={() => setEditandoPlano(plano)}
                >
                  Editar
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => excluirPlano(plano.id)}
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
          {planos.length === 0 && (
            <tr>
              <td colSpan="3" className="text-center text-muted">
                Nenhum plano cadastrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <button onClick={voltar} className="btn btn-secondary mt-4" type="button">
        Voltar
      </button>
      <Footer />
    </div>
  );
}