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
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const navigate = useNavigate();
  const auth = getAuth();

  const validarEmail = (email) =>
    /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);

  const validarTelefone = (telefone) =>
    /^\d{10,11}$/.test(telefone.replace(/\D/g, ''));

  const handleCadastro = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso('');

    if (!nome || !email || !telefone || !senha || !confirmarSenha) {
      setErro('Preencha todos os campos.');
      return;
    }
    if (!validarEmail(email)) {
      setErro('E-mail inválido.');
      return;
    }
    if (!validarTelefone(telefone)) {
      setErro('Telefone inválido. Use 10 ou 11 dígitos.');
      return;
    }
    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem.');
      return;
    }
    if (senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    try {
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      if (signInMethods.length > 0) {
        setErro('Este e-mail já está registrado. Tente fazer login ou usar outro e-mail.');
        return;
      }
      const resultado = await createUserWithEmailAndPassword(auth, email, senha);
      const usuario = resultado.user;

      await updateProfile(usuario, { displayName: nome });

      await setDoc(doc(db, 'Usuarios', usuario.uid), {
        uid: usuario.uid,
        nome,
        email,
        telefone,
        admin: false,
        criadoEm: new Date().toISOString(),
      });

      setSucesso('Cadastro realizado com sucesso! Faça login para continuar.');
      setTimeout(() => {
        auth.signOut();
        navigate('/inicio');
      }, 2000);
    } catch (erro) {
      console.error('Erro no cadastro:', erro);
      if (erro && erro.code) {
        switch (erro.code) {
          case 'auth/email-already-in-use':
            setErro('Este e-mail já está registrado. Tente fazer login.');
            break;
          case 'auth/invalid-email':
            setErro('E-mail inválido.');
            break;
          case 'auth/weak-password':
            setErro('A senha é muito fraca. Use pelo menos 6 caracteres.');
            break;
          default:
            setErro('Erro ao cadastrar: ' + erro.message);
        }
      } else {
        setErro('Erro ao cadastrar. Tente novamente.');
      }
    }
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
          <h4 className="fw-bold">Cadastro - Control<span className="fs-1">M</span></h4>
        </div>
        <form onSubmit={handleCadastro}>
          <div className="mb-3">
            <label className="form-label">Nome Completo</label>
            <input
              type="text"
              className="form-control"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Seu nome completo"
            />
          </div>
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
            <label className="form-label">Telefone</label>
            <input
              type="text"
              className="form-control"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="Ex.: (11) 99999-9999"
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
          <div className="mb-3">
            <label className="form-label">Confirmar Senha</label>
            <input
              type="password"
              className="form-control"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          {erro && <div className="alert alert-danger py-2 text-center" role="alert">{erro}</div>}
          {sucesso && <div className="alert alert-success py-2 text-center" role="alert">{sucesso}</div>}
          <button type="submit" className="btn btn-primary w-100 mb-2">Cadastrar</button>
          <div className="text-center mt-3">
            <span className="text-muted fs-6">Já tem conta? </span>
            <button
              onClick={() => navigate('/inicio')}
              className="btn btn-link p-0"
              type="button"
            >
              Faça login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}