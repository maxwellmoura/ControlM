import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import "bootstrap/dist/css/bootstrap.min.css";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();
  const provedorGoogle = new GoogleAuthProvider();

  async function ensureUserProfile(user) {
    if (!user?.uid) return;
    const ref = doc(db, "Usuarios", user.uid);
    const snap = await getDoc(ref);
    const base = {
      email: user.email ?? null,
      displayName: user.displayName ?? null,
      photoURL: user.photoURL ?? null,
      updatedAt: serverTimestamp(),
    };
    if (!snap.exists()) {
      await setDoc(ref, { ...base, createdAt: serverTimestamp(), role: "user" });
    } else {
      await setDoc(ref, { ...snap.data(), ...base }, { merge: true });
    }
  }

  // Processa resultado de redirect (fallback do Google)
  useEffect(() => {
    (async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          await ensureUserProfile(result.user);
          const token = await result.user.getIdTokenResult(true);
          const isAdmin = !!token.claims?.admin;
          navigate(isAdmin ? "/painel" : "/", { replace: true });
        }
      } catch (e) {
        // silencioso; usuário pode ter vindo sem redirect
        console.error("Redirect login falhou:", e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setErro("");
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), senha);
      await ensureUserProfile(cred.user);
      const token = await cred.user.getIdTokenResult(true);
      const isAdmin = !!token.claims?.admin;
      navigate(isAdmin ? "/painel" : "/", { replace: true });
    } catch (error) {
      console.error(error);
      setErro("Falha no login. Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErro("");
    setLoading(true);
    try {
      // tenta popup primeiro
      const cred = await signInWithPopup(auth, provedorGoogle);
      await ensureUserProfile(cred.user);
      const token = await cred.user.getIdTokenResult(true);
      const isAdmin = !!token.claims?.admin;
      navigate(isAdmin ? "/painel" : "/", { replace: true });
    } catch (err) {
      console.warn("Popup falhou; tentando redirect...", err?.message);
      try {
        await signInWithRedirect(auth, provedorGoogle);
        // fluxo continuará em getRedirectResult no useEffect
      } catch (e2) {
        console.error("Redirect também falhou:", e2);
        setErro("Não foi possível concluir o login com o Google.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRecuperarSenha = async () => {
    setErro("");
    if (!email) {
      setErro("Informe o e-mail para recuperar a senha.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      alert("E-mail de redefinição enviado (verifique sua caixa de entrada).");
    } catch (e) {
      console.error(e);
      setErro("Não foi possível enviar o e-mail de redefinição.");
    }
  };

  const irParaCadastro = () => navigate("/cadastro");

  return (
    <div className="container d-flex align-items-center justify-content-center" style={{ minHeight: "80vh" }}>
      <div className="w-100" style={{ maxWidth: 420 }}>
          <div className="text-center mb-4">
          <img
            src="../src/assets/logo.png"
            alt="Logo ControlM"
            className="img-fluid mb-1"
            style={{ maxHeight: "100px" }}
          />         
        </div>
        <h3 className="mb-4 text-center">Entrar Control<span className="fs-1 fst-italic">M</span></h3>

        {erro && (
          <div className="alert alert-danger py-2 text-center" role="alert">
            {erro}
          </div>
        )}

       

        <form onSubmit={handleEmailLogin}>
          <div className="mb-3">
            <label className="form-label">E-mail</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Senha</label>
            <input
              type="password"
              className="form-control"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>
          

          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
           <button
          type="button"
          className="btn btn-outline-danger w-100 mt-2"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          {loading ? "Entrando..." : "Entrar com Google"}
        </button>

          <div className="d-flex justify-content-between mt-3">
            <button
              type="button"
              className="btn btn-link p-0"
              onClick={handleRecuperarSenha}
            >
              Esqueci minha senha
            </button>
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
