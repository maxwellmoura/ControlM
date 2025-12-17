import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { verificarAdmin } from '../authService';
import { Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

function PrivateRoute(props) {
  const conteudo = props.children;
  const [ehAdmin, setEhAdmin] = useState(null);
  const [mostrarAlerta, setMostrarAlerta] = useState(false);
  const navigate = useNavigate();

  useEffect(
    function verificarUsuario() {
      const auth = getAuth();
      const unsubscribe = onAuthStateChanged(auth, function (usuario) {
        if (usuario) {
          verificarAdmin().then(function (statusAdmin) {
            setEhAdmin(statusAdmin);
            if (!statusAdmin) {
              setMostrarAlerta(true);
              setTimeout(function () {
                navigate('/');
                setMostrarAlerta(false);
              }, 3000);
            }
          });
        } else {
          setEhAdmin(false);
          navigate('/inicio');
        }
      });

      return function limpar() {
        unsubscribe();
      };
    },
    [navigate]
  );

  if (ehAdmin === null) {
    return <div className="container mt-5 text-center">Carregando...</div>;
  }

  return (
    <div>
      {mostrarAlerta && (
        <Alert
          variant="warning"
          className="text-center"
          onClose={function () {
            setMostrarAlerta(false);
          }}
          dismissible
        >
          Essa área só pode ser acessada por um administrador.
        </Alert>
      )}
      {ehAdmin ? conteudo : null}
    </div>
  );
}

export default PrivateRoute;
