"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../lib/translations";
import {
  Calendar,
  Link as LinkIcon,
  X,
  BookOpen,
  Twitch,
  Youtube,
} from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";
import { TbBrandGithub } from "react-icons/tb";
import NotificationBanners from "./NotificationBanners";
import CountdownWidget from "./CountdownWidget";
import { useSession } from "next-auth/react";
import { SignInButton, SignOutButton, AdminPanelButton } from "./AuthButtons";
import { useMotivation } from "../hooks/useMotivation";
import LanguageSwitcher from "./LanguageSwitcher";
import FloatingMusicButton from "./FloatingMusicButton";
import FloatingFootballButton from "./FloatingFootballButton";
import { timeAgo } from "../lib/utils";

interface HomeClientProps {
  initialPosts: HomePost[];
}

interface HomePost {
  slug: string;
  title: string;
  description: string;
  updatedAt: string | null;
  date: string | null;
}

type SelectedImage = {
  src: string;
  alt: string;
};

export default function HomeClient({ initialPosts }: HomeClientProps) {
  const { lang } = useLanguage();
  const { data: session, status } = useSession();
  const motivation = useMotivation(lang);
  const [posts, setPosts] = useState<HomePost[]>(initialPosts);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const t = translations[lang];
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(
    null,
  );
  const lightboxDialogRef = useRef<HTMLDivElement>(null);
  const lightboxCloseButtonRef = useRef<HTMLButtonElement>(null);
  const lightboxTriggerRef = useRef<HTMLButtonElement | null>(null);

  const closeLightbox = () => {
    setSelectedImage(null);
    requestAnimationFrame(() => {
      lightboxTriggerRef.current?.focus();
    });
  };

  const handleImageClick = (
    src: string,
    alt: string,
    trigger?: HTMLButtonElement,
  ) => {
    if (
      typeof window !== "undefined" &&
      window.innerWidth < 768 &&
      src === "/cyberdefense-fadena-undef.png"
    ) {
      window.open(
        "https://undef.edu.ar/fadena/carreras-de-grado/licciberdefensa/",
        "_blank",
        "noopener,noreferrer",
      );
      return;
    }
    lightboxTriggerRef.current = trigger || null;
    setSelectedImage({ src, alt });
  };

  useEffect(() => {
    const abortController = new AbortController();
    let isCurrentRequest = true;

    const fetchPosts = async () => {
      setIsLoadingPosts(true);
      try {
        const response = await fetch(`/api/posts?lang=${lang}`, {
          signal: abortController.signal,
        });
        if (!response.ok) {
          return;
        }
        const data: unknown = await response.json();
        if (isCurrentRequest && Array.isArray(data)) {
          setPosts(data as HomePost[]);
        }
      } catch (error) {
        if (abortController.signal.aborted) {
          return;
        }
      } finally {
        if (isCurrentRequest) {
          setIsLoadingPosts(false);
        }
      }
    };

    // Initial posts are from server, but refetch if language changes client-side
    if (lang) fetchPosts();

    return () => {
      isCurrentRequest = false;
      abortController.abort();
    };
  }, [lang]);

  useEffect(() => {
    if (selectedImage) document.body.classList.add("lightbox-open");
    else document.body.classList.remove("lightbox-open");
    return () => document.body.classList.remove("lightbox-open");
  }, [selectedImage]);

  useEffect(() => {
    if (!selectedImage) {
      return;
    }

    const dialog = lightboxDialogRef.current;
    if (!dialog) {
      return;
    }

    lightboxCloseButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeLightbox();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = dialog.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement as HTMLElement | null;

      if (event.shiftKey && activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable.focus();
      } else if (!event.shiftKey && activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedImage]);

  const ingresantesPosts = posts.filter(
    (p: HomePost) => p.title && p.title.includes("[00]"),
  );
  const materiaPosts = posts.filter(
    (p: HomePost) => !(p.title && p.title.includes("[00]")),
  );

  return (
    <div className="container fade-in home-container">
      <NotificationBanners />

      {selectedImage && (
        <div
          className="lightbox-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={
            lang === "es"
              ? "Vista ampliada de imagen"
              : "Enlarged image preview"
          }
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closeLightbox();
            }
          }}
        >
          <div className="lightbox-content" ref={lightboxDialogRef}>
            <button
              type="button"
              className="lightbox-close"
              ref={lightboxCloseButtonRef}
              aria-label={
                lang === "es" ? "Cerrar imagen ampliada" : "Close image preview"
              }
              onClick={closeLightbox}
            >
              <X size={24} />
            </button>
            <img src={selectedImage.src} alt={selectedImage.alt} />
          </div>
        </div>
      )}

      <header style={{ marginBottom: "1.5rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1.2rem",
            marginBottom: "0.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
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
              }}
            >
              {t.title}
            </h1>
            <div
              style={{
                marginTop: "0.6rem",
                minHeight: "45px",
                display: "flex",
                alignItems: "center",
                opacity: status === "loading" ? 0 : 1,
                transition: "opacity 0.2s ease-in-out",
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
            </div>
          </div>
          <div
            className="home-lang-container mobile-hide"
            style={{ marginBottom: 0, marginTop: "0.6rem" }}
          >
            <LanguageSwitcher />
          </div>
        </div>
        <p
          style={{
            color: "var(--muted)",
            fontSize: "1.1rem",
            marginTop: "0.2rem",
            fontWeight: "500",
          }}
        >
          {session ? (
            <>
              <span style={{ color: "var(--accent)", fontWeight: "700" }}>
                {t.dashboard.welcome}{" "}
                {session.user.name?.split(" ")[0] || "Estudiante"}!
              </span>{" "}
              <span style={{ opacity: 0.9, fontStyle: "italic" }}>
                {motivation}
              </span>
            </>
          ) : (
            <span style={{ fontStyle: "italic", opacity: 0.9 }}>
              {motivation || t.description}
            </span>
          )}
        </p>
      </header>

      <main style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ marginBottom: "1rem", width: "100%" }}>
          <img
            src="/ciberportero-recover.png"
            alt="Tree"
            style={{
              width: "100%",
              borderRadius: "12px",
              objectFit: "cover",
              maxHeight: "300px",
            }}
          />
        </div>
        <div
          className="responsive-countdown-wrapper countdowns-grid"
          style={{ marginBottom: "0.5rem", marginTop: "-1.25rem" }}
        >
          <CountdownWidget />
        </div>

        <div className="featured-grid">
          <Link
            href="/links"
            className="post-item featured roadmap-block links-card"
            style={{
              display: "block",
              textDecoration: "none",
              border: "1px solid var(--success)",
              background: "rgba(16, 185, 129, 0.03)",
            }}
          >
            <span
              className="post-title"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.8rem",
                color: "var(--success)",
              }}
            >
              <LinkIcon
                size={28}
                className="bell-animation"
                color="var(--success)"
              />
              {t.featured?.title}
            </span>
            <p
              className="post-description"
              dangerouslySetInnerHTML={{
                __html: t.featured?.description || "",
              }}
              style={{ margin: 0 }}
            />
          </Link>

          <Link
            href="/plan"
            className="post-item featured roadmap-block plan-card"
            style={{
              display: "block",
              textDecoration: "none",
              border: "1px solid var(--accent)",
              background: "rgba(0,112,243,0.02)",
            }}
          >
            <span
              className="post-title"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.8rem",
                color: "var(--accent)",
              }}
            >
              <BookOpen
                size={28}
                className="bell-animation"
                color="var(--accent)"
              />
              {t.plan?.title}
            </span>
            <p
              className="post-description"
              dangerouslySetInnerHTML={{ __html: t.plan?.description || "" }}
              style={{ margin: 0 }}
            />
          </Link>

          <Link
            href="/calendar"
            className="post-item featured roadmap-block calendar-card"
            style={{
              display: "block",
              textDecoration: "none",
              border: "1px solid #eab308",
              background: "rgba(234, 179, 8, 0.02)",
            }}
          >
            <span
              className="post-title"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.8rem",
                color: "#eab308",
              }}
            >
              <Calendar
                size={28}
                style={{ color: "#eab308" }}
                className="bell-animation"
              />
              {t.calendar?.title}
            </span>
            <p
              className="post-description"
              dangerouslySetInnerHTML={{
                __html: t.calendar?.description || "",
              }}
              style={{ margin: 0 }}
            />
          </Link>
        </div>

        <div style={{ marginTop: "0", marginBottom: "1.2rem" }}>
          <img
            src={
              lang === "en"
                ? "/bachelor-degree.png"
                : "/licenciatura-en-ciberdefensa.png"
            }
            alt={
              lang === "en"
                ? "Bachelor in Cyber Defense"
                : "Licenciatura en Ciberdefensa"
            }
            style={{ width: "100%", borderRadius: "12px", display: "block" }}
          />
        </div>

        <ul className="post-list">
          {isLoadingPosts ? (
            [1, 2, 3].map((i) => (
              <li
                key={i}
                className="post-item"
                style={{ pointerEvents: "none" }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.6rem",
                    padding: "1.5rem",
                  }}
                >
                  <div
                    style={{
                      width: "120px",
                      height: "14px",
                      borderRadius: "8px",
                      background:
                        "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
                      backgroundSize: "200% 100%",
                      animation: "shimmer 1.4s infinite",
                    }}
                  />
                  <div
                    style={{
                      width: `${60 + i * 10}%`,
                      height: "20px",
                      borderRadius: "8px",
                      background:
                        "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
                      backgroundSize: "200% 100%",
                      animation: "shimmer 1.4s infinite",
                    }}
                  />
                </div>
              </li>
            ))
          ) : materiaPosts.length > 0 ? (
            materiaPosts.map((post: HomePost) => {
              const postTimestamp = post.updatedAt || post.date;
              return (
                <li key={post.slug} className="post-item">
                  <Link href={`/${post.slug}`}>
                    <span className="post-date" suppressHydrationWarning>
                      {lang === "es" ? "Última actualización" : "Last update"}:{" "}
                      {postTimestamp
                        ? timeAgo(postTimestamp, lang)
                        : lang === "es"
                          ? "Sin fecha"
                          : "No date"}
                    </span>
                    <span className="post-title">{post.title}</span>
                    <p className="post-description">{post.description}</p>
                  </Link>
                </li>
              );
            })
          ) : (
            <li
              className="post-item"
              style={{
                padding: "3rem 1rem",
                textAlign: "center",
                background: "#f8fafc",
                borderRadius: "12px",
                border: "1px dashed var(--border)",
                color: "var(--muted)",
              }}
            >
              <p style={{ margin: 0, fontWeight: "500" }}>
                {lang === "es"
                  ? "No hay posts publicados por el momento."
                  : "No posts published yet."}
              </p>
            </li>
          )}
        </ul>

        {!isLoadingPosts && ingresantesPosts.length > 0 && (
          <>
            <div style={{ marginTop: "0.5rem", marginBottom: "1.5rem" }}>
              <img
                src={
                  lang === "en"
                    ? "/new-students.png"
                    : "/material-para-ingresantes.png"
                }
                alt={
                  lang === "en"
                    ? "Material for New Students"
                    : "Material para Ingresantes"
                }
                style={{
                  width: "100%",
                  borderRadius: "12px",
                  display: "block",
                }}
              />
            </div>
            <ul className="post-list">
              {ingresantesPosts.map((post: HomePost) => {
                const postTimestamp = post.updatedAt || post.date;
                return (
                  <li key={post.slug} className="post-item">
                    <Link href={`/${post.slug}`}>
                      <span className="post-date" suppressHydrationWarning>
                        {lang === "es" ? "Última actualización" : "Last update"}
                        :{" "}
                        {postTimestamp
                          ? timeAgo(postTimestamp, lang)
                          : lang === "es"
                            ? "Sin fecha"
                            : "No date"}
                      </span>
                      <span className="post-title">{post.title}</span>
                      <p className="post-description">{post.description}</p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        )}

        {lang === "es" && (
          <>
            <div style={{ marginTop: "1rem", marginBottom: "1.5rem" }}>
              <img
                src="/informacion-de-la-carrera.png"
                alt="Información de la Carrera"
                style={{
                  width: "100%",
                  borderRadius: "12px",
                  display: "block",
                }}
              />
            </div>
            <a
              href="https://undef.edu.ar/fadena/carreras-de-grado/licciberdefensa/"
              target="_blank"
              rel="noopener noreferrer"
              className="intro-cover"
            >
              <img
                src="/cyberdefense-fadena-undef.png"
                alt="Cyberdefense FADENA UNDEF"
                style={{ width: "100%", borderRadius: "12px" }}
              />
            </a>
            <Link href="/links" className="intro-cover">
              <img
                src="/moodle-siu.png"
                alt="Moodle y SIU"
                style={{ width: "100%", borderRadius: "12px" }}
              />
            </Link>
            <div style={{ marginTop: "1rem", marginBottom: "1.5rem" }}>
              <img
                src="/calendario-tentativo.png"
                alt="Calendario Tentativo (2026)"
                style={{
                  width: "100%",
                  borderRadius: "12px",
                  display: "block",
                }}
              />
            </div>
            <button
              type="button"
              className="intro-cover"
              onClick={(event) =>
                handleImageClick(
                  "/calendar-cover-ghibli.jpeg",
                  "Calendario Académico de Grado 2026",
                  event.currentTarget,
                )
              }
              style={{
                border: "none",
                background: "none",
                padding: 0,
                width: "100%",
                display: "block",
              }}
            >
              <img
                src="/calendar-cover-ghibli.jpeg"
                alt="Calendario Académico de Grado 2026"
                style={{
                  width: "100%",
                  borderRadius: "12px",
                  cursor: "zoom-in",
                }}
              />
            </button>
          </>
        )}

        {lang === "en" && (
          <>
            <div style={{ marginTop: "1rem", marginBottom: "1.5rem" }}>
              <img
                src="/degree-information.png"
                alt="Degree Information"
                style={{
                  width: "100%",
                  borderRadius: "12px",
                  display: "block",
                }}
              />
            </div>
            <a
              href="https://undef.edu.ar/fadena/carreras-de-grado/licciberdefensa/"
              target="_blank"
              rel="noopener noreferrer"
              className="intro-cover"
            >
              <img
                src="/information.png"
                alt="Career Information"
                style={{ width: "100%", borderRadius: "12px" }}
              />
            </a>
            <Link href="/links" className="intro-cover">
              <img
                src="/siu-vs-moodle.png"
                alt="Moodle and SIU"
                style={{ width: "100%", borderRadius: "12px" }}
              />
            </Link>
            <div style={{ marginTop: "1rem", marginBottom: "1.5rem" }}>
              <img
                src="/provisional-calendar.png"
                alt="Provisional Calendar (2026)"
                style={{
                  width: "100%",
                  borderRadius: "12px",
                  display: "block",
                }}
              />
            </div>
            <button
              type="button"
              className="intro-cover"
              onClick={(event) =>
                handleImageClick(
                  "/calendar.png",
                  "Academic Calendar 2026",
                  event.currentTarget,
                )
              }
              style={{
                border: "none",
                background: "none",
                padding: 0,
                width: "100%",
                display: "block",
              }}
            >
              <img
                src="/calendar.png"
                alt="Academic Calendar 2026"
                style={{
                  width: "100%",
                  borderRadius: "12px",
                  cursor: "zoom-in",
                }}
              />
            </button>
          </>
        )}
      </main>

      <div className="home-cover">
        <a
          href="https://www.twitch.tv/ciberportero"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="/ciberportero-cover.jpeg"
            alt="Ciberportero Blog Cover"
            style={{ width: "100%", borderRadius: "12px", cursor: "pointer" }}
          />
        </a>
      </div>

      <footer className="footer-main">
        <div
          className="footer-social-left"
          style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}
        >
          <a
            href="https://x.com/ciberportero"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "flex" }}
            aria-label={
              lang === "es"
                ? "X (Twitter) de Ciberportero"
                : "Ciberportero X (Twitter)"
            }
          >
            <FaXTwitter size={16} aria-hidden="true" />
          </a>
          <a
            href="https://github.com/gonzagramaglia/ciberportero"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "flex" }}
            aria-label={
              lang === "es" ? "GitHub de Ciberportero" : "Ciberportero GitHub"
            }
          >
            <TbBrandGithub size={21} aria-hidden="true" />
          </a>
        </div>
        <a href="https://whatsapp.com/channel/0029VbDixno96H4NZuwELU3Z" target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>{t.footer}</a>
        <div
          className="footer-social-right"
          style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}
        >
          <a
            href="https://twitch.tv/ciberportero"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "flex" }}
            aria-label={
              lang === "es" ? "Twitch de Ciberportero" : "Ciberportero Twitch"
            }
          >
            <Twitch size={18} aria-hidden="true" />
          </a>
          <a
            href="https://youtube.com/@ciberportero"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "flex" }}
            aria-label={
              lang === "es" ? "YouTube de Ciberportero" : "Ciberportero YouTube"
            }
          >
            <Youtube size={22} aria-hidden="true" />
          </a>
        </div>
      </footer>

      <FloatingMusicButton />
      <FloatingFootballButton />

      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  );
}
