import { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { formatarDataLocal } from '../services/adminService';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

function UserEditModal({ editandoUsuario, setEditandoUsuario, planos, carregarUsuarios }) {
  const [formularioUsuario, setFormularioUsuario] = useState({
    nome: '',
    email: '',
    planos: [],
    ehAdmin: false,
    telefone: '',
  });
  const [erro, setErro] = useState('');

  useEffect(function() {
    if (editandoUsuario) {
      console.log('Dados do usuário para edição:', JSON.stringify(editandoUsuario, null, 2));
      setFormularioUsuario({
        nome: editandoUsuario.nome || 'Sem nome',
        email: editandoUsuario.email || 'N/A',
        planos: Array.isArray(editandoUsuario.planos) ? editandoUsuario.planos : [],
        ehAdmin: editandoUsuario.ehAdmin || false,
        telefone: editandoUsuario.telefone || '',
      });
    } else {
      console.log('Nenhum usuário sendo editado, limpando formulário');
      setFormularioUsuario({
        nome: '',
        email: '',
        planos: [],
        ehAdmin: false,
        telefone: '',
      });
    }
  }, [editandoUsuario]);

  function adicionarPlanoFormulario() {
    const hoje = new Date();
    const dataExpiracao = new Date(hoje);
    dataExpiracao.setMonth(hoje.getMonth() + 1);
    let novoPlano = {
      nome: '',
      dataAdesao: formatarDataLocal(hoje),
      dataExpiracao: formatarDataLocal(dataExpiracao),
    };
    setFormularioUsuario(function(form) {
      return { ...form, planos: [...form.planos, novoPlano] };
    });
    console.log('Novo plano adicionado:', JSON.stringify(novoPlano, null, 2));
  }

  function atualizarPlanoFormulario(index, campo, valor) {
    let novosPlanos = [...formularioUsuario.planos];
    novosPlanos[index] = { ...novosPlanos[index], [campo]: valor };
    if (campo === 'dataAdesao' && valor && /^\d{4}-\d{2}-\d{2}$/.test(valor)) {
      const dataAdesao = new Date(valor);
      if (!isNaN(dataAdesao)) {
        const dataExpiracao = new Date(dataAdesao);
        dataExpiracao.setMonth(dataAdesao.getMonth() + 1);
        novosPlanos[index].dataExpiracao = formatarDataLocal(dataExpiracao);
        console.log(`Data de adesão alterada para ${valor}, nova data de expiração: ${novosPlanos[index].dataExpiracao}`);
      }
    }
    setFormularioUsuario(function(form) {
      return { ...form, planos: novosPlanos };
    });
  }

  function removerPlanoFormulario(index) {
    let novosPlanos = formularioUsuario.planos.filter(function(_, i) {
      return i !== index;
    });
    setFormularioUsuario(function(form) {
      return { ...form, planos: novosPlanos };
    });
    console.log('Plano removido do formulário, índice:', index);
  }

  function salvarUsuario() {
    setErro('');
    if (!formularioUsuario.nome || !formularioUsuario.email) {
      setErro('Nome e e-mail são obrigatórios.');
      console.log('Erro ao salvar: Nome ou e-mail faltando');
      return;
    }
    for (let plano of formularioUsuario.planos) {
      if (!plano.nome || !plano.dataAdesao || !plano.dataExpiracao) {
        setErro('Todos os planos devem ter nome, data de adesão e expiração.');
        console.log('Erro ao salvar: Plano incompleto', JSON.stringify(plano, null, 2));
        return;
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(plano.dataAdesao) || !/^\d{4}-\d{2}-\d{2}$/.test(plano.dataExpiracao)) {
        setErro('Datas de adesão e expiração devem estar no formato YYYY-MM-DD.');
        console.log('Erro ao salvar: Formato de data inválido', JSON.stringify(plano, null, 2));
        return;
      }
    }
    updateDoc(doc(db, 'Usuarios', editandoUsuario.id), {
      nome: formularioUsuario.nome || 'Sem nome',
      email: formularioUsuario.email || 'N/A',
      planos: formularioUsuario.planos || [],
      telefone: formularioUsuario.telefone || '',
      admin: formularioUsuario.ehAdmin || false,
    })
      .then(function() {
        console.log('Usuário salvo com sucesso:', JSON.stringify(formularioUsuario, null, 2));
        setEditandoUsuario(null);
        carregarUsuarios();
      })
      .catch(function(error) {
        console.error('Erro ao salvar usuário:', error);
        setErro('Erro ao salvar usuário.');
      });
  }

  return (
    <Modal show={editandoUsuario !== null} onHide={function() { setEditandoUsuario(null); }}>
      <Modal.Header closeButton>
        <Modal.Title>Editar Usuário</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {erro && <div className="alert alert-danger py-2 text-center">{erro}</div>}
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Nome</Form.Label>
            <Form.Control
              type="text"
              value={formularioUsuario.nome}
              onChange={function(e) {
                setFormularioUsuario(function(form) {
                  return { ...form, nome: e.target.value };
                });
              }}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={formularioUsuario.email}
              onChange={function(e) {
                setFormularioUsuario(function(form) {
                  return { ...form, email: e.target.value };
                });
              }}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Telefone</Form.Label>
            <Form.Control
              type="text"
              value={formularioUsuario.telefone}
              onChange={function(e) {
                setFormularioUsuario(function(form) {
                  return { ...form, telefone: e.target.value };
                });
              }}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Planos</Form.Label>
            {formularioUsuario.planos.map(function(plano, index) {
              return (
                <div key={plano.nome + plano.dataAdesao + index}>
                  <Form.Select
                    value={plano.nome}
                    onChange={function(e) {
                      atualizarPlanoFormulario(index, 'nome', e.target.value);
                    }}
                  >
                    <option value="">Selecione</option>
                    {planos.map(function(p) {
                      return <option key={p.id} value={p.text}>{p.text}</option>;
                    })}
                  </Form.Select>
                  <Form.Control
                    type="date"
                    value={plano.dataAdesao}
                    onChange={function(e) {
                      atualizarPlanoFormulario(index, 'dataAdesao', e.target.value);
                    }}
                  />
                  <Form.Control
                    type="date"
                    value={plano.dataExpiracao}
                    onChange={function(e) {
                      atualizarPlanoFormulario(index, 'dataExpiracao', e.target.value);
                    }}
                  />
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={function() { removerPlanoFormulario(index); }}
                  >
                    Remover
                  </Button>
                </div>
              );
            })}
            <Button
              variant="secondary"
              size="sm"
              onClick={adicionarPlanoFormulario}
            >
              Adicionar Plano
            </Button>
          </Form.Group>
          <Form.Group>
            <Form.Check
              type="checkbox"
              label="Administrador"
              checked={formularioUsuario.ehAdmin}
              onChange={function(e) {
                setFormularioUsuario(function(form) {
                  return { ...form, ehAdmin: e.target.checked };
                });
              }}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={function() { setEditandoUsuario(null); }}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={salvarUsuario}>
          Salvar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default UserEditModal;
