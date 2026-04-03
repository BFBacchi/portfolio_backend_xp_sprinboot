import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import { usePortfolioPublic } from '../../contexts/PortfolioPublicContext';
import '../admin/admin-xp.css';
import './portfolio-win.css';

const emptyForm = () => ({
  name: '',
  category: '',
  notes: '',
  sortOrder: 0,
});

export default function AdminSkillsContent() {
  const { logout } = useAuth();
  const { refresh } = usePortfolioPublic();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    setErr('');
    try {
      const list = await apiFetch('/api/v1/admin/skills');
      setItems(list || []);
    } catch (ex) {
      if (ex.status === 401) {
        logout();
        navigate('/welcome');
        return;
      }
      setErr(ex.body?.message || ex.message || 'Error');
    }
  }, [logout, navigate]);

  useEffect(() => {
    load();
  }, [load]);

  function startEdit(sk) {
    setEditingId(sk.id);
    setForm({
      name: sk.name || '',
      category: sk.category || '',
      notes: sk.notes || '',
      sortOrder: sk.sortOrder ?? 0,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm());
  }

  async function onSubmit(e) {
    e.preventDefault();
    setMsg('');
    setErr('');
    try {
      if (editingId) {
        await apiFetch(`/api/v1/admin/skills/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(form),
        });
        setMsg('Actualizado.');
      } else {
        await apiFetch('/api/v1/admin/skills', {
          method: 'POST',
          body: JSON.stringify(form),
        });
        setMsg('Añadido.');
      }
      cancelEdit();
      await load();
      refresh();
    } catch (ex) {
      if (ex.status === 401) {
        logout();
        navigate('/welcome');
        return;
      }
      setErr(ex.body?.message || ex.message || 'Error');
    }
  }

  async function del(id) {
    if (!window.confirm('¿Eliminar esta habilidad?')) return;
    try {
      await apiFetch(`/api/v1/admin/skills/${id}`, { method: 'DELETE' });
      setMsg('Eliminado.');
      if (editingId === id) cancelEdit();
      await load();
      refresh();
    } catch (ex) {
      if (ex.status === 401) {
        logout();
        navigate('/welcome');
        return;
      }
      setErr(ex.body?.message || ex.message || 'Error');
    }
  }

  return (
    <div className="portfolio-win-scroll admin-xp-body" style={{ background: '#ece9d8' }}>
      {err ? <div className="admin-xp-msg">{err}</div> : null}
      {msg ? <div className="admin-xp-msg admin-xp-msg--ok">{msg}</div> : null}
      <ul className="admin-xp-list">
        {items.map((sk) => (
          <li key={sk.id}>
            <div>
              <strong>{sk.name}</strong>
              {sk.category ? <div style={{ color: '#444' }}>{sk.category}</div> : null}
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button type="button" onClick={() => startEdit(sk)}>
                Editar
              </button>
              <button type="button" onClick={() => del(sk.id)}>
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>
      <form onSubmit={onSubmit}>
        <p style={{ margin: '8px 0 4px', fontWeight: 'bold' }}>
          {editingId ? `Editando #${editingId}` : 'Nueva habilidad'}
        </p>
        <div className="admin-xp-field">
          <label>Nombre</label>
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
        </div>
        <div className="admin-xp-field">
          <label>Categoría</label>
          <input
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          />
        </div>
        <div className="admin-xp-field">
          <label>Notas</label>
          <input
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          />
        </div>
        <div className="admin-xp-field">
          <label>Orden</label>
          <input
            type="number"
            value={form.sortOrder}
            onChange={(e) =>
              setForm((f) => ({ ...f, sortOrder: Number(e.target.value) || 0 }))
            }
          />
        </div>
        <div className="admin-xp-actions">
          <button type="submit" className="admin-xp-btn-primary">
            {editingId ? 'Guardar' : 'Añadir'}
          </button>
          {editingId ? (
            <button type="button" onClick={cancelEdit}>
              Cancelar
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
