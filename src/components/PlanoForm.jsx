import { useState, useEffect } from 'react';

export default function PlanoForm({ onSubmit, planoEditar, cancelar }) {
  const [text, setText] = useState('');
  const [value, setValue] = useState('');

  useEffect(() => {
    if (planoEditar) {
      setText(planoEditar.text || '');
      setValue(planoEditar.value || '');
    }
  }, [planoEditar]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text || !value) return;
    onSubmit({ text, value: Number(value) });
    setText('');
    setValue('');
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="mb-2">
        <input
          type="text"
          className="form-control"
          placeholder="Nome do plano"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>
      <div className="mb-2">
        <input
          type="number"
          className="form-control"
          placeholder="Valor"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
      <button className="btn btn-success me-2" type="submit">
        {planoEditar ? 'Atualizar' : 'Adicionar'}
      </button>
      {planoEditar && (
        <button className="btn btn-secondary" type="button" onClick={cancelar}>
          Cancelar
        </button>
      )}
    </form>
  );
}
