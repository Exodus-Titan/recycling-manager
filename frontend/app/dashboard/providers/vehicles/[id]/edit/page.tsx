'use client';

import { useState, useEffect } from 'react';
import { lusitana } from "@/app/ui/fonts";
import { fetchData, patchData } from "@/app/lib/data"; // Asumiendo que tienes putData para el PATCH/PUT
import { Words_diccionary } from "@/app/lib/diccionary";
import { FormInput } from '@/app/components/ui/text_form';
import { AddButton } from '@/app/components/ui/add_button';
import { useRouter, useParams } from 'next/navigation';
import { FormCheckbox } from '@/app/components/ui/checkbox_form';
import { FormSelect } from '@/app/components/ui/selector_form';

export default function EditVehiclePage() {
  const router = useRouter();
  const { id } = useParams(); // Obtenemos el ID de la URL
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState([]);
  const [vehicle, setVehicle] = useState<any>(null);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Cargamos proveedores y los datos del vehículo en paralelo
        const [providersData, vehicleData] = await Promise.all([
          fetchData('providers/'),
          fetchData(`vehicles/${id}/get_vehicle_by_id/`)
        ]);
        
        setProviders(providersData);
        setVehicle(vehicleData);
      } catch (err) {
        setError("No se pudo cargar la información del vehículo.");
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      // Usamos el endpoint update_vehicle que creamos en Django
      const result = await patchData(`vehicles/${id}/update_vehicle/`, data);
      
      if (result && !result.error) {
        router.push('/dashboard/providers/vehicles');
      } else {
        setError(result?.error || "Error al actualizar el vehículo");
      }
    } catch (err) {
      setError("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-white p-8 text-center">Cargando datos...</div>;

  return (
    <div className="bg-background p-8 text-white min-h-screen" style={lusitana.style}>
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-3xl font-bold">
          Editar {Words_diccionary.vehicle}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4 bg-card p-6 rounded-lg border border-border shadow-md">
          <FormInput 
            label="Marca del Vehículo" 
            name="brand" 
            defaultValue={vehicle?.brand}
            required 
          />
          
          <FormInput 
            label="Modelo del Vehículo" 
            name="model" 
            defaultValue={vehicle?.model}
            required 
          />

          <FormInput 
            label="Placa del Vehículo" 
            name="plate" 
            defaultValue={vehicle?.plate}
            required 
          />

          <FormInput 
            label="Color del Vehículo" 
            name="color" 
            defaultValue={vehicle?.color}
            required 
          />

          <FormSelect 
            label="Proveedor" 
            name="provider" 
            data={providers} 
            defaultValue={vehicle?.provider} // Django devuelve el ID del proveedor
            required 
          />
          
          <FormCheckbox 
            label="¿Es el vehículo principal?" 
            name="is_primary"
            defaultChecked={vehicle?.is_main}
          />

          <div className="flex justify-end pt-4">
            <AddButton type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Actualizar Vehículo'}
            </AddButton>
          </div>

          {error && (
            <div className="p-3 rounded bg-red-500/10 border border-red-500/50 text-red-500 text-sm text-center">
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}