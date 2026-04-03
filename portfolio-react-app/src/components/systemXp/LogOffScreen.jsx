import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import winxpLogo from '../../assets/winxp.png';
import './system-xp.css';

const PHASE_MS = [0, 2200, 4500];

/**
 * Secuencia tipo Windows XP al cerrar sesión: mensajes + barra de progreso,
 * luego cierra sesión (JWT e invitado) y vuelve a la pantalla de bienvenida.
 */
export default function LogOffScreen() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = window.setTimeout(() => setPhase(1), PHASE_MS[1]);
    const t2 = window.setTimeout(() => {
      logout();
      setPhase(2);
    }, PHASE_MS[2]);
    const t3 = window.setTimeout(() => {
      navigate('/welcome', { replace: true });
    }, PHASE_MS[2] + 900);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [logout, navigate]);

  const lines = [
    'Guardando la configuración…',
    'Cerrando sesión…',
    'Cerrando sesión…',
  ];

  return (
    <div className="xp-system-root xp-system-root--logoff" role="status" aria-live="polite">
      <div className="xp-system-logo-wrap">
        <img src={winxpLogo} alt="" draggable={false} />
      </div>
      <p className="xp-system-message">{lines[phase]}</p>
      <div className="xp-system-progress" aria-hidden="true">
        <div className="xp-system-progress-inner" />
      </div>
    </div>
  );
}
