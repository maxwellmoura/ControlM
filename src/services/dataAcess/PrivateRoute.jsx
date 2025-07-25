import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getAdminStatus } from '../authService';

export default function PrivateRoute({ children }) {
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (usuario) => {
      if (usuario) {
        const adminStatus = await getAdminStatus();
        setIsAdmin(adminStatus);
      } else {
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (isAdmin === null) {
    return <div>Carregando...</div>;
  }

  return isAdmin ? children : <Navigate to="/inicio" />;
}