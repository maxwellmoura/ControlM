import { useState, useEffect } from 'react';
import { Modal, Button, Table } from 'react-bootstrap';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { Pie, Bar } from 'react-chartjs-2';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

function CashFlowModal({ show, onHide }) {
  const [cashFlowData, setCashFlowData] = useState({
    totalRevenue: 0,
    newSubscriptions: 0,
    renewals: 0,
    expiredPlans: 0,
  });
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [revenueByPlan, setRevenueByPlan] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const parseYMD = (str) => {
    if (!str || !/^\d{4}-\d{2}-\d{2}$/.test(str)) return null;
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  const overlaps = (a1, b1, a2, b2) => a1 <= b2 && b1 >= a2;

  useEffect(() => {
    if (!show) return;

    async function fetchCashFlowData() {
      try {
        setLoading(true);
        setError('');

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const curStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const curEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        curStart.setHours(0,0,0,0);
        curEnd.setHours(0,0,0,0);

        const monthWindows = Array.from({ length: 6 }, (_, i) => {
          const idx = 5 - i;
          const start = new Date(today.getFullYear(), today.getMonth() - idx, 1);
          const end = new Date(today.getFullYear(), today.getMonth() - idx + 1, 0);
          start.setHours(0,0,0,0);
          end.setHours(0,0,0,0);
          const label = start.toLocaleString('pt-BR', { month: 'short', year: 'numeric' });
          return { start, end, label };
        });
        const revenueByMonth = Array(6).fill(0);

        const planosSnapshot = await getDocs(collection(db, 'Planos'));
        const planosMap = new Map();
        planosSnapshot.forEach(doc => {
          const d = doc.data() || {};
          planosMap.set(d.text, Number(d.value) || 0);
        });

        const usuariosSnapshot = await getDocs(collection(db, 'Usuarios'));

        let totalRevenue = 0;
        let newSubscriptions = 0;
        let renewals = 0;
        let expiredPlans = 0;
        const revenueByPlanMap = {};

        usuariosSnapshot.forEach(docu => {
          const userData = docu.data() || {};
          const arr = Array.isArray(userData.planos) ? userData.planos : [];

          arr.forEach(plano => {
            if (!plano?.nome) return;

            const adesaoDate = parseYMD(plano.dataAdesao);
            const expiracaoDate = parseYMD(plano.dataExpiracao);
            if (!adesaoDate || !expiracaoDate) return;

            const price = Number(plano.precoNaAdesao ?? planosMap.get(plano.nome) ?? 0);

            if (overlaps(adesaoDate, expiracaoDate, curStart, curEnd)) {
              totalRevenue += price;
              revenueByPlanMap[plano.nome] = (revenueByPlanMap[plano.nome] || 0) + price;
            }

            if (expiracaoDate < today) expiredPlans++;

            const adesaoInCurMonth =
              adesaoDate.getMonth() === curStart.getMonth() &&
              adesaoDate.getFullYear() === curStart.getFullYear();

            if (adesaoInCurMonth) {
              const hadPrevious = arr.some(p2 => {
                if (p2 === plano || p2?.nome !== plano.nome) return false;
                const a2 = parseYMD(p2.dataAdesao);
                return a2 && a2 < curStart;
              });
              if (hadPrevious) renewals++;
              else newSubscriptions++;
            }

            monthWindows.forEach((mw, idx) => {
              if (overlaps(adesaoDate, expiracaoDate, mw.start, mw.end)) {
                revenueByMonth[idx] += price;
              }
            });
          });
        });

        setCashFlowData({
          totalRevenue: totalRevenue.toFixed(2),
          newSubscriptions,
          renewals,
          expiredPlans,
        });
        setRevenueTrend(revenueByMonth.map(v => Number(v.toFixed(2))));
        setRevenueByPlan(revenueByPlanMap);
        setLoading(false);
      } catch (err) {
        console.error('Erro ao carregar dados de fluxo de caixa:', err);
        setError('Erro ao carregar dados de fluxo de caixa.');
        setLoading(false);
      }
    }

    fetchCashFlowData();
  }, [show]);

  const moeda = (n) => Number(n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  function gerarRelatorioFinanceiroPDF() {
    const doc = new jsPDF();
    const hojeBR = new Date().toLocaleDateString('pt-BR');

    doc.setFontSize(14);
    doc.text('Relatório Financeiro - ControlM', 14, 16);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${hojeBR}`, 14, 22);

    autoTable(doc, {
      startY: 28,
      head: [['Métrica', 'Valor']],
      body: [
        ['Novas Assinaturas', String(cashFlowData.newSubscriptions || 0)],
        ['Renovações', String(cashFlowData.renewals || 0)],
        ['Planos Expirados', String(cashFlowData.expiredPlans || 0)],
        ['Receita Total (Mês Atual)', moeda(cashFlowData.totalRevenue)],
      ],
    });

    let y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 8 : 28;

    const receitaPorPlano = Object.entries(revenueByPlan || {});
    if (receitaPorPlano.length > 0) {
      autoTable(doc, {
        startY: y,
        head: [['Plano', 'Receita (R$)']],
        body: receitaPorPlano.map(([nome, valor]) => [nome, moeda(valor)]),
      });
      y = doc.lastAutoTable.finalY + 8;
    }

    const labels6m = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return d.toLocaleString('pt-BR', { month: 'short', year: 'numeric' });
    });
    if (Array.isArray(revenueTrend) && revenueTrend.length > 0) {
      autoTable(doc, {
        startY: y,
        head: [['Mês', 'Receita (R$)']],
        body: labels6m.map((label, i) => [label, moeda(revenueTrend[i] || 0)]),
      });
    }

    doc.save(`relatorio_financeiro_${new Date().toISOString().slice(0,10)}.pdf`);
  }

  const pieChartData = {
    labels: Object.keys(revenueByPlan),
    datasets: [
      {
        label: 'Receita por Plano (R$)',
        data: Object.values(revenueByPlan),
        backgroundColor: ['#0d6efd','#198754','#dc3545','#ffc107','#20c997','#6610f2','#fd7e14'],
        borderColor: '#fff',
        borderWidth: 1,
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Distribuição da Receita por Plano' },
    },
  };

  const barChartData = {
    labels: Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return d.toLocaleString('pt-BR', { month: 'short', year: 'numeric' });
    }),
    datasets: [
      {
        label: 'Receita Mensal (R$)',
        data: revenueTrend,
        backgroundColor: '#0d6efd',
        borderColor: '#0b5ed7',
        borderWidth: 1,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Tendência de Receita (Últimos 6 Meses)' },
    },
    scales: { y: { beginAtZero: true } },
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Fluxo de Caixa - Mês Atual</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <div className="alert alert-danger py-2 text-center">{error}</div>}
        {loading ? (
          <p className="text-center">Carregando dados...</p>
        ) : (
          <>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Métrica</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Novas Assinaturas</td>
                  <td>{cashFlowData.newSubscriptions}</td>
                </tr>
                <tr>
                  <td>Renovações</td>
                  <td>{cashFlowData.renewals}</td>
                </tr>
                <tr>
                  <td>Planos Expirados</td>
                  <td>{cashFlowData.expiredPlans}</td>
                </tr>
                <tr>
                  <td>Receita Total (Mês Atual)</td>
                  <td>R$ {cashFlowData.totalRevenue}</td>
                </tr>
              </tbody>
            </Table>

            <div className="row g-3 mt-2">
              <div className="col-12 col-lg-6">
                <div style={{ height: 320 }}>
                  <Pie data={pieChartData} options={pieChartOptions} />
                </div>
              </div>
              <div className="col-12 col-lg-6">
                <div style={{ height: 320 }}>
                  <Bar data={barChartData} options={barChartOptions} />
                </div>
              </div>
            </div>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={gerarRelatorioFinanceiroPDF}>
          Baixar Relatório PDF
        </Button>
        <Button variant="secondary" onClick={onHide}>
          Fechar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default CashFlowModal;
