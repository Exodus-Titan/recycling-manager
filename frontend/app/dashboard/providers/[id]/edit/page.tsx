'use client';

import { useState, useEffect } from 'react';
import { lusitana } from "@/app/ui/fonts"
import { fetchData, patchData } from "@/app/lib/data"
import { Words_diccionary } from "@/app/lib/diccionary";
import { FormInput } from '@/app/components/ui/text_form';
import { AddButton } from '@/app/components/ui/add_button';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';

export default function AddProviderPage() {

  interface Provider {
    id: number;
    name: string;
    id_number: string;
  }

  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { id } = useParams(); // Aquí obtienes el ID de la URL
  const [provider, setProvider] = useState<Provider | null>(null);

  useEffect(() => {
    const fetchProvider = async () => {
      // Llamamos al endpoint que acabamos de configurar en Django
      const data = await fetchData(`providers/${id}/get_provider_by_id/`);
      
      setProvider(data);
    };
      if (id) fetchProvider();
    }, [id]);


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null); // Limpiamos errores previos al intentar de nuevo
    setLoading(true);
    
    // Convertimos todos los campos del form en un objeto JSON
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try{
      const result = await patchData(`providers/${id}/update_provider/`, data);
      if (result) {
        if (result.error) {
          setError(result.error);
          console.error('Error del backend:', result.error);
          return;
        }else{
          console.log('Proveedor guardado exitosamente:', result);
          router.push('/dashboard/providers');
        }
      } else {
          console.log(result);
          console.error('Error al guardar el proveedor');
      }
    } catch (err) {
        setError("Ocurrió un error inesperado al conectar con el servidor.");
    } finally {
        setLoading(false);
    }


  };

  return (
  <div className="bg-background p-8 text-white min-h-screen" style={lusitana.style}>
    <div className="max-w-md mx-auto space-y-6"> {/* max-w-md limita el ancho de toda la columna */}
      
      {/* Título en la misma columna */}
      <div>
        <h1 className="text-3xl font-bold">
          Agregar {Words_diccionary.provider}
        </h1>
      </div>

      {/* Formulario justo debajo */}
      <form 
        onSubmit={handleSubmit} 
        className="space-y-4 bg-card p-6 rounded-lg border border-border shadow-md"
      >
        <FormInput 
          label="Nombre del Proveedor" 
          name="name" 
          defaultValue={provider?.name || ''} // <--- RELLENO AUTOMÁTICO
          placeholder="Ej: Inversiones Caracas" 
          maxLength={50}
          pattern="^[^0-9]*$" // Regex para no permitir números
          title="El nombre no puede contener números"
          required 
        />
        
        <FormInput 
          label="Número de Cédula / RIF" 
          name="id_number" 
          defaultValue={provider?.id_number || ''} // <--- RELLENO AUTOMÁTICO
          type="text" // Cambiar a text para controlar el pattern mejor
          minLength={8}
          maxLength={14}
          //pattern="\d*" // Solo dígitos
          title="Debe tener entre 8 y 14 números"
          placeholder="12345678" 
          required 
        />

        <div className="flex justify-end pt-4">
          <AddButton type="submit">
            Guardar Proveedor
          </AddButton>
        </div>

          {error && (
            <div className="p-3 rounded bg-red-500/10 border border-red-500/50">
              <p className="text-red-500 text-sm font-medium text-center">
                {error}
              </p>
            </div>
          )}

      </form>

    </div>
  </div>
);
}
