import React, { useState, useEffect } from "react";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { Button, Form, Alert } from "react-bootstrap";

const db = getFirestore();

const FeedbackForm = ({ planId }) => {
  const [rating, setRating] = useState(1);
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [userName, setUserName] = useState('');
  const user = getAuth().currentUser;

  useEffect(() => {
    if (user) {
      setUserName(user.displayName || 'Cliente');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Você precisa estar logado para enviar um feedback");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await addDoc(collection(db, "Feedbacks"), {
        userId: user.uid,
        userName,  // Atualiza o nome do usuário ao enviar feedback
        planId: planId || null,
        rating: Number(rating),
        comments: comments.trim(),
        approved: false,               // ✅ entra pendente
        createdAt: serverTimestamp(),  // ✅ usa server time
      });

      setSuccessMessage("Feedback enviado com sucesso! Aguarde aprovação.");
      setRating(1);
      setComments('');
    } catch (error) {
      console.error("Erro ao enviar feedback:", error);
      setErrorMessage("Houve um erro ao enviar seu feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center">Deixe seu feedback</h2>

      {successMessage && <Alert variant="success">{successMessage}</Alert>}
      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="rating" className="mb-3">
          <Form.Label>Qual a sua avaliação?</Form.Label>
          <Form.Control
            as="select"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            size="sm"
          >
            {[1, 2, 3, 4, 5].map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </Form.Control>
        </Form.Group>

        <Form.Group controlId="comments" className="mb-3">
          <Form.Label>Comentários</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="O que você achou da aula ou plano?"
            style={{ fontSize: "0.9rem" }}
          />
        </Form.Group>

        <Button type="submit" variant="primary" disabled={isSubmitting} className="w-10 mb-5">
          {isSubmitting ? "Enviando..." : "Enviar Feedback"}
        </Button>
      </Form>
    </div>
  );
};

export default FeedbackForm;
