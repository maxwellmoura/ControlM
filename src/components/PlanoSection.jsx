
import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  onSnapshot,
  doc,
  runTransaction,
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { Button, Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { formatarDataLocal } from '../services/adminService';

function PlanoSection() {
  const [planos, setPlanos] = useState([]);
  const [mensagemErro, setMensagemErro] = useState('');
  const [usuario, setUsuario] = useState(null);
  const auth = getAuth();

  // Escuta o usuário logado (corrige o uso de auth.currentUser no render)
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUsuario(u || null));
    return () => unsub();
  }, [auth]);

  // Planos em tempo real
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'Planos'),
      (snap) => {
        const dados = snap.docs.map((d) => ({
          id: d.id,
          text: d.data().text || 'Plano sem nome',
          value: Number(d.data().value) || 0,
        }));
        setPlanos(dados);
      },
      (err) => {
        console.error('Erro ao escutar planos:', err);
        setMensagemErro('Não foi possível carregar os planos.');
      }
    );
    return () => unsub();
  }, []);

  // Adere a um plano com transação (evita duplicar e resolve corrida)
  async function aderirPlano(plano) {
    setMensagemErro('');
    if (!usuario) {
      setMensagemErro('Você precisa estar logado para aderir a um plano.');
      return;
    }

    try {
      const userRef = doc(db, 'Usuarios', usuario.uid);
      const hoje = new Date();

      const dataAdesao = formatarDataLocal(hoje);
      const exp = new Date(hoje);
      exp.setMonth(exp.getMonth() + 1);
      const dataExpiracao = formatarDataLocal(exp);

      await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(userRef);
        const atuais = snap.exists() && Array.isArray(snap.data().planos)
          ? snap.data().planos
          : [];

        // Evita duplicar adesão ativa do mesmo plano (baseado no nome)
        const jaTemAtivo = atuais.some((p) => {
          if (!p?.nome || !p?.dataExpiracao) return false;
          if (p.nome !== plano.text) return false;
          // considera ativo se expiração >= hoje
          const expDate = new Date(p.dataExpiracao);
          expDate.setHours(0, 0, 0, 0);
          const h = new Date(hoje);
          h.setHours(0, 0, 0, 0);
          return expDate >= h;
        });

        if (jaTemAtivo) {
          throw new Error(
            `Você já possui uma adesão ativa do plano "${plano.text}".`
          );
        }

        const novoPlano = {
          nome: plano.text,
          dataAdesao,
          dataExpiracao,
        };

        transaction.update(userRef, { planos: [...atuais, novoPlano] });
      });

      alert(`Você aderiu ao plano ${plano.text}!`);
    } catch (erro) {
      console.error('Erro ao aderir ao plano:', erro);
      setMensagemErro(
        erro?.message || 'Erro ao aderir ao plano. Tente novamente.'
      );
    }
  }

  // Divide os planos em duas linhas (máx. 4 na primeira)
  const dividirPlanos = () => {
    const primeiraLinha = planos.slice(0, 4);
    const segundaLinha = planos.slice(4);
    return { primeiraLinha, segundaLinha };
  };

  const { primeiraLinha, segundaLinha } = dividirPlanos();

  return (
    <div className="container mt-5">
      <h3 className="text-center mb-4">Nossos Planos</h3>
      {mensagemErro && (
        <div className="alert alert-danger text-center" role="alert">
          {mensagemErro}
        </div>
      )}

      <div className="row mb-4">
        {primeiraLinha.map((plano) => (
          <div key={plano.id} className="col-md-3 mb-3">
            <Card style={{ width: '100%', maxWidth: '250px' }}>
              <Card.Body>
                <Card.Title className="fs-6">{plano.text}</Card.Title>
                <Card.Text>Preço: R$ {plano.value.toFixed(2)}</Card.Text>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => aderirPlano(plano)}
                >
                  Aderir a este Plano
                </Button>
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>

      <div className="row">
        {segundaLinha.map((plano) => (
          <div key={plano.id} className="col-md-3 mb-3">
            <Card style={{ width: '100%', maxWidth: '250px' }}>
              <Card.Body>
                <Card.Title className="fs-6">{plano.text}</Card.Title>
                <Card.Text>Preço: R$ {plano.value.toFixed(2)}</Card.Text>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => aderirPlano(plano)}
                >
                  Aderir a este Plano
                </Button>
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>

      {planos.length === 0 && (
        <p className="text-center text-muted">
          Nenhum plano disponível no momento.
        </p>
      )}
    </div>
  );
}

export default PlanoSection;
