import Header from '../components/pages/Header';
import EsportesSection from '../components/EsportesSection';
import PlanosSection from '../components/PlanoSection';
import Footer from '../components/pages/Footer';
import Dashboard from './pages/Dashboard';

export default function LandingPage() {
  return (
    <>
      <Header />
      <EsportesSection />
      <PlanosSection />
      <Dashboard />
      <Footer />
    </>
  );
}
