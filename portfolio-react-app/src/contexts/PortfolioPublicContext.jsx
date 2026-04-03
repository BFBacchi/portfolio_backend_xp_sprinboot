import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { apiFetch } from '../api/client';

const PortfolioPublicContext = createContext(null);

export function PortfolioPublicProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [about, setAbout] = useState(null);
  const [projects, setProjects] = useState([]);
  const [education, setEducation] = useState([]);
  const [skills, setSkills] = useState([]);
  const [workExperience, setWorkExperience] = useState([]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [a, p, e, s, w] = await Promise.all([
        apiFetch('/api/v1/public/about-me', { omitAuth: true }),
        apiFetch('/api/v1/public/projects', { omitAuth: true }),
        apiFetch('/api/v1/public/education', { omitAuth: true }),
        apiFetch('/api/v1/public/skills', { omitAuth: true }),
        apiFetch('/api/v1/public/work-experience', { omitAuth: true }),
      ]);
      setAbout(a);
      setProjects(Array.isArray(p) ? p : []);
      setEducation(Array.isArray(e) ? e : []);
      setSkills(Array.isArray(s) ? s : []);
      setWorkExperience(Array.isArray(w) ? w : []);
    } catch (ex) {
      setError(ex.body?.message || ex.message || 'No se pudo cargar el portfolio público');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({
      loading,
      error,
      about,
      projects,
      education,
      skills,
      workExperience,
      refresh,
    }),
    [loading, error, about, projects, education, skills, workExperience, refresh]
  );

  return (
    <PortfolioPublicContext.Provider value={value}>{children}</PortfolioPublicContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- hook emparejado con el provider
export function usePortfolioPublic() {
  const ctx = useContext(PortfolioPublicContext);
  if (!ctx) {
    throw new Error('usePortfolioPublic debe usarse dentro de PortfolioPublicProvider');
  }
  return ctx;
}
