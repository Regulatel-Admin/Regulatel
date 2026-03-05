# REGULATEL Website

A modern, responsive website for the Foro Latinoamericano de Entes Reguladores de Telecomunicaciones (REGULATEL) built with React, TypeScript, Vite, and Tailwind CSS v4.

## Features

- ✨ **Animated Components**: Rotating text animations and scroll-triggered effects
- 🎨 **Modern UI**: Beautiful, responsive design with Tailwind CSS v4
- 🚀 **Performance**: Optimized with Vite for fast development and production builds
- 📱 **Responsive**: Fully responsive design for all device sizes
- 🎭 **Animations**: Smooth animations powered by Framer Motion
- 🌙 **Dark Theme**: Elegant dark theme with custom color palette

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS v4** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library

## Getting Started

### Prerequisites

- Node.js 18+ and npm (or yarn/pnpm)

### Installation

1. Install dependencies:

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

Build for production:

```bash
npm run build
```

The production build will be in the `dist` directory.

### Preview

Preview the production build:

```bash
npm run preview
```

## Project Structure

```
webage/
├── src/
│   ├── components/
│   │   └── ui/          # Reusable UI components (Button, Card, Input, Textarea)
│   ├── lib/
│   │   └── utils.ts     # Utility functions (cn helper)
│   ├── App.tsx          # Main application component
│   ├── main.tsx         # Application entry point
│   └── index.css        # Global styles and Tailwind configuration
├── index.html           # HTML template
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Dependencies and scripts
```

## Key Components

### RotatingText
An animated text component that cycles through multiple text strings with smooth transitions and stagger effects.

### MagicText
A scroll-triggered text animation that reveals words as you scroll through the section.

### RegulatelWebsite
The main website component featuring:
- Animated background with interactive dots
- Responsive navigation with mobile menu
- Multiple sections (Inicio, Autoridades, Miembros, Gestión, Eventos, Contacto)
- Contact form
- Footer with links

## Customization

### Colors

The color scheme is defined in `src/index.css` using CSS variables. You can customize the theme by modifying the `:root` and `.dark` variables.

### Components

UI components are located in `src/components/ui/` and can be customized to match your design system.

## License

This project is created for REGULATEL.
