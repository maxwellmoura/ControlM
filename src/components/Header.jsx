import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { verificarAdmin } from '../services/authService';
import 'bootstrap/dist/css/bootstrap.min.css';

function Header() {
  const [ehAdmin, setEhAdmin] = useState(false);
  const [estaLogado, setEstaLogado] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();

  // Verifica se o usuário está logado e se é administrador
  useEffect(function verificarUsuario() {
    const unsubscribe = auth.onAuthStateChanged(function(usuario) {
      if (usuario) {
        setEstaLogado(true);
        verificarAdmin().then(function(status) {
          setEhAdmin(status);
        });
      } else {
        setEstaLogado(false);
        setEhAdmin(false);
      }
    });
    return function limpar() {
      unsubscribe();
    };
  }, [auth]);

  // Função para sair
  function sair() {
    signOut(auth).then(function() {
      navigate('/inicio');
    });
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <img src="../src/assets/logo.png" alt="ControlM" style={{ height: '40px' }} />
        </Link>
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
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {estaLogado && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/">
                    Início
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/editar-cadastro">
                    Editar Cadastro
                  </Link>
                </li>
                {ehAdmin && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/painel">
                      Administrativo
                    </Link>
                  </li>
                )}
                <li className="nav-item">
                  <button className="nav-link btn btn-link" onClick={sair}>
                    Sair
                  </button>
                </li>
              </>
            )}
            {!estaLogado && (
              <li className="nav-item">
                <Link className="nav-link" to="/inicio">
                  Login
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Header;