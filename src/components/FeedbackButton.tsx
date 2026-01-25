'use client';

import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/lib/translations';
import { useState, useEffect } from 'react';

export default function FeedbackButton() {
    const { lang } = useLanguage();
    const t = translations[lang];
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const handleScroll = () => {
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            const scrollTop = window.scrollY || document.documentElement.scrollTop;

            // Si falta menos de 50px para el final, lo ocultamos
            if (scrollTop + windowHeight >= documentHeight - 50) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSf6i8nH_7vDfEoIc4sveS6j9mwZ0VfoagT5SqqvCqlq64VDKg/viewform"
            target="_blank"
            rel="noopener noreferrer"
            className={`feedback-fab ${!isVisible ? 'hidden' : ''}`}
            title={t.feedback}
        >
            <div className="feedback-content">
                <Image
                    src="/google-forms.jpg"
                    alt="Google Forms"
                    width={40}
                    height={40}
                    className="feedback-logo"
                />
            </div>
        </a>
    );
}
