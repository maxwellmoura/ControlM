import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, doc, runTransaction } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { Button, Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { formatarDataLocal } from '../services/adminService';

function PlanoSection() {
  const [planos, setPlanos] = useState([]);
  const [mensagemErro, setMensagemErro] = useState('');
  const [usuario, setUsuario] = useState(null);
  const [horario, setHorario] = useState('');
  const auth = getAuth();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUsuario(u || null));
    return () => unsub();
  }, [auth]);

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
        setMensagemErro('Nao foi possivel carregar os planos.');
      }
    );
    return () => unsub();
  }, []);

  async function aderirPlano(plano) {
    setMensagemErro('');
    if (!usuario) {
      setMensagemErro('Voce precisa estar logado para aderir a um plano.');
      return;
    }

    if (plano.text === 'Aula Experimental') {
      const mensagem = encodeURIComponent(
        `Ola, tenho uma nova adesao para a Aula Experimental. O nome do usuario e ${usuario.displayName || 'sem nome'}.`
      );
      const whatsappUrl = `https://api.whatsapp.com/send/?phone=%2B5511999999999&text=${mensagem}`;
      window.open(whatsappUrl, '_blank');
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
        const userSnap = await transaction.get(userRef);
        if (!userSnap.exists()) throw new Error('Usuario nao encontrado.');

        const atuais = userSnap.data().planos || [];
        const jaTemAtivo = atuais.some((p) => p.nome === plano.text && p.dataExpiracao >= dataAdesao);
        if (jaTemAtivo) throw new Error(`Voce ja possui uma adesao ativa do plano "${plano.text}".`);

        const novoPlano = { nome: plano.text, dataAdesao, dataExpiracao };
        transaction.update(userRef, { planos: [...atuais, novoPlano] });
      });

      alert(`Voce aderiu ao plano ${plano.text}!`);
    } catch (err) {
      setMensagemErro(`Erro ao aderir ao plano: ${err.message}`);
    }
  }

  const { primeiraLinha, segundaLinha } = (() => {
    const primeira = planos.slice(0, 4);
    const segunda = planos.slice(4);
    return { primeiraLinha: primeira, segundaLinha: segunda };
  })();

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
                <Card.Text>Preco: R$ {plano.value.toFixed(2)}</Card.Text>
                {plano.text === 'Aula Experimental' && (
                  <div>
                    <input
                      type="date"
                      value={horario}
                      onChange={(e) => setHorario(e.target.value)}
                      placeholder="Escolha o dia"
                    />
                  </div>
                )}
                <Button variant="primary" size="sm" onClick={() => aderirPlano(plano)}>
                  {plano.text === 'Aula Experimental' ? 'Agendar Aula Experimental' : 'Aderir a este Plano'}
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
                <Card.Text>Preco: R$ {plano.value.toFixed(2)}</Card.Text>
                <Button variant="primary" size="sm" onClick={() => aderirPlano(plano)}>
                  Aderir a este Plano
                </Button>
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>

      {planos.length === 0 && <p className="text-center text-muted">Nenhum plano disponivel no momento.</p>}
    </div>
  );
}

export default PlanoSection;
