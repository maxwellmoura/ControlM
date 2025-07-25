import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import logo from '../../src/assets/logo.png';
import '../App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Header() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (usuario) => {
      setUser(usuario);
    });
    return () => unsubscribe();
  }, []);

  return (
    <header>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <a className="navbar-brand d-flex align-items-center" href="/">
            <img src={logo} alt="logo" className="logo-img me-2" />
            <span className="fs-4">Academia Control<span className="text-primary">M</span></span>
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          {user && (
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav ms-auto">
                <li className="nav-item">
                  <a className="nav-link" href="/editar-cadastro">Editar Cadastro</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/mudar-plano">Mudar de Plano</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/pagamento">Pagamento</a>
                </li>
              </ul>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}