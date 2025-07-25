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
