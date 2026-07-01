'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  User, 
  Clock, 
  Calendar, 
  LineChart, 
  Users, 
  LogOut 
} from 'lucide-react';

const menuItems = [
    { name: 'Inicio', icon: Home, path: '/dashboard' },
    { name: 'Gestión de Empleados', icon: User, path: '/dashboard/empleados' },
    { name: 'Control de Asistencia', icon: Clock, path: '/dashboard/asistencia' },
    { name: 'Gestión de Horarios', icon: Calendar, path: '/dashboard/horarios' },
    { name: 'Eval. de Desempeño', icon: LineChart, path: '/dashboard/evaluaciones' },
    { name: 'Selección de Personal', icon: Users, path: '/dashboard/seleccion' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 bg-gray-900 text-white flex flex-col h-full shadow-lg">
      {/* Título o Logo de la empresa */}
      <div className="p-6 mb-4">
        <div className="text-2xl font-bold text-center text-red-500 tracking-wide">Extintores G&S</div>
      </div>

      {/* Menú de Navegación */}
      <nav className="flex-1 px-4 space-y-2 flex flex-col">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.path) && (item.path !== '/dashboard' || pathname === '/dashboard');
          
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
                isActive ? 'bg-red-600 text-white font-semibold shadow-md' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" strokeWidth={2} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Botón de Cerrar Sesión */}
      <div className="p-4 border-t border-gray-800 mt-auto">
        <button className="group flex items-center justify-center p-3 w-full rounded-lg text-gray-300 hover:text-white hover:bg-red-600 transition-all duration-200" title="Cerrar Sesión">
          <LogOut className="w-5 h-5 flex-shrink-0" strokeWidth={2} />
        </button>
      </div>
    </aside>
  );
}