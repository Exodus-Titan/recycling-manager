'use client';

import { useState } from 'react';
import { lusitana } from "@/app/ui/fonts"
import { postData, postImage } from "@/app/lib/data"
import { Words_diccionary } from "@/app/lib/diccionary";
import { FormInput } from '@/app/components/ui/text_form';
import { AddButton } from '@/app/components/ui/add_button';
import { useRouter } from 'next/navigation';

export default function AddProviderPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Función para capturar la imagen y crear la vista previa
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      // Creamos una URL temporal para que el navegador pueda mostrar la imagen
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null); // Limpiamos errores previos al intentar de nuevo
    setLoading(true);
    
    // Convertimos todos los campos del form en un objeto JSON
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try{
      const result = await postData('providers/save_provider/', data);
      if (result) {
        if (result.error) {
          setError(result.error);
          console.error('Error del backend:', result.error);
          return;
        }else{

          const providerId = result.id;
          const imageUpload = await postImage(providerId, 'providers/upload_signature/', selectedImage);
          if (imageUpload && imageUpload.error) {
            setError(imageUpload.error);
            console.error('Error al subir la imagen:', imageUpload.error);
            return;
          }
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
          placeholder="Ej: Inversiones Caracas" 
          maxLength={50}
          pattern="^[^0-9]*$" // Regex para no permitir números
          title="El nombre no puede contener números"
          required 
        />
        
        <FormInput 
          label="Número de Cédula / RIF" 
          name="id_number" 
          type="text" // Cambiar a text para controlar el pattern mejor
          minLength={8}
          maxLength={14}
          //pattern="\d*" // Solo dígitos
          title="Debe tener entre 8 y 14 números"
          placeholder="12345678" 
          required 
        />

        {/* Sección de Imagen/Firma */}
        <div className="bg-card p-6 rounded-lg border border-border space-y-4">
          <label className="text-sm font-medium">Firma del Proveedor</label>
          
          <div className="flex flex-col items-center gap-4 border-2 border-dashed border-border p-4 rounded-lg">
            {/* Contenedor de Vista Previa */}
            <div className="w-40 h-40 bg-background rounded-md flex items-center justify-center overflow-hidden border border-border">
              {previewUrl ? (
                <img src={previewUrl} alt="Vista previa" className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-500 text-xs text-center p-2">Sin foto seleccionada</span>
              )}
            </div>

            {/* Input de archivo oculto o estilizado */}
            <input 
              type="file" 
              name="signature" // El nombre debe coincidir con el campo en Django
              accept="image/*" 
              onChange={handleImageChange}
              className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
            />
          </div>
        </div>

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
