// mock firebase config and plansAcess to avoid Vite-specific import.meta usage
jest.mock('../src/config/firebaseConfig', () => ({ db: {} }));
jest.mock('../src/services/plansAcess', () => ({
  obterUsuariosPorPlano: jest.fn().mockResolvedValue([]),
}));

import {
  formatarDataLocal,
  formatarDataParaExibicao,
  calcularDiasAteVencimento,
  calcularValorTotalPlanos,
  obterDataVencimentoMaisRecente,
  contarAdeptosPlano,
  listarAdeptosPlano,
  formatarTelefone,
} from '../src/services/adminService';

describe('adminService - util functions', () => {
  test('formatarDataLocal returns YYYY-MM-DD', () => {
    const d = new Date(2025, 11, 17); // local midnight for 17 Dec 2025
    expect(formatarDataLocal(d)).toBe('2025-12-17');
  });

  test('formatarDataParaExibicao valid and invalid', () => {
    expect(formatarDataParaExibicao('2025-12-17')).toBe('17/12/2025');
    expect(formatarDataParaExibicao('invalid')).toBe('N/A');
  });

  test('calcularDiasAteVencimento works for future/past/invalid', () => {
    const hoje = new Date();
    const amanhã = new Date(hoje);
    amanhã.setDate(hoje.getDate() + 2);
    const amanhãStr = `${amanhã.getFullYear()}-${String(amanhã.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(amanhã.getDate()).padStart(2, '0')}`;
    const dias = calcularDiasAteVencimento(amanhãStr);
    expect(typeof dias).toBe('number');
    expect(calcularDiasAteVencimento('invalid-date')).toBeNull();
  });

  test('calcularValorTotalPlanos sums correctly', () => {
    const planosUsuario = [{ nome: 'A' }, { nome: 'B' }];
    const planos = [
      { text: 'A', value: 10 },
      { text: 'B', value: 5 },
    ];
    expect(calcularValorTotalPlanos(planosUsuario, planos)).toBe('R$ 15,00');
    expect(calcularValorTotalPlanos([], planos)).toBe('R$ 0,00');
  });

  test('obterDataVencimentoMaisRecente picks latest date and returns formatted', () => {
    const planosUsuario = [
      { dataExpiracao: '2025-12-01', nome: 'X' },
      { dataExpiracao: '2025-12-20', nome: 'Y' },
    ];
    const res = obterDataVencimentoMaisRecente(planosUsuario);
    expect(res.texto).toBe('20/12/2025');
    expect(res.classe).toBeDefined();
  });

  test('contarAdeptosPlano and listarAdeptosPlano', () => {
    const adeptosPorPlano = { A: [1, 2], B: [] };
    expect(contarAdeptosPlano('A', adeptosPorPlano)).toBe(2);
    expect(listarAdeptosPlano('B', adeptosPorPlano)).toEqual([]);
  });

  test('formatarTelefone formats different lengths', () => {
    expect(formatarTelefone('(11) 91234-5678')).toBe('(11) 91234-5678');
    expect(formatarTelefone('11912345678')).toBe('(11) 91234-5678');
    expect(formatarTelefone('123')).toBe('123');
    expect(formatarTelefone('')).toBe('N/A');
  });
});
