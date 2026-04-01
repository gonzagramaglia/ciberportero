export interface Subject {
  id: number;
  name: string;
  hours: number;
  year: number;
  term: number;
  prerequisites: number[];
}

export const curriculum: Subject[] = [
  { id: 1, name: "Análisis Matemático I", hours: 64, year: 1, term: 1, prerequisites: [] },
  { id: 2, name: "Álgebra I", hours: 64, year: 1, term: 1, prerequisites: [] },
  { id: 3, name: "Gestión de Servicios de Información", hours: 64, year: 1, term: 1, prerequisites: [] },
  { id: 4, name: "Inglés I", hours: 64, year: 1, term: 1, prerequisites: [] },
  { id: 5, name: "Sistemas Operativos I", hours: 64, year: 1, term: 1, prerequisites: [] },
  { id: 6, name: "Sistemas de Tratamiento de Datos", hours: 64, year: 1, term: 2, prerequisites: [3] },
  { id: 7, name: "Infraestructura de Telecomunicaciones", hours: 64, year: 1, term: 2, prerequisites: [3] },
  { id: 8, name: "Sociedad y Estado", hours: 64, year: 1, term: 2, prerequisites: [] },
  { id: 9, name: "Sistemas Operativos II", hours: 64, year: 1, term: 2, prerequisites: [5] },
  { id: 10, name: "Lenguajes de Programación", hours: 64, year: 1, term: 2, prerequisites: [] },
  { id: 11, name: "Análisis Matemático II", hours: 64, year: 2, term: 1, prerequisites: [1] },
  { id: 12, name: "Álgebra II", hours: 64, year: 2, term: 1, prerequisites: [2] },
  { id: 13, name: "Probabilidad y Estadística", hours: 64, year: 2, term: 1, prerequisites: [] },
  { id: 14, name: "Inglés II", hours: 64, year: 2, term: 1, prerequisites: [4] },
  { id: 15, name: "Tecnología Operativa", hours: 80, year: 2, term: 1, prerequisites: [] },
  { id: 16, name: "Programación Segura", hours: 96, year: 2, term: 2, prerequisites: [6, 7, 10] },
  { id: 17, name: "Ciberseguridad Aplicada", hours: 80, year: 2, term: 2, prerequisites: [] },
  { id: 18, name: "Dispositivos Remotos e Internet de las Cosas", hours: 64, year: 2, term: 2, prerequisites: [] },
  { id: 19, name: "Ética Profesional", hours: 64, year: 2, term: 2, prerequisites: [] },
  { id: 20, name: "Sistema de Gestión de Seguridad de la Información", hours: 96, year: 3, term: 1, prerequisites: [3, 6, 7, 17] },
  { id: 21, name: "Protección de Infraestructuras Críticas", hours: 64, year: 3, term: 1, prerequisites: [3, 8, 17] },
  { id: 22, name: "Metodologías de Análisis de Riesgos de TIC", hours: 80, year: 3, term: 1, prerequisites: [] },
  { id: 23, name: "Análisis de Escenarios y Capacidades", hours: 64, year: 3, term: 1, prerequisites: [] },
  { id: 24, name: "Gobierno y Políticas Públicas", hours: 64, year: 3, term: 2, prerequisites: [8] },
  { id: 25, name: "Informática Forense", hours: 80, year: 3, term: 2, prerequisites: [5, 16, 20] },
  { id: 26, name: "Relaciones Internacionales", hours: 64, year: 3, term: 2, prerequisites: [] },
  { id: 27, name: "Inteligencia Artificial y Aprendizaje de Máquina", hours: 80, year: 3, term: 2, prerequisites: [10] },
  { id: 28, name: "Geopolítica", hours: 64, year: 3, term: 2, prerequisites: [] },
  { id: 29, name: "Derecho Aplicado a la Defensa Nacional", hours: 80, year: 4, term: 1, prerequisites: [8] },
  { id: 30, name: "Sistema de Inteligencia Nacional", hours: 80, year: 4, term: 1, prerequisites: [] },
  { id: 31, name: "Investigación Operativa", hours: 80, year: 4, term: 1, prerequisites: [] },
  { id: 32, name: "Criptografía Aplicada", hours: 96, year: 4, term: 1, prerequisites: [21] },
  { id: 33, name: "Gestión de Proyectos", hours: 64, year: 4, term: 2, prerequisites: [] },
  { id: 34, name: "Instrumento Militar y su Sistema de Armas", hours: 80, year: 4, term: 2, prerequisites: [30] },
  { id: 35, name: "Modelos y Simulación", hours: 80, year: 4, term: 2, prerequisites: [31] },
  { id: 36, name: "Prospectiva Estratégica y Táctica", hours: 64, year: 4, term: 2, prerequisites: [35] },
  { id: 37, name: "Actores en el Quinto Dominio", hours: 64, year: 4, term: 2, prerequisites: [] },
];
