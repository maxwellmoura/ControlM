//Pages
import LoginPage from './components/LoginPage';
import Cadastro from './components/Cadastro'
import Painel from './components/Painel';
//React
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
//BD
import { addPlansAcess } from './services/dataAcess/plansAcess';
// import PrivateRoute from './PrivateRoute';

function App() {
  useEffect(() =>{
    addPlansAcess()
  },[])
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/painel" element={<Painel />} />
        <Route path="*" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;