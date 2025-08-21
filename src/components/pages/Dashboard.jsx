import React, { useState, useEffect } from "react";
import { Spinner, Alert, Container, Row, Col, Card, Badge } from "react-bootstrap";
import FeedbackForm from "../FeedbackForm";
import { getFirestore, collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const db = getFirestore();

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedbacks, setFeedbacks] = useState([]);
  const [userName, setUserName] = useState("");
  const [isLogged, setIsLogged] = useState(false);
  const [completedPlan] = useState(true); // mantenho true pra sempre renderizar a área

  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, async (u) => {
      setIsLogged(!!u);
      setUserName(u ? (u.displayName || u.email || "Cliente") : "");
      await loadFeedbacks(u);
    });
    return () => unsub();
  }, []);

  async function loadFeedbacks(user) {
    setLoading(true);
    setError("");

    try {
      let q;
      if (user) {
        // ✅ logado: somente os meus feedbacks (aprovados ou não)
        q = query(collection(db, "Feedbacks"), where("userId", "==", user.uid));
      } else {
        // ✅ não logado: somente feedbacks aprovados (de todos os usuários)
        q = query(collection(db, "Feedbacks"), where("approved", "==", true));
      }

      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setFeedbacks(list);
    } catch (e) {
      console.error("Erro ao carregar feedbacks:", e);
      setError("Erro ao carregar feedbacks.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container className="mt-4">
      <Row className="d-flex justify-content-center">
        <Col xs={12} md={10} lg={8} xl={6}>
          <h1 className="mb-4 text-center">Feedbacks</h1>

          {loading ? (
            <div className="d-flex justify-content-center">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : (
            <div>
              {isLogged && <h5 className="mb-3 text-center">Bem-vindo, {userName}!</h5>}

              {completedPlan ? (
                <>
                  {/* Cards lado a lado */}
                  <div className="d-flex flex-wrap gap-4 justify-content-center">
                    {feedbacks.length > 0 ? (
                      feedbacks.map((fb) => (
                        <Card key={fb.id} className="feedback-card" style={{ width: "22rem" }}>
                          <Card.Body>
                            <Card.Title>{fb.userName || "Cliente"}</Card.Title>
                            <Card.Subtitle className="mb-2 text-muted">
                              Avaliação: {fb.rating}/5
                            </Card.Subtitle>
                            <Card.Text>{fb.comments || "Sem comentário"}</Card.Text>

                            {/* Status do feedback */}
                          
                          </Card.Body>
                        </Card>
                      ))
                    ) : (
                      <p className="text-center mb-0">Nenhum feedback encontrado.</p>
                    )}
                  </div>

                  {/* Formulário somente quando logado */}
                  {isLogged && (
                    <div className="mt-4">
                      <FeedbackForm planId="12345" />
                    </div>
                  )}
                </>
              ) : (
                <p className="text-center">Você ainda não completou nenhum plano. Continue seu progresso!</p>
              )}
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
