import RegistroEmpleado from '@/components/modulos/empleados/RegistroEmpleado';
import BotonesAccion from '@/components/modulos/empleados/BotonesAccion';
import { obtenerTodosLosEmpleados } from '@/controllers/empleado.controller';
import { Empleado } from '@/types/empleado';

export default async function EmpleadosPage() {
    // 1. LA VISTA: Llama al controlador para obtener los datos.
    const response = await obtenerTodosLosEmpleados();
    const empleados: Empleado[] = response.empleados || [];

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Encabezado Premium Unificado */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-gradient-to-br from-red-50 to-rose-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-3">
                        Gestión de Empleados
                    </h1>
                    <p className="text-lg text-slate-500 max-w-2xl">
                        Gestione el directorio de colaboradores, registre nuevos ingresos y actualice la información del personal activo de <strong className="font-semibold text-slate-800">Extintores G&S</strong>.
                    </p>
                </div>
            </div>
            
            <RegistroEmpleado />

            {/* 2. Tabla de Lista de Empleados */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-7xl mx-auto mt-8">
                <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-4">
                    Directorio de Empleados
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                                <th className="p-4 border-b font-semibold rounded-tl-lg w-16">ID</th>
                                <th className="p-4 border-b font-semibold">DNI</th>
                                <th className="p-4 border-b font-semibold">Nombres y Apellidos</th>
                                <th className="p-4 border-b font-semibold">Correo</th>
                                <th className="p-4 border-b font-semibold">Cargo</th>
                                <th className="p-4 border-b font-semibold">Horario</th>
                                <th className="p-4 border-b font-semibold rounded-tr-lg w-28 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700">
                            {empleados.length > 0 ? empleados.map((emp) => (
                                <tr key={emp.id_empleado} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                    <td className="p-4 font-medium text-red-600">#{emp.id_empleado}</td>
                                    <td className="p-4 text-gray-600">{emp.dni}</td>
                                    <td className="p-4">{emp.nombres} {emp.apellidos}</td>
                                    <td className="p-4 text-slate-500 font-mono text-xs">{emp.correo || '--'}</td>
                                    <td className="p-4">
                                        <span className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">{emp.cargo || 'Sin Área'}</span>
                                    </td>
                                    <td className="p-4">
                                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">{emp.horario_nombre || 'Sin Horario'}</span>
                                    </td>
                                    <td className="p-4 flex justify-center">
                                        <BotonesAccion empleado={{
                                            id_empleado: emp.id_empleado,
                                            dni: emp.dni,
                                            nombres: emp.nombres,
                                            apellidos: emp.apellidos,
                                            cargo: emp.cargo || '',
                                            horarioId: emp.id_horario || 0
                                        }} />
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={7} className="p-6 text-center text-gray-500">No hay empleados registrados.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}