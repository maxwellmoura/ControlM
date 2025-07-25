import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAuth,
  signInWithPopup,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { app, db } from '../config/firebaseConfig';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();
  provider.addScope('profile');

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

      // Verificar se o documento do usuário existe no Firestore
      const userRef = doc(db, 'Usuarios', usuario.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // Criar documento do usuário se não existir
        await setDoc(userRef, {
          uid: usuario.uid,
          nome: usuario.displayName || 'Sem nome',
          email: usuario.email,
          admin: false,
          criadoEm: new Date().toISOString(),
        });
      }

      const token = await usuario.getIdTokenResult(true);

      if (token.claims.admin) {
        navigate('/painel');
      } else {
        navigate('/');
      }
    } catch (erro) {
      console.error('Erro no login com email:', erro);
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

      const userRef = doc(db, 'Usuarios', usuario.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: usuario.uid,
          nome: usuario.displayName || 'Sem nome',
          email: usuario.email,
          admin: false,
          criadoEm: new Date().toISOString(),
        });
      }

      const token = await usuario.getIdTokenResult(true);

      if (token.claims.admin) {
        navigate('/painel');
      } else {
        navigate('/');
      }
    } catch (erro) {
      console.error('Erro no login com Google:', erro.message, erro.code);
      setErro(`Erro ao autenticar com o Google: ${erro.message}`);
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
            src="../src/assets/logo.png"
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
            <span className="text-muted fs-6">Não tem conta? </span>
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