import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import './admin-xp.css';

const TABS = [
  { id: 'about', label: 'Sobre mí' },
  { id: 'projects', label: 'Proyectos' },
  { id: 'work', label: 'Experiencia laboral' },
  { id: 'education', label: 'Educación' },
  { id: 'skills', label: 'Habilidades' },
];

const emptyProj = () => ({
  title: '',
  description: '',
  projectUrl: '',
  imageUrl1: '',
  imageUrl2: '',
  technologies: '',
  sortOrder: 0,
});

const emptyEdu = () => ({
  institution: '',
  degree: '',
  periodLabel: '',
  description: '',
  certificateUrl: '',
  sortOrder: 0,
});

const emptySkill = () => ({
  name: '',
  category: '',
  notes: '',
  sortOrder: 0,
});

const emptyWork = () => ({
  company: '',
  roleTitle: '',
  periodLabel: '',
  description: '',
  sortOrder: 0,
});

export default function AdminPanel() {
  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('about');
  const [msg, setMsg] = useState({ text: '', ok: false });
  const [loadErr, setLoadErr] = useState('');

  const [about, setAbout] = useState({
    headline: '',
    bio: '',
    tagline: '',
    lunaQuote: '',
  });
  const [projects, setProjects] = useState([]);
  const [education, setEducation] = useState([]);
  const [skills, setSkills] = useState([]);
  const [workExp, setWorkExp] = useState([]);

  const [projForm, setProjForm] = useState(emptyProj);
  const [projEditId, setProjEditId] = useState(null);

  const [eduForm, setEduForm] = useState(emptyEdu);
  const [eduEditId, setEduEditId] = useState(null);

  const [skillForm, setSkillForm] = useState(emptySkill);
  const [skillEditId, setSkillEditId] = useState(null);

  const [workForm, setWorkForm] = useState(emptyWork);
  const [workEditId, setWorkEditId] = useState(null);

  const flash = useCallback((text, ok = true) => {
    setMsg({ text, ok });
    window.setTimeout(() => setMsg({ text: '', ok: false }), 4000);
  }, []);

  const reloadAll = useCallback(async () => {
    setLoadErr('');
    try {
      const [a, p, w, e, s] = await Promise.all([
        apiFetch('/api/v1/admin/about-me'),
        apiFetch('/api/v1/admin/projects'),
        apiFetch('/api/v1/admin/work-experience'),
        apiFetch('/api/v1/admin/education'),
        apiFetch('/api/v1/admin/skills'),
      ]);
      setAbout({
        headline: a.headline || '',
        bio: a.bio || '',
        tagline: a.tagline || '',
        lunaQuote: a.lunaQuote || '',
      });
      setProjects(p || []);
      setWorkExp(w || []);
      setEducation(e || []);
      setSkills(s || []);
    } catch (ex) {
      if (ex.status === 401) {
        logout();
        navigate('/welcome', { replace: true });
        return;
      }
      setLoadErr(ex.body?.message || ex.message || 'Error cargando datos');
    }
  }, [logout, navigate]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/welcome', { replace: true });
      return;
    }
    reloadAll();
  }, [isAuthenticated, navigate, reloadAll]);

  async function saveAbout(e) {
    e.preventDefault();
    try {
      await apiFetch('/api/v1/admin/about-me', {
        method: 'PUT',
        body: JSON.stringify(about),
      });
      flash('Sobre mí guardado correctamente.');
    } catch (ex) {
      flash(ex.body?.message || ex.message || 'Error al guardar', false);
    }
  }

  function startEditProject(p) {
    setProjEditId(p.id);
    setProjForm({
      title: p.title || '',
      description: p.description || '',
      projectUrl: p.projectUrl || '',
      imageUrl1: p.imageUrl1 || '',
      imageUrl2: p.imageUrl2 || '',
      technologies: p.technologies || '',
      sortOrder: p.sortOrder ?? 0,
    });
  }

  function cancelProj() {
    setProjEditId(null);
    setProjForm(emptyProj());
  }

  async function submitProject(e) {
    e.preventDefault();
    try {
      if (projEditId) {
        await apiFetch(`/api/v1/admin/projects/${projEditId}`, {
          method: 'PUT',
          body: JSON.stringify(projForm),
        });
        flash('Proyecto actualizado.');
      } else {
        await apiFetch('/api/v1/admin/projects', {
          method: 'POST',
          body: JSON.stringify(projForm),
        });
        flash('Proyecto añadido.');
      }
      cancelProj();
      reloadAll();
    } catch (ex) {
      flash(ex.body?.message || ex.message || 'Error', false);
    }
  }

  async function delProject(id) {
    if (!window.confirm('¿Eliminar este proyecto?')) return;
    try {
      await apiFetch(`/api/v1/admin/projects/${id}`, { method: 'DELETE' });
      if (projEditId === id) cancelProj();
      flash('Proyecto eliminado.');
      reloadAll();
    } catch (ex) {
      flash(ex.body?.message || ex.message || 'Error', false);
    }
  }

  function startEditEdu(ed) {
    setEduEditId(ed.id);
    setEduForm({
      institution: ed.institution || '',
      degree: ed.degree || '',
      periodLabel: ed.periodLabel || '',
      description: ed.description || '',
      certificateUrl: ed.certificateUrl || '',
      sortOrder: ed.sortOrder ?? 0,
    });
  }

  function cancelEdu() {
    setEduEditId(null);
    setEduForm(emptyEdu());
  }

  async function submitEducation(e) {
    e.preventDefault();
    try {
      if (eduEditId) {
        await apiFetch(`/api/v1/admin/education/${eduEditId}`, {
          method: 'PUT',
          body: JSON.stringify(eduForm),
        });
        flash('Educación actualizada.');
      } else {
        await apiFetch('/api/v1/admin/education', {
          method: 'POST',
          body: JSON.stringify(eduForm),
        });
        flash('Educación añadida.');
      }
      cancelEdu();
      reloadAll();
    } catch (ex) {
      flash(ex.body?.message || ex.message || 'Error', false);
    }
  }

  async function delEducation(id) {
    if (!window.confirm('¿Eliminar este registro?')) return;
    try {
      await apiFetch(`/api/v1/admin/education/${id}`, { method: 'DELETE' });
      if (eduEditId === id) cancelEdu();
      flash('Registro eliminado.');
      reloadAll();
    } catch (ex) {
      flash(ex.body?.message || ex.message || 'Error', false);
    }
  }

  function startEditSkill(sk) {
    setSkillEditId(sk.id);
    setSkillForm({
      name: sk.name || '',
      category: sk.category || '',
      notes: sk.notes || '',
      sortOrder: sk.sortOrder ?? 0,
    });
  }

  function cancelSkill() {
    setSkillEditId(null);
    setSkillForm(emptySkill());
  }

  async function submitSkill(e) {
    e.preventDefault();
    try {
      if (skillEditId) {
        await apiFetch(`/api/v1/admin/skills/${skillEditId}`, {
          method: 'PUT',
          body: JSON.stringify(skillForm),
        });
        flash('Habilidad actualizada.');
      } else {
        await apiFetch('/api/v1/admin/skills', {
          method: 'POST',
          body: JSON.stringify(skillForm),
        });
        flash('Habilidad añadida.');
      }
      cancelSkill();
      reloadAll();
    } catch (ex) {
      flash(ex.body?.message || ex.message || 'Error', false);
    }
  }

  async function delSkill(id) {
    if (!window.confirm('¿Eliminar esta habilidad?')) return;
    try {
      await apiFetch(`/api/v1/admin/skills/${id}`, { method: 'DELETE' });
      if (skillEditId === id) cancelSkill();
      flash('Habilidad eliminada.');
      reloadAll();
    } catch (ex) {
      flash(ex.body?.message || ex.message || 'Error', false);
    }
  }

  function startEditWork(w) {
    setWorkEditId(w.id);
    setWorkForm({
      company: w.company || '',
      roleTitle: w.roleTitle || '',
      periodLabel: w.periodLabel || '',
      description: w.description || '',
      sortOrder: w.sortOrder ?? 0,
    });
  }

  function cancelWork() {
    setWorkEditId(null);
    setWorkForm(emptyWork());
  }

  async function submitWork(e) {
    e.preventDefault();
    try {
      if (workEditId) {
        await apiFetch(`/api/v1/admin/work-experience/${workEditId}`, {
          method: 'PUT',
          body: JSON.stringify(workForm),
        });
        flash('Experiencia laboral actualizada.');
      } else {
        await apiFetch('/api/v1/admin/work-experience', {
          method: 'POST',
          body: JSON.stringify(workForm),
        });
        flash('Experiencia laboral añadida.');
      }
      cancelWork();
      reloadAll();
    } catch (ex) {
      flash(ex.body?.message || ex.message || 'Error', false);
    }
  }

  async function delWork(id) {
    if (!window.confirm('¿Eliminar esta experiencia laboral?')) return;
    try {
      await apiFetch(`/api/v1/admin/work-experience/${id}`, { method: 'DELETE' });
      if (workEditId === id) cancelWork();
      flash('Eliminado.');
      reloadAll();
    } catch (ex) {
      flash(ex.body?.message || ex.message || 'Error', false);
    }
  }

  if (!isAuthenticated) return null;

  return (
    <div className="admin-xp-root">
      <div className="admin-xp-window">
        <div className="admin-xp-titlebar">
          <span>Estudio del portfolio — Windows XP Edition</span>
          <div className="admin-xp-actions" style={{ margin: 0 }}>
            <button type="button" onClick={() => navigate('/start')}>
              Escritorio
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
        </div>
        <div className="admin-xp-body">
          {loadErr ? <div className="admin-xp-msg">{loadErr}</div> : null}
          {msg.text ? (
            <div className={msg.ok ? 'admin-xp-msg admin-xp-msg--ok' : 'admin-xp-msg'}>{msg.text}</div>
          ) : null}

          <div className="admin-xp-tabs">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={tab === t.id ? 'admin-xp-tab--on' : ''}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'about' && (
            <form onSubmit={saveAbout}>
              <div className="admin-xp-field">
                <label>Título / headline</label>
                <input
                  value={about.headline}
                  onChange={(e) => setAbout((a) => ({ ...a, headline: e.target.value }))}
                />
              </div>
              <div className="admin-xp-field">
                <label>Biografía (Sobre mí)</label>
                <textarea
                  value={about.bio}
                  onChange={(e) => setAbout((a) => ({ ...a, bio: e.target.value }))}
                />
              </div>
              <div className="admin-xp-field">
                <label>Tagline (subtítulo)</label>
                <input
                  value={about.tagline}
                  onChange={(e) => setAbout((a) => ({ ...a, tagline: e.target.value }))}
                />
              </div>
              <div className="admin-xp-field">
                <label>Cita Luna / frase XP (opcional)</label>
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
          )}

          {tab === 'projects' && (
            <>
              <ul className="admin-xp-list">
                {projects.map((p) => (
                  <li key={p.id}>
                    <div>
                      <strong>{p.title}</strong>
                      {p.technologies ? (
                        <div style={{ color: '#444' }}>{p.technologies}</div>
                      ) : null}
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button type="button" onClick={() => startEditProject(p)}>
                        Editar
                      </button>
                      <button type="button" onClick={() => delProject(p.id)}>
                        Eliminar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <form onSubmit={submitProject}>
                <p style={{ margin: '8px 0 4px', fontWeight: 'bold' }}>
                  {projEditId ? `Editando #${projEditId}` : 'Nuevo proyecto'}
                </p>
                <div className="admin-xp-field">
                  <label>Título</label>
                  <input
                    value={projForm.title}
                    onChange={(e) => setProjForm((f) => ({ ...f, title: e.target.value }))}
                    required
                  />
                </div>
                <div className="admin-xp-field">
                  <label>Descripción</label>
                  <textarea
                    value={projForm.description}
                    onChange={(e) => setProjForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </div>
                <div className="admin-xp-field">
                  <label>URL del proyecto</label>
                  <input
                    value={projForm.projectUrl}
                    onChange={(e) => setProjForm((f) => ({ ...f, projectUrl: e.target.value }))}
                  />
                </div>
                <div className="admin-xp-field">
                  <label>URL imagen 1 (opcional)</label>
                  <input
                    type="url"
                    value={projForm.imageUrl1}
                    onChange={(e) => setProjForm((f) => ({ ...f, imageUrl1: e.target.value }))}
                    placeholder="https://…"
                  />
                </div>
                <div className="admin-xp-field">
                  <label>URL imagen 2 (opcional)</label>
                  <input
                    type="url"
                    value={projForm.imageUrl2}
                    onChange={(e) => setProjForm((f) => ({ ...f, imageUrl2: e.target.value }))}
                    placeholder="https://…"
                  />
                </div>
                <div className="admin-xp-field">
                  <label>Tecnologías (texto corto)</label>
                  <input
                    value={projForm.technologies}
                    onChange={(e) => setProjForm((f) => ({ ...f, technologies: e.target.value }))}
                  />
                </div>
                <div className="admin-xp-field">
                  <label>Orden</label>
                  <input
                    type="number"
                    value={projForm.sortOrder}
                    onChange={(e) =>
                      setProjForm((f) => ({ ...f, sortOrder: Number(e.target.value) || 0 }))
                    }
                  />
                </div>
                <div className="admin-xp-actions">
                  <button type="submit" className="admin-xp-btn-primary">
                    {projEditId ? 'Guardar cambios' : 'Añadir proyecto'}
                  </button>
                  {projEditId ? (
                    <button type="button" onClick={cancelProj}>
                      Cancelar edición
                    </button>
                  ) : null}
                </div>
              </form>
            </>
          )}

          {tab === 'work' && (
            <>
              <ul className="admin-xp-list">
                {workExp.map((w) => (
                  <li key={w.id}>
                    <div>
                      <strong>{w.company}</strong>
                      <div style={{ color: '#444' }}>
                        {[w.roleTitle, w.periodLabel].filter(Boolean).join(' · ')}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button type="button" onClick={() => startEditWork(w)}>
                        Editar
                      </button>
                      <button type="button" onClick={() => delWork(w.id)}>
                        Eliminar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <form onSubmit={submitWork}>
                <p style={{ margin: '8px 0 4px', fontWeight: 'bold' }}>
                  {workEditId ? `Editando #${workEditId}` : 'Nueva experiencia laboral'}
                </p>
                <div className="admin-xp-field">
                  <label>Empresa</label>
                  <input
                    value={workForm.company}
                    onChange={(e) => setWorkForm((f) => ({ ...f, company: e.target.value }))}
                    required
                  />
                </div>
                <div className="admin-xp-field">
                  <label>Puesto / rol</label>
                  <input
                    value={workForm.roleTitle}
                    onChange={(e) => setWorkForm((f) => ({ ...f, roleTitle: e.target.value }))}
                  />
                </div>
                <div className="admin-xp-field">
                  <label>Período</label>
                  <input
                    value={workForm.periodLabel}
                    onChange={(e) => setWorkForm((f) => ({ ...f, periodLabel: e.target.value }))}
                  />
                </div>
                <div className="admin-xp-field">
                  <label>Descripción</label>
                  <textarea
                    value={workForm.description}
                    onChange={(e) => setWorkForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </div>
                <div className="admin-xp-field">
                  <label>Orden</label>
                  <input
                    type="number"
                    value={workForm.sortOrder}
                    onChange={(e) =>
                      setWorkForm((f) => ({ ...f, sortOrder: Number(e.target.value) || 0 }))
                    }
                  />
                </div>
                <div className="admin-xp-actions">
                  <button type="submit" className="admin-xp-btn-primary">
                    {workEditId ? 'Guardar' : 'Añadir'}
                  </button>
                  {workEditId ? (
                    <button type="button" onClick={cancelWork}>
                      Cancelar
                    </button>
                  ) : null}
                </div>
              </form>
            </>
          )}

          {tab === 'education' && (
            <>
              <ul className="admin-xp-list">
                {education.map((ed) => (
                  <li key={ed.id}>
                    <div>
                      <strong>{ed.institution}</strong>
                      <div style={{ color: '#444' }}>
                        {ed.degree} {ed.periodLabel ? `· ${ed.periodLabel}` : ''}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button type="button" onClick={() => startEditEdu(ed)}>
                        Editar
                      </button>
                      <button type="button" onClick={() => delEducation(ed.id)}>
                        Eliminar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <form onSubmit={submitEducation}>
                <p style={{ margin: '8px 0 4px', fontWeight: 'bold' }}>
                  {eduEditId ? `Editando #${eduEditId}` : 'Nueva educación'}
                </p>
                <div className="admin-xp-field">
                  <label>Institución</label>
                  <input
                    value={eduForm.institution}
                    onChange={(e) => setEduForm((f) => ({ ...f, institution: e.target.value }))}
                    required
                  />
                </div>
                <div className="admin-xp-field">
                  <label>Título / carrera</label>
                  <input
                    value={eduForm.degree}
                    onChange={(e) => setEduForm((f) => ({ ...f, degree: e.target.value }))}
                  />
                </div>
                <div className="admin-xp-field">
                  <label>Período (ej. 2020 — 2024)</label>
                  <input
                    value={eduForm.periodLabel}
                    onChange={(e) => setEduForm((f) => ({ ...f, periodLabel: e.target.value }))}
                  />
                </div>
                <div className="admin-xp-field">
                  <label>Descripción</label>
                  <textarea
                    value={eduForm.description}
                    onChange={(e) => setEduForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </div>
                <div className="admin-xp-field">
                  <label>URL del certificado (opcional)</label>
                  <input
                    type="url"
                    value={eduForm.certificateUrl}
                    onChange={(e) => setEduForm((f) => ({ ...f, certificateUrl: e.target.value }))}
                    placeholder="https://…"
                  />
                </div>
                <div className="admin-xp-field">
                  <label>Orden</label>
                  <input
                    type="number"
                    value={eduForm.sortOrder}
                    onChange={(e) =>
                      setEduForm((f) => ({ ...f, sortOrder: Number(e.target.value) || 0 }))
                    }
                  />
                </div>
                <div className="admin-xp-actions">
                  <button type="submit" className="admin-xp-btn-primary">
                    {eduEditId ? 'Guardar' : 'Añadir educación'}
                  </button>
                  {eduEditId ? (
                    <button type="button" onClick={cancelEdu}>
                      Cancelar edición
                    </button>
                  ) : null}
                </div>
              </form>
            </>
          )}

          {tab === 'skills' && (
            <>
              <ul className="admin-xp-list">
                {skills.map((sk) => (
                  <li key={sk.id}>
                    <div>
                      <strong>{sk.name}</strong>
                      {sk.category ? <div style={{ color: '#444' }}>{sk.category}</div> : null}
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button type="button" onClick={() => startEditSkill(sk)}>
                        Editar
                      </button>
                      <button type="button" onClick={() => delSkill(sk.id)}>
                        Eliminar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <form onSubmit={submitSkill}>
                <p style={{ margin: '8px 0 4px', fontWeight: 'bold' }}>
                  {skillEditId ? `Editando #${skillEditId}` : 'Nueva habilidad'}
                </p>
                <div className="admin-xp-field">
                  <label>Nombre</label>
                  <input
                    value={skillForm.name}
                    onChange={(e) => setSkillForm((f) => ({ ...f, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="admin-xp-field">
                  <label>Categoría (ej. Lenguajes, Frameworks)</label>
                  <input
                    value={skillForm.category}
                    onChange={(e) => setSkillForm((f) => ({ ...f, category: e.target.value }))}
                  />
                </div>
                <div className="admin-xp-field">
                  <label>Notas / nivel</label>
                  <input
                    value={skillForm.notes}
                    onChange={(e) => setSkillForm((f) => ({ ...f, notes: e.target.value }))}
                  />
                </div>
                <div className="admin-xp-field">
                  <label>Orden</label>
                  <input
                    type="number"
                    value={skillForm.sortOrder}
                    onChange={(e) =>
                      setSkillForm((f) => ({ ...f, sortOrder: Number(e.target.value) || 0 }))
                    }
                  />
                </div>
                <div className="admin-xp-actions">
                  <button type="submit" className="admin-xp-btn-primary">
                    {skillEditId ? 'Guardar' : 'Añadir habilidad'}
                  </button>
                  {skillEditId ? (
                    <button type="button" onClick={cancelSkill}>
                      Cancelar edición
                    </button>
                  ) : null}
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
