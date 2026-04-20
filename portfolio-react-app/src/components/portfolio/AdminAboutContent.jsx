import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import { usePortfolioPublic } from '../../contexts/PortfolioPublicContext';
import '../admin/admin-xp.css';
import './portfolio-win.css';

export default function AdminAboutContent() {
  const { logout } = useAuth();
  const { refresh } = usePortfolioPublic();
  const navigate = useNavigate();
  const [about, setAbout] = useState({
    headline: '',
    bio: '',
    cvText: '',
    tagline: '',
    lunaQuote: '',
  });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    setErr('');
    try {
      const a = await apiFetch('/api/v1/admin/about-me');
      setAbout({
        headline: a.headline || '',
        bio: a.bio || '',
        cvText: a.cvText || '',
        tagline: a.tagline || '',
        lunaQuote: a.lunaQuote || '',
      });
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

  async function onSubmit(e) {
    e.preventDefault();
    setMsg('');
    setErr('');
    try {
      await apiFetch('/api/v1/admin/about-me', {
        method: 'PUT',
        body: JSON.stringify(about),
      });
      setMsg('Guardado.');
      refresh();
    } catch (ex) {
      if (ex.status === 401) {
        logout();
        navigate('/welcome');
        return;
      }
      setErr(ex.body?.message || ex.message || 'Error al guardar');
    }
  }

  return (
    <div className="portfolio-win-scroll admin-xp-body" style={{ background: '#ece9d8' }}>
      {err ? <div className="admin-xp-msg">{err}</div> : null}
      {msg ? <div className="admin-xp-msg admin-xp-msg--ok">{msg}</div> : null}
      <form onSubmit={onSubmit}>
        <div className="admin-xp-field">
          <label>Título / headline</label>
          <input
            value={about.headline}
            onChange={(e) => setAbout((a) => ({ ...a, headline: e.target.value }))}
          />
        </div>
        <div className="admin-xp-field">
          <label>Biografía</label>
          <textarea
            value={about.bio}
            onChange={(e) => setAbout((a) => ({ ...a, bio: e.target.value }))}
          />
        </div>
        <div className="admin-xp-field">
          <label>Tagline</label>
          <input
            value={about.tagline}
            onChange={(e) => setAbout((a) => ({ ...a, tagline: e.target.value }))}
          />
        </div>
        <div className="admin-xp-field">
          <label>CV para asistente IA (texto)</label>
          <textarea
            value={about.cvText}
            onChange={(e) => setAbout((a) => ({ ...a, cvText: e.target.value }))}
            style={{ minHeight: 120 }}
          />
        </div>
        <div className="admin-xp-field">
          <label>Cita Luna (opcional)</label>
          <input
            value={about.lunaQuote}
            onChange={(e) => setAbout((a) => ({ ...a, lunaQuote: e.target.value }))}
          />
        </div>
        <div className="admin-xp-actions">
          <button type="submit" className="admin-xp-btn-primary">
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}
