import { useState, useEffect } from 'react';
     import { Form, Button } from 'react-bootstrap';
     import 'bootstrap/dist/css/bootstrap.min.css';

     export default function PlanoForm({ onSubmit, planoEditar, cancelar }) {
       const [form, setForm] = useState({ text: '', value: '' });

       useEffect(() => {
         if (planoEditar) {
           setForm({ text: planoEditar.text, value: planoEditar.value });
         } else {
           setForm({ text: '', value: '' });
         }
       }, [planoEditar]);

       const handleChange = (e) => {
         const { name, value } = e.target;
         setForm(prev => ({ ...prev, [name]: value }));
       };

       const handleSubmit = (e) => {
         e.preventDefault();
         onSubmit(form);
         setForm({ text: '', value: '' });
       };

       return (
         <Form onSubmit={handleSubmit} className="mb-4">
           <Form.Group className="mb-3">
             <Form.Label>Nome do Plano</Form.Label>
             <Form.Control
               type="text"
               name="text"
               value={form.text}
               onChange={handleChange}
               placeholder="Ex.: Plano Básico"
             />
           </Form.Group>
           <Form.Group className="mb-3">
             <Form.Label>Valor (R$/mês)</Form.Label>
             <Form.Control
               type="number"
               name="value"
               value={form.value}
               onChange={handleChange}
               placeholder="Ex.: 99.90"
             />
           </Form.Group>
           <Button variant="primary" type="submit">
             {planoEditar ? 'Atualizar' : 'Adicionar'}
           </Button>
           {planoEditar && (
             <Button variant="secondary" className="ms-2" onClick={cancelar}>
               Cancelar
             </Button>
           )}
         </Form>
       );
     }