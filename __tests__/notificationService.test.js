jest.mock('../src/config/firebaseConfig', () => ({ db: {} }));

jest.mock('firebase/firestore', () => {
  const getDocs = jest.fn();
  const collection = jest.fn(() => ({}));
  return { collection, getDocs };
});

import { getOverdueUsers } from '../src/services/notificationService';

const firestore = require('firebase/firestore');

describe('notificationService.getOverdueUsers', () => {
  beforeEach(() => jest.clearAllMocks());

  test('returns overdue users with whatsapp url', async () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5);
    const pastStr = `${pastDate.getFullYear()}-${String(pastDate.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(pastDate.getDate()).padStart(2, '0')}`;

    const docs = [
      {
        id: 'u1',
        data: () => ({
          nome: 'Joao',
          planos: [{ nome: 'PlanoX', dataExpiracao: pastStr }],
          telefone: '5511912345678',
        }),
      },
      {
        id: 'u2',
        data: () => ({
          nome: 'Maria',
          planos: [{ nome: 'PlanoY', dataExpiracao: '2099-01-01' }],
          telefone: '5511999999999',
        }),
      },
    ];

    firestore.getDocs.mockResolvedValue({ forEach: (cb) => docs.forEach((d) => cb(d)) });

    const overdue = await getOverdueUsers();
    expect(overdue).toHaveLength(1);
    expect(overdue[0]).toMatchObject({ id: 'u1', nome: 'Joao', planoNome: 'PlanoX' });
    expect(overdue[0].whatsAppUrl).toContain('https://wa.me/');
  });
});
