import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
<<<<<<< HEAD
import { getAdminStatus } from '../../config/getAdminStatus';
=======
import { getAdminStatus } from '../../getAdminStatus';
>>>>>>> cbf912b9474ebed377623fd99197e6d4ddf7b13d

export default function PrivateRoute({ children }) {
  const [carregando, setCarregando] = useState(true);
  const [usuario, setUsuario] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
<<<<<<< HEAD
          await user.getIdToken(true);

=======
>>>>>>> cbf912b9474ebed377623fd99197e6d4ddf7b13d
          const admin = await getAdminStatus();
          setIsAdmin(admin);
          setUsuario(user);
        } catch (error) {
          console.error('Erro ao verificar status de admin:', error);
          setIsAdmin(false);
        }
      } else {
        setUsuario(null);
        setIsAdmin(false);
      }

      setCarregando(false);
    });

    return () => unsubscribe();
  }, []);

  if (carregando) {
    return <div className="text-center mt-5">Verificando acesso...</div>;
  }

<<<<<<< HEAD
  if (!usuario) {
    return <Navigate to="/" replace />;
  }

  if (!isAdmin) {
    return <div className="text-center mt-5 text-danger fw-bold">Acesso negado: usuário não é admin.</div>;
=======
  if (!usuario || !isAdmin) {
    return <Navigate to="/painel" replace />;
>>>>>>> cbf912b9474ebed377623fd99197e6d4ddf7b13d
  }

  return children;
}
