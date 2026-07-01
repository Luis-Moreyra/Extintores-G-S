import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | Extintores G&S',
    default: 'Extintores G&S | Sistema RRHH',
  },
  description: 'Sistema de Gestión de Recursos Humanos y Asistencia para Extintores G&S.',
  applicationName: 'Sistema RRHH Extintores G&S',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}