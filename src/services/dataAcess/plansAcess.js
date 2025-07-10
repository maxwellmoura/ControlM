import { db } from "../../firebaseConfig";
import { collection, addDoc, setDoc, doc } from "firebase/firestore";

const plansReference = collection(db, "Planos");

export async function addPlansAcess(body) {
  if (!body || typeof body !== 'object') {
    throw new Error("Dados inválidos: 'body' deve ser um objeto.");
  }
  const response = await addDoc(plansReference, body);
  return response;
}

export async function setPlansAcess(body) {
  if (!body || typeof body !== 'object') {
    throw new Error("Dados inválidos: 'body' deve ser um objeto.");
  }
  const newDocRef = doc(plansReference);
  const response = await setDoc(newDocRef, body);
  return response;
}
