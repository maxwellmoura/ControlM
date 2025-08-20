// src/components/PainelAdm.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { Button, Table } from 'react-bootstrap';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Header from '../components/pages/Header';
import Footer from '../components/pages/Footer';
import UserTable from './UserTable';
import UserEditModal from './UserEditModal';
import UserPlansModal from './UserPlansModal';
import PlanAdeptosModal from './PlanAdeptosModal';
import PlanoForm from './PlanoForm';
import CashFlowModal from './CashFlowModal';
import OverdueUsersModal from './OverdueUsersModal';
import {
  calcularValorTotalPlanos,
  obterDataVencimentoMaisRecente,
  verificarAdmin,          // mantém o verificador que você já usa no projeto
  contarAdeptosPlano,
} from '../services/adminService';
import 'bootstrap/dist/css/bootstrap.min.css';

// Firestore (tempo real e operações)
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

function PainelAdm() {
  const [usuarios, setUsuarios] = useState([]);
  const [planos, setPlanos] = useState([]);
  const [adeptosPorPlano, setAdeptosPorPlano] = useState({});
  const [editandoUsuario, setEditandoUsuario] = useState(null);
  const [editandoPlano, setEditandoPlano] = useState(null);
  const [mostrarPlanosUsuario, setMostrarPlanosUsuario] = useState(null);
  const [mostrarAdeptosPlano, setMostrarAdeptosPlano] = useState(null);
  const [mostrarCashFlow, setMostrarCashFlow] = useState(false);
  const [mostrarOverdueUsers, setMostrarOverdueUsers] = useState(false);
  const [erro, setErro] = useState('');
  const navigate = useNavigate();
  const auth = getAuth();

  // Guarda unsubscribers para limpar listeners
  useEffect(() => {
    let unsubUsuarios = null;
    let unsubPlanos = null;

    verificarAdmin(auth, navigate).then(({ isAdmin, error }) => {
      if (!isAdmin) {
        setErro(error);
        navigate(error.includes('logado') ? '/inicio' : '/');
        return;
      }

      // 🔴 Tempo real: Usuarios
      unsubUsuarios = onSnapshot(
        collection(db, 'Usuarios'),
        (snap) => {
          const lista = snap.docs.map((d) => {
            const data = d.data() || {};
            return {
              id: d.id,
              nome: data.nome || 'Sem nome',
              email: data.email || 'N/A',
              planos: Array.isArray(data.planos) ? data.planos : [],
              ehAdmin: !!data.admin,
              telefone: data.telefone || '',
              criadoEm: data.criadoEm || 'N/A',
            };
          });
          setUsuarios(lista);
        },
        (err) => {
          console.error('Erro (onSnapshot Usuarios):', err);
          setErro('Erro ao carregar usuários.');
        }
      );

      // 🔴 Tempo real: Planos
      unsubPlanos = onSnapshot(
        collection(db, 'Planos'),
        (snap) => {
          const lista = snap.docs.map((d) => {
            const data = d.data() || {};
            return {
              id: d.id,
              text: data.text || 'Plano sem nome',
              value: Number(data.value) || 0,
            };
          });
          setPlanos(lista);
        },
        (err) => {
          console.error('Erro (onSnapshot Planos):', err);
          setErro('Erro ao carregar planos.');
        }
      );
    });

    return () => {
      if (unsubUsuarios) unsubUsuarios();
      if (unsubPlanos) unsubPlanos();
    };
  }, [navigate, auth]);

  // 🔵 Recalcula adeptosPorPlano sempre que usuarios/planos mudarem
  useEffect(() => {
    // nomePlano -> array de { id, nome, email, telefone, adesoes }
    const mapa = {};

    usuarios.forEach((u) => {
      const arr = Array.isArray(u.planos) ? u.planos : [];
      // conta quantas adesões do mesmo plano o usuário tem
      const counts = new Map();
      arr.forEach((p) => {
        if (!p?.nome) return;
        counts.set(p.nome, (counts.get(p.nome) || 0) + 1);
      });

      counts.forEach((qtd, planoNome) => {
        if (!mapa[planoNome]) mapa[planoNome] = [];
        mapa[planoNome].push({
          id: u.id,
          nome: u.nome,
          email: u.email,
          telefone: u.telefone,
          adesoes: qtd,
        });
      });
    });

    setAdeptosPorPlano(mapa);
  }, [usuarios, planos]);

  function gerarRelatorioPDF() {
    const docPdf = new jsPDF();
    docPdf.text('Relatório de Usuários - ControlM', 10, 10);
    docPdf.text('Data: ' + new Date().toLocaleDateString('pt-BR'), 10, 20);

    const dados = usuarios.map((usuario) => {
      const vencimento = obterDataVencimentoMaisRecente(usuario.planos);
      return [
        usuario.nome || 'Sem nome',
        usuario.email || 'N/A',
        usuario.telefone || 'N/A',
        usuario.planos.length > 0
          ? usuario.planos.map((p) => p.nome || 'N/A').join(', ')
          : 'Nenhum',
        usuario.ehAdmin ? 'Sim' : 'Não',
        vencimento.texto,
        calcularValorTotalPlanos(usuario.planos, planos),
      ];
    });

    autoTable(docPdf, {
      startY: 30,
      head: [['Nome', 'E-mail', 'Telefone', 'Planos', 'Admin', 'Vencimento', 'Valor Total']],
      body: dados,
    });

    docPdf.save('relatorio_usuarios.pdf');
  }

  function abrirEdicaoUsuario(usuario) {
    setEditandoUsuario(usuario);
  }

  function abrirEdicaoPlano(plano) {
    setEditandoPlano(plano);
  }

  function abrirDetalhesPlanos(usuario) {
    setMostrarPlanosUsuario(usuario);
  }

  function abrirAdeptosPlano(planoNome) {
    setMostrarAdeptosPlano(planoNome);
  }

  // ✅ Agora não chamamos mais "carregarPlanos" ao salvar/excluir: os listeners cuidam do refresh
  async function handleSalvarPlano(dados) {
    try {
      if (editandoPlano) {
        await updateDoc(doc(db, 'Planos', editandoPlano.id), {
          text: dados.text,
          value: Number(dados.value) || 0,
        });
        setEditandoPlano(null);
      } else {
        await addDoc(collection(db, 'Planos'), {
          text: dados.text,
          value: Number(dados.value) || 0,
        });
      }
    } catch (error) {
      console.error('Erro ao salvar plano:', error);
      setErro('Erro ao salvar plano.');
    }
  }

  async function handleExcluirPlano(id) {
    if (!window.confirm('Tem certeza que deseja excluir este plano?')) return;
    try {
      await deleteDoc(doc(db, 'Planos', id));
      // onSnapshot fará o restante
    } catch (error) {
      console.error('Erro ao excluir plano:', error);
      setErro('Erro ao excluir plano.');
    }
  }

  return (
    <div className="container mt-5">
      <Header />
      <h2 className="text-center mb-4">Painel Administrativo</h2>
      {erro && <div className="alert alert-danger py-2 text-center">{erro}</div>}

      <h4>Usuários</h4>
      <Button onClick={gerarRelatorioPDF} className="me-2">Gerar Relatório PDF</Button>
      <Button onClick={() => setMostrarCashFlow(true)} className="me-2">Ver Fluxo de Caixa</Button>
      <Button onClick={() => setMostrarOverdueUsers(true)}>Ver Inadimplentes</Button>

      <UserTable
        usuarios={usuarios}
        planos={planos}
        abrirEdicaoUsuario={abrirEdicaoUsuario}
        abrirDetalhesPlanos={abrirDetalhesPlanos}
        // exclusão de usuário pode continuar vindo do seu service, se quiser
        excluirUsuario={async (id) => {
          if (!window.confirm('Quer mesmo excluir este usuário?')) return;
          try {
            await deleteDoc(doc(db, 'Usuarios', id));
          } catch (e) {
            console.error('Erro ao excluir usuário:', e);
            setErro('Erro ao excluir usuário.');
          }
        }}
      />

      <h4 className="mt-4">Planos</h4>
      <PlanoForm
        onSubmit={handleSalvarPlano}
        planoEditar={editandoPlano}
        cancelar={() => setEditandoPlano(null)}
      />

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Preço</th>
            <th>Adeptos</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {planos.map((plano) => {
            const total = contarAdeptosPlano(plano.text, adeptosPorPlano);
            return (
              <tr key={plano.id}>
                <td>{plano.text}</td>
                <td>R$ {Number(plano.value).toFixed(2)}</td>
                <td
                  style={{ cursor: total > 0 ? 'pointer' : 'default' }}
                  onClick={() => total > 0 && abrirAdeptosPlano(plano.text)}
                >
                  {total}
                </td>
                <td>
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={() => abrirEdicaoPlano(plano)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    className="ms-2"
                    onClick={() => handleExcluirPlano(plano.id)}
                  >
                    Excluir
                  </Button>
                </td>
              </tr>
            );
          })}
          {planos.length === 0 && (
            <tr>
              <td colSpan="4" className="text-center text-muted">
                Nenhum plano cadastrado.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <UserEditModal
        editandoUsuario={editandoUsuario}
        setEditandoUsuario={setEditandoUsuario}
        planos={planos}
        // ao salvar dentro do modal, o onSnapshot atualiza a tabela automaticamente
        carregarUsuarios={() => {}}
      />
      <UserPlansModal
        mostrarPlanosUsuario={mostrarPlanosUsuario}
        setMostrarPlanosUsuario={setMostrarPlanosUsuario}
      />
      <PlanAdeptosModal
        mostrarAdeptosPlano={mostrarAdeptosPlano}
        setMostrarAdeptosPlano={setMostrarAdeptosPlano}
        adeptosPorPlano={adeptosPorPlano}
      />
      <CashFlowModal
        show={mostrarCashFlow}
        onHide={() => setMostrarCashFlow(false)}
      />
      <OverdueUsersModal
        show={mostrarOverdueUsers}
        onHide={() => setMostrarOverdueUsers(false)}
      />
      <Footer />
    </div>
  );
}

export default PainelAdm;
