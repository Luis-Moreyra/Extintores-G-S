import { redirect } from 'next/navigation';

export default function RootPage() {
  // Redirige automáticamente al panel principal al abrir la aplicación
  redirect('/dashboard');
}
