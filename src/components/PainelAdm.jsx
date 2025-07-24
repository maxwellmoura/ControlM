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
  getPlansAcess,
  addPlansAcess,
  updatePlansAcess,
  deletePlansAcess,
} from '../services/dataAcess/plansAcess';
import PlanoForm from './PlanoForm';
import { db } from '../firebaseConfig';

export default function PainelAdm() {
  const [usuarios, setUsuarios] = useState([]);
  const [planos, setPlanos] = useState([]);
  const [editandoPlano, setEditandoPlano] = useState(null);
  const navigate = useNavigate();

  const carregarUsuarios = async () => {
    const snapshot = await getDocs(collection(db, 'Usuarios'));
    const lista = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setUsuarios(lista);
  };

  const carregarPlanos = async () => {
    try {
      const dados = await getPlansAcess();
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

  const atualizarPlanoUsuario = async (usuarioId, novoPlanoNome, novaData) => {
    const usuarioRef = doc(db, 'Usuarios', usuarioId);
    await updateDoc(usuarioRef, {
      planoNome: novoPlanoNome,
      planoData: novaData,
    });
    carregarUsuarios();
  };

  const adicionarPlano = async (novo) => {
    await addPlansAcess(novo);
    carregarPlanos();
  };

  const atualizarPlano = async (dados) => {
    await updatePlansAcess(editandoPlano.id, dados);
    setEditandoPlano(null);
    carregarPlanos();
  };

  const excluirPlano = async (id) => {
    if (window.confirm('Deseja realmente excluir este plano?')) {
      await deletePlansAcess(id);
      carregarPlanos();
    }
  };

  const voltar = () => navigate('/');

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Painel Administrativo - ControlM</h2>

      {/* === USUÁRIOS === */}
      <h4 className="mt-4">Usuários Cadastrados</h4>
      <table className="table table-striped mt-3">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Plano Aderido</th>
            <th>Data do Plano</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => (
            <tr key={usuario.id}>
              <td>{usuario.nome}</td>
              <td>{usuario.email}</td>
              <td>
                <select
                  value={usuario.planoNome || ''}
                  onChange={(e) =>
                    atualizarPlanoUsuario(
                      usuario.id,
                      e.target.value,
                      usuario.planoData || new Date().toISOString().substring(0, 10)
                    )
                  }
                >
                  <option value="">Nenhum</option>
                  {planos.map((plano) => (
                    <option key={plano.id} value={plano.text}>
                      {plano.text}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <input
                  type="date"
                  value={usuario.planoData || ''}
                  onChange={(e) =>
                    atualizarPlanoUsuario(
                      usuario.id,
                      usuario.planoNome || '',
                      e.target.value
                    )
                  }
                />
              </td>
              <td>
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
    </div>
  );
}
