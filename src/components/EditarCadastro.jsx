import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, updateEmail } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { getPlansAccess } from '../services/plansAcess';
import { updateUserAccess } from '../services/authService';
import { Form, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function EditarCadastro() {
  const [form, setForm] = useState({
    nome: '',
    email: '',
    planoNome: '',
    planoData: '',
  });
  const [planos, setPlanos] = useState([]);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      navigate('/inicio');
      return;
    }

    async function carregarDadosUsuario() {
      try {
        // Carregar dados do usuário
        const userRef = doc(db, 'Usuarios', user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const dados = userSnap.data();
          setForm({
            nome: dados.nome || '',
            email: dados.email || user.email,
            planoNome: dados.planoNome || '',
            planoData: dados.planoData || '',
          });
        } else {
          // Criar documento se não existir
          await setDoc(userRef, {
            uid: user.uid,
            nome: user.displayName || 'Sem nome',
            email: user.email,
            admin: false,
            criadoEm: new Date().toISOString(),
          });
          setForm({
            nome: user.displayName || 'Sem nome',
            email: user.email,
            planoNome: '',
            planoData: '',
          });
        }

        // Carregar planos disponíveis
        const dadosPlanos = await getPlansAccess();
        setPlanos(dadosPlanos);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setErro('Erro ao carregar dados do usuário.');
      } finally {
        setLoading(false);
      }
    }

    carregarDadosUsuario();
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validarEmail = (email) =>
    /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');

    if (!form.nome || !form.email) {
      setErro('Preencha todos os campos obrigatórios.');
      return;
    }

    if (!validarEmail(form.email)) {
      setErro('E-mail inválido.');
      return;
    }

    try {
      setLoading(true);
      // Atualizar email no Firebase Authentication, se necessário
      if (form.email !== user.email) {
        await updateEmail(user, form.email);
      }

      // Atualizar dados no Firestore
      await updateUserAccess(user.uid, {
        nome: form.nome,
        email: form.email,
        planoNome: form.planoNome,
        planoData: form.planoData,
      });

      navigate('/');
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
      switch (error.code) {
        case 'auth/email-already-in-use':
          setErro('Este e-mail já está em uso por outra conta.');
          break;
        case 'auth/requires-recent-login':
          setErro('Por favor, faça login novamente para atualizar o e-mail.');
          navigate('/inicio');
          break;
        default:
          setErro('Erro ao salvar as alterações. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container mt-5 text-center">Carregando...</div>;
  }

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Editar Cadastro</h2>
      {erro && (
        <div className="alert alert-danger text-center" role="alert">
          {erro}
        </div>
      )}
      <Form onSubmit={handleSubmit} style={{ maxWidth: '500px', margin: 'auto' }}>
        <Form.Group className="mb-3">
          <Form.Label>Nome Completo</Form.Label>
          <Form.Control
            type="text"
            name="nome"
            value={form.nome}
            onChange={handleChange}
            placeholder="Seu nome completo"
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>E-mail</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="exemplo@gmail.com"
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Plano</Form.Label>
          <Form.Select
            name="planoNome"
            value={form.planoNome}
            onChange={handleChange}
          >
            <option value="">Nenhum</option>
            {planos.map((plano) => (
              <option key={plano.id} value={plano.text}>
                {plano.text}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Data de Adesão</Form.Label>
          <Form.Control
            type="date"
            name="planoData"
            value={form.planoData}
            onChange={handleChange}
          />
        </Form.Group>
        <div className="d-flex justify-content-between">
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate('/')}
            disabled={loading}
          >
            Cancelar
          </Button>
        </div>
      </Form>
    </div>
  );
}