import React, { useState, useEffect } from "react";
import { Spinner, Alert, Container, Row, Col } from "react-bootstrap"; // Importando componentes do Bootstrap
import FeedbackForm from "../FeedbackForm"; // Importando o FeedbackForm
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const db = getFirestore();

const Dashboard = () => {
  const [completedPlan, setCompletedPlan] = useState(null); // Variável de estado para verificar se o plano foi concluído
  const [loading, setLoading] = useState(true); // Variável de estado para carregar a verificação
  const [error, setError] = useState(""); // Mensagem de erro, caso algo dê errado
  const [feedbacks, setFeedbacks] = useState([]); // Armazenar os feedbacks carregados
  const [userName, setUserName] = useState(""); // Armazenar o nome do usuário logado
  const user = getAuth().currentUser;

  // Função para carregar feedbacks do Firestore
  const loadFeedbacks = async () => {
    if (user) {
      // Carregar feedbacks do usuário logado
      const q = query(
        collection(db, "Feedbacks"),
        where("userId", "==", user.uid)
      );
      try {
        const querySnapshot = await getDocs(q);
        console.log("Feedbacks carregados:", querySnapshot.docs);

        const feedbackList = querySnapshot.docs.map((doc) => doc.data());
        setFeedbacks(feedbackList);
        setCompletedPlan(feedbackList.length > 0); // Se já tiver feedback, marcar o plano como completado
      } catch (err) {
        console.error("Erro ao carregar feedbacks:", err);
        setError("Erro ao carregar feedbacks.");
      }
    } else {
      // Se não houver usuário logado, carregar feedbacks de todos os usuários
      const q = query(collection(db, "Feedbacks"));
      try {
        const querySnapshot = await getDocs(q);
        const feedbackList = querySnapshot.docs.map((doc) => doc.data());
        setFeedbacks(feedbackList);
        setLoading(false); // Finaliza o carregamento
      } catch (err) {
        console.error("Erro ao carregar feedbacks:", err);
        setError("Erro ao carregar feedbacks.");
      }
    }
  };

  useEffect(() => {
    if (user) {
      setUserName(user.displayName); // Define o nome do usuário logado
    } else {
      setUserName("");
    }

    loadFeedbacks(); // Carregar feedbacks ao iniciar
  }, [user]); // Roda sempre que o usuário mudar (exemplo: após login)

  useEffect(() => {
    // Simulação de consulta ao Firestore para verificar o status do plano
    setTimeout(() => {
      try {
        const userHasCompletedPlan = true; // Exemplo: consulta retornou que o plano foi completado
        setCompletedPlan(userHasCompletedPlan);
        setLoading(false);
      } catch (err) {
        setError("Houve um erro ao carregar o seu plano.");
        setLoading(false);
      }
    }, 2000); // Simulando um tempo de carregamento de 2 segundos
  }, []);

  return (
    <Container className="mt-4">
      <Row className="d-flex justify-content-center">
        <Col xs={12} md={8} lg={6}>
          <h1 className="mb-4 text-center">Feedbacks</h1>

          {/* Exibição de feedback para carregamento ou erro */}
          {loading ? (
            <Spinner animation="border" variant="primary" />
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : (
            <div>
              {/* Se o usuário estiver logado, exibe seu nome */}
              {user && <h3>Bem-vindo, {userName}!</h3>}

              {/* Verificando se o plano foi completado */}
              {completedPlan ? (
                <div>
                  {/* Exibindo feedbacks enviados */}
                  <div className="mt-4">
                    <h4>Feedbacks enviados:</h4>
                    {feedbacks.length > 0 ? (
                      <div className="d-flex flex-wrap">
                        {feedbacks.map((feedback, index) => (
                          <div
                            key={index}
                            className="feedback-card p-3 m-2" // Adicionando padding e margem para separar os feedbacks
                            style={{ width: "calc(33% - 1rem)" }} // Cada feedback ocupará um terço da largura disponível
                          >
                            <strong>Cliente:</strong> {feedback.userName} <br />
                            <strong>Avaliação:</strong> {feedback.rating} <br />
                            <strong>Comentários:</strong> {feedback.comments}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center">
                        Nenhum feedback enviado ainda.
                      </p>
                    )}
                  </div>

                  {/* Exibindo o formulário de feedback */}
                  <FeedbackForm planId="12345" />
                </div>
              ) : (
                <p className="text-center">
                  Você ainda não completou nenhum plano. Continue seu progresso!
                </p>
              )}
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
