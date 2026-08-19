'use client';

import { useState, useEffect } from 'react';
import { lusitana } from "@/app/ui/fonts";
import { fetchData, postFormData } from "@/app/lib/data";
import { FormInput } from '@/app/components/ui/text_form';
import { AddButton } from '@/app/components/ui/add_button';
import { useRouter } from 'next/navigation';
import { Plus, Image as ImageIcon, X } from 'lucide-react'; // Importamos iconos
import { TicketItemRow } from '../../../components/ui/ticket-item-row';
import { FormSelect } from '@/app/components/ui/selector_form';
import Image from 'next/image';

export default function AddTicketPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [providers, setProviders] = useState([]);
  
  // --- NUEVO ESTADO PARA PREVIEW ---
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [items, setItems] = useState([{ material: '', amount: '', unit_type: 'KG' }]);

  useEffect(() => {
    fetchData('materials/').then(setMaterials);
    fetchData('providers/').then(setProviders);
  }, []);

  // --- FUNCIÓN PARA MANEJAR EL CAMBIO DE IMAGEN ---
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Crear una URL temporal para la imagen
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

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
    formData.append('items', JSON.stringify(items));

    try {
      const result = await postFormData('tickets/save_ticket/', formData);
      if (result?.error) {
        setError(result.error);
      } else {
        router.push('/dashboard/tickets');
      }
    } catch (err) {
      setError("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { id: 'Pendiente', name: 'Pendiente' },
    { id: 'Pagado', name: 'Pagado' },
    { id: 'Anulado', name: 'Anulado' }
  ];

  return (
    <div className="bg-background p-8 text-white min-h-screen" style={lusitana.style}>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Generar Ticket de Recepción</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-card p-6 rounded-lg border border-border grid grid-cols-1 md:grid-cols-2 gap-4">
            <h2 className="col-span-full text-xl font-semibold border-b border-border pb-2">Datos del Ticket</h2>
            
            <FormInput label="Nro. Ticket" name="ticket_number" required />
            <FormInput label="Fecha" name="date" type="date" required />
            <FormInput label="Empleado" name="employee_name" required />
            
            <FormSelect label="Proveedor" name="provider" data={providers} required />
            <FormSelect label="Estado del Ticket" name="status" data={statusOptions} required />

            <FormInput 
              label="Abono" 
              name="installment_amount" 
              type="number" 
              step="0.01" 
              required 
            />

            {/* --- SECCIÓN DE FOTO CON PREVIEW --- */}
            <div className="flex flex-col gap-3 col-span-full mt-4">
              <label className="text-sm font-medium text-blue-400 flex items-center gap-2">
                <ImageIcon size={18} /> Foto del Ticket (Obligatoria)
              </label>
              
              <div className="flex flex-col md:flex-row gap-4 items-start">
                <input 
                  type="file" 
                  name="photo" 
                  accept="image/*" 
                  required
                  onChange={handleImageChange} // Gatilla la preview
                  className="bg-background border border-border rounded-md p-2 text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer w-full md:w-auto"
                />

                {/* Contenedor de la Vista Previa */}
                {previewUrl && (
                  <div className="relative group animate-in fade-in zoom-in duration-300">
                    <div className="relative h-40 w-40 rounded-lg overflow-hidden border-2 border-blue-500/50 shadow-xl">
                      <Image 
                        src={previewUrl} 
                        alt="Preview" 
                        fill 
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setPreviewUrl(null)}
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow-lg hover:bg-red-700 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sección de Items */}
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

          <div className="flex flex-col items-end gap-4">
             {error && (
               <div className="p-3 rounded bg-red-500/10 border border-red-500/50 w-full md:w-1/2">
                 <p className="text-red-500 text-sm font-medium text-center">{error}</p>
               </div>
             )}
             <AddButton type="submit" disabled={loading}>
                {loading ? 'Procesando...' : 'Finalizar y Guardar Ticket'}
             </AddButton>
          </div>
        </form>
      </div>
    </div>
  );
}