import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getAdminStatus } from '../../config/getAdminStatus'; 

export default function PrivateRoute({ children }) {
  const [carregando, setCarregando] = useState(true);
  const [usuario, setUsuario] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          await user.getIdToken(true);
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

  if (!usuario) {
    return <Navigate to="/" replace />;
  }

  if (!isAdmin) {
    return <div className="text-center mt-5 text-danger fw-bold">Acesso negado: usuário não é admin.</div>;
  }

  return children;
}
