'use client';

import { useState } from 'react';
import { lusitana } from "@/app/ui/fonts";
import { postData } from "@/app/lib/data";
import { FormInput } from '@/app/components/ui/text_form';
import { AddButton } from '@/app/components/ui/add_button';
import { useRouter } from 'next/navigation';

export default function AddMaterialPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const result = await postData('materials/save_material/', data);
      if (result && !result.error) {
        router.push('/dashboard/materials');
      } else {
        setError(result?.error || "Error al guardar el material");
      }
    } catch (err) {
      setError("Error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background p-8 text-white min-h-screen" style={lusitana.style}>
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Nuevo Material</h1>
        <form onSubmit={handleSubmit} className="space-y-4 bg-card p-6 rounded-lg border border-border">
          <FormInput label="Nombre del Material" name="name" placeholder="Ej: Cobre, Bronce..." required />
          <FormInput label="Descripción" name="description" placeholder="Opcional..." />
          
          <div className="flex justify-end pt-4">
            <AddButton type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Crear Material'}
            </AddButton>
          </div>
          {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
        </form>
      </div>
    </div>
  );
}