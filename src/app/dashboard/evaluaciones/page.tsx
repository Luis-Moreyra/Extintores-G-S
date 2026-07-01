import ContenedorEvaluaciones from '@/components/modulos/evaluaciones/ContenedorEvaluaciones';
import { obtenerTodosLosEmpleados, obtenerTodasLasAreas } from '@/controllers/empleado.controller';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Evaluación de Desempeño',
  description: 'Módulo para el registro y seguimiento del rendimiento laboral de los colaboradores.',
};

export default async function EvaluacionesPage() {
  // LA VISTA: Solicita datos a los controladores siguiendo la arquitectura MVC del proyecto.
  const respEmpleados = await obtenerTodosLosEmpleados();
  const respAreas = await obtenerTodasLasAreas();

  const empleados = respEmpleados.empleados || [];
  const areas = respAreas.areas || [];

  return (
    <main className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Encabezado con estilo consistente al Dashboard Home */}
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-gradient-to-br from-red-50 to-indigo-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-3">
            Registrar Evaluación de Desempeño
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl">
            Gestione el rendimiento del personal de <strong className="font-semibold text-slate-800">Extintores G&S</strong> basándose en indicadores clave de calidad, proactividad y cumplimiento.
          </p>
        </div>
      </div>
      
      <ContenedorEvaluaciones empleados={empleados} areas={areas} />
    </main>
  );
}