import { useEffect, useState } from 'react';
import {
  getFirestore,
  collection,
  onSnapshot,
  query,
  where,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { Table, Button, Badge, Form } from 'react-bootstrap';

const db = getFirestore();

export default function FeedbackAdmin() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [filtro, setFiltro] = useState('pendentes');
  const [erro, setErro] = useState('');

  useEffect(() => {
    setErro('');
    let q = collection(db, 'Feedbacks');
    if (filtro === 'pendentes') q = query(q, where('approved', '==', false));
    if (filtro === 'aprovados') q = query(q, where('approved', '==', true));

    const unsub = onSnapshot(
      q,
      (snap) => {
        setFeedbacks(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (e) => {
        console.error(e);
        setErro('Erro ao carregar feedbacks.');
      }
    );
    return () => unsub();
  }, [filtro]);

  async function aprovar(id, valor) {
    try {
      await updateDoc(doc(db, 'Feedbacks', id), { approved: valor });
    } catch (e) {
      console.error(e);
      alert('Não foi possível atualizar.');
    }
  }

  async function excluir(id) {
    if (!confirm('Tem certeza que deseja excluir este feedback?')) return;
    try {
      await deleteDoc(doc(db, 'Feedbacks', id));
    } catch (e) {
      console.error(e);
      alert('Não foi possível excluir.');
    }
  }

  return (
    <div className="mt-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h4 className="mb-0">Moderação de Feedbacks</h4>
        <Form.Select
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          style={{ maxWidth: 240 }}
        >
          <option value="pendentes">Pendentes</option>
          <option value="aprovados">Aprovados</option>
          <option value="todos">Todos</option>
        </Form.Select>
      </div>

      {erro && <div className="alert alert-danger">{erro}</div>}

      <Table bordered hover responsive>
        <thead>
          <tr>
            <th>Data</th>
            <th>Usuário</th>
            <th>Avaliação</th>
            <th>Comentário</th>
            <th>Status</th>
            <th style={{ width: 220 }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {feedbacks.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center">
                Nenhum feedback.
              </td>
            </tr>
          ) : (
            feedbacks.map((fb) => (
              <tr key={fb.id}>
                <td>{fb.createdAt?.toDate ? fb.createdAt.toDate().toLocaleString() : '-'}</td>
                <td>{fb.userName || fb.userId}</td>
                <td>{fb.rating}/5</td>
                <td>{fb.comments || '-'}</td>
                <td>
                  {fb.approved ? (
                    <Badge bg="success">Aprovado</Badge>
                  ) : (
                    <Badge bg="secondary">Pendente</Badge>
                  )}
                </td>
                <td className="d-flex gap-2">
                  {fb.approved ? (
                    <Button size="sm" variant="secondary" onClick={() => aprovar(fb.id, false)}>
                      Remover aprovação
                    </Button>
                  ) : (
                    <Button size="sm" variant="success" onClick={() => aprovar(fb.id, true)}>
                      Aprovar
                    </Button>
                  )}
                  <Button size="sm" variant="danger" onClick={() => excluir(fb.id)}>
                    Excluir
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
}
