export default function PlanosSection() {
    const planos = [
      { nome: 'Plano Básico', valor: 99 },
      { nome: 'Plano Premium', valor: 149 },
      { nome: 'Plano Ilimitado', valor: 199 },
    ];
  
    return (
      <section className="container my-5">
        <h2 className="mb-4 text-center">Planos e Preços</h2>
        <div className="row">
          {planos.map((plano, index) => (
            <div key={index} className="col-md-4 mb-3">
              <div className="card text-center">
                <div className="card-body">
                  <h5 className="card-title">{plano.nome}</h5>
                  <p className="card-text">R$ {plano.valor}/mês</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }
  