import { signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";

export default function Painel() {
  const navigate = useNavigate();

  const logout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div className="container mt-5">
      <h2>Bem-vindo ao Painel!</h2>
      <button className="btn btn-danger mt-3" onClick={logout}>
        Sair
      </button>
    </div>
  );
}
