'use client';

import { useState, useEffect } from 'react';
import { lusitana } from "@/app/ui/fonts";
import { fetchData, patchData } from "@/app/lib/data";
import { FormInput } from '@/app/components/ui/text_form';
import { AddButton } from '@/app/components/ui/add_button';
import { useRouter, useParams } from 'next/navigation';
import { FormSelect } from '@/app/components/ui/selector_form';

export default function EditAddressPage() {
  const router = useRouter();
  const { id } = useParams();
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState([]);
  const [addressData, setAddressData] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [providersList, currentAddress] = await Promise.all([
          fetchData('providers/'),
          fetchData(`addresses/${id}/get_address_by_id/`)
        ]);
        setProviders(providersList);
        setAddressData(currentAddress);
      } catch (err) {
        setError("Error al cargar los datos.");
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
    const data = Object.fromEntries(formData.entries());

    try {
      const result = await patchData(`addresses/${id}/update_address/`, data);
      if (result && !result.error) {
        router.push('/dashboard/providers/addresses');
      } else {
        setError(result?.error || "Error al actualizar la dirección");
      }
    } catch (err) {
      setError("Error de comunicación con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-white p-8 text-center">Cargando...</div>;

  return (
    <div className="bg-background p-8 text-white min-h-screen" style={lusitana.style}>
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Editar Dirección</h1>

        <form onSubmit={handleSubmit} className="space-y-4 bg-card p-6 rounded-lg border border-border shadow-md">
          <FormInput 
            label="Dirección Exacta" 
            name="address" 
            defaultValue={addressData?.address} 
            required 
          />
          <FormInput 
            label="Ciudad" 
            name="city" 
            defaultValue={addressData?.city} 
            required 
          />
          <FormInput 
            label="Estado" 
            name="state" 
            defaultValue={addressData?.state} 
            required 
          />
          
          <FormSelect 
            label="Proveedor" 
            name="provider" 
            data={providers} 
            defaultValue={addressData?.provider} 
            required 
          />

          <div className="flex justify-end pt-4">
            <AddButton type="submit">Actualizar Dirección</AddButton>
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