import { addPlansAcess, setPlansAcess, updatePlansAcess } from '../services/plansAcess';

export async function addDoc(body) {
  const response = await addPlansAcess(body);
  return response.id;
}

export async function setDoc(body) {
  const response = await setPlansAcess(body);
  return response;
}

export async function updateDoc(id, dados) {
  const response = await updatePlansAcess(id, dados);
  return response;
}
