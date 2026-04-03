import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDesktopActions } from '../startDesktop/context/DesktopActionsContext';
import { useAuth } from '../../contexts/AuthContext';
import './portfolio-win.css';

const BTNS = [
  { id: 'adminAbout', label: 'Sobre mí' },
  { id: 'adminProjects', label: 'Proyectos' },
  { id: 'adminEducation', label: 'Educación' },
  { id: 'adminSkills', label: 'Habilidades' },
  { id: 'adminWork', label: 'Experiencia laboral' },
];

export default function AdminHubContent() {
  const { openWindow } = useDesktopActions();
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="portfolio-win-hub">
      <p style={{ margin: 0, fontSize: 11, color: '#444' }}>
        Elija una sección para abrir una ventana con formularios. También puede usar el panel web completo.
      </p>
      {BTNS.map((b) => (
        <button key={b.id} type="button" onClick={() => openWindow(b.id)}>
          {b.label}
        </button>
      ))}
      <button type="button" onClick={() => navigate('/admin')}>
        Abrir estudio web (todas las pestañas)
      </button>
      <button
        type="button"
        onClick={() => {
          logout();
          navigate('/welcome');
        }}
      >
        Cerrar sesión
      </button>
    </div>
  );
}
