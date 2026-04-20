import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'rgba(255, 255, 255, 0.08)', // Tynnere, subtile rammer
				input: 'rgba(255, 255, 255, 0.05)',
				ring: 'rgba(20, 184, 166, 0.4)',    // Teal ring
				background: '#090910',              // Din nye dype basefarge
				foreground: '#ffffff',
				primary: {
					DEFAULT: '#14b8a6',               // Teal-500
					foreground: '#ffffff'
				},
				secondary: {
					DEFAULT: 'rgba(255, 255, 255, 0.04)',
					foreground: '#ffffff'
				},
				destructive: {
					DEFAULT: 'hsl(0 84.2% 60.2%)',
					foreground: 'hsl(0 0% 98%)'
				},
				muted: {
					DEFAULT: 'rgba(255, 255, 255, 0.03)',
					foreground: 'rgba(255, 255, 255, 0.4)'
				},
				accent: {
					DEFAULT: 'rgba(20, 184, 166, 0.1)',
					foreground: '#14b8a6'
				},
				popover: {
					DEFAULT: '#0c0c14',
					foreground: '#ffffff'
				},
				card: {
					DEFAULT: 'rgba(255, 255, 255, 0.03)', // Glass-effekt base
					foreground: '#ffffff'
				}
			},
			borderRadius: {
				lg: '1.25rem',   // Rundere hjørner (20px)
				md: '0.75rem',   // (12px)
				sm: '0.5rem'     // (8px)
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'pulse-slow': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.5' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'pulse-gentle': 'pulse-slow 3s infinite ease-in-out'
			},
			backgroundImage: {
				'glass-gradient': 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.01))',
				'teal-gradient': 'linear-gradient(to bottom right, #14b8a6, #0891b2)',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
