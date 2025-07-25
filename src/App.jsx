import LoginPage from './components/LoginPage';
import Cadastro from './components/Cadastro';
import PainelAdm from './components/PainelAdm';
import LandingPage from './components/LandingPage';
import EditarCadastro from './components/EditarCadastro';
import MudarPlano from './components/MudarPlano';
import Pagamento from './components/Pagamento';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PrivateRoute from '../src/services/dataAcess/PrivateRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<LoginPage />} />
        <Route path="/inicio" element={<LoginPage />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/painel" element={<PrivateRoute><PainelAdm /></PrivateRoute>} />
        <Route path="/editar-cadastro" element={<EditarCadastro />} />
        <Route path="/mudar-plano" element={<MudarPlano />} />
        <Route path="/pagamento" element={<Pagamento />} />
        <Route path="*" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;