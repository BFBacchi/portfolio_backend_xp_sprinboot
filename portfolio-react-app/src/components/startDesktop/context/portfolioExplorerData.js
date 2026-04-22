import { EXPLORER_PATHS } from "./explorerFs";

const PORTFOLIO_PATHS = new Set([
  "portfolio",
  "portfolioprojects",
  "portfolieducation",
  "portfoliowork",
  "portfolioskills",
]);

/** Evita caracteres inválidos en nombres de archivo del explorador */
export function sanitizeExplorerFileName(name) {
  const s = String(name || "sin_titulo")
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, "_")
    .trim();
  return s || "sin_titulo";
}

function lines(...parts) {
  return parts.filter((p) => p != null && String(p).trim() !== "").join("\n\n");
}

export function buildReadmeMarkdown(readmeType, readmeId, ctx) {
  const { about, projects, education, skills, workExperience, error } = ctx;

  if (readmeType === "error") {
    return `# Error al cargar el portfolio\n\n${error || "Error desconocido."}\n`;
  }

  if (readmeType === "about") {
    if (!about) return "# Sobre mí\n\n_Sin datos en la base._\n";
    const parts = [];
    if (about.headline) parts.push(`# ${about.headline}`);
    else parts.push("# Sobre mí");
    if (about.tagline) parts.push(`_${about.tagline}_`);
    if (about.bio) parts.push(about.bio);
    if (about.lunaQuote) parts.push(`> «${about.lunaQuote}»`);
    if (about.xpFlavorNote) parts.push(about.xpFlavorNote);
    return `${parts.join("\n\n")}\n`;
  }

  if (readmeType === "project") {
    const p = projects.find((x) => x.id === readmeId);
    if (!p) return "# Proyecto\n\n_No encontrado._\n";
    const tech = p.technologies ? `**Tecnologías:** ${p.technologies}` : null;
    const link = p.projectUrl ? `**Enlace:** ${p.projectUrl}` : null;
    const img =
      p.imageUrl1 || p.imageUrl2
        ? `**Capturas:**\n- ${p.imageUrl1 || "—"}\n- ${p.imageUrl2 || "—"}`
        : null;
    return lines(`# ${p.title}`, tech, p.description || null, link, img);
  }

  if (readmeType === "education") {
    const ed = education.find((x) => x.id === readmeId);
    if (!ed) return "# Educación\n\n_No encontrado._\n";
    const head = [ed.institution, ed.degree].filter(Boolean).join(" — ");
    const period = ed.periodLabel ? `**Período:** ${ed.periodLabel}` : null;
    const cert = ed.certificateUrl ? `**Certificado:** ${ed.certificateUrl}` : null;
    return lines(`# ${head}`, period, ed.description || null, cert);
  }

  if (readmeType === "work") {
    const w = workExperience.find((x) => x.id === readmeId);
    if (!w) return "# Experiencia laboral\n\n_No encontrado._\n";
    const sub = [w.roleTitle, w.periodLabel].filter(Boolean).join(" · ");
    return lines(`# ${w.company}`, sub ? `_${sub}_` : null, w.description || null);
  }

  if (readmeType === "skill") {
    const sk = skills.find((x) => x.id === readmeId);
    if (!sk) return "# Habilidad\n\n_No encontrado._\n";
    const cat = sk.category ? `**Categoría:** ${sk.category}` : null;
    return lines(`# ${sk.name}`, cat, sk.notes || null);
  }

  return "# Documento\n\n_Sin contenido._\n";
}

function loadingRow() {
  return [
    {
      name: "Cargando…",
      size: "",
      type: "Sistema",
      date: "—",
      icon: "doc",
      loadingPlaceholder: true,
    },
  ];
}

/**
 * Nodo del explorador para rutas del portfolio (datos API públicos).
 * @returns {null | object} null → usar solo EXPLORER_PATHS[path]
 */
export function getPortfolioExplorerNode(path, ctx) {
  if (!PORTFOLIO_PATHS.has(path)) return null;

  const base = EXPLORER_PATHS[path];
  if (!base) return null;

  const { loading, error, projects, education, skills, workExperience } = ctx;

  if (loading) {
    return { ...base, items: loadingRow() };
  }

  if (error) {
    return {
      ...base,
      items: [
        {
          name: "Error_carga.md",
          size: "1 KB",
          type: "Documento Markdown",
          date: "—",
          icon: "doc",
          action: "portfolioReadme",
          readmeType: "error",
        },
      ],
    };
  }

  if (path === "portfolio") {
    return {
      ...base,
      items: [
        {
          name: "Sobre_mi.md",
          size: "—",
          type: "Documento Markdown",
          date: "—",
          icon: "doc",
          action: "portfolioReadme",
          readmeType: "about",
        },
        {
          name: "Proyectos",
          size: "",
          type: "Carpeta de archivos",
          date: "—",
          navigateTo: "portfolioprojects",
          icon: "folder",
        },
        {
          name: "Educación",
          size: "",
          type: "Carpeta de archivos",
          date: "—",
          navigateTo: "portfolieducation",
          icon: "folder",
        },
        {
          name: "Experiencia_laboral",
          size: "",
          type: "Carpeta de archivos",
          date: "—",
          navigateTo: "portfoliowork",
          icon: "folder",
        },
        {
          name: "Habilidades",
          size: "",
          type: "Carpeta de archivos",
          date: "—",
          navigateTo: "portfolioskills",
          icon: "folder",
        },
      ],
    };
  }

  if (path === "portfolioprojects") {
    const items = projects.map((p) => ({
      name: `${sanitizeExplorerFileName(p.title)}.md`,
      size: "—",
      type: "Documento Markdown",
      date: "—",
      icon: "doc",
      action: "portfolioReadme",
      readmeType: "project",
      readmeId: p.id,
    }));
    return { ...base, items };
  }

  if (path === "portfolieducation") {
    const items = education.map((ed) => ({
      name: `${sanitizeExplorerFileName(ed.institution || ed.degree || "estudio")}.md`,
      size: "—",
      type: "Documento Markdown",
      date: "—",
      icon: "doc",
      action: "portfolioReadme",
      readmeType: "education",
      readmeId: ed.id,
    }));
    return { ...base, items };
  }

  if (path === "portfoliowork") {
    const items = workExperience.map((w) => ({
      name: `${sanitizeExplorerFileName(w.company || w.roleTitle || "empleo")}.md`,
      size: "—",
      type: "Documento Markdown",
      date: "—",
      icon: "doc",
      action: "portfolioReadme",
      readmeType: "work",
      readmeId: w.id,
    }));
    return { ...base, items };
  }

  if (path === "portfolioskills") {
    const items = skills.map((sk) => ({
      name: `${sanitizeExplorerFileName(sk.name)}.md`,
      size: "—",
      type: "Documento Markdown",
      date: "—",
      icon: "doc",
      action: "portfolioReadme",
      readmeType: "skill",
      readmeId: sk.id,
    }));
    return { ...base, items };
  }

  return { ...base, items: [] };
}
