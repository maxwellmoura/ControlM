import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Table } from 'react-bootstrap';
import { getOverdueUsers } from '../services/notificationService';
import 'bootstrap/dist/css/bootstrap.min.css';

function OverdueUsersModal({ show, onHide }) {
  const [overdueUsers, setOverdueUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!show) return;

    async function fetchOverdueUsers() {
      try {
        setLoading(true);
        setError('');
        const users = await getOverdueUsers();
        setOverdueUsers(users);
        setLoading(false);
      } catch (err) {
        console.error('Erro ao carregar usuários inadimplentes:', err);
        setError('Erro ao carregar usuários inadimplentes.');
        setLoading(false);
      }
    }

    fetchOverdueUsers();
  }, [show]);

  function handleSendNotification(url) {
    window.open(url, '_blank');
  }

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Usuários com Planos Vencidos</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <div className="alert alert-danger py-2 text-center">{error}</div>}
        {loading ? (
          <p className="text-center">Carregando dados...</p>
        ) : overdueUsers.length === 0 ? (
          <p className="text-center">Nenhum usuário com planos vencidos encontrado.</p>
        ) : (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Telefone</th>
                <th>Plano</th>
                <th>Data de Expiração</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {overdueUsers.map((user) => (
                <tr key={`${user.id}-${user.planoNome}`}>
                  <td>{user.nome}</td>
                  <td>{user.email}</td>
                  <td>{user.telefone}</td>
                  <td>{user.planoNome}</td>
                  <td>{new Date(user.dataExpiracao).toLocaleDateString('pt-BR')}</td>
                  <td>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleSendNotification(user.whatsAppUrl)}
                    >
                      Enviar Notificação
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Fechar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default OverdueUsersModal;

OverdueUsersModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
};
