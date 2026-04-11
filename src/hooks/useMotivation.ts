import { useState, useEffect } from 'react';
import { translations } from '@/lib/translations';

export function useMotivation(lang: string) {
  const [motivation, setMotivation] = useState('');

  useEffect(() => {
    const t = translations[lang as keyof typeof translations] as any;
    if (t?.motivations) {
      const randomIndex = Math.floor(Math.random() * t.motivations.length);
      setMotivation(t.motivations[randomIndex]);
    }
  }, [lang]);

  return motivation;
}
