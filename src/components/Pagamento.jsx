import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Pagamento() {
  const navigate = useNavigate();

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Pagamento</h2>
      <p className="text-center">Funcionalidade de pagamento em desenvolvimento.</p>
      <button className="btn btn-secondary" onClick={() => navigate('/')}>
        Voltar
      </button>
    </div>
  );
}
