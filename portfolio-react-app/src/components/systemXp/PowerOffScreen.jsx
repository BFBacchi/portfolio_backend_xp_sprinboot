import React from 'react';
import { useNavigate } from 'react-router-dom';
import './system-xp.css';

/**
 * Estado final tipo "ya puede apagar el equipo" (mensaje clásico de Windows 9x/XP en PCs AT).
 */
export default function PowerOffScreen() {
  const navigate = useNavigate();

  return (
    <div className="xp-system-root xp-system-root--poweroff">
      <p className="xp-poweroff-msg">
        Es ahora posible apagar el equipo de forma segura.
        <br />
        <br />
        En el navegador puede cerrar esta pestaña; o pulse el botón para volver a encender el
        portfolio.
      </p>
      <button
        type="button"
        className="xp-poweroff-btn"
        onClick={() => navigate('/', { replace: true })}
      >
        Encender de nuevo
      </button>
    </div>
  );
}
