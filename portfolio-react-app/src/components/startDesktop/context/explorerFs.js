/** Árbol simulado de rutas para el Explorador (Mi PC) */

export const EXPLORER_PATHS = {
  mycomputer: {
    title: "Mi PC",
    address: "Mi PC",
    parent: null,
    items: [
      {
        name: "Disco local (C:)",
        size: "",
        type: "Disco local",
        date: "02/04/2026 12:00",
        navigateTo: "c:",
        icon: "drive",
      },
      {
        name: "Documentos compartidos",
        size: "",
        type: "Carpeta de archivos compartidos",
        date: "01/04/2026 09:15",
        navigateTo: "shared",
        icon: "folder",
      },
      {
        name: "Bruno Bacchi (portfolio)",
        size: "",
        type: "Carpeta de archivos",
        date: "02/04/2026 18:30",
        navigateTo: "portfolio",
        icon: "folder",
      },
    ],
  },
  "c:": {
    title: "Disco local (C:)",
    address: "C:\\",
    parent: "mycomputer",
    items: [
      {
        name: "Archivos de programa",
        size: "",
        type: "Carpeta de archivos",
        date: "15/03/2026 10:22",
        navigateTo: "c:programfiles",
        icon: "folder",
      },
      {
        name: "Windows",
        size: "",
        type: "Carpeta de archivos",
        date: "01/04/2026 08:00",
        navigateTo: "c:windows",
        icon: "folder",
      },
      {
        name: "pagefile.sys",
        size: "768 MB",
        type: "Archivo de sistema",
        date: "02/04/2026 06:00",
        icon: "sys",
      },
    ],
  },
  cprogramfiles: {
    title: "Archivos de programa",
    address: "C:\\Archivos de programa",
    parent: "c:",
    items: [
      {
        name: "Internet Explorer",
        size: "",
        type: "Carpeta de archivos",
        date: "10/01/2006 14:00",
        navigateTo: "c:ie",
        icon: "folder",
      },
      {
        name: "Accesorios",
        size: "",
        type: "Carpeta de archivos",
        date: "12/03/2006 11:30",
        navigateTo: "c:accessories",
        icon: "folder",
      },
    ],
  },
  cwindows: {
    title: "Windows",
    address: "C:\\Windows",
    parent: "c:",
    items: [
      {
        name: "System32",
        size: "",
        type: "Carpeta de archivos",
        date: "20/02/2006 09:45",
        navigateTo: "c:system32",
        icon: "folder",
      },
      {
        name: "explorer.exe",
        size: "102 KB",
        type: "Aplicación",
        date: "14/08/2004 12:00",
        icon: "exe",
      },
    ],
  },
  csystem32: {
    title: "System32",
    address: "C:\\Windows\\System32",
    parent: "c:windows",
    items: [
      {
        name: "notepad.exe",
        size: "67 KB",
        type: "Aplicación",
        date: "14/08/2004 12:00",
        action: "notepad",
        icon: "exe",
      },
      {
        name: "calc.exe",
        size: "112 KB",
        type: "Aplicación",
        date: "14/08/2004 12:00",
        action: "calc",
        icon: "exe",
      },
    ],
  },
  cie: {
    title: "Internet Explorer",
    address: "C:\\Archivos de programa\\Internet Explorer",
    parent: "cprogramfiles",
    items: [
      {
        name: "iexplore.exe",
        size: "93 KB",
        type: "Aplicación",
        date: "14/08/2004 12:00",
        icon: "exe",
      },
    ],
  },
  caccessories: {
    title: "Accesorios",
    address: "C:\\Archivos de programa\\Accesorios",
    parent: "cprogramfiles",
    items: [
      {
        name: "Bloc de notas",
        size: "",
        type: "Acceso directo",
        date: "02/04/2026 18:00",
        action: "notepad",
        icon: "shortcut",
      },
      {
        name: "Calculadora",
        size: "",
        type: "Acceso directo",
        date: "02/04/2026 18:00",
        action: "calc",
        icon: "shortcut",
      },
    ],
  },
  shared: {
    title: "Documentos compartidos",
    address: "Documentos compartidos",
    parent: "mycomputer",
    items: [
      {
        name: "Documentos públicos",
        size: "",
        type: "Carpeta de archivos",
        date: "01/04/2026 09:15",
        navigateTo: "sharedpublic",
        icon: "folder",
      },
    ],
  },
  sharedpublic: {
    title: "Documentos públicos",
    address: "\\Documentos compartidos\\Documentos públicos",
    parent: "shared",
    items: [
      {
        name: "Leeme.txt",
        size: "1 KB",
        type: "Documento de texto",
        date: "02/04/2026 17:00",
        icon: "doc",
      },
    ],
  },
  portfolio: {
    title: "Bruno Bacchi (portfolio)",
    address: "Bruno Bacchi (portfolio)",
    parent: "mycomputer",
    items: [],
  },
  portfolioprojects: {
    title: "Proyectos",
    address: "Bruno Bacchi (portfolio)\\Proyectos",
    parent: "portfolio",
    items: [],
  },
  portfolieducation: {
    title: "Educación",
    address: "Bruno Bacchi (portfolio)\\Educación",
    parent: "portfolio",
    items: [],
  },
  portfoliowork: {
    title: "Experiencia laboral",
    address: "Bruno Bacchi (portfolio)\\Experiencia laboral",
    parent: "portfolio",
    items: [],
  },
  portfolioskills: {
    title: "Habilidades",
    address: "Bruno Bacchi (portfolio)\\Habilidades",
    parent: "portfolio",
    items: [],
  },
  documents: {
    title: "Mis documentos",
    address: "C:\\Documents and Settings\\Bruno\\Mis documentos",
    parent: "mycomputer",
    items: [
      {
        name: "Mi música",
        size: "",
        type: "Carpeta de archivos",
        date: "02/04/2026 14:00",
        icon: "folder",
      },
      {
        name: "Mis imágenes",
        size: "",
        type: "Carpeta de archivos",
        date: "02/04/2026 14:00",
        icon: "folder",
      },
    ],
  },
};

export const DEFAULT_EXPLORER_PATH = "mycomputer";
