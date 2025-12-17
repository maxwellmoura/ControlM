import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// mock adminService used by UserTable to avoid loading firebase/config
jest.mock('../src/services/adminService', () => ({
  calcularValorTotalPlanos: (planosUsuario, planos) => {
    if (!planosUsuario || planosUsuario.length === 0) return 'R$ 0,00';
    let total = 0;
    for (const plano of planosUsuario) {
      const encontrado = planos.find((p) => p.text === (plano?.nome || ''));
      if (encontrado) total += Number(encontrado.value || 0);
    }
    return 'R$ ' + total.toFixed(2).replace('.', ',');
  },
  formatarTelefone: (telefone) => {
    if (!telefone) return 'N/A';
    const limpo = telefone.replace(/\D/g, '');
    if (limpo.length === 11) return `(${limpo.slice(0, 2)}) ${limpo.slice(2, 7)}-${limpo.slice(7)}`;
    if (limpo.length === 10) return `(${limpo.slice(0, 2)}) ${limpo.slice(2, 6)}-${limpo.slice(6)}`;
    return telefone;
  },
}));

import UserTable from '../src/components/UserTable';

describe('UserTable component', () => {
  const mockUsuarios = [
    {
      id: 'u1',
      nome: 'João',
      email: 'joao@example.com',
      telefone: '11912345678',
      planos: [{ nome: 'A' }],
      ehAdmin: false,
    },
  ];

  const mockPlanos = [{ text: 'A', value: 10 }];

  test('renders row and triggers actions', () => {
    const abrirEdicaoUsuario = jest.fn();
    const abrirDetalhesPlanos = jest.fn();
    const excluirUsuario = jest.fn();

    render(
      <UserTable
        usuarios={mockUsuarios}
        planos={mockPlanos}
        abrirEdicaoUsuario={abrirEdicaoUsuario}
        abrirDetalhesPlanos={abrirDetalhesPlanos}
        excluirUsuario={excluirUsuario}
      />
    );

    expect(screen.getByText('João')).toBeInTheDocument();
    expect(screen.getByText('joao@example.com')).toBeInTheDocument();
    expect(screen.getByText('1 plano(s)')).toBeInTheDocument();

    // abrir detalhes planos
    fireEvent.click(screen.getByText('1 plano(s)'));
    expect(abrirDetalhesPlanos).toHaveBeenCalledWith(mockUsuarios[0]);

    // editar
    fireEvent.click(screen.getByText('Editar'));
    expect(abrirEdicaoUsuario).toHaveBeenCalledWith(mockUsuarios[0]);

    // excluir
    fireEvent.click(screen.getByText('Excluir'));
    expect(excluirUsuario).toHaveBeenCalledWith('u1');
  });
});
