import TabsSeleccion from '@/components/modulos/seleccion/TabsSeleccion';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Selección de Personal',
  description: 'Gestiona solicitudes de contratación, convocatorias, postulantes, entrevistas, evaluaciones y contratos del proceso de selección de personal.',
};

export default async function SeleccionPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Encabezado Premium Unificado */}
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-gradient-to-br from-red-50 to-amber-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-3">
            Selección de Personal
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl">
            Gestione las ofertas de empleo, el proceso de reclutamiento de postulantes, entrevistas, evaluaciones y generación de contratos en <strong className="font-semibold text-slate-800">Extintores G&S</strong>.
          </p>
        </div>
      </div>
      
      <TabsSeleccion />
    </div>
  );
}