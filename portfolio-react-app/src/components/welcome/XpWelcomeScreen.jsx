import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import XpMessageBox from '../startDesktop/xpMessageBox/XpMessageBox.jsx';
import winxpLogo from '../../assets/winxp.png';
import './xp-welcome.css';

function PowerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <path d="M12 2v10" />
      <path d="M8.2 5.2a7 7 0 1 0 7.6 0" />
    </svg>
  );
}

/**
 * Pantalla de bienvenida tipo Windows XP: elegir Admin (contraseña) o Invitado (solo lectura).
 */
export default function XpWelcomeScreen() {
  const navigate = useNavigate();
  const { login, isAuthenticated, enterGuestSession } = useAuth();
  const [adminMode, setAdminMode] = useState(false);
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [shutdownOpen, setShutdownOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/start', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  async function submitAdmin(e) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      await login('admin', password);
      setPassword('');
      navigate('/start', { replace: true });
    } catch (ex) {
      setErr(ex.body?.message || ex.message || 'Contraseña incorrecta.');
    } finally {
      setLoading(false);
    }
  }

  function pickGuest() {
    enterGuestSession();
    navigate('/start', { replace: true });
  }

  return (
    <div className="xp-welcome-root">
      <div className="xp-welcome-main-wrap">
        <div className="xp-welcome-panel">
          <div className="xp-welcome-left">
            <img src={winxpLogo} alt="" draggable={false} />
            <div className="xp-welcome-brand">Microsoft Windows XP</div>
            <p className="xp-welcome-instruction">
              Para comenzar, pulse su nombre de usuario
            </p>
          </div>
          <div className="xp-welcome-divider" aria-hidden="true" />
          <div className="xp-welcome-right">
            {!adminMode ? (
              <ul className="xp-welcome-users">
                <li>
                  <button
                    type="button"
                    className="xp-welcome-user"
                    onClick={() => {
                      setAdminMode(true);
                      setErr('');
                      setPassword('');
                    }}
                  >
                    <span className="xp-welcome-avatar xp-welcome-avatar--admin" aria-hidden="true">
                      A
                    </span>
                    <span>Admin</span>
                  </button>
                </li>
                <li>
                  <button type="button" className="xp-welcome-user" onClick={pickGuest}>
                    <span className="xp-welcome-avatar xp-welcome-avatar--guest" aria-hidden="true">
                      I
                    </span>
                    <span>Invitado</span>
                  </button>
                </li>
              </ul>
            ) : (
              <div className="xp-welcome-admin-form">
                <h2>Administrador</h2>
                {err ? <div className="xp-welcome-err">{err}</div> : null}
                <form onSubmit={submitAdmin}>
                  <label htmlFor="xp-welcome-pass">Escriba su contraseña</label>
                  <input
                    id="xp-welcome-pass"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    autoFocus
                  />
                  <div className="xp-welcome-form-actions">
                    <button type="submit" className="xp-welcome-btn" disabled={loading}>
                      {loading ? 'Conectando…' : 'Aceptar'}
                    </button>
                    <button
                      type="button"
                      className="xp-welcome-btn-link"
                      onClick={() => {
                        setAdminMode(false);
                        setErr('');
                        setPassword('');
                      }}
                    >
                      « Cambiar usuario
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="xp-welcome-footer">
        <button type="button" className="xp-welcome-power" onClick={() => setShutdownOpen(true)}>
          <span className="xp-welcome-power-icon">
            <PowerIcon />
          </span>
          <span>Apagar el equipo</span>
        </button>
        <p className="xp-welcome-footer-hint">
          Después de iniciar sesión puede editar el portfolio como administrador o explorarlo como
          invitado. Use el Panel de control del escritorio para más opciones.
        </p>
      </footer>

      <XpMessageBox
        open={shutdownOpen}
        title="Apagar el equipo"
        confirmLabel="Sí"
        cancelLabel="No"
        onConfirm={() => {
          setShutdownOpen(false);
          navigate('/shutdown');
        }}
        onCancel={() => setShutdownOpen(false)}
      >
        <p>¿Desea apagar el equipo?</p>
        <p>Se cerrará el sistema de forma segura.</p>
      </XpMessageBox>
    </div>
  );
}
