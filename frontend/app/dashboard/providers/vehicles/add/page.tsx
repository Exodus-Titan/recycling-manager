'use client';

import { useState, useEffect } from 'react';
import { lusitana } from "@/app/ui/fonts"
import { fetchData, postData } from "@/app/lib/data"
import { Words_diccionary } from "@/app/lib/diccionary";
import { FormInput } from '@/app/components/ui/text_form';
import { AddButton } from '@/app/components/ui/add_button';
import { useRouter } from 'next/navigation';
import { FormCheckbox } from '@/app/components/ui/checkbox_form';
import { FormSelect } from '@/app/components/ui/selector_form';


export default function AddProviderPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [providers, setProviders] = useState([]);

    useEffect(() => {
    const fetchProviders = async () => {
        const data = await fetchData('providers/');
         
        setProviders(data);
    };
    fetchProviders();
    }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null); // Limpiamos errores previos al intentar de nuevo
    setLoading(true);
    
    // Convertimos todos los campos del form en un objeto JSON
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try{
      const result = await postData('vehicles/save_vehicle/', data);
      if (result) {
        if (result.error) {
          setError(result.error);
          console.error('Error del backend:', result.error);
          return;
        }else{
          console.log('Proveedor guardado exitosamente:', result);
          router.push('/dashboard/providers/vehicles');
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
          Agregar {Words_diccionary.vehicle}
        </h1>
      </div>

      {/* Formulario justo debajo */}
      <form 
        onSubmit={handleSubmit} 
        className="space-y-4 bg-card p-6 rounded-lg border border-border shadow-md"
      >
        <FormInput 
          label="Marca del Vehículo" 
          name="brand" 
          placeholder="Ej: Toyota" 
          maxLength={50}
          required 
        />
        
        <FormInput 
          label="Modelo del Vehículo" 
          name="model" 
          type="text" // Cambiar a text para controlar el pattern mejor
          maxLength={50}
          placeholder="Ej: Corolla" 
          required 
        />

        <FormInput 
          label="Placa del Vehículo" 
          name="plate" 
          type="text" // Cambiar a text para controlar el pattern mejor
          minLength={6}
          maxLength={12}
          placeholder="AB789PE" 
          required 
        />

        <FormInput 
          label="Color del Vehículo" 
          name="color" 
          type="text" // Cambiar a text para controlar el pattern mejor
          maxLength={50}
          placeholder="Blanco" 
          required 
        />

        <FormSelect 
            label="Proveedor" 
            name="provider" // Este es el nombre que recibirá Django en el POST/PUT
            data={providers} 
            required 
        />
        
        <FormCheckbox 
            label="¿Es el vehículo principal del proveedor?" 
            name="is_main"
        />


        <div className="flex justify-end pt-4">
          <AddButton type="submit">
            Guardar Vehiculo
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
