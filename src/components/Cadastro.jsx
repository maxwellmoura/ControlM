import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword, fetchSignInMethodsForEmail, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [senhaConfirmada, setSenhaConfirmada] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');  // Reset error message

    // Verifica se as senhas coincidem
    if (senha !== senhaConfirmada) {
      setErro('As senhas não coincidem!');
      return;
    }

    const auth = getAuth();
    try {
      // Verifica se o email já está em uso
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      if (signInMethods.length > 0) {
        setErro('Este e-mail já está em uso.');
        return;
      }

      // Criação do usuário
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;

      // Atualiza o perfil do usuário (nome)
      await updateProfile(user, { displayName: nome });

      // Salva o usuário no Firestore
      await setDoc(doc(db, 'Usuarios', user.uid), {
        nome,
        email,
        telefone,
        criadoEm: new Date(),
      });

      // Navega para a página de login ou painel
      navigate('/');
    } catch (err) {
      setErro('Erro ao cadastrar usuário: ' + err.message);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div className="card p-4" style={{ width: '100%', maxWidth: '500px' }}>
        <img className="img-fluid w-25 mx-auto d-block" src="./src/assets/logo.png" alt="Logo" />
        <h2 className="text-center mb-4">Cadastro </h2>
        {erro && <p className="text-danger">{erro}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <label htmlFor="nome">Nome</label>
            <input
              type="text"
              className="form-control"
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>
          <div className="form-group mb-3">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              className="form-control"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group mb-3">
            <label htmlFor="telefone">Telefone</label>
            <input
              type="tel"
              className="form-control"
              id="telefone"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              required
            />
          </div>
          <div className="form-group mb-3">
            <label htmlFor="senha">Senha</label>
            <input
              type="password"
              className="form-control"
              id="senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>
          <div className="form-group mb-4">
            <label htmlFor="senhaConfirmada">Repita a Senha</label>
            <input
              type="password"
              className="form-control"
              id="senhaConfirmada"
              value={senhaConfirmada}
              onChange={(e) => setSenhaConfirmada(e.target.value)}
              required
            />
          </div>
          <div className="d-flex justify-content-between">
            <button type="submit" className="btn btn-primary">
              Criar Conta
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/login')}
            >
              Retornar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
