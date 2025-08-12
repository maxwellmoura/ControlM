import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import Cadastro from './components/Cadastro';
import PainelAdm from './components/PainelAdm';
import LandingPage from './components/LandingPage';
import EditarCadastro from './components/EditarCadastro';
import PrivateRoute from './services/dataAcess/PrivateRoute';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  // Configura as rotas principais do aplicativo
  return (
    <BrowserRouter>
      <Routes>
        {/* Página de login para /inicio e /admin */}
        <Route path="/inicio" element={<LoginPage />} />
        <Route path="/admin" element={<LoginPage />} />
        {/* Página inicial com esportes e planos */}
        <Route path="/" element={<LandingPage />} />
        {/* Página de cadastro */}
        <Route path="/cadastro" element={<Cadastro />} />
        Painel administrativo, mensagem de erro na renderização protegido por PrivateRoute
        <Route path="/painel" element={<ErrorBoundary><PainelAdm /></ErrorBoundary>} />
        {/* Painel administrativo, protegido por PrivateRoute */}
        <Route path="/painel" element={<PrivateRoute><PainelAdm /></PrivateRoute>} />
        {/* Página de edição de perfil */}
        <Route path="/editar-cadastro" element={<EditarCadastro />} />
        {/* Rota padrão redireciona para login */}
        <Route path="*" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
