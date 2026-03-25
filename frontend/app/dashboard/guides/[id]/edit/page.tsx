'use client';

import { useState, useEffect } from 'react';
import { lusitana } from "@/app/ui/fonts";
import { fetchData, patchData } from "@/app/lib/data";
import { FormInput } from '@/app/components/ui/text_form';
import { FormSelect } from '@/app/components/ui/selector_form';
import { AddButton } from '@/app/components/ui/add_button';
import { useRouter, useParams } from 'next/navigation';

export default function EditGuidePage() {
  const router = useRouter();
  const { id } = useParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [guide, setGuide] = useState<any>(null);
  const [availableTickets, setAvailableTickets] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // 1. Cargamos los datos de la guía actual
        const guideData = await fetchData(`guides/${id}/`);
        setGuide(guideData);

        // 2. Cargamos los tickets sin guía
        const freeTickets = await fetchData('tickets/get_tickets_without_guide/');
        
        // 3. Formateamos los tickets libres
        let formatted = freeTickets.map((t: any) => ({
          id: t.id,
          name: `Ticket #${t.ticket_number}`
        }));

        // 4. Si la guía tiene un ticket, lo buscamos y lo agregamos a la lista
        // para que sea la opción seleccionada por defecto.
        if (guideData.ticket) {
          const currentTicket = await fetchData(`tickets/${guideData.ticket}/`);
          const currentItem = {
            id: currentTicket.id,
            name: `Ticket #${currentTicket.ticket_number} (Actual)`
          };
          
          // Evitamos duplicados por si acaso y ponemos el actual al inicio
          formatted = [currentItem, ...formatted.filter((t: { id: number; }) => t.id !== currentTicket.id)];
        }

        setAvailableTickets(formatted);
      } catch (err) {
        console.error("Error cargando datos:", err);
        setError("No se pudieron cargar los datos de la guía.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    try {
      // Usamos el endpoint de actualización (ajusta el path si es necesario)
      const result = await patchData(`guides/${id}/update_guide/`, payload);
      
      if (result?.error) {
        setError(result.error);
      } else {
        router.push('/dashboard/guides');
      }
    } catch (err) {
      setError("Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-white">Cargando datos...</div>;

  return (
    <div className="bg-background p-8 text-white min-h-screen" style={lusitana.style}>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Editar Guía</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-card p-6 rounded-lg border border-border grid grid-cols-1 md:grid-cols-2 gap-4">
            <h2 className="col-span-full text-xl font-semibold border-b border-border pb-2">
              Información de la Guía
            </h2>

            <FormInput 
              label="Nro. de Acta" 
              name="inspection_record_number" 
              defaultValue={guide?.inspection_record_number}
              required 
            />

            <FormInput 
              label="Fecha" 
              name="date" 
              type="date" 
              defaultValue={guide?.date}
              required 
            />

            <FormInput 
              label="Estatus" 
              name="status" 
              defaultValue={guide?.status}
              required 
            />

            <FormSelect 
              label="Ticket Asociado" 
              name="ticket" 
              data={availableTickets} 
              defaultValue={guide?.ticket} // Importante para que el selector se posicione
              required 
            />
          </div>

          <div className="flex justify-end gap-4 items-center">
             {error && <p className="text-red-500 text-sm">{error}</p>}
             <AddButton type="submit">
                Actualizar Guía
             </AddButton>
          </div>
        </form>
      </div>
    </div>
  );
}