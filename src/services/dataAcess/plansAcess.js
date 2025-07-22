import { db } from "../../firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

const plansReference = collection(db, "Planos");

export async function addPlansAcess(body) {
  if (!body || typeof body !== "object") {
    throw new Error("Dados inválidos: 'body' deve ser um objeto.");
  }
  return await addDoc(plansReference, body);
}

export async function getPlansAcess() {
  const snapshot = await getDocs(plansReference);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function updatePlansAcess(id, body) {
  if (!id || !body || typeof body !== "object") {
    throw new Error("ID ou body inválido.");
  }
  const docRef = doc(db, "Planos", id);
  return await updateDoc(docRef, body);
}

export async function deletePlansAcess(id) {
  if (!id) throw new Error("ID inválido para exclusão.");
  const docRef = doc(db, "Planos", id);
  return await deleteDoc(docRef);
}
