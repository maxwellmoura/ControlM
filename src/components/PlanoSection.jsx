import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  onSnapshot,
  doc,
  runTransaction,
  deleteDoc,
} from 'firebase/firestore';
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

  // Função para tratar a adesão do plano
  async function aderirPlano(plano) {
    setMensagemErro('');
    if (!usuario) {
      setMensagemErro('Você precisa estar logado para aderir a um plano.');
      return;
    }

    // Se for o plano "Aula Experimental", enviar mensagem para o WhatsApp cadastrado no sistema
    if (plano.text === 'Aula Experimental') {
      const hoje = new Date();
      const dataAdesao = formatarDataLocal(hoje);
      const mensagem = encodeURIComponent(`Olá, tenho uma nova adesão para a Aula Experimental. O nome do usuário é ${usuario.displayName}.`);
      const whatsappUrl = `https://api.whatsapp.com/send/?phone=%2B5511999999999&text=${mensagem}`;
      console.log('Gerando link de WhatsApp:', whatsappUrl);
      window.open(whatsappUrl, '_blank');

    } else {
      // Caso não seja a "Aula Experimental", faz a adesão do plano normalmente
      try {
        const userRef = doc(db, 'Usuarios', usuario.uid);
        const hoje = new Date();
        const dataAdesao = formatarDataLocal(hoje);
        const exp = new Date(hoje);
        exp.setMonth(exp.getMonth() + 1);
        const dataExpiracao = formatarDataLocal(exp);

        await runTransaction(db, async (transaction) => {
          // Primeiras leituras: usuário e plano
          const userSnap = await transaction.get(userRef);
          const planoRef = doc(db, 'Planos', plano.id);
          const planoSnap = await transaction.get(planoRef);

          // Se o usuário não existe ou o plano não existe
          if (!userSnap.exists()) {
            throw new Error("Usuário não encontrado.");
          }
          if (!planoSnap.exists()) {
            throw new Error("Plano não encontrado.");
          }

          // Lógica de adesão: Verificar se já tem o plano ativo
          const atuais = userSnap.data().planos || [];
          const jaTemAtivo = atuais.some((p) => p.nome === plano.text && p.dataExpiracao >= dataAdesao);

          if (jaTemAtivo) {
            throw new Error(`Você já possui uma adesão ativa do plano "${plano.text}".`);
          }

          // Atualizar o plano do usuário
          const novoPlano = { nome: plano.text, dataAdesao, dataExpiracao };
          transaction.update(userRef, { planos: [...atuais, novoPlano] });

          // Atualizar a contagem de adeptos no plano
          const currentAdeptos = planoSnap.data().adeptos || 0;
          transaction.update(planoRef, { adeptos: currentAdeptos + 1 });
        });

        alert(`Você aderiu ao plano ${plano.text}!`);
      } catch (err) {
        setMensagemErro(`Erro ao aderir ao plano: ${err.message}`);
      }
    }
  }

  // Função para excluir o plano e remover de todos os usuários
  async function excluirPlano(idPlano) {
    try {
      // 1) Obter os documentos dos usuários que possuem esse plano
      const usuariosRef = collection(db, 'Usuarios');
      const usuariosSnap = await usuariosRef.get();

      // 2) Remover o plano de todos os usuários que o possuem
      const batch = db.batch();
      usuariosSnap.forEach((usuarioDoc) => {
        const usuarioData = usuarioDoc.data();
        const planos = usuarioData.planos || [];

        // Filtra o plano que está sendo excluído
        const novosPlanos = planos.filter(plano => plano.id !== idPlano);

        // Se o plano foi removido, atualiza o documento do usuário
        if (novosPlanos.length !== planos.length) {
          const usuarioRef = doc(db, 'Usuarios', usuarioDoc.id);
          batch.update(usuarioRef, { planos: novosPlanos });
        }
      });

      // 3) Excluir o plano na coleção 'Planos'
      const planoRef = doc(db, 'Planos', idPlano);
      batch.delete(planoRef);

      // 4) Commit em todas as operações (remover plano de usuários e do banco)
      await batch.commit();
      alert('Plano excluído com sucesso de todos os usuários!');
    } catch (error) {
      console.error('Erro ao excluir plano:', error);
      alert('Erro ao excluir o plano, tente novamente mais tarde.');
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
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => aderirPlano(plano)}
                >
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
