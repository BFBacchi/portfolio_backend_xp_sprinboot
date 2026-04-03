import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import winxpLogo from '../../assets/winxp.png';
import './system-xp.css';

/**
 * Secuencia tipo apagado de Windows XP → pantalla final "apagado".
 */
export default function ShutdownScreen() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = window.setTimeout(() => setPhase(1), 2400);
    const t2 = window.setTimeout(() => setPhase(2), 5200);
    const t3 = window.setTimeout(() => {
      logout();
      navigate('/power-off', { replace: true });
    }, 6800);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [logout, navigate]);

  const lines = [
    'Guardando la configuración…',
    'Windows se está cerrando…',
    'Windows se está cerrando…',
  ];

  return (
    <div className="xp-system-root xp-system-root--shutdown" role="status" aria-live="polite">
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
