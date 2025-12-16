import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getPlansAcess,
  addPlansAcess,
  updatePlansAcess,
  deletePlansAcess,
  obterUsuariosPorPlano
} from '../services/plansAcess';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { Modal, Button, Table } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import PlanoForm from './PlanoForm';

export default function PlanosList() {
  const [planos, setPlanos] = useState([]);
  const [editando, setEditando] = useState(null);
  const [planoSelecionado, setPlanoSelecionado] = useState(null);
  const [usuariosPlano, setUsuariosPlano] = useState([]);
  const navigate = useNavigate();

  const voltar = () => {
    navigate('/');
  };

  const carregarPlanos = async () => {
    try {
      const planosSnap = await getDocs(collection(db, 'Planos'));
      const planosBase = planosSnap.docs.map((d) => ({
        id: d.id,
        text: d.data().text || 'Plano sem nome',
        value: Number(d.data().value) || 0,
      }));

      const usuariosSnap = await getDocs(collection(db, 'Usuarios'));
      const countPorPlano = new Map();

      usuariosSnap.forEach((docu) => {
        const arr = Array.isArray(docu.data().planos) ? docu.data().planos : [];
        arr.forEach((p) => {
          if (!p?.nome) return;
          countPorPlano.set(p.nome, (countPorPlano.get(p.nome) || 0) + 1);
        });
      });

      const planosComContagem = planosBase.map((p) => ({
        ...p,
        totalAdesoes: countPorPlano.get(p.text) || 0,
      }));

      setPlanos(planosComContagem);
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
    }
  };

  useEffect(() => {
    carregarPlanos();
  }, []);

  const adicionarPlano = async (novo) => {
    await addPlansAcess(novo);
    await carregarPlanos();
  };

  const atualizarPlano = async (dados) => {
    await updatePlansAcess(editando.id, dados);
    setEditando(null);
    await carregarPlanos();
  };

  const excluirPlano = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este plano?')) {
      await deletePlansAcess(id);
      await carregarPlanos();
    }
  };

  const abrirModalUsuarios = async (plano) => {
    try {
      const usuarios = await obterUsuariosPorPlano(plano.text);
      setUsuariosPlano(usuarios);
      setPlanoSelecionado(plano);
    } catch (error) {
      console.error('Erro ao carregar usuários do plano:', error);
    }
  };

  const fecharModalUsuarios = () => {
    setPlanoSelecionado(null);
    setUsuariosPlano([]);
  };

  const baixarListaUsuarios = () => {
    const conteudo = usuariosPlano.map((usuario) => usuario.nome).join('\n');
    const blob = new Blob([conteudo], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `usuarios_${planoSelecionado.text}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-4">Gerenciar Planos</h3>

      <PlanoForm
        onSubmit={editando ? atualizarPlano : adicionarPlano}
        planoEditar={editando}
        cancelar={() => setEditando(null)}
      />

      <Table striped bordered hover className="mt-3">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Valor</th>
            <th>Usuários</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {planos.map((plano) => (
            <tr key={plano.id}>
              <td>{plano.text}</td>
              <td>R$ {plano.value.toFixed(2)}</td>
              <td
                style={{ cursor: plano.totalAdesoes > 0 ? 'pointer' : 'default' }}
                onClick={plano.totalAdesoes > 0 ? () => abrirModalUsuarios(plano) : undefined}
              >
                {plano.totalAdesoes > 0
                  ? `${plano.totalAdesoes} adesão(ões)`
                  : 'Nenhuma adesão'}
              </td>
              <td>
                <Button
                  variant="warning"
                  size="sm"
                  className="me-2"
                  onClick={() => setEditando(plano)}
                >
                  Editar
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => excluirPlano(plano.id)}
                >
                  Excluir
                </Button>
              </td>
            </tr>
          ))}
          {planos.length === 0 && (
            <tr>
              <td colSpan="4" className="text-center text-muted">
                Nenhum plano cadastrado.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <Modal show={planoSelecionado !== null} onHide={fecharModalUsuarios}>
        <Modal.Header closeButton>
          <Modal.Title>Usuários do Plano: {planoSelecionado?.text}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {usuariosPlano.length > 0 ? (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Foto</th>
                  <th>Nome</th>
                  <th>Telefone</th>
                  <th>Adesões</th>
                </tr>
              </thead>
              <tbody>
                {usuariosPlano.map((usuario, index) => (
                  <tr key={index}>
                    <td>
                      {usuario.fotoUrl ? (
                        <img
                          src={usuario.fotoUrl}
                          alt={usuario.nome}
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        'Sem foto'
                      )}
                    </td>
                    <td>{usuario.nome}</td>
                    <td>{usuario.telefone || 'Sem telefone'}</td>
                    <td>{usuario.adesoes}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="text-center text-muted">
              Nenhum usuário aderiu a este plano.
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          {usuariosPlano.length > 0 && (
            <Button variant="primary" onClick={baixarListaUsuarios}>
              Baixar Lista (.txt)
            </Button>
          )}
          <Button variant="secondary" onClick={fecharModalUsuarios}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>

      <Button variant="secondary" className="mt-4" onClick={voltar}>
        Voltar
      </Button>
    </div>
  );
}
