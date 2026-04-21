import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import { usePortfolioPublic } from '../../contexts/PortfolioPublicContext';
import '../admin/admin-xp.css';
import './portfolio-win.css';

const emptyForm = () => ({
  title: '',
  description: '',
  projectUrl: '',
  imageUrl1: '',
  imageUrl2: '',
  technologies: '',
  sortOrder: 0,
});

export default function AdminProjectsContent() {
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
      const list = await apiFetch('/api/v1/admin/projects');
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

  function startEdit(p) {
    setEditingId(p.id);
    setForm({
      title: p.title || '',
      description: p.description || '',
      projectUrl: p.projectUrl || '',
      imageUrl1: p.imageUrl1 || '',
      imageUrl2: p.imageUrl2 || '',
      technologies: p.technologies || '',
      sortOrder: p.sortOrder ?? 0,
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
        await apiFetch(`/api/v1/admin/projects/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(form),
        });
        setMsg('Proyecto actualizado.');
      } else {
        await apiFetch('/api/v1/admin/projects', {
          method: 'POST',
          body: JSON.stringify(form),
        });
        setMsg('Proyecto añadido.');
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
    if (!window.confirm('¿Eliminar este proyecto?')) return;
    try {
      await apiFetch(`/api/v1/admin/projects/${id}`, { method: 'DELETE' });
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
        {items.map((p) => (
          <li key={p.id}>
            <div>
              <strong>{p.title}</strong>
              {p.technologies ? <div style={{ color: '#444' }}>{p.technologies}</div> : null}
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button type="button" onClick={() => startEdit(p)}>
                Editar
              </button>
              <button type="button" onClick={() => del(p.id)}>
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>
      <form onSubmit={onSubmit}>
        <p style={{ margin: '8px 0 4px', fontWeight: 'bold' }}>
          {editingId ? `Editando #${editingId}` : 'Nuevo proyecto'}
        </p>
        <div className="admin-xp-field">
          <label>Título</label>
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
          />
        </div>
        <div className="admin-xp-field">
          <label>Descripción</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </div>
        <div className="admin-xp-field">
          <label>URL del proyecto</label>
          <input
            value={form.projectUrl}
            onChange={(e) => setForm((f) => ({ ...f, projectUrl: e.target.value }))}
          />
        </div>
        <div className="admin-xp-field">
          <label>URL imagen 1 (opcional)</label>
          <input
            type="url"
            value={form.imageUrl1}
            onChange={(e) => setForm((f) => ({ ...f, imageUrl1: e.target.value }))}
            placeholder="https://…"
          />
        </div>
        <div className="admin-xp-field">
          <label>URL imagen 2 (opcional)</label>
          <input
            type="url"
            value={form.imageUrl2}
            onChange={(e) => setForm((f) => ({ ...f, imageUrl2: e.target.value }))}
            placeholder="https://…"
          />
        </div>
        <div className="admin-xp-field">
          <label>Tecnologías</label>
          <input
            value={form.technologies}
            onChange={(e) => setForm((f) => ({ ...f, technologies: e.target.value }))}
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
            {editingId ? 'Guardar cambios' : 'Añadir'}
          </button>
          {editingId ? (
            <button type="button" onClick={cancelEdit}>
              Cancelar edición
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
