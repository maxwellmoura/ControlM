// mock firebase config and firestore functions before importing the module
jest.mock('../src/config/firebaseConfig', () => ({ db: {} }));

jest.mock('firebase/firestore', () => {
  const addDoc = jest.fn();
  const getDocs = jest.fn();
  const updateDoc = jest.fn();
  const deleteDoc = jest.fn();
  const setDoc = jest.fn();
  const collection = jest.fn(() => ({}));
  const doc = jest.fn(() => ({}));
  return { collection, addDoc, getDocs, updateDoc, deleteDoc, setDoc, doc };
});

import {
  getPlansAcess,
  addPlansAcess,
  updatePlansAcess,
  deletePlansAcess,
  obterUsuariosPorPlano,
} from '../src/services/plansAcess';

const firestore = require('firebase/firestore');

describe('plansAcess service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getPlansAcess returns mapped plans', async () => {
    firestore.getDocs.mockResolvedValue({
      docs: [
        { id: 'p1', data: () => ({ text: 'Plano A', value: 10 }) },
        { id: 'p2', data: () => ({ text: 'Plano B', value: 5 }) },
      ],
    });

    const planos = await getPlansAcess();
    expect(planos).toHaveLength(2);
    expect(planos[0]).toMatchObject({ id: 'p1', text: 'Plano A', value: 10 });
  });

  test('addPlansAcess validates input', async () => {
    expect(() => addPlansAcess({ text: '', value: 0 })).toThrow();
  });

  test('addPlansAcess calls addDoc when valid', async () => {
    firestore.addDoc.mockResolvedValue({ id: 'new' });
    await expect(addPlansAcess({ text: 'X', value: 12 })).resolves.toBeDefined();
    expect(firestore.addDoc).toHaveBeenCalled();
  });

  test('updatePlansAcess validates input', async () => {
    expect(() => updatePlansAcess(null, { text: 'x', value: 1 })).toThrow();
  });

  test('deletePlansAcess validates input', async () => {
    expect(() => deletePlansAcess(null)).toThrow();
  });

  test('obterUsuariosPorPlano returns users matching plan', async () => {
    // mock snapshot.forEach behavior
    const docs = [
      {
        id: 'u1',
        data: () => ({
          nome: 'A',
          planos: [{ nome: 'MeuPlano', dataExpiracao: '2020-01-01' }],
          telefone: '119',
        }),
      },
      {
        id: 'u2',
        data: () => ({ nome: 'B', planos: [{ nome: 'OutroPlano' }], telefone: '' }),
      },
    ];
    firestore.getDocs.mockResolvedValue({
      forEach: (cb) => docs.forEach((d) => cb(d)),
    });

    const usuarios = await obterUsuariosPorPlano('MeuPlano');
    expect(usuarios).toHaveLength(1);
    expect(usuarios[0]).toMatchObject({ id: 'u1', nome: 'A' });
  });
});
