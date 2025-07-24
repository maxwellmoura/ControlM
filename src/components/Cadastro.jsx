<<<<<<< HEAD
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from '../config/firebaseConfig'; // ou '../firebaseConfig', ajuste conforme seu projeto

export default function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const navigate = useNavigate();

  const validarEmail = (email) => /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);

  const voltar = () => {
    navigate('/');
  };

  const handleCadastro = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso('');

    if (!nome || !email || !senha || !confirmarSenha) {
      setErro('Preencha todos os campos.');
      return;
    }

    if (!validarEmail(email)) {
      setErro('E-mail inválido.');
      return;
    }

    if (senha.length < 6) {
      setErro('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;

      await setDoc(doc(db, "Usuarios", user.uid), {
        nome,
        email,
        criadoEm: new Date()
      });

      setSucesso('Cadastro realizado com sucesso!');
      setNome('');
      setEmail('');
      setSenha('');
      setConfirmarSenha('');

      // Redireciona após 2 segundos
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      console.error(error);
      setErro('Erro ao cadastrar: ' + error.message);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className="card p-4 shadow-sm" style={{ maxWidth: '400px', width: '100%' }}>
        <h4 className="text-center mb-2 fw-bold">
          Cadastro - Control<span className="text-primary">M</span>
        </h4>
        <p className="text-center mb-4 text-muted">Faça seu cadastro abaixo</p>

        <form onSubmit={handleCadastro}>
          <div className="mb-3">
            <label className="form-label">Nome completo</label>
            <input
              type="text"
              className="form-control"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Seu nome"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">E-mail</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seuemail@dominio.com"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Senha</label>
            <input
              type="password"
              className="form-control"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Confirmar Senha</label>
            <input
              type="password"
              className="form-control"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              placeholder="Digite a senha novamente"
            />
          </div>

          {erro && (
            <div className="alert alert-danger py-2 text-center" role="alert">
              {erro}
            </div>
          )}

          {sucesso && (
            <div className="alert alert-success py-2 text-center" role="alert">
              {sucesso}
            </div>
          )}

          <button type="submit" className="btn btn-success w-100">Cadastrar</button>
          <button onClick={voltar} className="btn btn-secondary mt-2 w-100" type="button">Voltar</button>
        </form>
      </div>
    </div>
  );
}
=======
import React from "react";
import { auth, db } from "../firebaseConfig";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      
      provider.setCustomParameters({ prompt: "select_account" });

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      console.log("Usuário autenticado:", user.uid, user.email);

      const userRef = doc(db, "Usuarios", user.uid);
      const userSnap = await getDoc(userRef);

      // Cria usuário no Firestore se ainda não existir
      if (!userSnap.exists()) {
        console.log("Usuário novo, criando no Firestore...");

        await setDoc(userRef, {
          uid: user.uid,
          nome: user.displayName || "",
          email: user.email || "",
          admin: false,
          criadoEm: new Date()
        });

        console.log("Usuário criado com sucesso.");
      }

      const userData = (await getDoc(userRef)).data();

      // Redirecionamento baseado no perfil
      if (userData.admin) {
        navigate("/painel");
      } else {
        navigate("/inicio");
      }

    } catch (error) {
      console.error("Erro ao logar com Google:", error);
      alert("Erro ao logar com Google: " + error.message);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Login</h2>
      <button className="btn btn-danger" onClick={handleGoogleLogin}>
        Entrar com Google
      </button>
    </div>
  );
};

export default Login;
>>>>>>> 063e2937bc709c9ed9d4fc5f6e0ce9b9253aca11
