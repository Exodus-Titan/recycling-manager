'use client';

import { useState, useEffect } from 'react';
import { lusitana } from "@/app/ui/fonts";
import { fetchData, patchData} from "@/app/lib/data";
import { FormInput } from '@/app/components/ui/text_form';
import { AddButton } from '@/app/components/ui/add_button';
import { useRouter, useParams } from 'next/navigation';
import { Plus } from 'lucide-react';
import { TicketItemRow } from '../../../../components/ui/ticket-item-row';
import { FormSelect } from '@/app/components/ui/selector_form';

export default function EditTicketPage() {
  const router = useRouter();
  const { id } = useParams();
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [materials, setMaterials] = useState([]);
  
  // Datos del ticket (campos básicos)
  const [ticketData, setTicketData] = useState<any>(null);
  
  // Los ítems se manejan en su propio estado para permitir la edición dinámica
  const [items, setItems] = useState<any[]>([]);
   const [providers, setProviders] = useState([]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [materialsList, currentTicket, providersData] = await Promise.all([
          fetchData('materials/'),
          fetchData(`tickets/${id}/get_ticket_by_id/`),
          fetchData('providers/'),
        ]);
        
        setMaterials(materialsList);
        setTicketData(currentTicket);
        setProviders(providersData);
        
        // Importante: Si el ticket ya tiene ítems, los cargamos en el estado.
        // Cada ítem debe traer su ID de la base de datos.
        if (currentTicket.items && currentTicket.items.length > 0) {
          setItems(currentTicket.items);
        } else {
          setItems([{ material: '', amount: '', unit_type: 'KG' }]);
        }
      } catch (err) {
        setError("Error al cargar los datos del ticket.");
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, [id]);

  const handleItemChange = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const addItem = () => {
    // Los nuevos ítems no tienen ID
    setItems([...items, { material: '', amount: '', unit_type: 'KG' }]);
  };
  
  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const payload = {
      ...Object.fromEntries(formData.entries()),
      items: items // Enviamos la lista actual (incluyendo IDs para el backend)
    };

    try {
      const result = await patchData(`tickets/${id}/update_ticket/`, payload);
      if (result && !result.error) {
        router.push('/dashboard/tickets');
      } else {
        setError(result?.error || "Error al actualizar el ticket");
      }
    } catch (err) {
      setError("Error de comunicación con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-white p-8 text-center">Cargando datos del ticket...</div>;

  return (
    <div className="bg-background p-8 text-white min-h-screen" style={lusitana.style}>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Editar Ticket de Recepción</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información General */}
          <div className="bg-card p-6 rounded-lg border border-border grid grid-cols-1 md:grid-cols-2 gap-4">
            <h2 className="col-span-full text-xl font-semibold border-b border-border pb-2">Datos del Ticket</h2>
            <FormInput label="Nro. Ticket" name="ticket_number" defaultValue={ticketData?.ticket_number} required />
            <FormInput label="Fecha" name="date" type="date" defaultValue={ticketData?.date} required />
            <FormInput label="Empleado" name="employee_name" defaultValue={ticketData?.employee_name} required />
            <FormSelect 
              label="Proveedor" 
              name="provider" 
              data={providers} 
              defaultValue={ticketData?.provider} // Django devuelve el ID del proveedor
              required 
            />
            <FormInput label="Peso Total (Referencial)" name="total_weight" type="number" step="0.01" defaultValue={ticketData?.total_weight} required />
            <FormInput label="Abono" name="installment_amount" type="number" step="0.01" defaultValue={ticketData?.installment_amount} required />
          </div>

          {/* Listado dinámico de materiales */}
          <div className="bg-card p-6 rounded-lg border border-border space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-2">
              <h2 className="text-xl font-semibold">Desglose de Materiales</h2>
              <button type="button" onClick={addItem} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-sm transition-all shadow-lg">
                <Plus size={18} /> Añadir Fila
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <TicketItemRow 
                  key={item.id || index} // Usamos el ID de la BD si existe
                  index={index}
                  item={item}
                  materials={materials}
                  onChange={handleItemChange}
                  onRemove={removeItem}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-4 items-center">
             {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
             <AddButton type="submit">Actualizar y Guardar</AddButton>
          </div>
        </form>
      </div>
    </div>
  );
}