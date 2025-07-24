import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';
import jiuKids from '../../src/assets/esportes/jiujitsu-kids.jpg';
import jiuAdulto from '../../src/assets/esportes/jiujitsu-adulto.jpg';
import jiuBaby from '../../src/assets/esportes/jiujitsu-baby.jpg';
import kickboxer from '../../src/assets/esportes/kickboxer.jpeg';
<<<<<<< HEAD

export default function EsportesSection() {
=======
import { useState } from 'react';
import Modal from 'react-bootstrap/Modal';

export default function EsportesSection() {
  const [imagemExpandida, setImagemExpandida] = useState(null);

  const esportes = [
    {
      imagem: jiuKids,
      titulo: 'Jiu-Jitsu Kids',
      descricao: 'Disciplina, confiança e muita diversão para os pequenos.',
    },
    {
      imagem: jiuAdulto,
      titulo: 'Jiu-Jitsu Adulto',
      descricao: 'Treinamento intenso com foco em técnica, defesa pessoal e performance.',
    },
    {
      imagem: jiuBaby,
      titulo: 'Jiu-Jitsu Baby',
      descricao: 'Iniciação ao esporte com atividades lúdicas para crianças pequenas.',
    },
    {
      imagem: kickboxer,
      titulo: 'KickBoxer',
      descricao: 'Condicionamento físico e técnicas de combate para todas as idades.',
    },
  ];

>>>>>>> 063e2937bc709c9ed9d4fc5f6e0ce9b9253aca11
  return (
    <div className="container py-5">
      <h2 className="text-center mb-5 fw-bold">Nossos Esportes</h2>
      <div className="row g-4">
<<<<<<< HEAD
        
        <div className="col-md-6 col-lg-3">
          <div className="card esporte-card h-100 shadow-sm">
            <img src={jiuKids} className="card-img-top" alt="Jiu-Jitsu Kids" />
            <div className="card-body">
              <h5 className="card-title">Jiu-Jitsu Kids</h5>
              <p className="card-text">Disciplina, confiança e muita diversão para os pequenos.</p>
            </div>
          </div>
        </div>

       
        <div className="col-md-6 col-lg-3">
          <div className="card esporte-card h-100 shadow-sm">
            <img src={jiuAdulto} className="card-img-top" alt="Jiu-Jitsu Adulto" />
            <div className="card-body">
              <h5 className="card-title">Jiu-Jitsu Adulto</h5>
              <p className="card-text">Treinamento intenso com foco em técnica, defesa pessoal e performance.</p>
            </div>
          </div>
        </div>

        
        <div className="col-md-6 col-lg-3">
          <div className="card esporte-card h-100 shadow-sm">
            <img src={jiuBaby} className="card-img-top" alt="Jiu-Jitsu Baby" />
            <div className="card-body">
              <h5 className="card-title">Jiu-Jitsu Baby</h5>
              <p className="card-text">Iniciação ao esporte com atividades lúdicas para crianças pequenas.</p>
            </div>
          </div>
        </div>

        
        <div className="col-md-6 col-lg-3">
          <div className="card esporte-card h-100 shadow-sm">
            <img src={kickboxer} className="card-img-top" alt="KickBoxer" />
            <div className="card-body">
              <h5 className="card-title">KickBoxer</h5>
              <p className="card-text">Condicionamento físico e técnicas de combate para todas as idades.</p>
            </div>
          </div>
        </div>
      </div>
=======
        {esportes.map((e, i) => (
          <div key={i} className="col-md-6 col-lg-3">
            <div className="card esporte-card h-100 shadow-sm">
              <img
                src={e.imagem}
                className="card-img-top"
                alt={e.titulo}
                onClick={() => setImagemExpandida(e)}
                style={{ cursor: 'pointer' }}
              />
              <div className="card-body">
                <h5 className="card-title">{e.titulo}</h5>
                <p className="card-text">{e.descricao}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      
      <Modal
        show={!!imagemExpandida}
        onHide={() => setImagemExpandida(null)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>{imagemExpandida?.titulo}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <img
            src={imagemExpandida?.imagem}
            alt={imagemExpandida?.titulo}
            className="img-fluid"
          />
        </Modal.Body>
      </Modal>
>>>>>>> 063e2937bc709c9ed9d4fc5f6e0ce9b9253aca11
    </div>
  );
}
