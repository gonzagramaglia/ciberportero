"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import { curriculum } from "@/data/curriculum";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import {
  CheckCircle,
  Info,
  Lock,
  ChevronLeft,
  ChevronDown,
  Layers,
  Star,
  Zap,
  Coffee,
  Youtube,
  Search,
  X,
  Calendar,
  ExternalLink,
  Twitch,
  Home,
  BookOpen,
  RotateCcw,
} from "lucide-react";
import NotificationBanners from "@/components/NotificationBanners";
import CountdownWidget from "@/components/CountdownWidget";
import SyncStatus from "@/components/SyncStatus";
import { normalizeString } from "@/lib/string-utils";
import { useSession } from "next-auth/react";
import { getUserProgress, updateUserProgress } from "@/lib/actions";
import {
  SignInButton,
  SignOutButton,
  AdminPanelButton,
} from "@/components/AuthButtons";
import CommentSection from "@/components/CommentSection";
import { FaXTwitter } from "react-icons/fa6";
import { TbBrandGithub } from "react-icons/tb";
import FloatingMusicButton from "@/components/FloatingMusicButton";
import FloatingFootballButton from "@/components/FloatingFootballButton";

// ── Reglamento Académico ───────────────────────────────────────────────────
const reglamentoData = {
  es: [
    {
      id: "regularidad",
      icon: "📋",
      title: "Regularidad de la Carrera",
      subtitle: "Res. Rectoral UNDEF N° 326/2025 · Cap. 4, Art. 3.2",
      items: [
        {
          label: "Mínimo de materias por año",
          value: "2 asignaturas aprobadas",
          highlight: true,
        },
        {
          label: "Límite de aplazos",
          value: "Máximo 33% del total de materias del plan",
        },
        {
          label: "Duración máxima",
          value:
            "El doble de los años académicos estipulados (4 años → máx. 8 años)",
        },
      ],
      note: "Si perdés la regularidad, podés solicitar reincorporación mediante nota dirigida a la Dirección de la carrera.",
    },
    {
      id: "promocion-directa",
      icon: "🏆",
      title: "Promoción Directa",
      subtitle: "Sin examen final — nota mínima 7",
      items: [
        {
          label: "Parciales requeridos",
          value: "Mínimo 2 instancias de evaluación",
          highlight: true,
        },
        {
          label: "Nota mínima en parciales",
          value: "7 puntos en todos los casos",
          highlight: true,
        },
        {
          label: "Actividades obligatorias",
          value: "Totalidad de las actividades propuestas por el docente",
        },
        {
          label: "Recuperatorio",
          value:
            "Si usás el recuperatorio, perdés la posibilidad de promoción directa",
        },
      ],
      note: "El promedio de parciales se redondea: ≥0.50 → número superior; ≤0.49 → número inferior. Excepción: de 3.01 a 3.99 → 3 puntos.",
    },
    {
      id: "examen-final",
      icon: "📝",
      title: "Promoción con Examen Final",
      subtitle: "Nota mínima 4 en parciales y final",
      items: [
        {
          label: "Parciales requeridos",
          value: "Mínimo 2 instancias de evaluación",
        },
        {
          label: "Nota mínima en parciales",
          value: "4 puntos en todos los casos",
        },
        {
          label: "Examen final",
          value:
            "Nota mínima 4 — la nota del final es la calificación definitiva",
          highlight: true,
        },
        {
          label: "Turnos disponibles",
          value: "3 turnos consecutivos desde la finalización de la cursada",
          highlight: true,
        },
        {
          label: "Vencimiento",
          value:
            "Al pasar los 3 turnos sin rendir, se pierde la regularidad de la materia y hay que recursarla",
        },
      ],
      note: null,
    },
    {
      id: "libre",
      icon: "🎓",
      title: "Régimen Libre",
      subtitle: "Sin cursar — examen escrito y oral",
      items: [
        {
          label: "Límite de materias en libre",
          value: "Hasta el 30% del plan de estudios",
          highlight: true,
        },
        {
          label: "Requisitos",
          value: "Ser alumno regular y tener aprobadas las correlativas",
        },
        {
          label: "Formato del examen",
          value: "Prueba escrita (obligatorio aprobarla) y luego prueba oral",
        },
        {
          label: "Programa",
          value: "Se evalúa sobre el programa vigente a la fecha del examen",
        },
      ],
      note: null,
    },
    {
      id: "recuperatorio",
      icon: "🔁",
      title: "Examen Recuperatorio",
      subtitle: "Una sola instancia disponible",
      items: [
        {
          label: "¿Cuándo aplica?",
          value: "Si faltaste con certificado médico o desaprobaste el parcial",
        },
        {
          label: "Instancias recuperables",
          value: "Solo 1 (UNA) instancia parcial por materia",
          highlight: true,
        },
        {
          label: "La nota reemplaza",
          value: "El ausente o el insuficiente original",
        },
        {
          label: "Consecuencia",
          value:
            "Usar el recuperatorio anula la posibilidad de Promoción Directa",
        },
      ],
      note: null,
    },
  ],
  en: [
    {
      id: "regularidad",
      icon: "📋",
      title: "Academic Continuity Requirements",
      subtitle: "Rector\u2019s Resolution UNDEF N° 326/2025 · Ch. 4, Art. 3.2",
      items: [
        {
          label: "Minimum subjects per year",
          value: "2 approved subjects",
          highlight: true,
        },
        {
          label: "Failed exam limit",
          value: "Maximum 33% of total subjects in the study plan",
        },
        {
          label: "Maximum duration",
          value: "Double the program length (4-year degree → max. 8 years)",
        },
      ],
      note: "If you lose regular student status, you may apply for reinstatement by submitting a written request to the Program Director.",
    },
    {
      id: "promocion-directa",
      icon: "🏆",
      title: "Direct Promotion",
      subtitle: "No final exam required — minimum grade: 7",
      items: [
        {
          label: "Required assessments",
          value: "At least 2 evaluation instances",
          highlight: true,
        },
        {
          label: "Minimum grade per assessment",
          value: "7 points in all cases",
          highlight: true,
        },
        {
          label: "Mandatory activities",
          value: "All activities assigned by the professor must be completed",
        },
        {
          label: "Make-up exam",
          value:
            "Using the make-up exam forfeits eligibility for Direct Promotion",
        },
      ],
      note: "Averages are rounded: ≥0.50 rounds up; ≤0.49 rounds down. Exception: 3.01–3.99 = 3 points.",
    },
    {
      id: "examen-final",
      icon: "📝",
      title: "Promotion with Final Exam",
      subtitle: "Minimum grade 4 on partials and final",
      items: [
        {
          label: "Required assessments",
          value: "At least 2 evaluation instances",
        },
        {
          label: "Minimum grade on assessments",
          value: "4 points in all cases",
        },
        {
          label: "Final exam",
          value:
            "Minimum grade 4 — the final exam grade is the definitive score",
          highlight: true,
        },
        {
          label: "Available sittings",
          value: "3 consecutive sittings after the course ends",
          highlight: true,
        },
        {
          label: "Expiry",
          value:
            "Missing all 3 sittings means losing the subject\u2019s regularity and having to retake the course",
        },
      ],
      note: null,
    },
    {
      id: "libre",
      icon: "🎓",
      title: "Free Exam Regime",
      subtitle: "No coursing required — written and oral exam",
      items: [
        {
          label: "Subject limit",
          value: "Up to 30% of the study plan",
          highlight: true,
        },
        {
          label: "Requirements",
          value: "Must be an active student with prerequisites approved",
        },
        {
          label: "Exam format",
          value: "Written exam (must pass) followed by an oral exam",
        },
        {
          label: "Syllabus",
          value: "Evaluated on the syllabus in effect at the exam date",
        },
      ],
      note: null,
    },
    {
      id: "recuperatorio",
      icon: "🔁",
      title: "Make-up Exam",
      subtitle: "One opportunity available",
      items: [
        {
          label: "When it applies",
          value: "Missed exam with medical certificate, or failed a partial",
        },
        {
          label: "Recoverable instances",
          value: "Only 1 (ONE) partial instance per subject",
          highlight: true,
        },
        {
          label: "Grade replaces",
          value: "The original absence or failing grade",
        },
        {
          label: "Consequence",
          value:
            "Using the make-up exam disqualifies you from Direct Promotion",
        },
      ],
      note: null,
    },
  ],
};

function ReglamentoSection({ lang }: { lang: "es" | "en" }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const toggle = (id: string) => setOpenId((prev) => (prev === id ? null : id));

  const es = lang === "es";

  const cards = [
    {
      id: "regularidad",
      color: "#3b82f6",
      bg: "#eff6ff",
      icon: "📋",
      title: es ? "Regularidad" : "Status",
      stats: [
        {
          value: "2",
          unit: es ? "materias/año" : "subjects/year",
          label: es ? "mínimo a aprobar" : "minimum to pass",
        },
        {
          value: "33%",
          unit: es ? "de aplazos" : "of fails",
          label: es ? "límite máximo" : "maximum limit",
        },
        {
          value: "2×",
          unit: es ? "años max." : "years max.",
          label: es ? "duración total" : "total duration",
        },
      ],
      details: es
        ? [
            "Aprobá mínimo 2 materias por año para mantener la regularidad.",
            "No superés el 33% de aplazos sobre el total del plan.",
            "La carrera no puede durar más del doble de años previstos (ej: 4 años → máx. 8 años).",
            "Si perdés la regularidad, podés solicitar reincorporación a la Dirección de la carrera.",
          ]
        : [
            "Pass at least 2 subjects per year to maintain regular status.",
            "Do not exceed 33% failed exams relative to the total plan.",
            "The degree cannot take more than double the planned years (e.g. 4 years → max. 8).",
            "If you lose regular status, you may apply for reinstatement to the Program Director.",
          ],
      warn: null,
    },
    {
      id: "promocion-directa",
      color: "#10b981",
      bg: "#ecfdf5",
      icon: "🏆",
      title: es ? "Promoción Directa" : "Direct Promotion",
      stats: [
        {
          value: "7",
          unit: es ? "en parciales" : "on partials",
          label: es ? "nota mínima" : "minimum grade",
        },
        {
          value: "2",
          unit: es ? "parciales" : "assessments",
          label: es ? "como mínimo" : "at least",
        },
        {
          value: "0",
          unit: es ? "examen final" : "final exam",
          label: es ? "no requerido" : "not required",
        },
      ],
      details: es
        ? [
            "Aprobá al menos 2 parciales con nota ≥ 7 en todos los casos.",
            "Cumplí todas las actividades obligatorias del docente.",
            "Si usás el recuperatorio, perdés la promoción directa automáticamente.",
            "El promedio se redondea: ≥0.50 → sube, ≤0.49 → baja. Entre 3.01 y 3.99 = 3 pts.",
          ]
        : [
            "Pass at least 2 partials with a grade ≥ 7 in all cases.",
            "Complete all mandatory activities assigned by the professor.",
            "Using the make-up exam forfeits Direct Promotion eligibility.",
            "Averages round: ≥0.50 rounds up, ≤0.49 rounds down. Between 3.01–3.99 = 3 pts.",
          ],
      warn: es
        ? "⚠️ El recuperatorio anula la promoción directa"
        : "⚠️ Make-up exam forfeits direct promotion",
    },
    {
      id: "examen-final",
      color: "#f59e0b",
      bg: "#fffbeb",
      icon: "📝",
      title: es ? "Con Examen Final" : "Final Exam",
      stats: [
        {
          value: "4",
          unit: es ? "en parciales" : "on partials",
          label: es ? "nota mínima" : "minimum grade",
        },
        {
          value: "4",
          unit: es ? "en el final" : "on final",
          label: es ? "nota mínima" : "minimum grade",
        },
        {
          value: "3",
          unit: es ? "turnos" : "sittings",
          label: es ? "para rendir" : "to take it",
        },
      ],
      details: es
        ? [
            "Aprobá al menos 2 parciales con nota ≥ 4.",
            "La nota del examen final es la calificación definitiva.",
            "Tenés 3 turnos consecutivos desde que terminás la cursada.",
            "Si no rendís en los 3 turnos, perdés la regularidad y debés recursar.",
          ]
        : [
            "Pass at least 2 partials with grade ≥ 4.",
            "The final exam grade is the definitive score.",
            "You have 3 consecutive sittings after the course ends.",
            "Missing all 3 sittings means losing regularity and having to retake the course.",
          ],
      warn: es
        ? "⚠️ 3 turnos y vence — después hay que recursar"
        : "⚠️ 3 sittings then expires — must retake the course",
    },
    {
      id: "libre",
      color: "#8b5cf6",
      bg: "#f5f3ff",
      icon: "🎓",
      title: es ? "Régimen Libre" : "Free Exam",
      stats: [
        {
          value: "30%",
          unit: es ? "del plan" : "of plan",
          label: es ? "máximo en libre" : "max in free regime",
        },
        {
          value: "2",
          unit: es ? "exámenes" : "exams",
          label: es ? "escrito + oral" : "written + oral",
        },
        {
          value: "✓",
          unit: es ? "correlativas" : "prereqs",
          label: es ? "deben estar aprobadas" : "must be passed",
        },
      ],
      details: es
        ? [
            "Podés rendir hasta el 30% de las materias del plan como libre.",
            "Debés ser alumno regular y tener las correlativas aprobadas.",
            "Primero rendís un examen escrito (obligatorio aprobarlo).",
            "Solo si aprobás el escrito, podés rendir el oral. El programa es el vigente al momento del examen.",
          ]
        : [
            "You can take up to 30% of subjects in free-exam mode.",
            "You must be a regular student with prerequisites passed.",
            "First take a written exam (must pass it).",
            "Only if you pass the written exam can you take the oral. The syllabus in effect at exam date applies.",
          ],
      warn: null,
    },
    {
      id: "recuperatorio",
      color: "#ef4444",
      bg: "#fef2f2",
      icon: "🔁",
      title: es ? "Recuperatorio" : "Make-up Exam",
      stats: [
        {
          value: "1",
          unit: es ? "instancia" : "instance",
          label: es ? "por materia" : "per subject",
        },
        {
          value: "✓",
          unit: es ? "reemplaza" : "replaces",
          label: es ? "ausente o insuficiente" : "absence or fail",
        },
        {
          value: "✗",
          unit: es ? "directa" : "direct",
          label: es ? "si usás recuperatorio" : "if you use it",
        },
      ],
      details: es
        ? [
            "Aplica si faltaste con certificado médico, o si desaprobaste el parcial.",
            "Solo podés recuperar 1 instancia parcial por materia.",
            "La nota del recuperatorio reemplaza el ausente o insuficiente original.",
            "Usar el recuperatorio anula la posibilidad de Promoción Directa en esa materia.",
          ]
        : [
            "Applies if you missed with a medical certificate, or failed a partial.",
            "You can only make up 1 partial instance per subject.",
            "The make-up grade replaces the original absence or failing grade.",
            "Using the make-up exam voids Direct Promotion eligibility for that subject.",
          ],
      warn: es
        ? "⚠️ Usarlo cancela la promoción directa"
        : "⚠️ Using it cancels direct promotion",
    },
  ];

  return (
    <section
      className="reglamento-section"
      style={{ width: "100%", marginBottom: "2.5rem" }}
    >
      <div
        className="reglamento-header"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          marginBottom: "1.25rem",
          paddingTop: "1.75rem",
          borderTop: "1px solid #e2e8f0",
        }}
      >
        <div
          className="reglamento-header-icon"
          style={{
            width: 36,
            height: 36,
            borderRadius: "10px",
            background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <BookOpen size={18} color="#fff" />
        </div>
        <div>
          <h2
            className="reglamento-header-title"
            style={{
              margin: 0,
              fontSize: "1.15rem",
              fontWeight: 800,
              color: "#0f172a",
            }}
          >
            {es ? "Reglamento Académico" : "Academic Regulations"}
          </h2>
          <p
            className="reglamento-header-subtitle"
            style={{
              margin: 0,
              fontSize: "0.75rem",
              color: "#94a3b8",
              fontWeight: 500,
            }}
          >
            {es
              ? "Res. Rectoral UNDEF N° 326/2025 — FADENA"
              : "Rector's Resolution UNDEF N° 326/2025 — FADENA"}
          </p>
        </div>
      </div>

      {/* Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {cards.map((card) => (
          <div
            key={card.id}
            style={{
              borderRadius: "14px",
              border: `1px solid ${card.color}22`,
              overflow: "hidden",
              background: "#fff",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}
          >
            {/* Card Header — always visible */}
            <button
              onClick={() => toggle(card.id)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                padding: "0.85rem 1rem",
                background: "none",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                gap: "0.75rem",
              }}
            >
              {/* Color strip */}
              <div
                style={{
                  width: 4,
                  alignSelf: "stretch",
                  borderRadius: 4,
                  background: card.color,
                  flexShrink: 0,
                }}
              />

              {/* Icon + title */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  minWidth: 0,
                  flex: 1,
                }}
              >
                <span
                  style={{ fontSize: "1.25rem", lineHeight: 1, flexShrink: 0 }}
                >
                  {card.icon}
                </span>
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: "0.95rem",
                    color: "#0f172a",
                    whiteSpace: "nowrap",
                  }}
                >
                  {card.title}
                </span>
              </div>

              {/* Key stats — visible on header */}
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  marginLeft: "auto",
                  marginRight: "0.5rem",
                  flexShrink: 0,
                }}
              >
                {card.stats.map((s, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      textAlign: "center",
                      background: card.bg,
                      borderRadius: "8px",
                      padding: "0.3rem 0.4rem",
                      width: "6.5rem",
                      minWidth: "6.5rem",
                      flex: "0 0 6.5rem",
                      minHeight: "3.05rem",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "1rem",
                        fontWeight: 900,
                        color: card.color,
                        lineHeight: 1.1,
                      }}
                    >
                      {s.value}
                    </div>
                    <div
                      style={{
                        fontSize: "0.55rem",
                        color: "#64748b",
                        fontWeight: 700,
                        lineHeight: 1.1,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "100%",
                      }}
                    >
                      {s.unit}
                    </div>
                  </div>
                ))}
              </div>

              <ChevronDown
                size={16}
                style={{
                  color: "#94a3b8",
                  flexShrink: 0,
                  transform:
                    openId === card.id ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease",
                }}
              />
            </button>

            {/* Expanded details */}
            {openId === card.id && (
              <div
                style={{
                  borderTop: `1px solid ${card.color}22`,
                  padding: "0.85rem 1rem 1rem",
                  background: card.bg,
                }}
              >
                <ul
                  style={{
                    margin: 0,
                    padding: "0 0 0 1.1rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.4rem",
                  }}
                >
                  {card.details.map((d, i) => (
                    <li
                      key={i}
                      style={{
                        fontSize: "0.85rem",
                        color: "#334155",
                        lineHeight: 1.55,
                      }}
                    >
                      {d}
                    </li>
                  ))}
                </ul>
                {card.warn && (
                  <div
                    style={{
                      marginTop: "0.75rem",
                      padding: "0.5rem 0.75rem",
                      borderRadius: "8px",
                      background: "#fff",
                      border: `1px solid ${card.color}44`,
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      color: card.color,
                    }}
                  >
                    {card.warn}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function PlanPage() {
  const { lang } = useLanguage();
  const { data: session, status } = useSession();
  const t = translations[lang];
  const pt = translations[lang].plan;
  const [completed, setCompleted] = useState<number[]>([]);
  const [inProgress, setInProgress] = useState<number[]>([]);
  const [objective, setObjective] = useState<"intermediate" | "degree">(
    "degree",
  );
  const [search, setSearch] = useState("");
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const topScrollRef = useRef<HTMLDivElement>(null);
  const mainScrollRef = useRef<HTMLElement>(null);
  const dummyContentRef = useRef<HTMLDivElement>(null);

  const handleTopScroll = (e: React.UIEvent) => {
    if (mainScrollRef.current)
      mainScrollRef.current.scrollLeft = (
        e.target as HTMLDivElement
      ).scrollLeft;
  };

  const handleMainScroll = (e: React.UIEvent) => {
    if (topScrollRef.current)
      topScrollRef.current.scrollLeft = (e.target as HTMLElement).scrollLeft;
  };

  useEffect(() => {
    const updateWidth = () => {
      if (mainScrollRef.current && dummyContentRef.current) {
        dummyContentRef.current.style.width = `${mainScrollRef.current.scrollWidth}px`;
      }
    };
    // Timeout to ensure DOM is fully rendered before calculating width
    const timeout = setTimeout(updateWidth, 50);
    window.addEventListener("resize", updateWidth);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", updateWidth);
    };
  }, [isLoaded, search, objective, lang]);

  // Load from localStorage and Sync with Cloud
  useEffect(() => {
    const isGuest = status === "unauthenticated" || !session;
    const completedKey = isGuest
      ? "ciberportero_completed_subjects"
      : "ciberportero_user_completed_subjects";
    const inProgressKey = isGuest
      ? "ciberportero_inprogress_subjects"
      : "ciberportero_user_inprogress_subjects";
    const objectiveKey = isGuest
      ? "ciberportero_plan_objective"
      : "ciberportero_user_plan_objective";

    const savedCompleted = localStorage.getItem(completedKey);
    if (savedCompleted) {
      try {
        setCompleted(JSON.parse(savedCompleted));
      } catch (e) {
        setCompleted([]);
      }
    } else {
      setCompleted([]);
    }

    const savedInProgress = localStorage.getItem(inProgressKey);
    if (savedInProgress) {
      try {
        setInProgress(JSON.parse(savedInProgress));
      } catch (e) {
        setInProgress([]);
      }
    } else {
      setInProgress([]);
    }

    const savedObj = localStorage.getItem(objectiveKey);
    if (savedObj === "intermediate" || savedObj === "degree") {
      setObjective(savedObj);
    } else {
      setObjective("degree");
    }

    // Cloud Sync ONLY for users
    if (session?.user?.id) {
      getUserProgress().then((data) => {
        if (data) {
          setCompleted(data.completed);
          setInProgress(data.inProgress);
          localStorage.setItem(
            "ciberportero_user_completed_subjects",
            JSON.stringify(data.completed),
          );
          localStorage.setItem(
            "ciberportero_user_inprogress_subjects",
            JSON.stringify(data.inProgress),
          );
        }
      });
    }

    setIsLoaded(true);
  }, [session, status]);

  useEffect(() => {
    document.title = `Ciberportero | ${pt.title}`;
  }, [lang, pt.title]);

  // Cycle through states: Pending (0) -> In Progress (1) -> Completed (2) -> Pending (0)
  const toggleSubjectState = (id: number) => {
    // Prevent toggling locked subjects
    const subject = curriculum.find((s) => s.id === id);
    const isLocked = subject?.prerequisites.some((p) => !completed.includes(p));
    if (isLocked) return;

    const isCompleted = completed.includes(id);
    const isInProgress = inProgress.includes(id);

    const isGuest = !session;
    const completedKey = isGuest
      ? "ciberportero_completed_subjects"
      : "ciberportero_user_completed_subjects";
    const inProgressKey = isGuest
      ? "ciberportero_inprogress_subjects"
      : "ciberportero_user_inprogress_subjects";

    if (!isInProgress && !isCompleted) {
      // Transition to In Progress
      const nextInProgress = [...inProgress, id];
      setInProgress(nextInProgress);
      localStorage.setItem(inProgressKey, JSON.stringify(nextInProgress));
      if (session?.user?.id) updateUserProgress(completed, nextInProgress);
    } else if (isInProgress && !isCompleted) {
      // Transition to Completed
      const nextInProgress = inProgress.filter((subjectId) => subjectId !== id);
      const nextCompleted = [...completed, id];
      setInProgress(nextInProgress);
      setCompleted(nextCompleted);
      localStorage.setItem(inProgressKey, JSON.stringify(nextInProgress));
      localStorage.setItem(completedKey, JSON.stringify(nextCompleted));
      if (session?.user?.id) updateUserProgress(nextCompleted, nextInProgress);
    } else {
      // Transition to Pending
      const nextCompleted = completed.filter((subjectId) => subjectId !== id);
      setCompleted(nextCompleted);
      localStorage.setItem(completedKey, JSON.stringify(nextCompleted));
      if (session?.user?.id) updateUserProgress(nextCompleted, inProgress);
    }
  };

  const changeObjective = (obj: "intermediate" | "degree") => {
    const isGuest = !session;
    const objectiveKey = isGuest
      ? "ciberportero_plan_objective"
      : "ciberportero_user_plan_objective";
    setObjective(obj);
    localStorage.setItem(objectiveKey, obj);
  };

  const objectiveSubjects =
    objective === "intermediate"
      ? curriculum.filter((subject) => subject.year <= 3)
      : curriculum;

  const objectiveSubjectIds = new Set(
    objectiveSubjects.map((subject) => subject.id),
  );

  const completedInObjective = completed.filter((id) =>
    objectiveSubjectIds.has(id),
  );
  const inProgressInObjective = inProgress.filter((id) =>
    objectiveSubjectIds.has(id),
  );
  const totalSubjects = objectiveSubjects.length;

  const progressPercent =
    totalSubjects === 0
      ? 0
      : Math.round((completedInObjective.length / totalSubjects) * 100);
  const inProgressPercent =
    totalSubjects === 0
      ? 0
      : Math.round((inProgressInObjective.length / totalSubjects) * 100);

  const normalizedSearch = normalizeString(search);
  const searchedCurriculum = objectiveSubjects.filter((subject) => {
    if (!normalizedSearch) return true;

    const localizedSubjectName =
      pt.subjectNames[subject.id as keyof typeof pt.subjectNames] ||
      subject.name;

    return (
      normalizeString(localizedSubjectName).includes(normalizedSearch) ||
      subject.id.toString().includes(normalizedSearch)
    );
  });

  const filteredYears = Array.from(
    new Set(searchedCurriculum.map((subject) => subject.year)),
  ).sort((a, b) => a - b);

  const getUnlocks = (subjectId: number): number[] =>
    objectiveSubjects
      .filter((subject) => subject.prerequisites.includes(subjectId))
      .map((subject) => subject.id);

  const isRelatated = (
    subjectId: number,
  ): { type: "prerequisite" | "unlock" } | null => {
    if (!hoveredId || hoveredId === subjectId) return null;

    const hoveredSubject = objectiveSubjects.find(
      (subject) => subject.id === hoveredId,
    );
    const currentSubject = objectiveSubjects.find(
      (subject) => subject.id === subjectId,
    );

    if (!hoveredSubject || !currentSubject) return null;
    if (hoveredSubject.prerequisites.includes(subjectId)) {
      return { type: "prerequisite" };
    }
    if (currentSubject.prerequisites.includes(hoveredId)) {
      return { type: "unlock" };
    }

    return null;
  };

  const getOrdinalLabel = (value: number, kind: "year" | "term"): string => {
    if (lang === "en") {
      const mod10 = value % 10;
      const mod100 = value % 100;
      const suffix =
        mod10 === 1 && mod100 !== 11
          ? "st"
          : mod10 === 2 && mod100 !== 12
            ? "nd"
            : mod10 === 3 && mod100 !== 13
              ? "rd"
              : "th";
      return `${value}${suffix} ${pt[kind]}`;
    }

    return `${value}° ${pt[kind]}`;
  };

  function ReglamentoSection({ lang }: { lang: "es" | "en" }) {
    const [openId, setOpenId] = useState<string | null>(null);
    const toggle = (id: string) =>
      setOpenId((prev) => (prev === id ? null : id));

    const es = lang === "es";

    const cards = [
      {
        id: "regularidad",
        color: "#3b82f6",
        bg: "#eff6ff",
        icon: "📋",
        title: es ? "Regularidad" : "Status",
        stats: [
          {
            value: "2",
            unit: es ? "materias/año" : "subjects/year",
            label: es ? "mínimo a aprobar" : "minimum to pass",
          },
          {
            value: "33%",
            unit: es ? "de aplazos" : "of fails",
            label: es ? "límite máximo" : "maximum limit",
          },
          {
            value: "2×",
            unit: es ? "años max." : "years max.",
            label: es ? "duración total" : "total duration",
          },
        ],
        details: es
          ? [
              "Aprobá mínimo 2 materias por año para mantener la regularidad.",
              "No superés el 33% de aplazos sobre el total del plan.",
              "La carrera no puede durar más del doble de años previstos (ej: 4 años → máx. 8 años).",
              "Si perdés la regularidad, podés solicitar reincorporación a la Dirección de la carrera.",
            ]
          : [
              "Pass at least 2 subjects per year to maintain regular status.",
              "Do not exceed 33% failed exams relative to the total plan.",
              "The degree cannot take more than double the planned years (e.g. 4 years → max. 8).",
              "If you lose regular status, you may apply for reinstatement to the Program Director.",
            ],
        warn: null,
      },
      {
        id: "promocion-directa",
        color: "#10b981",
        bg: "#ecfdf5",
        icon: "🏆",
        title: es ? "Promoción Directa" : "Direct Promotion",
        stats: [
          {
            value: "7",
            unit: es ? "en parciales" : "on partials",
            label: es ? "nota mínima" : "minimum grade",
          },
          {
            value: "2",
            unit: es ? "parciales" : "assessments",
            label: es ? "como mínimo" : "at least",
          },
          {
            value: "0",
            unit: es ? "examen final" : "final exam",
            label: es ? "no requerido" : "not required",
          },
        ],
        details: es
          ? [
              "Aprobá al menos 2 parciales con nota ≥ 7 en todos los casos.",
              "Cumplí todas las actividades obligatorias del docente.",
              "Si usás el recuperatorio, perdés la promoción directa automáticamente.",
              "El promedio se redondea: ≥0.50 → sube, ≤0.49 → baja. Entre 3.01 y 3.99 = 3 pts.",
            ]
          : [
              "Pass at least 2 partials with a grade ≥ 7 in all cases.",
              "Complete all mandatory activities assigned by the professor.",
              "Using the make-up exam forfeits Direct Promotion eligibility.",
              "Averages round: ≥0.50 rounds up, ≤0.49 rounds down. Between 3.01–3.99 = 3 pts.",
            ],
        warn: es
          ? "⚠️ El recuperatorio anula la promoción directa"
          : "⚠️ Make-up exam forfeits direct promotion",
      },
      {
        id: "examen-final",
        color: "#f59e0b",
        bg: "#fffbeb",
        icon: "📝",
        title: es ? "Con Examen Final" : "Final Exam",
        stats: [
          {
            value: "4",
            unit: es ? "en parciales" : "on partials",
            label: es ? "nota mínima" : "minimum grade",
          },
          {
            value: "4",
            unit: es ? "en el final" : "on final",
            label: es ? "nota mínima" : "minimum grade",
          },
          {
            value: "3",
            unit: es ? "turnos" : "sittings",
            label: es ? "para rendir" : "to take it",
          },
        ],
        details: es
          ? [
              "Aprobá al menos 2 parciales con nota ≥ 4.",
              "La nota del examen final es la calificación definitiva.",
              "Tenés 3 turnos consecutivos desde que terminás la cursada.",
              "Si no rendís en los 3 turnos, perdés la regularidad y debés recursar.",
            ]
          : [
              "Pass at least 2 partials with grade ≥ 4.",
              "The final exam grade is the definitive score.",
              "You have 3 consecutive sittings after the course ends.",
              "Missing all 3 sittings means losing regularity and having to retake the course.",
            ],
        warn: es
          ? "⚠️ 3 turnos y vence — después hay que recursar"
          : "⚠️ 3 sittings then expires — must retake the course",
      },
      {
        id: "libre",
        color: "#8b5cf6",
        bg: "#f5f3ff",
        icon: "🎓",
        title: es ? "Régimen Libre" : "Free Exam",
        stats: [
          {
            value: "30%",
            unit: es ? "del plan" : "of plan",
            label: es ? "máximo en libre" : "max in free regime",
          },
          {
            value: "2",
            unit: es ? "exámenes" : "exams",
            label: es ? "escrito + oral" : "written + oral",
          },
          {
            value: "✓",
            unit: es ? "correlativas" : "prereqs",
            label: es ? "deben estar aprobadas" : "must be passed",
          },
        ],
        details: es
          ? [
              "Podés rendir hasta el 30% de las materias del plan como libre.",
              "Debés ser alumno regular y tener las correlativas aprobadas.",
              "Primero rendís un examen escrito (obligatorio aprobarlo).",
              "Solo si aprobás el escrito, podés rendir el oral. El programa es el vigente al momento del examen.",
            ]
          : [
              "You can take up to 30% of subjects in free-exam mode.",
              "You must be a regular student with prerequisites passed.",
              "First take a written exam (must pass it).",
              "Only if you pass the written exam can you take the oral. The syllabus in effect at exam date applies.",
            ],
        warn: null,
      },
      {
        id: "recuperatorio",
        color: "#ef4444",
        bg: "#fef2f2",
        icon: "🔁",
        title: es ? "Recuperatorio" : "Make-up Exam",
        stats: [
          {
            value: "1",
            unit: es ? "instancia" : "instance",
            label: es ? "por materia" : "per subject",
          },
          {
            value: "✓",
            unit: es ? "reemplaza" : "replaces",
            label: es ? "ausente o insuficiente" : "absence or fail",
          },
          {
            value: "✗",
            unit: es ? "directa" : "direct",
            label: es ? "si usás recuperatorio" : "if you use it",
          },
        ],
        details: es
          ? [
              "Aplica si faltaste con certificado médico, o si desaprobaste el parcial.",
              "Solo podés recuperar 1 instancia parcial por materia.",
              "La nota del recuperatorio reemplaza el ausente o insuficiente original.",
              "Usar el recuperatorio anula la posibilidad de Promoción Directa en esa materia.",
            ]
          : [
              "Applies if you missed with a medical certificate, or failed a partial.",
              "You can only make up 1 partial instance per subject.",
              "The make-up grade replaces the original absence or failing grade.",
              "Using the make-up exam voids Direct Promotion eligibility for that subject.",
            ],
        warn: es
          ? "⚠️ Usarlo cancela la promoción directa"
          : "⚠️ Using it cancels direct promotion",
      },
    ];

    return (
      <section
        className="reglamento-section"
        style={{ width: "100%", marginBottom: "2.5rem" }}
      >
        <div
          className="reglamento-header"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "1.25rem",
            paddingTop: "1.75rem",
            borderTop: "1px solid #e2e8f0",
          }}
        >
          <div
            className="reglamento-header-icon"
            style={{
              width: 36,
              height: 36,
              borderRadius: "10px",
              background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <BookOpen size={18} color="#fff" />
          </div>
          <div>
            <h2
              className="reglamento-header-title"
              style={{
                margin: 0,
                fontSize: "1.15rem",
                fontWeight: 800,
                color: "#0f172a",
              }}
            >
              {es ? "Reglamento Académico" : "Academic Regulations"}
            </h2>
            <p
              className="reglamento-header-subtitle"
              style={{
                margin: 0,
                fontSize: "0.75rem",
                color: "#94a3b8",
                fontWeight: 500,
              }}
            >
              {es
                ? "Res. Rectoral UNDEF N° 326/2025 — FADENA"
                : "Rector's Resolution UNDEF N° 326/2025 — FADENA"}
            </p>
          </div>
        </div>

        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          {cards.map((card) => (
            <div
              key={card.id}
              style={{
                borderRadius: "14px",
                border: `1px solid ${card.color}22`,
                overflow: "hidden",
                background: "#fff",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              }}
            >
              <button
                type="button"
                className="reglamento-card-button"
                onClick={() => toggle(card.id)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  padding: "0.85rem 1rem",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  gap: "0.75rem",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    width: 4,
                    alignSelf: "stretch",
                    borderRadius: 4,
                    background: card.color,
                    flexShrink: 0,
                  }}
                />

                <div
                  className="reglamento-card-meta"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    minWidth: 0,
                    flex: "1 1 0",
                  }}
                >
                  <span
                    className="reglamento-card-icon"
                    style={{
                      fontSize: "1.25rem",
                      lineHeight: 1,
                      flexShrink: 0,
                    }}
                  >
                    {card.icon}
                  </span>
                  <span
                    className="reglamento-card-title"
                    style={{
                      fontWeight: 800,
                      fontSize: "0.95rem",
                      color: "#0f172a",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {card.title}
                  </span>
                </div>

                <div
                  className="reglamento-card-stats"
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    marginLeft: "auto",
                    marginRight: "0.5rem",
                    flexShrink: 0,
                  }}
                >
                  {card.stats.map((s, i) => (
                    <div
                      key={i}
                      className="reglamento-card-stat"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        textAlign: "center",
                        background: card.bg,
                        borderRadius: "8px",
                        padding: "0.3rem 0.4rem",
                        width: "6.5rem",
                        minWidth: "6.5rem",
                        flex: "0 0 6.5rem",
                        minHeight: "3.05rem",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "1rem",
                          fontWeight: 900,
                          color: card.color,
                          lineHeight: 1.1,
                        }}
                      >
                        {s.value}
                      </div>
                      <div
                        className="reglamento-card-stat-unit"
                        style={{
                          fontSize: "0.55rem",
                          color: "#64748b",
                          fontWeight: 700,
                          lineHeight: 1.1,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "100%",
                        }}
                      >
                        {s.unit}
                      </div>
                    </div>
                  ))}
                </div>

                <ChevronDown
                  className="reglamento-card-chevron"
                  size={16}
                  style={{
                    color: "#94a3b8",
                    flexShrink: 0,
                    marginLeft: "auto",
                    transform:
                      openId === card.id ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s ease",
                  }}
                />
              </button>

              {openId === card.id && (
                <div
                  style={{
                    borderTop: `1px solid ${card.color}22`,
                    padding: "0.85rem 1rem 1rem",
                    background: card.bg,
                  }}
                >
                  <ul
                    style={{
                      margin: 0,
                      padding: "0 0 0 1.1rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.4rem",
                    }}
                  >
                    {card.details.map((d, i) => (
                      <li
                        key={i}
                        style={{
                          fontSize: "0.85rem",
                          color: "#334155",
                          lineHeight: 1.55,
                        }}
                      >
                        {d}
                      </li>
                    ))}
                  </ul>
                  {card.warn && (
                    <div
                      style={{
                        marginTop: "0.75rem",
                        padding: "0.5rem 0.75rem",
                        borderRadius: "8px",
                        background: "#fff",
                        border: `1px solid ${card.color}44`,
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        color: card.color,
                      }}
                    >
                      {card.warn}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <style jsx global>{`
          @media (max-width: 768px) {
            .reglamento-header {
              align-items: flex-start !important;
              gap: 0.6rem !important;
              margin-bottom: 1rem !important;
              padding-top: 1.25rem !important;
            }

            .reglamento-header-icon {
              width: 32px !important;
              height: 32px !important;
              border-radius: 9px !important;
            }

            .reglamento-header-title {
              font-size: 1rem !important;
              line-height: 1.2 !important;
            }

            .reglamento-header-subtitle {
              font-size: 0.68rem !important;
              line-height: 1.25 !important;
            }

            .reglamento-card-button {
              align-items: flex-start !important;
              gap: 0.55rem !important;
              padding: 0.8rem 0.85rem !important;
            }

            .reglamento-card-meta {
              flex: 1 1 calc(100% - 2rem) !important;
              min-width: 0 !important;
              gap: 0.45rem !important;
            }

            .reglamento-card-icon {
              font-size: 1.05rem !important;
            }

            .reglamento-card-title {
              font-size: 0.88rem !important;
              white-space: normal !important;
              line-height: 1.15 !important;
            }

            .reglamento-card-stats {
              order: 3 !important;
              width: 100% !important;
              margin: 0 !important;
              display: grid !important;
              grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
              gap: 0.35rem !important;
            }

            .reglamento-card-stat {
              width: 100% !important;
              min-width: 0 !important;
              flex: none !important;
              min-height: 2.9rem !important;
              padding: 0.35rem 0.2rem !important;
            }

            .reglamento-card-stat-unit {
              white-space: normal !important;
              overflow: visible !important;
              text-overflow: clip !important;
              font-size: 0.5rem !important;
              line-height: 1.05 !important;
            }

            .reglamento-card-chevron {
              margin-left: auto !important;
              align-self: center !important;
              margin-top: 0.15rem !important;
            }
          }
        `}</style>
      </section>
    );
  }

  return (
    <div className="container fade-in page-container">
      <CountdownWidget />

      <NotificationBanners />

      <header style={{ marginBottom: '3rem' }}>
        <div className="nav-header-row">
          <Link href="/" className="back-link">
            <ChevronLeft size={18} /> {translations[lang].back}
          </Link>
          <div className="mobile-only">
            <LanguageSwitcher />
          </div>
        </div>

        <div
          style={{
            marginTop: "0.5rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "1.5rem",
          }}
        >
          <div style={{ width: "100%" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "1.2rem",
              }}
            >
              <h1
                style={{
                  margin: 0,
                  fontSize: "3rem",
                  fontWeight: "900",
                  color: "#000",
                  letterSpacing: "-0.03em",
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "1rem",
                }}
              >
                <Link
                  href="/"
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Home
                    className="title-home-icon"
                    size={40}
                    style={{ marginRight: "0.5rem" }}
                  />
                  {pt.title}
                </Link>
                <div
                  style={{
                    opacity: status === "loading" ? 0 : 1,
                    transition: "opacity 0.2s",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {status !== "loading" &&
                    (session ? (
                      session.user?.role === "admin" ||
                      session.user?.email === "ciberportero@gmail.com" ? (
                        <AdminPanelButton />
                      ) : (
                        <SignOutButton />
                      )
                    ) : (
                      <SignInButton />
                    ))}
                  <SyncStatus />
                </div>
              </h1>
              <div className="mobile-hide">
                <LanguageSwitcher />
              </div>
            </div>
            <div className="calendar-desc-row">
              <p
                style={{
                  color: "var(--muted)",
                  fontSize: "1.2rem",
                  margin: 0,
                  fontWeight: "500",
                }}
              >
                {session?.user ? (
                  <>
                    <span style={{ color: "var(--accent)", fontWeight: "700" }}>
                      {t.dashboard.welcome},{" "}
                      {session.user.name?.split(" ")[0] || "Estudiante"}!
                    </span>{" "}
                    <span dangerouslySetInnerHTML={{ __html: pt.description }} />
                  </>
                ) : (
                  <span dangerouslySetInnerHTML={{ __html: pt.description }} />
                )}
              </p>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "0.8rem",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {/* Objective Selector */}
            <div
              style={{
                background: "#f1f5f9",
                padding: "4px",
                borderRadius: "14px",
                display: "flex",
                gap: "4px",
                border: "1px solid var(--border)",
              }}
            >
              <button
                onClick={() => changeObjective("degree")}
                style={{
                  padding: "0.6rem 1.2rem",
                  borderRadius: "10px",
                  border: "none",
                  background: objective === "degree" ? "white" : "transparent",
                  color: objective === "degree" ? "#000" : "var(--muted)",
                  fontWeight: "700",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  boxShadow:
                    objective === "degree"
                      ? "0 4px 12px rgba(0,0,0,0.05)"
                      : "none",
                }}
              >
                {pt.full}
              </button>
              <button
                onClick={() => changeObjective("intermediate")}
                style={{
                  padding: "0.6rem 1.2rem",
                  borderRadius: "10px",
                  border: "none",
                  background:
                    objective === "intermediate" ? "white" : "transparent",
                  color: objective === "intermediate" ? "#000" : "var(--muted)",
                  fontWeight: "700",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  boxShadow:
                    objective === "intermediate"
                      ? "0 4px 12px rgba(0,0,0,0.05)"
                      : "none",
                }}
              >
                {pt.intermediate}
              </button>
            </div>

            {/* PDF Link */}
            <a
              href="https://undef.edu.ar/fadena/wp-content/uploads/2025/10/Plan-de-estudios-CIBERDEFENSA.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="pdf-link"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                fontSize: "0.85rem",
                color: "var(--accent)",
                fontWeight: "700",
                padding: "0.4rem 0.8rem",
                background: "rgba(0, 112, 243, 0.05)",
                borderRadius: "10px",
                textDecoration: "none",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
            >
              <ExternalLink size={16} />
              Plan Oficial (PDF)
            </a>
          </div>
        </div>
      </header>

      <header
        style={{
          background: "rgba(255,255,255,0.9)",
          border: "1px solid var(--border)",
          borderRadius: "24px",
          boxShadow: "0 20px 40px rgba(15,23,42,0.05)",
          overflow: "hidden",
          marginBottom: "1.5rem",
        }}
      >
        <div
          style={{
            padding: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "2rem",
            flexWrap: "wrap",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div style={{ flex: 1, minWidth: "200px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                marginBottom: "0.8rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "0.6rem",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "0.6rem",
                  }}
                >
                  <span
                    style={{
                      fontWeight: "700",
                      fontSize: "1rem",
                      color: "#000",
                      opacity: 0.8,
                    }}
                  >
                    {pt.stats.progress}:
                  </span>
                  <span
                    style={{
                      fontWeight: "900",
                      fontSize: "1.25rem",
                      color: "#000",
                    }}
                  >
                    {progressPercent}%
                  </span>
                </div>
                <div
                  className="storage-notice-wrapper"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    color: "var(--muted)",
                    fontSize: "0.7rem",
                    fontWeight: "500",
                    opacity: 0.6,
                  }}
                >
                  <Info size={11} />
                  <span>{pt.storageNotice}</span>
                </div>
              </div>
            </div>
            <div
              style={{
                height: "10px",
                background: "#f1f5f9",
                borderRadius: "10px",
                overflow: "hidden",
                display: "flex",
              }}
            >
              <div
                style={{
                  width: `${progressPercent}%`,
                  height: "100%",
                  background: "var(--success)",
                  transition: "width 0.5s",
                }}
              ></div>
              <div
                style={{
                  width: `${inProgressPercent}%`,
                  height: "100%",
                  background: "#fbbf24",
                  transition: "width 0.5s",
                }}
              ></div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "2rem" }}>
            <div style={{ textAlign: "center" }}>
              <span
                style={{
                  display: "block",
                  fontSize: "1.5rem",
                  fontWeight: "900",
                  color: "#fbbf24",
                }}
              >
                {inProgressInObjective.length}
              </span>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  color: "var(--muted)",
                  textTransform: "uppercase",
                }}
              >
                {pt.inProgress}
              </span>
            </div>
            <div style={{ textAlign: "center" }}>
              <span
                style={{
                  display: "block",
                  fontSize: "1.5rem",
                  fontWeight: "900",
                  color: "var(--success)",
                }}
              >
                {completedInObjective.length}
              </span>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  color: "var(--muted)",
                  textTransform: "uppercase",
                }}
              >
                {completedInObjective.length === 1
                  ? pt.completed
                  : pt.completedPlural || pt.completed}
              </span>
            </div>
            <div style={{ textAlign: "center" }}>
              <span
                style={{
                  display: "block",
                  fontSize: "1.5rem",
                  fontWeight: "900",
                }}
              >
                {totalSubjects - completedInObjective.length}
              </span>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  color: "var(--muted)",
                  textTransform: "uppercase",
                }}
              >
                {pt.stats.remaining}
              </span>
            </div>
          </div>
        </div>

        <div style={{ padding: "0 1.5rem 1.5rem" }}>
          <div style={{ position: "relative", width: "100%" }}>
            <input
              type="text"
              placeholder={pt.search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "1.25rem 1rem 1.25rem 3.5rem",
                border: "none",
                outline: "none",
                fontSize: "1rem",
                background: "#f8fafc",
                transition: "all 0.2s",
                fontWeight: "600",
              }}
            />
            <Search
              size={20}
              style={{
                position: "absolute",
                left: "1.5rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--muted)",
                opacity: 0.6,
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{
                  position: "absolute",
                  right: "1.5rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  color: "var(--muted)",
                }}
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>
      </header>

      <div
        style={{
          marginBottom: "1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "0.8rem",
        }}
      >
        <h2
          style={{
            fontSize: "1.4rem",
            fontWeight: "800",
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            color: "#000",
          }}
        >
          <Layers size={22} style={{ color: "var(--accent)", flexShrink: 0 }} />
          {objective === "intermediate"
            ? lang === "en"
              ? "University Analyst in Cyber Risk Management"
              : "Analista Universitario en Gestión de Riesgos Cibernéticos"
            : lang === "en"
              ? "Bachelor in Cyberdefense"
              : "Licenciatura en Ciberdefensa"}
        </h2>
      </div>

      <div
        ref={topScrollRef}
        onScroll={handleTopScroll}
        className="custom-scrollbar"
        style={{ overflowX: "auto", margin: "0 -1rem 1rem -1rem" }}
      >
        <div ref={dummyContentRef} style={{ height: "1px" }}></div>
      </div>

      <main
        ref={mainScrollRef}
        onScroll={handleMainScroll}
        className="custom-scrollbar"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${filteredYears.length}, 1fr)`,
          gap: "2rem",
          alignItems: "start",
          overflowX: "auto",
          padding: "0 1rem 4rem 1rem",
          margin: "0 -1rem", // Compensate container padding
        }}
      >
        {filteredYears.map((year) => (
          <section key={year} style={{ minWidth: "280px", padding: "0.5rem" }}>
            <h2
              style={{
                fontSize: "1.2rem",
                fontWeight: "900",
                marginBottom: "1.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.8rem",
              }}
            >
              <span
                style={{
                  background: "#000",
                  color: "#fff",
                  padding: "0.3rem 0.8rem",
                  borderRadius: "10px",
                  fontSize: "0.8rem",
                }}
              >
                {getOrdinalLabel(year, "year")}
              </span>
              <div
                style={{
                  height: "2px",
                  flex: 1,
                  background: "var(--border)",
                  opacity: 0.5,
                }}
              ></div>
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "0.8rem",
              }}
            >
              {searchedCurriculum
                .filter((s) => s.year === year)
                .map((subject) => {
                  const relation = isRelatated(subject.id);
                  const isCompleted = completed.includes(subject.id);
                  const isInProgress = inProgress.includes(subject.id);
                  const isLocked = subject.prerequisites.some(
                    (p) => !completed.includes(p),
                  );
                  const isHovered = hoveredId === subject.id;

                  const cardStyle: React.CSSProperties = {
                    padding: "0.8rem",
                    borderRadius: "14px",
                    background: isLocked ? "#f1f5f9" : "white",
                    border: "1px solid var(--border)",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    cursor: isLocked ? "not-allowed" : "pointer",
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.4rem",
                    opacity: isLocked
                      ? 0.5
                      : hoveredId
                        ? relation
                          ? 1
                          : 0.8
                        : 1,
                    transform: isHovered ? "scale(1.04)" : "none",
                    boxShadow: isHovered
                      ? "0 20px 40px rgba(0,0,0,0.12)"
                      : "0 2px 4px rgba(0,0,0,0.02)",
                    zIndex: isHovered ? 100 : relation ? 50 : 1,
                  };

                  if (relation && relation.type === "prerequisite") {
                    cardStyle.borderColor = "#ef4444";
                    cardStyle.borderWidth = "2.5px";
                    cardStyle.background = "#fef2f2";
                    cardStyle.boxShadow = "0 0 25px rgba(239, 68, 68, 0.25)";
                  } else if (relation && relation.type === "unlock") {
                    cardStyle.borderColor = "#0070f3";
                    cardStyle.borderWidth = "2.5px";
                    cardStyle.background = "rgba(0, 112, 243, 0.08)";
                    cardStyle.boxShadow = "0 0 25px rgba(0, 112, 243, 0.25)";
                  } else if (isCompleted) {
                    cardStyle.borderColor = "#10b981";
                    cardStyle.background = "rgba(16, 185, 129, 0.05)";
                  } else if (isInProgress) {
                    cardStyle.borderColor = "#fbbf24";
                    cardStyle.background = "rgba(251, 191, 36, 0.12)";
                    cardStyle.boxShadow =
                      "inset 0 0 15px rgba(251, 191, 36, 0.05)";
                  }

                  return (
                    <div
                      key={subject.id}
                      style={cardStyle}
                      onMouseEnter={() => setHoveredId(subject.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      onClick={() => toggleSubjectState(subject.id)}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: "0.6rem",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.2rem",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "0.65rem",
                              fontWeight: "900",
                              color: "#000",
                              opacity: 0.9,
                            }}
                          >
                            [{subject.id.toString().padStart(2, "0")}]{" "}
                            <span
                              style={{ color: "var(--muted)", opacity: 0.7 }}
                            >
                              • {getOrdinalLabel(subject.term, "term")}
                            </span>
                          </span>
                          <h3
                            style={{
                              margin: 0,
                              fontSize: "0.9rem",
                              fontWeight: relation ? "900" : "800",
                              lineHeight: 1.2,
                              color: relation
                                ? relation.type === "prerequisite"
                                  ? "#ef4444"
                                  : "#0070f3"
                                : isCompleted
                                  ? "#059669"
                                  : isLocked
                                    ? "var(--muted)"
                                    : isInProgress
                                      ? "#d97706"
                                      : "#000",
                            }}
                          >
                            {pt.subjectNames[
                              subject.id as keyof typeof pt.subjectNames
                            ] || subject.name}
                          </h3>
                          {isInProgress && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.3rem",
                                marginTop: "0.2rem",
                              }}
                            >
                              <Zap
                                size={10}
                                fill="#fbbf24"
                                style={{ color: "#fbbf24" }}
                              />
                              <span
                                style={{
                                  fontSize: "0.6rem",
                                  fontWeight: "900",
                                  color: "#d97706",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.05em",
                                }}
                              >
                                {pt.inProgress}
                              </span>
                            </div>
                          )}
                        </div>
                        <div
                          style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            border: `1.5px solid ${isCompleted ? "#10b981" : isInProgress ? "#fbbf24" : isLocked ? "#e2e8f0" : "var(--border)"}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: isCompleted
                              ? "#10b981"
                              : isInProgress
                                ? "#fbbf24"
                                : isLocked
                                  ? "#f1f5f9"
                                  : "transparent",
                            color: "white",
                            transition: "all 0.2s",
                            flexShrink: 0,
                          }}
                        >
                          {isCompleted ? (
                            <CheckCircle size={14} />
                          ) : isInProgress ? (
                            <Zap size={12} fill="white" />
                          ) : isLocked ? (
                            <Lock
                              size={12}
                              style={{ color: "var(--muted)", opacity: 0.8 }}
                            />
                          ) : null}
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: "0.3rem",
                          flexDirection: "column",
                        }}
                      >
                        {getUnlocks(subject.id).length > 0 && isHovered && (
                          <div
                            style={{
                              display: "flex",
                              gap: "0.2rem",
                              alignItems: "center",
                              marginTop: "0.2rem",
                            }}
                          >
                            <Star
                              size={10}
                              style={{ color: "var(--accent)" }}
                            />
                            <span
                              style={{
                                fontSize: "0.6rem",
                                color: "var(--accent)",
                                fontWeight: "800",
                              }}
                            >
                              {pt.unlocks}:{" "}
                              {getUnlocks(subject.id)
                                .map(
                                  (p) => `[${p.toString().padStart(2, "0")}]`,
                                )
                                .join(", ")}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </section>
        ))}
      </main>
      <div
        style={{
          width: "100%",
          marginTop: "1.5rem",
          marginBottom: "2rem",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        <img
          src="/meme-messi.jpg"
          alt="Messi"
          style={{
            width: "100%",
            height: "auto",
            maxHeight: "400px",
            objectFit: "cover",
            display: "block",
          }}
        />
      </div>

      <ReglamentoSection lang={lang} />

      <CommentSection postSlug="plan" lang={lang} />

      <footer className="footer-main footer-stacked">
        <a
          href="https://github.com/zzzNata/Mapa-Interactivo-CiberDefensa-UNDEF"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            textDecoration: "none",
            color: "var(--muted)",
            fontSize: "0.8rem",
            fontWeight: "500",
            transition: "color 0.2s",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
          }}
        >
          <Star
            size={14}
            style={{ color: "#fbbf24", fill: "#fbbf24", opacity: 0.9 }}
          />
          {translations[lang].credits}
        </a>
        <span
          style={{ fontSize: "0.9rem", opacity: 0.6, color: "var(--muted)" }}
        >
          {translations[lang].footer}
        </span>
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
          <a
            href="https://x.com/ciberportero"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "flex", color: "var(--muted)" }}
            aria-label="X (Twitter) de Ciberportero"
          >
            <FaXTwitter size={16} aria-hidden="true" />
          </a>
          <a
            href="https://github.com/gonzagramaglia/ciberportero"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "flex", color: "var(--muted)" }}
            aria-label={lang === 'es' ? "GitHub de Ciberportero" : "Ciberportero GitHub"}
          >
            <TbBrandGithub size={21} aria-hidden="true" />
          </a>
          <a
            href="https://twitch.tv/ciberportero"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "flex", color: "var(--muted)" }}
            aria-label="Twitch de Ciberportero"
          >
            <Twitch size={18} aria-hidden="true" />
          </a>
          <a
            href="https://youtube.com/@ciberportero"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "flex", color: "var(--muted)" }}
            aria-label="YouTube de Ciberportero"
          >
            <Youtube size={20} aria-hidden="true" />
          </a>
        </div>
      </footer>
      <FloatingMusicButton />
      <FloatingFootballButton />
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.03);
          border-radius: 10px;
          margin: 0 1rem;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
          border: 2px solid #f8fafc;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        @media (max-width: 768px) {
          .reglamento-header {
            align-items: flex-start !important;
            gap: 0.6rem !important;
            margin-bottom: 1rem !important;
            padding-top: 1.25rem !important;
          }

          .reglamento-header-icon {
            width: 32px !important;
            height: 32px !important;
            border-radius: 9px !important;
          }

          .reglamento-header-title {
            font-size: 1rem !important;
            line-height: 1.2 !important;
          }

          .reglamento-header-subtitle {
            font-size: 0.68rem !important;
            line-height: 1.25 !important;
          }

          .reglamento-card-button {
            flex-wrap: wrap !important;
            align-items: flex-start !important;
            gap: 0.6rem !important;
            padding: 0.8rem 0.85rem !important;
          }

          .reglamento-card-meta {
            flex: 1 1 calc(100% - 2rem) !important;
            min-width: 0 !important;
            gap: 0.45rem !important;
          }

          .reglamento-card-icon {
            font-size: 1.05rem !important;
          }

          .reglamento-card-title {
            font-size: 0.88rem !important;
            white-space: normal !important;
            line-height: 1.15 !important;
          }

          .reglamento-card-stats {
            order: 3 !important;
            width: 100% !important;
            margin: 0 !important;
            display: grid !important;
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            gap: 0.35rem !important;
          }

          .reglamento-card-stats > div {
            width: 100% !important;
            min-width: 0 !important;
            flex: none !important;
            min-height: 2.9rem !important;
            padding: 0.35rem 0.2rem !important;
          }

          .reglamento-card-stat-unit {
            white-space: normal !important;
            overflow: visible !important;
            text-overflow: clip !important;
            font-size: 0.5rem !important;
            line-height: 1.05 !important;
          }

          .reglamento-card-chevron {
            margin-left: auto !important;
            align-self: center !important;
            margin-top: 0.15rem !important;
          }

          .reglamento-section > div:last-child > div {
            border-radius: 16px !important;
          }
        }
      `}</style>
    </div>
  );
}
