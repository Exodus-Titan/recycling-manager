'use client';

import { useState, useEffect } from 'react';
import { lusitana } from "@/app/ui/fonts";
import { fetchData, postData } from "@/app/lib/data";
import { FormInput } from '@/app/components/ui/text_form';
import { AddButton } from '@/app/components/ui/add_button';
import { useRouter } from 'next/navigation';
import { FormSelect } from '@/app/components/ui/selector_form';

export default function AddAddressPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState([]);

  useEffect(() => {
    const getProviders = async () => {
      const data = await fetchData('providers/');
      setProviders(data);
    };
    getProviders();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const result = await postData('addresses/save_address/', data);
      if (result && !result.error) {
        router.push('/dashboard/providers/addresses');
      } else {
        setError(result?.error || "Error al guardar la dirección");
      }
    } catch (err) {
      setError("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background p-8 text-white min-h-screen" style={lusitana.style}>
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Agregar Dirección</h1>

        <form onSubmit={handleSubmit} className="space-y-4 bg-card p-6 rounded-lg border border-border shadow-md">
          <FormInput label="Dirección Exacta" name="address" placeholder="Calle, Edificio, Nro..." required />
          <FormInput label="Ciudad" name="city" placeholder="Ej: Caracas" required />
          <FormInput label="Estado" name="state" placeholder="Ej: Miranda" required />
          
          <FormSelect 
            label="Proveedor" 
            name="provider" 
            data={providers} 
            required 
          />

          <div className="flex justify-end pt-4">
            <AddButton type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Dirección'}
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