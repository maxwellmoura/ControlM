import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import PrivateRoute from './services/dataAcess/PrivateRoute';

const LoginPage = lazy(() => import('./components/LoginPage'));
const Cadastro = lazy(() => import('./components/Cadastro'));
const PainelAdm = lazy(() => import('./components/PainelAdm'));
const LandingPage = lazy(() => import('./components/LandingPage'));
const EditarCadastro = lazy(() => import('./components/EditarCadastro'));

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense fallback={<div>Carregando...</div>}>
          <Routes>
            {/* Rota pública (Landing Page) */}
            <Route path="/" element={<LandingPage />} />

            {/* Rota de login */}
            <Route path="/inicio" element={<LoginPage />} />

            {/* Rota de cadastro */}
            <Route path="/cadastro" element={<Cadastro />} />

            {/* Rota protegida para painel administrativo */}
            <Route path="/painel" element={<PrivateRoute><PainelAdm /></PrivateRoute>} />

            {/* Rota para editar cadastro */}
            <Route path="/editar-cadastro" element={<EditarCadastro />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
