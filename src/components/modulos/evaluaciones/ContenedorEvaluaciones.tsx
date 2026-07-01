/**
 * @file ContenedorEvaluaciones.tsx
 * @description Componente de interfaz de usuario correspondiente al sistema de Evaluación de Desempeño y KPI Analíticos de Productividad.
 * @module ExtintoresGS/components
 * @copyright Extintores GS S.A.C. Todos los derechos reservados.
 * 
 * ============================================================================
 * SECCIÓN GENERAL DE DOCUMENTACIÓN Y RESUMEN DE FUNCIONES:
 * - Provee control reactivo y encapsulación de lógica.
 * - Asegura la consistencia en el tipado y llamado de las consultas SQL/Actions.
 * ============================================================================
 */

'use client';

import React, { useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';

// 1. Importaciones por defecto estandarizadas
import FormularioEvaluacion from './FormularioEvaluacion';
import PanelReportes from './PanelReportes';
import EmisionReporte from './EmisionReporte';
import ConsultorProductividad from './ConsultorProductividad';
import ArchivarExpediente from './ArchivarExpediente';
import NotificarResultados from './NotificarResultados';

import { Empleado } from '@/types/empleado';

interface Props {
  empleados: Empleado[];
  areas: any[];
}

const TABS = [
  { id: 1, name: 'Registrar Evaluación' },
  { id: 2, name: 'Generar Informe' },
  { id: 3, name: 'Emitir Reporte de Desempeño' },
  { id: 4, name: 'Consultor Indicadores de Productividad' },
  { id: 5, name: 'Archivar expediente del trabajador' },
  { id: 6, name: 'Notificar Resultados' },
];

// ==========================================
// COMPONENTE PRINCIPAL DE LA VISTA
// ==========================================
export default function ContenedorEvaluaciones({ empleados, areas }: Props) {
  const [activeTab, setActiveTab] = useState(1);

  // 2. Salvaguarda: Validador de componentes
  // Este componente interno evita que la app rompa si un import falla o devuelve un objeto
  const SafeRender = ({ component: Component, props }: { component: any, props: any }) => {
    // Si el componente no es una función (es undefined o un objeto plano debido a mal import)
    if (typeof Component !== 'function') {
      console.error(`Error de renderizado: El componente para la pestaña ${activeTab} no es válido.`, Component);
      return (
        <div className="flex flex-col items-center justify-center p-20 bg-red-50 rounded-[2.5rem] border-2 border-dashed border-red-200 text-red-600 gap-4">
          <AlertCircle size={48} />
          <div className="text-center">
            <p className="font-bold text-lg">Error de carga de módulo</p>
            <p className="text-sm opacity-80">Verifica que el archivo tenga "export default" y la ruta sea correcta.</p>
          </div>
        </div>
      );
    }
    return <Component {...props} />;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
      {/* Navegación por Pestañas */}
      <div className="flex overflow-x-auto gap-1 p-1.5 bg-white rounded-3xl border border-slate-100 shadow-sm scrollbar-hide backdrop-blur-sm bg-white/80 sticky top-0 z-20">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all duration-300 ${
              activeTab === tab.id 
                ? 'bg-red-600 text-white shadow-lg shadow-red-200 scale-[1.02]' 
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Renderizado Condicional */}
      <div className="pt-2 min-h-[500px]">
        {activeTab === 1 && (
          <SafeRender component={FormularioEvaluacion} props={{ empleados, areas }} />
        )}

        {activeTab === 2 && (
          <SafeRender component={PanelReportes} props={{ empleados, areas }} />
        )}

        {activeTab === 3 && (
          <SafeRender component={EmisionReporte} props={{ empleados, areas }} />
        )}

        {activeTab === 4 && (
          <SafeRender component={ConsultorProductividad} props={{ areas }} />
        )}

        {activeTab === 5 && (
          <SafeRender component={ArchivarExpediente} props={{ empleados, areas }} />
        )}

        {activeTab === 6 && (
          <SafeRender component={NotificarResultados} props={{ empleados, areas }} />
        )}

        {/* Estado para pestañas en desarrollo */}
        {activeTab > 6 && (
          <div className="bg-white p-24 rounded-[2.5rem] border-2 border-dashed border-slate-100 text-center text-slate-300 font-bold flex flex-col items-center justify-center gap-4">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-3xl">🚧</div>
            <div className="space-y-1">
              <p>Módulo {TABS.find(t => t.id === activeTab)?.name}</p>
              <p className="text-xs uppercase tracking-widest opacity-60">Próximamente disponible</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}