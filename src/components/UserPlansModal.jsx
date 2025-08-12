import { Modal, Button, Table } from 'react-bootstrap';
import {
  formatarDataParaExibicao,
  formatarTelefone,
  calcularDiasAteVencimento,
} from '../services/adminService';

function UserPlansModal({ mostrarPlanosUsuario, setMostrarPlanosUsuario }) {
  function classeExpiracao(dataExpiracao) {
    const dias = calcularDiasAteVencimento(dataExpiracao);
    if (dias === null) return '';
    if (dias > 15) return 'bg-success bg-opacity-25';
    if (dias >= 5) return 'bg-warning bg-opacity-25';
    return 'bg-danger bg-opacity-25';
  }

  return (
    <Modal
      show={mostrarPlanosUsuario !== null}
      onHide={() => setMostrarPlanosUsuario(null)}
    >
      <Modal.Header closeButton>
        <Modal.Title>{mostrarPlanosUsuario?.nome || 'Sem nome'}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p>
          <strong>Telefone:</strong> {formatarTelefone(mostrarPlanosUsuario?.telefone)}
        </p>

        {mostrarPlanosUsuario?.planos?.length > 0 ? (
          <>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Plano</th>
                  <th>Data de Adesão</th>
                  <th>Data de Expiração</th>
                </tr>
              </thead>
              <tbody>
                {mostrarPlanosUsuario.planos.map((plano, index) => (
                  <tr key={`${plano.nome}-${plano.dataAdesao}-${index}`}>
                    <td>{plano.nome || 'N/A'}</td>
                    <td>
                      {plano.dataAdesao
                        ? formatarDataParaExibicao(plano.dataAdesao)
                        : 'N/A'}
                    </td>
                    <td className={classeExpiracao(plano.dataExpiracao)}>
                      {plano.dataExpiracao
                        ? formatarDataParaExibicao(plano.dataExpiracao)
                        : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            {/* Legenda */}
            <div
              className="mt-3"
              style={{ display: 'flex' ,alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}
            >
              <strong>Legenda:</strong>
              <span>✅ <span style={{ fontWeight: 500}}></span> &gt;15 dias,</span>
              <span>🟨 15-5,</span>
              <span>🟥 &lt;5</span>
            </div>
          </>
        ) : (
          <p>Nenhum plano.</p>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={() => setMostrarPlanosUsuario(null)}>
          Fechar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default UserPlansModal;
