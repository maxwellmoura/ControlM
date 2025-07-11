// Pages
import LoginPage from './components/LoginPage';
import Cadastro from './components/Cadastro';
import Painel from './components/Painel';

// React Router
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Services e BD
import PrivateRoute from './services/dataAcess/PrivateRoute';
import { addPlansAcess, updatePlansAcess } from './services/dataAcess/plansAcess';

import { useEffect } from 'react';

function App() {
  // useEffect(() => {
  //   // Apenas para testes (você pode remover depois)
  //   async function executarTestes() {
  //     try {
  //       const novoPlano = await addPlansAcess({ text: "Plano Inicial", value: 100 });
  //       await updatePlansAcess(novoPlano.id, { text: "Plano Atualizado", value: 120 });
  //     } catch (error) {
  //       console.error('Erro nos testes de plano:', error);
  //     }
  //   }

  //   executarTestes();
  // }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route
          path="/painel"
          element={
            <PrivateRoute>
              <Painel />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;
