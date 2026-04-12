import type { Config } from 'tailwindcss';

const config: Config = {
  // Assurez-vous que Tailwind analyse tous vos fichiers React et Next.js
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // ----------------------------------------------------------------------
      // COULEURS PERSONNALISÉES
      // ----------------------------------------------------------------------
      colors: {
        // Couleur Principale (Rouge Boucherie)
        'primary-red': '#B71C1C', 
        
        // Couleur d'Accentuation (Or ou Jaune)
        'accent-gold': '#FFC107',
        
        // Couleurs de Fond
        'bg-light': '#F8F9FA',
        'bg-cream': '#F3F4F6',
        
        // Couleurs de Texte/Sombre
        'text-dark': '#212529',
        'text-subtle': '#6C757D',
      },
      
      // ----------------------------------------------------------------------
      // TYPOGRAPHIE
      // ----------------------------------------------------------------------
      fontFamily: {
        // Par défaut, utilisez Inter (ou une autre police moderne)
        sans: ['Inter', 'sans-serif'],
        // Une police spéciale pour les titres (optionnel, doit être importée via Google Fonts ou autre)
        title: ['Georgia', 'serif'],
      },

      // ----------------------------------------------------------------------
      // OMBRES
      // ----------------------------------------------------------------------
      boxShadow: {
        'strong': '0 10px 15px -3px rgba(183, 28, 28, 0.2), 0 4px 6px -2px rgba(183, 28, 28, 0.1)',
      }
    },
  },
  plugins: [
    // Si vous utilisez @tailwindcss/forms, assurez-vous de l'inclure ici
    // require('@tailwindcss/forms'),
  ],
};

export default config;
