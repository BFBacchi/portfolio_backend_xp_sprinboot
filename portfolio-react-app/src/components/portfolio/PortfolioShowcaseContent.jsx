import React from 'react';
import { usePortfolioPublic } from '../../contexts/PortfolioPublicContext';
import { useDesktopActions } from '../startDesktop/context/DesktopActionsContext';
import './portfolio-win.css';

export default function PortfolioShowcaseContent() {
  const { openOverlay } = useDesktopActions();
  const { loading, error, about, projects, education, skills, workExperience, refresh } =
    usePortfolioPublic();

  if (loading && !about) {
    return (
      <div className="portfolio-win-scroll">
        <p>Cargando portfolio desde el servidor…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="portfolio-win-scroll">
        <p className="portfolio-win-muted">{error}</p>
        <button type="button" onClick={() => refresh()}>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="portfolio-win-scroll">
      <div style={{ marginBottom: 10 }}>
        <button type="button" onClick={() => refresh()} disabled={loading}>
          {loading ? 'Actualizando…' : 'Actualizar datos'}
        </button>
      </div>

      <section className="portfolio-win-section">
        <h3>Sobre mí</h3>
        {about?.headline ? <p><strong>{about.headline}</strong></p> : null}
        {about?.tagline ? <p className="portfolio-win-muted">{about.tagline}</p> : null}
        {about?.bio ? <p>{about.bio}</p> : null}
        {about?.lunaQuote ? <p className="portfolio-win-muted">«{about.lunaQuote}»</p> : null}
        {about?.xpFlavorNote ? (
          <p className="portfolio-win-xp-note">{about.xpFlavorNote}</p>
        ) : null}
      </section>

      <section className="portfolio-win-section">
        <h3>Experiencia laboral</h3>
        {workExperience.length === 0 ? (
          <p className="portfolio-win-muted">Sin entradas todavía.</p>
        ) : (
          workExperience.map((w) => (
            <div key={w.id} className="portfolio-win-item">
              <strong>{w.company}</strong>
              {w.roleTitle ? <span> — {w.roleTitle}</span> : null}
              {w.periodLabel ? (
                <div className="portfolio-win-muted">{w.periodLabel}</div>
              ) : null}
              {w.description ? <p>{w.description}</p> : null}
            </div>
          ))
        )}
      </section>

      <section className="portfolio-win-section">
        <h3>Educación</h3>
        {education.length === 0 ? (
          <p className="portfolio-win-muted">Sin entradas todavía.</p>
        ) : (
          education.map((ed) => (
            <div key={ed.id} className="portfolio-win-item">
              <strong>{ed.institution}</strong>
              <div className="portfolio-win-muted">
                {[ed.degree, ed.periodLabel].filter(Boolean).join(' · ')}
              </div>
              {ed.description ? <p>{ed.description}</p> : null}
              {ed.certificateUrl ? (
                <p>
                  <button
                    type="button"
                    onClick={() =>
                      openOverlay({
                        type: 'certificatePreview',
                        payload: {
                          title: [ed.institution, ed.degree].filter(Boolean).join(' — ') || 'Certificado',
                          url: ed.certificateUrl,
                        },
                      })
                    }
                  >
                    Ver certificado
                  </button>
                </p>
              ) : null}
            </div>
          ))
        )}
      </section>

      <section className="portfolio-win-section">
        <h3>Proyectos</h3>
        {projects.length === 0 ? (
          <p className="portfolio-win-muted">Sin proyectos todavía.</p>
        ) : (
          projects.map((p) => (
            <div key={p.id} className="portfolio-win-item">
              <strong>{p.title}</strong>
              {p.technologies ? (
                <div className="portfolio-win-muted">{p.technologies}</div>
              ) : null}
              {p.description ? <p>{p.description}</p> : null}
              {p.projectUrl ? (
                <a href={p.projectUrl} target="_blank" rel="noreferrer">
                  Enlace
                </a>
              ) : null}
              {p.imageUrl1 || p.imageUrl2 ? (
                <p>
                  <button
                    type="button"
                    onClick={() =>
                      openOverlay({
                        type: 'projectImages',
                        payload: {
                          title: p.title,
                          imageUrl1: p.imageUrl1,
                          imageUrl2: p.imageUrl2,
                        },
                      })
                    }
                  >
                    Ver capturas
                  </button>
                </p>
              ) : null}
            </div>
          ))
        )}
      </section>

      <section className="portfolio-win-section">
        <h3>Habilidades</h3>
        {skills.length === 0 ? (
          <p className="portfolio-win-muted">Sin habilidades todavía.</p>
        ) : (
          skills.map((sk) => (
            <div key={sk.id} className="portfolio-win-item">
              <strong>{sk.name}</strong>
              {sk.category ? <div className="portfolio-win-muted">{sk.category}</div> : null}
              {sk.notes ? <p className="portfolio-win-muted">{sk.notes}</p> : null}
            </div>
          ))
        )}
      </section>
    </div>
  );
}
