import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../config/firebaseConfig"; // Certifique-se de que o Firebase está corretamente configurado
import "bootstrap/dist/css/bootstrap.min.css";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagemErro, setMensagemErro] = useState("");
  const [emailRecuperacao, setEmailRecuperacao] = useState("");
  const [recuperacaoVisible, setRecuperacaoVisible] = useState(false); // Para controlar a visibilidade do formulário de recuperação
  const navigate = useNavigate();
  const auth = getAuth();
  const provedorGoogle = new GoogleAuthProvider();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((usuario) => {
      if (usuario) {
        const documentoUsuario = doc(db, "Usuarios", usuario.uid);
        getDoc(documentoUsuario).then((docSnapshot) => {
          if (docSnapshot.exists()) {
            usuario.getIdTokenResult(true).then((token) => {
              if (token.claims.admin || docSnapshot.data().admin) {
                navigate("/painel");
              } else {
                navigate("/");
              }
            });
          } else {
            auth.signOut();
            setMensagemErro(
              "Conta não encontrada. Por favor, faça um novo cadastro."
            );
          }
        });
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provedorGoogle);
      const user = result.user;

      const userRef = doc(db, "Usuarios", user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          nome: user.displayName,
          email: user.email,
          foto: user.photoURL,
          criadoEm: new Date(),
        });
      }

      navigate("/painel");
    } catch (error) {
      console.error("Erro ao fazer login com o Google", error);
      setMensagemErro("Erro ao tentar fazer login com o Google");
    }
  };

  // Função para login com e-mail e senha
  const handleEmailLogin = async (evento) => {
    evento.preventDefault();
    setMensagemErro("");

    if (!email || !senha) {
      setMensagemErro("Preencha todos os campos.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, senha);
      navigate("/painel");
    } catch (error) {
      console.error("Erro no login:", error);
      if (error.code === "auth/user-not-found") {
        setMensagemErro("Usuário não encontrado.");
      } else if (error.code === "auth/wrong-password") {
        setMensagemErro("Senha incorreta.");
      } else {
        setMensagemErro("Falha no login. Tente novamente.");
      }
    }
  };

  const irParaCadastro = () => {
    navigate("/cadastro");
  };

  // Função para exibir o formulário de recuperação de senha
  const handleRecuperacaoSenha = () => {
    setRecuperacaoVisible(true);
  };

  // Função para enviar o e-mail de recuperação de senha
  const enviarEmailRecuperacao = async () => {
    if (!emailRecuperacao) {
      setMensagemErro("Por favor, insira seu e-mail.");
      return;
    }

    try {
      console.log("Enviando e-mail de recuperação para:", emailRecuperacao); // Log para verificar o e-mail
      await sendPasswordResetEmail(auth, emailRecuperacao);
      setMensagemErro(
        "E-mail de recuperação enviado! Verifique sua caixa de entrada ou seu SPAM."
      );
      setRecuperacaoVisible(false); // Fecha o formulário após enviar o e-mail
    } catch (error) {
      console.error("Erro ao enviar e-mail de recuperação:", error);

      // Tratamento de erros detalhados
      if (error.code === "auth/invalid-email") {
        setMensagemErro("O formato do e-mail é inválido.");
      } else if (error.code === "auth/user-not-found") {
        setMensagemErro("Não encontramos um usuário com esse e-mail.");
      } else if (error.code === "auth/too-many-requests") {
        setMensagemErro(
          "Muitas tentativas de recuperação. Tente novamente mais tarde."
        );
      } else {
        setMensagemErro(
          "Erro ao enviar e-mail de recuperação. Tente novamente."
        );
      }
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div
        className="card shadow-sm p-4"
        style={{ maxWidth: "400px", width: "100%" }}
      >
        <div className="text-center mb-4">
          <img
            src="../src/assets/logo.png"
            alt="Logo ControlM"
            className="img-fluid mb-3"
            style={{ maxHeight: "80px" }}
          />
          <h4 className="fw-bold">
            Login - Control<span className="fs-1">M</span>
          </h4>
        </div>
        <form onSubmit={handleEmailLogin}>
          <div className="mb-3">
            <label className="form-label">E-mail</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(evento) => setEmail(evento.target.value)}
              placeholder="exemplo@gmail.com"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Senha</label>
            <input
              type="password"
              className="form-control"
              value={senha}
              onChange={(evento) => setSenha(evento.target.value)}
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
            onClick={handleGoogleLogin}
            className="btn btn-outline-danger w-100 mb-2"
          >
            Entrar com Google
          </button>

          {/* Link para a recuperação de senha */}
          <div className="text-center mt-3">
            <button
              onClick={handleRecuperacaoSenha}
              className="btn btn-link p-0"
              type="button"
            >
              Esqueceu a senha?
            </button>
          </div>

          {/* Formulário para recuperação de senha */}
          {recuperacaoVisible && (
            <div className="mt-3">
              <input
                type="email"
                className="form-control"
                placeholder="Digite seu e-mail"
                value={emailRecuperacao}
                onChange={(e) => setEmailRecuperacao(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-warning w-100 mt-2"
                onClick={enviarEmailRecuperacao}
              >
                Enviar e-mail de recuperação
              </button>
            </div>
          )}

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
