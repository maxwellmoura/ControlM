import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAuth,
  signInWithPopup,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
} from 'firebase/auth';
<<<<<<< HEAD
import { app } from '../config/firebaseConfig';
=======
import { app } from '../firebaseConfig';
>>>>>>> cbf912b9474ebed377623fd99197e6d4ddf7b13d
import 'bootstrap/dist/css/bootstrap.min.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();

  const validarEmail = (email) =>
    /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');

    if (!email || !senha) {
      setErro('Preencha todos os campos.');
      return;
    }

    if (!validarEmail(email)) {
      setErro('E-mail inválido.');
      return;
    }

    try {
      const resultado = await signInWithEmailAndPassword(auth, email, senha);
      const usuario = resultado.user;
      console.log('Login com e-mail/senha:', usuario);

<<<<<<< HEAD
      await usuario.getIdToken(true);
      const token = await usuario.getIdTokenResult(true);
      console.log("Custom claims:", token.claims);

      if (token.claims.admin) {
        navigate('/painel');
      } else {
        navigate('/inicio'); 
      }

=======
      // ⚠️ Atualiza o token para garantir que as claims (como admin) sejam carregadas
      await usuario.getIdToken(true);

      navigate('/painel');
>>>>>>> cbf912b9474ebed377623fd99197e6d4ddf7b13d
    } catch (erro) {
      console.error(erro);

      switch (erro.code) {
        case 'auth/user-not-found':
          setErro('Usuário não encontrado.');
          break;
        case 'auth/wrong-password':
          setErro('Senha incorreta.');
          break;
        case 'auth/invalid-email':
          setErro('E-mail inválido.');
          break;
        default:
          setErro('Erro ao autenticar. Tente novamente.');
      }
    }
  };

  const loginComGoogle = async () => {
    try {
      const resultado = await signInWithPopup(auth, provider);
      const usuario = resultado.user;
      console.log('Login com Google:', usuario);

      await usuario.getIdToken(true);

      navigate('/painel');
    } catch (erro) {
<<<<<<< HEAD
      navigate('/inicio');
=======
>>>>>>> cbf912b9474ebed377623fd99197e6d4ddf7b13d
      console.error(erro);
      setErro('Erro ao autenticar com o Google.');
    }
  };

  const irParaCadastro = () => {
    navigate('/cadastro');
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className="card shadow-sm p-4" style={{ maxWidth: '400px', width: '100%' }}>
        <div className="text-center mb-4">
          <img
            src="../src/assets/ControlM_Logo.png"
            alt="ControlM Logo"
            className="img-fluid mb-3"
            style={{ maxHeight: '80px' }}
          />
          <h4 className="fw-bold">Login - Control<span className="fs-1">M</span></h4>
        </div>
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">E-mail</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemplo@gmail.com"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Senha</label>
            <input
              type="password"
              className="form-control"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          {erro && (
            <div className="alert alert-danger py-2 text-center" role="alert">
              {erro}
            </div>
          )}
          <button type="submit" className="btn btn-primary w-100 mb-2">
            Entrar
          </button>
          <button
            type="button"
            onClick={loginComGoogle}
            className="btn btn-outline-danger w-100 mb-2"
          >
            Entrar com Google
          </button>
          <div className="text-center mt-3">
            <span className="text-muted">Não tem conta? </span>
            <button
              onClick={irParaCadastro}
              className="btn btn-link p-0"
              type="button"
            >
              Cadastre-se
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
