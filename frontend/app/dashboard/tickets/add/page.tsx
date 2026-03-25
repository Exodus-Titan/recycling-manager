'use client';

import { useState, useEffect } from 'react';
import { lusitana } from "@/app/ui/fonts";
import { fetchData, postData } from "@/app/lib/data";
import { FormInput } from '@/app/components/ui/text_form';
import { AddButton } from '@/app/components/ui/add_button';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { TicketItemRow } from '../../../components/ui/ticket-item-row';
import { FormSelect } from '@/app/components/ui/selector_form';

export default function AddTicketPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [items, setItems] = useState([{ material: '', amount: '', unit_type: 'KG' }]);
  const [providers, setProviders] = useState([]);

  useEffect(() => {
    fetchData('materials/').then(setMaterials);

    const fetchProviders = async () => {
        const data = await fetchData('providers/');
         
        setProviders(data);
    };
    fetchProviders();

  }, []);

  const handleItemChange = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const addItem = () => setItems([...items, { material: '', amount: '', unit_type: 'KG' }]);
  
  const removeItem = (index: number) => {
    if (items.length > 1) setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const payload = {
      ...Object.fromEntries(formData.entries()),
      items: items 
    };

    try {
      const result = await postData('tickets/save_ticket/', payload);
      if (result?.error) setError(result.error);
      else router.push('/dashboard/tickets');
    } catch (err) {
      setError("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background p-8 text-white min-h-screen" style={lusitana.style}>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Generar Ticket de Recepción</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Formulario Principal */}
          <div className="bg-card p-6 rounded-lg border border-border grid grid-cols-1 md:grid-cols-2 gap-4">
            <h2 className="col-span-full text-xl font-semibold border-b border-border pb-2">Datos del Ticket</h2>
            <FormInput label="Nro. Ticket" name="ticket_number" required />
            <FormInput label="Fecha" name="date" type="date" required />
            <FormInput label="Empleado" name="employee_name" required />
            <FormSelect 
                label="Proveedor" 
                name="provider" // Este es el nombre que recibirá Django en el POST/PUT
                data={providers} 
                required 
            />
            <FormInput 
              label="Peso Total" 
              name="total_weight" 
              type="number" 
              step="0.01" 
              required 
            />
            <FormInput 
              label="Abono" 
              name="installment_amount" 
              type="number" 
              step="0.01" 
              required 
            />
          </div>

          {/* Sección de Items con el nuevo componente */}
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
                  key={index}
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
             {error && <p className="text-red-500 text-sm">{error}</p>}
             <AddButton type="submit" disabled={loading}>
                {loading ? 'Procesando...' : 'Finalizar y Guardar'}
             </AddButton>
          </div>
        </form>
      </div>
    </div>
  );
}