export default function EsportesSection() {
    const esportes = ['Musculação', 'Jiu-Jitsu', 'Pilates', 'Zumba', 'Boxe'];
  
    return (
      <section className="container my-5">
        <h2 className="mb-4 text-center">Esportes Disponíveis</h2>
        <ul className="list-group">
          {esportes.map((esporte, index) => (
            <li key={index} className="list-group-item">
              {esporte}
            </li>
          ))}
        </ul>
      </section>
    );
  }
  