// src/components/PainelAdm.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { Button, Table } from 'react-bootstrap';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Header from '../components/pages/Header';
import Footer from '../components/pages/Footer';
import FeedbackAdmin from './pages/FeedbackAdmin';
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
  orderBy,
  query,
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
  const [carregando, setCarregando] = useState(true);

  const navigate = useNavigate();
  const auth = getAuth();

  // guardamos unsubscribers para limpar listeners
  const unsubUsuariosRef = useRef(null);
  const unsubPlanosRef = useRef(null);

  useEffect(() => {
    let cancelado = false;

    async function init() {
      try {
        setErro('');
        setCarregando(true);

        const user = auth.currentUser;

        // Não logado -> manda para login
        if (!user) {
          setCarregando(false);
          setErro('Você precisa estar logado para acessar o painel.');
          navigate('/inicio', { replace: true });
          return;
        }

        // força refresh de token para garantir claims atualizadas
        try {
          await user.getIdToken(true);
        } catch {
          // mesmo que falhe o refresh, seguimos tentando verificar
        }

        // compatibilidade: verificarAdmin pode retornar boolean OU objeto {isAdmin, error}
        let isAdmin = false;
        let vResult;
        try {
          vResult = await verificarAdmin(auth, navigate);
        } catch {
          vResult = false;
        }

        if (typeof vResult === 'object' && vResult !== null) {
          isAdmin = !!vResult.isAdmin;
          if (!isAdmin && vResult.error) {
            setErro(vResult.error);
          }
        } else {
          isAdmin = !!vResult;
        }

        if (!isAdmin) {
          setCarregando(false);
          if (!cancelado) {
            setErro((prev) => prev || 'Acesso negado: esta área é restrita a administradores.');
            // se não é admin, redireciona para a home
            navigate('/', { replace: true });
          }
          return;
        }

        // Somente admins chegam aqui -> iniciamos listeners
        // Usuarios (ordenado opcionalmente por createdAt/updatedAt se existirem)
        const qUsuarios = query(collection(db, 'Usuarios'), orderBy('createdAt', 'desc'));
        unsubUsuariosRef.current = onSnapshot(
          qUsuarios,
          (snap) => {
            if (cancelado) return;
            const lista = snap.docs.map((d) => {
              const data = d.data() || {};
              return {
                id: d.id,
                nome: data.nome || data.displayName || 'Sem nome',
                email: data.email || 'N/A',
                planos: Array.isArray(data.planos) ? data.planos : [],
                ehAdmin: !!data.admin, // apenas decorativo; permissão real é claim no token
                telefone: data.telefone || '',
                criadoEm: data.createdAt || data.criadoEm || null,
                updatedAt: data.updatedAt || null,
                photoURL: data.photoURL || null,
              };
            });
            setUsuarios(lista);
            setCarregando(false);
          },
          (err) => {
            console.error('Erro (onSnapshot Usuarios):', err);
            if (cancelado) return;
            setErro('Não foi possível carregar usuários. Verifique suas permissões.');
            setCarregando(false);
            // Em caso de permissão negada, fechamos o listener por segurança
            if (unsubUsuariosRef.current) {
              unsubUsuariosRef.current();
              unsubUsuariosRef.current = null;
            }
          }
        );

        // Planos
        const qPlanos = query(collection(db, 'Planos'), orderBy('text', 'asc'));
        unsubPlanosRef.current = onSnapshot(
          qPlanos,
          (snap) => {
            if (cancelado) return;
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
            if (cancelado) return;
            setErro('Não foi possível carregar planos. Verifique suas permissões.');
            // Se der permissão negada, encerra listener
            if (unsubPlanosRef.current) {
              unsubPlanosRef.current();
              unsubPlanosRef.current = null;
            }
          }
        );
      } catch (e) {
        console.error('Falha ao iniciar PainelAdm:', e);
        if (!cancelado) {
          setErro('Falha ao iniciar o painel. Tente novamente.');
          setCarregando(false);
        }
      }
    }

    init();

    return () => {
      cancelado = true;
      if (unsubUsuariosRef.current) {
        unsubUsuariosRef.current();
        unsubUsuariosRef.current = null;
      }
      if (unsubPlanosRef.current) {
        unsubPlanosRef.current();
        unsubPlanosRef.current = null;
      }
    };
  }, [navigate, auth]);

  // Recalcula adeptosPorPlano sempre que usuarios/planos mudarem
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

  // As operações de CRUD de Planos ficam sob as regras do Firestore (admin)
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

      {carregando && (
        <div className="alert alert-info py-2 text-center">Carregando...</div>
      )}

      {!carregando && erro && (
        <div className="alert alert-danger py-2 text-center">{erro}</div>
      )}

      {!carregando && !erro && (
        <>
          <h4>Usuários</h4>
          <Button onClick={gerarRelatorioPDF} className="me-2">Gerar Relatório PDF</Button>
          <Button onClick={() => setMostrarCashFlow(true)} className="me-2">Ver Fluxo de Caixa</Button>
          <Button onClick={() => setMostrarOverdueUsers(true)}>Ver Inadimplentes</Button>

          <UserTable
            usuarios={usuarios}
            planos={planos}
            abrirEdicaoUsuario={abrirEdicaoUsuario}
            abrirDetalhesPlanos={abrirDetalhesPlanos}
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
          <FeedbackAdmin />
        </>
      )}

      <Footer />
    </div>
  );
}

export default PainelAdm;
