import type { Metadata } from 'next';
import { DashboardController } from '@/controllers/dashboard.controller';

export const metadata: Metadata = {
  title: 'Inicio',
};

export default async function DashboardHome() {
    // LA VISTA: Solo le pide datos al Controlador, no sabe nada de BD.
  const metrics = await DashboardController.getDashboardMetrics();
  
  const {
    employeeCount = 0,
    presentCount = 0,
    evaluationCount = 0,
    postingCount = 0
  } = metrics.data || {};

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Encabezado Principal */}
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-gradient-to-br from-red-50 to-orange-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-3">
            Bienvenido al Sistema de RRHH
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl">
            Selecciona un módulo en el menú lateral para comenzar a gestionar los recursos humanos de <strong className="font-semibold text-slate-800">Extintores G&S Perú SAC</strong>.
          </p>
        </div>
      </div>

      {/* Grid de Tarjetas de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Tarjeta 1 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest group-hover:text-red-600 transition-colors">Empleados Activos</h3>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </span>
          </div>
          <p className="text-4xl font-black text-slate-800 tracking-tight">{employeeCount}</p>
        </div>

        {/* Tarjeta 2 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest group-hover:text-emerald-500 transition-colors">Presentes Hoy</h3>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </span>
          </div>
          <p className="text-4xl font-black text-slate-800 tracking-tight">{presentCount}</p>
        </div>

        {/* Tarjeta 3 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest group-hover:text-indigo-500 transition-colors">Evaluaciones Mes</h3>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </span>
          </div>
          <p className="text-4xl font-black text-slate-800 tracking-tight">{evaluationCount}</p>
        </div>

        {/* Tarjeta 4 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest group-hover:text-amber-500 transition-colors">Convocatorias Activas</h3>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </span>
          </div>
          <p className="text-4xl font-black text-slate-800 tracking-tight">{postingCount}</p>
        </div>
      </div>
    </div>
  );
}