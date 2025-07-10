import { addPlansAcess, setPlansAcess } from "../dataAcess/plansAcess";

export async function addDoc(body) {
  const response = await addPlansAcess(body);
  return response.id;
}

export async function setDoc(body) {
  const response = await setPlansAcess(body);
  return response;
}
