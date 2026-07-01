/**
 * @file RelojMarcador.tsx
 * @description Componente de interfaz de usuario correspondiente al flujo de Control de Asistencia y Reportes de Marcaciones del personal.
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

import { useState } from 'react';
import { marcarEntrada, marcarSalida } from '@/app/dashboard/asistencia/actions';

// ==========================================
// COMPONENTE PRINCIPAL DE LA VISTA
// ==========================================
export default function RelojMarcador({ registroHoy }: { registroHoy: any }) {
    const [mensaje, setMensaje] = useState('');
    const [loading, setLoading] = useState(false);

    const handleMarcarEntrada = async () => {
        setLoading(true);
        const res = await marcarEntrada();
        setMensaje(res.message);
        setLoading(false);
    };

    const handleMarcarSalida = async () => {
        setLoading(true);
        const res = await marcarSalida();
        setMensaje(res.message);
        setLoading(false);
    };

    const yaMarcoEntrada = !!registroHoy?.hora_entrada;
    const yaMarcoSalida = !!registroHoy?.hora_salida;

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Mi Asistencia (Hoy)</h2>
            
            <div className="w-full space-y-3">
                <button 
                    onClick={handleMarcarEntrada}
                    disabled={loading || yaMarcoEntrada}
                    className={`w-full py-3 rounded-lg font-semibold transition-colors shadow-sm ${yaMarcoEntrada ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                >
                    {yaMarcoEntrada ? `Entrada marcada: ${registroHoy.hora_entrada}` : 'Marcar Entrada'}
                </button>

                <button 
                    onClick={handleMarcarSalida}
                    disabled={loading || !yaMarcoEntrada || yaMarcoSalida}
                    className={`w-full py-3 rounded-lg font-semibold transition-colors shadow-sm ${!yaMarcoEntrada || yaMarcoSalida ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white'}`}
                >
                    {yaMarcoSalida ? `Salida marcada: ${registroHoy.hora_salida}` : 'Marcar Salida'}
                </button>
            </div>

            {mensaje && <div className="text-sm font-medium text-gray-700 bg-gray-50 p-3 rounded-md w-full text-center border border-gray-200">{mensaje}</div>}
        </div>
    );
}