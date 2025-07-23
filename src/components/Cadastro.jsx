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
