'use client';

import { useState, useEffect } from 'react';
import { lusitana } from "@/app/ui/fonts";
import { fetchData, patchData } from "@/app/lib/data";
import { FormInput } from '@/app/components/ui/text_form';
import { AddButton } from '@/app/components/ui/add_button';
import { useRouter, useParams } from 'next/navigation';

export default function EditMaterialPage() {
  const router = useRouter();
  const { id } = useParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [material, setMaterial] = useState<any>(null);

  useEffect(() => {
    fetchData(`materials/${id}/`).then(res => {
      setMaterial(res);
      setLoading(false);
    }).catch(() => setError("Error al cargar material"));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const result = await patchData(`materials/${id}/update_material/`, data);
      if (!result.error) router.push('/dashboard/materials');
      else setError(result.error);
    } catch (err) {
      setError("Error al actualizar.");
    }
  };

  if (loading) return <div className="text-white p-8">Cargando...</div>;

  return (
    <div className="bg-background p-8 text-white min-h-screen" style={lusitana.style}>
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Editar Material</h1>
        <form onSubmit={handleSubmit} className="space-y-4 bg-card p-6 rounded-lg border border-border">
          <FormInput label="Nombre" name="name" defaultValue={material?.name} required />
          <FormInput label="Descripción" name="description" defaultValue={material?.description} />
          
          <div className="flex justify-end pt-4">
            <AddButton type="submit">Actualizar Material</AddButton>
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </form>
      </div>
    </div>
  );
}