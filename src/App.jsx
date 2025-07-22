<<<<<<< HEAD
// Pages
import LoginPage from './components/LoginPage';
import Cadastro from './components/Cadastro';
import Painel from './components/Painel';
import LandingPage from './components/LandingPage'

// React Router
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Services e BD
import PrivateRoute from './services/dataAcess/PrivateRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<LoginPage />} />
        <Route path="/inicio" element={<LandingPage />} />
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
=======
// Pages
import LoginPage from './components/LoginPage';
import Cadastro from './components/Cadastro';
import Painel from './components/Painel';
<<<<<<< HEAD
import LandingPage from './components/LandingPage';
=======
>>>>>>> cbf912b9474ebed377623fd99197e6d4ddf7b13d

// React Router
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Services e BD
import PrivateRoute from './services/dataAcess/PrivateRoute';
<<<<<<< HEAD


function App() {
=======
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
>>>>>>> cbf912b9474ebed377623fd99197e6d4ddf7b13d

  return (
    <Router>
      <Routes>
<<<<<<< HEAD
        <Route path="/admin" element={<LoginPage />} />
        <Route path="/inicio" element={<LandingPage />} />
=======
        <Route path="/" element={<LoginPage />} />
>>>>>>> cbf912b9474ebed377623fd99197e6d4ddf7b13d
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
>>>>>>> 62d0858d6073ccc8a523f3f6a32c26db9ab369f7
