import { useEffect, useState } from 'react';
import { getPlansAccess } from '../services/plansAcess';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { onAuthStateChanged, getAuth, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function PlanoSection() {
  const [planos, setPlanos] = useState([]);
  const [user, setUser] = useState(null);
  const [mensagem, setMensagem] = useState('');
  const navigate = useNavigate();

  const auth = getAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/inicio');
    } catch (error) {
      console.error('Erro ao sair:', error);
      setMensagem('Erro ao sair. Tente novamente.');
    }
  };

  useEffect(() => {
    async function carregarPlanos() {
      try {
        const dados = await getPlansAccess();
        setPlanos(dados);
      } catch (error) {
        console.error('Erro ao carregar planos:', error);
        setMensagem('Erro ao carregar planos.');
      }
    }

    carregarPlanos();

    const unsubscribe = onAuthStateChanged(auth, (usuario) => {
      setUser(usuario);
    });

    return () => unsubscribe();
  }, []);

  const aderirAoPlano = async (planoId, planoNome) => {
    if (!user) {
      setMensagem('Você precisa estar logado para aderir a um plano.');
      return;
    }

    try {
      const usuarioRef = doc(db, 'Usuarios', user.uid);
      const userSnap = await getDoc(usuarioRef);

      if (!userSnap.exists()) {
        // Criar documento do usuário se não existir
        await setDoc(usuarioRef, {
          uid: user.uid,
          nome: user.displayName || 'Sem nome',
          email: user.email,
          admin: false,
          criadoEm: new Date().toISOString(),
        });
      }

      const dataAdesao = new Date().toISOString().substring(0, 10);
      await updateDoc(usuarioRef, {
        planoId,
        planoNome,
        planoData: dataAdesao,
      });

      setMensagem(`Você aderiu ao plano ${planoNome} em ${dataAdesao}`);
    } catch (error) {
      console.error('Erro ao aderir ao plano:', error);
      setMensagem('Erro ao aderir ao plano. Tente novamente.');
    }
  };

  return (
    <section className="container my-5">
      <h2 className="mb-4 text-center">Planos e Preços</h2>
      {mensagem && (
        <div className="alert alert-info text-center">{mensagem}</div>
      )}
      <div className="row">
        {planos.map((plano) => (
          <div key={plano.id} className="col-md-4 mb-3">
            <div className="card text-center h-100">
              <div className="card-body">
                <h5 className="card-title">{plano.text}</h5>
                <p className="card-text">R$ {plano.value}/mês</p>
                <button
                  className="btn btn-success"
                  onClick={() => aderirAoPlano(plano.id, plano.text)}
                >
                  Aderir
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={handleLogout}
        className="btn btn-danger mt-3"
      >
        Sair
      </button>
    </section>
  );
}