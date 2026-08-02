import React from 'react';

export default function DiscordIcon({ size = 24, color = 'currentColor', className = '' }: { size?: number, color?: string, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M19.73 4.87a18.2 18.2 0 0 0-4.63-1.44c-.21.4-.43.91-.59 1.35-1.74-.26-3.47-.26-5.18 0-.17-.44-.39-.95-.6-1.35a18.2 18.2 0 0 0-4.63 1.44 19.33 19.33 0 0 0-2.3 12.35 18.15 18.15 0 0 0 5.6 2.8 13.97 13.97 0 0 0 1.2-1.95 12.33 12.33 0 0 1-1.92-.93c.14-.1.28-.21.41-.32 3.86 1.83 8.04 1.83 11.87 0 .14.11.27.22.41.32-.6.37-1.25.68-1.93.93a14 14 0 0 0 1.2 1.95 18.15 18.15 0 0 0 5.6-2.8 19.33 19.33 0 0 0-2.32-12.35z"></path>
      <path d="M8.5 13.9c-1.12 0-2.03-.99-2.03-2.2s.9-2.2 2.03-2.2c1.13 0 2.05 1 2.03 2.2 0 1.2-.9 2.2-2.03 2.2zM15.5 13.9c-1.12 0-2.03-.99-2.03-2.2s.9-2.2 2.03-2.2c1.13 0 2.05 1 2.03 2.2 0 1.2-.89 2.2-2.03 2.2z"></path>
    </svg>
  );
}
