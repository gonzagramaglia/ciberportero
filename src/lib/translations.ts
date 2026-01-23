export const translations = {
    es: {
        title: "Ciberportero",
        description: "Ciberdefensa y seguridad digital desde la primera línea.",
        back: "Volver al inicio",
        footer: "© 2026 | Mens secura in corpore tuto",
        langName: "Español",
        featured: {
            title: "Recursos y Enlaces Útiles",
            description: "Recursos curados para estudiantes de la Lic. en Ciberdefensa de la UNDEF",
            tag: "Destacado"
        }
    },
    en: {
        title: "Ciberportero",
        description: "Cyberdefense and digital security from the front lines.",
        back: "Back to home",
        footer: "© 2026 | Mens secura in corpore tuto",
        langName: "English",
        featured: {
            title: "Useful Resources and Links",
            description: "Curated resources for Cyberdefense students at UNDEF",
            tag: "Featured"
        }
    },
    pt: {
        title: "Ciberportero",
        description: "Ciberdefesa e segurança digital na linha de frente.",
        back: "Voltar ao início",
        footer: "© 2026 | Mens secura in corpore tuto",
        langName: "Português",
        featured: {
            title: "Recursos e Links Úteis",
            description: "Recursos selecionados para estudantes de Ciberdefesa da UNDEF",
            tag: "Destaque"
        }
    }
};

export type Locale = keyof typeof translations;
