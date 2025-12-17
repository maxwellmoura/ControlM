import { Table, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { calcularValorTotalPlanos, formatarTelefone } from '../services/adminService';

function UserTable({ usuarios, planos, abrirEdicaoUsuario, abrirDetalhesPlanos, excluirUsuario }) {
  return (
    <Table striped bordered hover className="mt-3">
      <thead>
        <tr>
          <th>Nome</th>
          <th>Email</th>
          <th>Telefone</th>
          <th>Planos</th>
          <th>Admin</th>
          <th>Valor Total</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        {usuarios.map((usuario) => (
          <tr key={usuario.id}>
            <td>{usuario.nome}</td>
            <td>{usuario.email}</td>
            <td>{formatarTelefone(usuario.telefone)}</td>
            <td
              style={{ cursor: usuario.planos.length > 0 ? 'pointer' : 'default' }}
              onClick={() => {
                if (usuario.planos.length > 0) abrirDetalhesPlanos(usuario);
              }}
            >
              {usuario.planos.length > 0 ? `${usuario.planos.length} plano(s)` : 'Nenhum'}
            </td>
            <td>{usuario.ehAdmin ? 'Sim' : 'Não'}</td>
            <td>{calcularValorTotalPlanos(usuario.planos, planos)}</td>
            <td>
              <Button variant="warning" size="sm" onClick={() => abrirEdicaoUsuario(usuario)}>
                Editar
              </Button>
              {!usuario.ehAdmin && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => excluirUsuario(usuario.id)}
                  className="ms-2"
                >
                  Excluir
                </Button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

export default UserTable;

UserTable.propTypes = {
  usuarios: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      nome: PropTypes.string,
      email: PropTypes.string,
      telefone: PropTypes.string,
      planos: PropTypes.array,
      ehAdmin: PropTypes.bool,
    })
  ).isRequired,
  planos: PropTypes.array,
  abrirEdicaoUsuario: PropTypes.func.isRequired,
  abrirDetalhesPlanos: PropTypes.func,
  excluirUsuario: PropTypes.func.isRequired,
};
