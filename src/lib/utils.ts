
export function timeAgo(date: Date | string, lang: string = 'es'): string {
  const d = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  const translations: Record<string, any> = {
    es: {
      now: 'hace un momento',
      minute: 'hace 1 minuto',
      minutes: 'hace {n} minutos',
      hour: 'hace 1 hora',
      hours: 'hace {n} horas',
      day: 'hace 1 día',
      days: 'hace {n} días',
      week: 'hace 1 semana',
      weeks: 'hace {n} semanas',
      month: 'hace 1 mes',
      months: 'hace {n} meses',
      year: 'hace 1 año',
      years: 'hace {n} años'
    },
    en: {
      now: 'just now',
      minute: '1 minute ago',
      minutes: '{n} minutes ago',
      hour: '1 hour ago',
      hours: '{n} hours ago',
      day: '1 day ago',
      days: '{n} days ago',
      week: '1 week ago',
      weeks: '{n} weeks ago',
      month: '1 month ago',
      months: '{n} months ago',
      year: '1 year ago',
      years: '{n} years ago'
    },
    pt: {
      now: 'agora mesmo',
      minute: 'há 1 minuto',
      minutes: 'há {n} minutos',
      hour: 'há 1 hora',
      hours: 'há {n} horas',
      day: 'há 1 dia',
      days: 'há {n} dias',
      week: 'há 1 semana',
      weeks: 'há {n} semanas',
      month: 'há 1 mes',
      months: 'há {n} meses',
      year: 'há 1 ano',
      years: 'há {n} anos'
    }
  };

  const t = translations[lang] || translations['es'];

  if (diffInSeconds < 60) return t.now;
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes === 1) return t.minute;
  if (diffInMinutes < 60) return t.minutes.replace('{n}', diffInMinutes);

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours === 1) return t.hour;
  if (diffInHours < 24) return t.hours.replace('{n}', diffInHours);

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return t.day;
  if (diffInDays < 7) return t.days.replace('{n}', diffInDays);

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks === 1) return t.week;
  if (diffInWeeks < 4) return t.weeks.replace('{n}', diffInWeeks);

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths === 1) return t.month;
  if (diffInMonths < 12) return t.months.replace('{n}', diffInMonths);

  const diffInYears = Math.floor(diffInDays / 365);
  if (diffInYears === 1) return t.year;
  return t.years.replace('{n}', diffInYears);
}
