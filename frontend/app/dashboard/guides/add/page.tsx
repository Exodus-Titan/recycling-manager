'use client';

import { useState, useEffect } from 'react';
import { lusitana } from "@/app/ui/fonts";
import { fetchData, postData } from "@/app/lib/data";
import { FormInput } from '@/app/components/ui/text_form';
import { FormSelect } from '@/app/components/ui/selector_form';
import { AddButton } from '@/app/components/ui/add_button';
import { useRouter } from 'next/navigation';

export default function AddGuidePage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Estado para los tickets que no tienen guía asignada
  const [availableTickets, setAvailableTickets] = useState([]);

  useEffect(() => {
    // Llamamos al endpoint que creamos en el backend
    const getAvailableTickets = async () => {
      try {
        const data = await fetchData('tickets/get_tickets_without_guide/');
        // Formateamos la data para el FormSelect si es necesario
        // El FormSelect suele esperar { id, name } o similar. 
        // Si tu componente usa 'ticket_number' como etiqueta, lo mapeamos:
        const formattedTickets = data.map((t: any) => ({
          id: t.id,
          name: `Ticket #${t.ticket_number}` // Lo que verá el usuario
        }));
        
        setAvailableTickets(formattedTickets);
      } catch (err) {
        console.error("Error cargando tickets disponibles:", err);
      }
    };

    getAvailableTickets();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    try {
      const result = await postData('guides/save_guide/', payload);
      console.log(result);

      if (result?.error) {
        setError(result.error);
      } else {
        router.push('/dashboard/guides');
      }
    } catch (err) {
      setError("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background p-8 text-white min-h-screen" style={lusitana.style}>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Registrar Nueva Guía</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-card p-6 rounded-lg border border-border grid grid-cols-1 md:grid-cols-2 gap-4">
            <h2 className="col-span-full text-xl font-semibold border-b border-border pb-2">
              Información de la Guía
            </h2>

            <FormInput 
              label="Nro. de Acta" 
              name="inspection_record_number" 
              placeholder="Ej: ACTA-2024-001"
              required 
            />

            <FormInput 
              label="Fecha" 
              name="date" 
              type="date" 
              required 
            />

            <FormInput 
              label="Estatus" 
              name="status" 
              placeholder="Ej: En Proceso, Completado..."
              required 
            />

            <FormSelect 
              label="Ticket Asociado" 
              name="ticket" 
              data={availableTickets} 
              required 
            />
          </div>

          <div className="flex justify-end gap-4 items-center">
             {error && <p className="text-red-500 text-sm">{error}</p>}
             <AddButton type="submit" disabled={loading || availableTickets.length === 0}>
                {loading ? 'Procesando...' : 'Generar Guía'}
             </AddButton>
          </div>
          
          {availableTickets.length === 0 && !loading && (
            <p className="text-yellow-500 text-xs text-right mt-2">
              * No hay tickets disponibles sin guía asignada.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}