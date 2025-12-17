// mock firebase config so tests don't attempt to use Vite import.meta.env
jest.mock('../src/config/firebaseConfig', () => ({ db: {}, auth: {} }));

// mock firebase/auth functions used at module init
jest.mock('firebase/auth', () => ({
  getAuth: () => ({ currentUser: null }),
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signInWithPopup: jest.fn(),
  signInWithRedirect: jest.fn(),
  getRedirectResult: jest.fn(),
  GoogleAuthProvider: jest.fn().mockImplementation(() => ({})),
  signOut: jest.fn(),
  updateProfile: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));

import { signInWithEmail, signUpWithEmail } from '../src/services/authService';

describe('authService validations', () => {
  test('signInWithEmail rejects invalid email', async () => {
    await expect(signInWithEmail({ email: 'invalid', password: '123456' })).rejects.toThrow(
      'E-mail inválido.'
    );
  });

  test('signInWithEmail rejects short password', async () => {
    await expect(signInWithEmail({ email: 'a@b.com', password: '123' })).rejects.toThrow(
      'A senha deve ter no mínimo 6 caracteres.'
    );
  });

  test('signUpWithEmail rejects invalid email', async () => {
    await expect(
      signUpWithEmail({ email: 'nope', password: '123456', displayName: 'X' })
    ).rejects.toThrow('E-mail inválido.');
  });

  test('signUpWithEmail rejects short password', async () => {
    await expect(
      signUpWithEmail({ email: 'a@b.com', password: '123', displayName: 'X' })
    ).rejects.toThrow('A senha deve ter no mínimo 6 caracteres.');
  });
});
