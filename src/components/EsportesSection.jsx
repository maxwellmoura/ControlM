import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';
import jiuKids from '../../src/assets/esportes/jiujitsu-kids.jpg';
import jiuAdulto from '../../src/assets/esportes/jiujitsu-adulto.jpg';
import jiuBaby from '../../src/assets/esportes/jiujitsu-baby.jpg';
import kickboxer from '../../src/assets/esportes/kickboxer.jpeg';
import nogi from '../../src/assets/esportes/nogi.jpeg'
import capoeira from '../assets/esportes/capoeiraadulto.jpeg'
import capoeirakids from '../assets/esportes/capoeirakids.jpeg'
import { useState } from 'react';
import Modal from 'react-bootstrap/Modal';

export default function EsportesSection() {
  const [imagemExpandida, setImagemExpandida] = useState(null);

  const esportes = [
    {
      imagem: jiuKids,
      titulo: 'Jiu-Jitsu Kids',
      descricao: 'Disciplina, confiança e muita diversão para os pequenos.',
      horario: "Horário",
      time: '18:00 as 19:00(Terças e Quintas)'
    },
    {
      imagem: jiuAdulto,
      titulo: 'Jiu-Jitsu Adulto',
      descricao: 'Treinamento intenso com foco em técnica, defesa pessoal e performance.',
      horario: "Horário",
      time: '10:00(Iniciantes), 12:00(Intermediário/Avançado), 19:00(Iniciantes) 20:15(Intermediario/Avançado) 22:00(Iniciantes)'
    },
    {
      imagem: jiuBaby,
      titulo: 'Jiu-Jitsu Baby',
      descricao: 'Iniciação ao esporte com atividades lúdicas para crianças pequenas.',
      horario: "Horário",
      time: '18:15 as 19:00(Segundas e Quartas)'
    },
    {
      imagem: kickboxer,
      titulo: 'KickBoxer',
      descricao: 'Condicionamento físico e técnicas de combate para todas as idades.',
      horario: "Horário",
      time: '8:00 as 9:00, 17:30 as 18:30, 19:00 as 20:00 e 20:00 as 21:00'
    },
     {
      imagem: nogi,
      titulo: 'No-Gi',
      descricao: 'Condicionamento físico e técnicas de combate reais sem kimono',
      horario: "Horário",
      time: '20:15(Quarta) e 19:00(Sexta)'
    },
    {
      imagem: capoeira,
      titulo: 'Capoeira',
      descricao: 'Condicionamento físico e técnicas de combate com a arte marcial mais antiga do brasil',
      horario: "Horário",
      time: '21:00(Terça e Quinta)'
    },
    {
      imagem: capoeirakids,
      titulo: 'Capoeira Kids',
      descricao: 'Condicionamento físico, técnicas e confiança para os seus pequenos ',
      horario: "Horário",
      time: '17:30 áS 18:30(Segundas e Quartas)'
    },
  ];

  return (
    <div className="container py-5">
      <h2 className="text-center mb-5 fw-bold">Nossos Esportes</h2>
      <div className="row g-4">
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
                <p className='card-text fs-5 fw-bold'>{e.horario}</p>
                <p className='card-hora'>{e.time}</p>
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
            className="img-fluid modal-img"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </Modal.Body>
      </Modal>
    </div>
  );
}