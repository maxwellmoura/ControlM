import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getPlansAcess,
  addPlansAcess,
  updatePlansAcess,
  deletePlansAcess,
} from '../services/dataAcess/plansAcess';
import PlanoForm from './PlanoForm';

export default function PlanosList() {
  const [planos, setPlanos] = useState([]);
  const [editando, setEditando] = useState(null);
  const navigate = useNavigate();

  const voltar = () => {
    navigate('/');
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
    carregarPlanos();
  }, []);

  const adicionarPlano = async (novo) => {
    await addPlansAcess(novo);
    carregarPlanos();
  };

  const atualizarPlano = async (dados) => {
    await updatePlansAcess(editando.id, dados);
    setEditando(null);
    carregarPlanos();
  };

  const excluirPlano = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este plano?')) {
      await deletePlansAcess(id);
      carregarPlanos();
    }
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-4">Gerenciar Planos</h3>

      <PlanoForm
        onSubmit={editando ? atualizarPlano : adicionarPlano}
        planoEditar={editando}
        cancelar={() => setEditando(null)}
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
                  onClick={() => setEditando(plano)}
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
