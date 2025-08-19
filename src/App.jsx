import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import PrivateRoute from './services/dataAcess/PrivateRoute';

// Lazy load dos componentes
const LoginPage = lazy(() => import('./components/LoginPage'));
const Cadastro = lazy(() => import('./components/Cadastro'));
const PainelAdm = lazy(() => import('./components/PainelAdm'));
const LandingPage = lazy(() => import('./components/LandingPage'));
const EditarCadastro = lazy(() => import('./components/EditarCadastro'));

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true }}>
      <ErrorBoundary>
        <Suspense fallback={<div>Carregando...</div>}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/inicio" element={<LoginPage />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/painel" element={<PrivateRoute><PainelAdm /></PrivateRoute>} />
            <Route path="/editar-cadastro" element={<EditarCadastro />}/>
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
