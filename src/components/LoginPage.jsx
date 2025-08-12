import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import 'bootstrap/dist/css/bootstrap.min.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagemErro, setMensagemErro] = useState('');
  const navigate = useNavigate();
  const auth = getAuth();
  const provedorGoogle = new GoogleAuthProvider();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(usuario => {
      if (usuario) {
        const documentoUsuario = doc(db, 'Usuarios', usuario.uid);
        getDoc(documentoUsuario).then(docSnapshot => {
          if (docSnapshot.exists()) {
            usuario.getIdTokenResult(true).then(token => {
              if (token.claims.admin || docSnapshot.data().admin) {
                navigate('/painel');
              } else {
                navigate('/');
              }
            });
          } else {
            auth.signOut();
            setMensagemErro('Conta não encontrada. Por favor, faça um novo cadastro.');
          }
        });
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  function emailValido(email) {
    return /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
  }

  function loginComEmail(evento) {
    evento.preventDefault();
    setMensagemErro('');

    if (!email || !senha) {
      setMensagemErro('Preencha todos os campos.');
      return;
    }

    if (!emailValido(email)) {
      setMensagemErro('Formato de e-mail inválido.');
      return;
    }

    signInWithEmailAndPassword(auth, email, senha)
      .then(resultado => {
        const usuario = resultado.user;
        const documentoUsuario = doc(db, 'Usuarios', usuario.uid);

        getDoc(documentoUsuario).then(docSnapshot => {
          if (!docSnapshot.exists()) {
            auth.signOut();
            setMensagemErro('Conta não encontrada. Por favor, faça um novo cadastro.');
            return;
          }

          usuario.getIdTokenResult(true).then(token => {
            if (token.claims.admin || docSnapshot.data().admin) {
              navigate('/painel');
            } else {
              navigate('/');
            }
          });
        });
      })
      .catch(erro => {
        console.error('Erro no login:', erro);
        if (erro.code === 'auth/user-not-found') {
          setMensagemErro('Usuário não encontrado.');
        } else if (erro.code === 'auth/wrong-password') {
          setMensagemErro('Senha incorreta.');
        } else if (erro.code === 'auth/invalid-email') {
          setMensagemErro('E-mail inválido.');
        } else {
          setMensagemErro('Falha no login. Tente novamente.');
        }
      });
  }

  function loginComGoogle() {
    signInWithPopup(auth, provedorGoogle)
      .then(resultado => {
        const usuario = resultado.user;
        const documentoUsuario = doc(db, 'Usuarios', usuario.uid);

        getDoc(documentoUsuario).then(docSnapshot => {
          if (!docSnapshot.exists()) {
            auth.signOut();
            setMensagemErro('Conta não encontrada. Por favor, faça um novo cadastro.');
            return;
          }

          usuario.getIdTokenResult(true).then(token => {
            if (token.claims.admin || docSnapshot.data().admin) {
              navigate('/painel');
            } else {
              navigate('/');
            }
          });
        });
      })
      .catch(erro => {
        console.error('Erro no login com Google:', erro);
        setMensagemErro('Falha no login com Google: ' + erro.message);
      });
  }

  function irParaCadastro() {
    navigate('/cadastro');
  }

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className="card shadow-sm p-4" style={{ maxWidth: '400px', width: '100%' }}>
        <div className="text-center mb-4">
          <img
            src="../src/assets/logo.png"
            alt="Logo ControlM"
            className="img-fluid mb-3"
            style={{ maxHeight: '80px' }}
          />
          <h4 className="fw-bold">Login - Control<span className="fs-1">M</span></h4>
        </div>
        <form onSubmit={loginComEmail}>
          <div className="mb-3">
            <label className="form-label">E-mail</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={evento => setEmail(evento.target.value)}
              placeholder="exemplo@gmail.com"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Senha</label>
            <input
              type="password"
              className="form-control"
              value={senha}
              onChange={evento => setSenha(evento.target.value)}
              placeholder="••••••••"
            />
          </div>
          {mensagemErro && (
            <div className="alert alert-danger py-2 text-center" role="alert">
              {mensagemErro}
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

export default LoginPage;