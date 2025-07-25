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

