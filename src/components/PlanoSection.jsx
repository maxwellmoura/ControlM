import { useEffect, useState } from 'react';
import { getPlansAcess } from '../services/dataAcess/plansAcess';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { onAuthStateChanged, getAuth, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';


export default function PlanosSection() {
  const [planos, setPlanos] = useState([]);
  const [user, setUser] = useState(null);
  const [mensagem, setMensagem] = useState('');
  const navigate = useNavigate();

  const auth = getAuth();
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

 
  useEffect(() => {
    async function carregarPlanos() {
      const dados = await getPlansAcess();
      setPlanos(dados);
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
      await updateDoc(usuarioRef, {
        planoId,
        planoNome,
      });

      setMensagem(`Você aderiu ao plano: ${planoNome}`);
    } catch (error) {
      console.error(error);
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
        className="bg-red-600 text-black px-4 py-2 rounded hover:bg-red-700 transition"
      >
        Sair
      </button>
    </section>
  );
}
