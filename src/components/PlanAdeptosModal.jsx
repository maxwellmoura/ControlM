import { Modal, Button, Table } from 'react-bootstrap';
import { listarAdeptosPlano, formatarTelefone } from '../services/adminService';

function PlanAdeptosModal({ mostrarAdeptosPlano, setMostrarAdeptosPlano, adeptosPorPlano }) {
  return (
    <Modal show={mostrarAdeptosPlano !== null} onHide={function() { setMostrarAdeptosPlano(null); }}>
      <Modal.Header closeButton>
        <Modal.Title>Adeptos do Plano: {mostrarAdeptosPlano || 'N/A'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {listarAdeptosPlano(mostrarAdeptosPlano, adeptosPorPlano).length > 0 ? (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Telefone</th>
              </tr>
            </thead>
            <tbody>
              {listarAdeptosPlano(mostrarAdeptosPlano, adeptosPorPlano).map(function(usuario) {
                return (
                  <tr key={usuario.id}>
                    <td>{usuario.nome || 'Sem nome'}</td>
                    <td>{usuario.email || 'N/A'}</td>
                    <td>{formatarTelefone(usuario.telefone)}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        ) : (
          <p>Nenhum usuário neste plano.</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={function() { setMostrarAdeptosPlano(null); }}>
          Fechar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default PlanAdeptosModal;