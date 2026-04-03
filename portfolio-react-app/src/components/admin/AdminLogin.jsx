import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './admin-xp.css';

export default function AdminLogin() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState('admin');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated) navigate('/start', { replace: true });
  }, [isAuthenticated, navigate]);

  async function onSubmit(e) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      await login(user, pass);
      navigate('/start', { replace: true });
    } catch (ex) {
      setErr(ex.body?.message || ex.message || 'No se pudo iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-xp-root">
      <div className="admin-xp-window admin-xp-login-box">
        <div className="admin-xp-titlebar">
          <span>Iniciar sesión — Estudio del portfolio</span>
        </div>
        <div className="admin-xp-body">
          <p style={{ marginTop: 0 }}>
            Bienvenido al <strong>Estudio XP</strong>. Tras iniciar sesión volverá al escritorio: use el icono
            «Estudio del portfolio», el menú Inicio → Accesorios o el panel web para editar datos.
          </p>
          {err ? <div className="admin-xp-msg">{err}</div> : null}
          <form onSubmit={onSubmit}>
            <div className="admin-xp-field">
              <label htmlFor="xp-user">Nombre de usuario</label>
              <input
                id="xp-user"
                autoComplete="username"
                value={user}
                onChange={(e) => setUser(e.target.value)}
              />
            </div>
            <div className="admin-xp-field">
              <label htmlFor="xp-pass">Contraseña</label>
              <input
                id="xp-pass"
                type="password"
                autoComplete="current-password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
              />
            </div>
            <div className="admin-xp-actions">
              <button type="submit" className="admin-xp-btn-primary" disabled={loading}>
                {loading ? 'Conectando…' : 'Aceptar'}
              </button>
              <button type="button" onClick={() => navigate('/welcome')}>
                Cancelar (pantalla de bienvenida)
              </button>
            </div>
          </form>
          <p className="admin-xp-hint">
            En desarrollo local el backend crea el usuario <code>admin</code> con contraseña por defecto
            (vea variables <code>PORTFOLIO_ADMIN_PASSWORD</code> / logs del servidor). El API debe estar en{' '}
            <code>localhost:8080</code> o defina <code>VITE_API_BASE_URL</code>.
          </p>
        </div>
      </div>
    </div>
  );
}
