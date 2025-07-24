<<<<<<< HEAD
import { db } from "../../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

const usersReference = collection(db, "Usuarios");

export async function addUserAcess(user) {
  if (!user || typeof user !== "object") {
    throw new Error("Dados inválidos");
  }
  const response = await addDoc(usersReference, user);
  return response;
}
=======
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig"; 

const provider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  const auth = getAuth();

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

   
    const userRef = doc(db, "Usuarios", user.uid); 
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
     
      await setDoc(userRef, {
        uid: user.uid,
        nome: user.displayName || "Sem nome",
        email: user.email,
        admin: false,
        criadoEm: new Date(),
      });
    }

    return user;
  } catch (error) {
    console.error("Erro no login com Google:", error);
    throw error;
  }
};
>>>>>>> 063e2937bc709c9ed9d4fc5f6e0ce9b9253aca11
