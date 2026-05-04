'use client';

import { useState, useEffect } from 'react';
import { lusitana } from "@/app/ui/fonts";
import { fetchData, patchData } from "@/app/lib/data"; 
import { postFormData, patchFormData, deleteData } from "@/app/lib/data"; // <-- Tus nuevas funciones
import { Words_diccionary } from "@/app/lib/diccionary";
import { FormInput } from '@/app/components/ui/text_form';
import { AddButton } from '@/app/components/ui/add_button';
import { useRouter, useParams } from 'next/navigation';
import { FormCheckbox } from '@/app/components/ui/checkbox_form';
import { FormSelect } from '@/app/components/ui/selector_form';

export default function EditVehiclePage() {
  const router = useRouter();
  const { id } = useParams(); 
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState([]);
  const [vehicle, setVehicle] = useState<any>(null);

  // Estados extra para mostrar las fotos actuales (opcional pero recomendado)
  const [currentPlatePhoto, setCurrentPlatePhoto] = useState<string | null>(null);
  const [currentVehiclePhotos, setCurrentVehiclePhotos] = useState<{id: number, url: string}[]>([]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Cargamos todos los datos en paralelo usando tus endpoints
        const [providersData, vehicleData, plateData, photosData] = await Promise.all([
          fetchData('providers/'),
          fetchData(`vehicles/${id}/get_vehicle_by_id/`),
          fetchData(`vehicles/${id}/get_license_plate/`),
          fetchData(`vehicles/${id}/get_vehicle_photos/`)
        ]);
        
        setProviders(providersData);
        setVehicle(vehicleData);
        
        if (plateData && plateData.license_plate_photo) {
            setCurrentPlatePhoto(plateData.license_plate_photo);
        }
        if (photosData && photosData.vehicle_photos) {
            setCurrentVehiclePhotos(photosData.vehicle_photos);
            console.log("Fotos del vehículo cargadas:", photosData.vehicle_photos);
        }

      } catch (err) {
        setError("No se pudo cargar la información del vehículo.");
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, [id]);

  const getImageUrl = (path: string) => {
    if (!path) return '';
    return path.startsWith('http') ? path : `http://localhost:8000${path}`;
  };

  const handleDeletePhoto = async (photoId: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta foto?")) return;

    try {
      // Usamos fetch nativo para poder enviar el body en una petición DELETE
      // Asegúrate de que esta sea la URL correcta base de tu API
      const response = await fetch('http://localhost:8000/api/vehicles/delete_vehicle_photo/', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}` <-- Descomenta y agrega tu token si usas JWT
        },
        body: JSON.stringify({ photo_id: photoId }) // Aquí enviamos tu JSON
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Ocurrió un error al eliminar.");
        return;
      }
      
      // Si se eliminó correctamente, actualizamos la interfaz
      setCurrentVehiclePhotos(prev => prev.filter((photo: any) => photo.id !== photoId));
      
    } catch (err) {
      setError("Error de conexión con el servidor al eliminar la foto.");
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    const formElement = e.currentTarget;
    const formData = new FormData(formElement);
    
    // Separamos los datos de texto de los archivos
    const textData = {
        brand: formData.get('brand'),
        model: formData.get('model'),
        plate: formData.get('plate'),
        color: formData.get('color'),
        provider: formData.get('provider'),
        is_main: formData.get('is_main') === 'on' ? true : false,
    };

    try {
      // 1. ACTUALIZAR DATOS DE TEXTO
      const updateResult = await patchData(`vehicles/${id}/update_vehicle/`, textData);
      
      if (updateResult && updateResult.error) {
        setError(updateResult.error);
        setLoading(false);
        return;
      }

      // 2. ACTUALIZAR FOTO DE PLACA (Si seleccionó una nueva)
      const licensePlateFile = formData.get('license_plate') as File;
      if (licensePlateFile && licensePlateFile.size > 0) {
          const plateFormData = new FormData();
          // Aseguramos que los nombres coincidan con lo que espera tu backend
          plateFormData.append('vehicle_id', id as string);
          plateFormData.append('license_plate', licensePlateFile);
          
          const result = await patchFormData('vehicles/update_license_plate/', plateFormData);
          if (result && result.error) {
            setError(result.error);
            setLoading(false);
            return;
          }
      }

      // 3. SUBIR NUEVAS FOTOS DEL VEHÍCULO (Si seleccionó nuevas)
      const vehiclePhotosFiles = formData.getAll('vehicle_photos') as File[];
      // Verificamos que el primer archivo tenga tamaño para no enviar arrays vacíos
      if (vehiclePhotosFiles.length > 0 && vehiclePhotosFiles[0].size > 0) {
          const photosFormData = new FormData();
          photosFormData.append('vehicle_id', id as string);
          
          vehiclePhotosFiles.forEach((file) => {
              photosFormData.append('vehicle_photos', file); // Mismo 'name' que espera el getlist()
          });
          const result = await postFormData(`vehicles/upload_vehicle_photo/`, photosFormData);
          if (result && result.error) {
            setError(result.error);
            setLoading(false);
            return;
          }
      }

      // Si todo sale bien, redirigimos
      router.push('/dashboard/providers/vehicles');
      
    } catch (err) {
      setError("Error de conexión con el servidor al actualizar.");
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

        <form onSubmit={handleSubmit} className="space-y-4 bg-card p-6 rounded-lg border border-border shadow-md" encType="multipart/form-data">
          
          {/* ... TUS INPUTS DE TEXTO EXISTENTES ... */}
          <FormInput label="Marca del Vehículo" name="brand" defaultValue={vehicle?.brand} required />
          <FormInput label="Modelo del Vehículo" name="model" defaultValue={vehicle?.model} required />
          <FormInput label="Placa del Vehículo" name="plate" defaultValue={vehicle?.plate} required />
          <FormInput label="Color del Vehículo" name="color" defaultValue={vehicle?.color} required />
          
          <FormSelect label="Proveedor" name="provider" data={providers} defaultValue={vehicle?.provider} required />
          <FormCheckbox label="¿Es el vehículo principal?" name="is_main" defaultChecked={vehicle?.is_main} />

          {/* --- SECCIÓN DE FOTOS (EDICIÓN) --- */}
          <div className="border-t border-border pt-4 mt-4 space-y-4">
            <h2 className="text-lg font-semibold text-blue-400">Actualizar Fotos</h2>

            {/* PLACA */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Foto de la Placa</label>
              {currentPlatePhoto && (
                  <p className="text-xs text-green-400">Ya existe una foto guardada. Sube una nueva solo si deseas reemplazarla.</p>
              )}
              <input 
                type="file" 
                name="license_plate" // <-- Debe coincidir con lo que lee request.FILES.get('license_plate') en Django
                accept="image/*" 
                // Ya no es 'required' porque es una edición y puede que ya tenga foto
                className="bg-background border border-border rounded-md p-2 text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
              />
            </div>

            {/* FOTOS DEL VEHÍCULO */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Agregar más fotos del vehículo (Opcional)</label>
              {currentVehiclePhotos.length > 0 && (
                  <p className="text-xs text-green-400">El vehículo tiene {currentVehiclePhotos.length} foto(s). Selecciona más para añadirlas.</p>
              )}
              <input 
                type="file" 
                name="vehicle_photos" // <-- Debe coincidir con request.FILES.getlist('vehicle_photos')
                accept="image/*" 
                multiple
                className="bg-background border border-border rounded-md p-2 text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-white hover:file:bg-gray-600 cursor-pointer"
              />
            </div>
          </div>

          {/* --- PREVISUALIZACIÓN DE FOTOS GUARDADAS --- */}
          {(currentPlatePhoto || currentVehiclePhotos.length > 0) && (
            <div className="border-t border-border pt-4 mt-4 space-y-4 bg-background/50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-blue-400">Fotos Guardadas</h2>

              {/* Preview Placa */}
              {currentPlatePhoto && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-300">Placa del Vehículo</h3>
                  <img 
                    src={getImageUrl(currentPlatePhoto)} 
                    alt="Placa guardada" 
                    className="w-48 h-32 object-cover rounded-md border border-border shadow-sm"
                  />
                </div>
              )}

              {/* Preview Vehículo (Múltiples) */}
              {currentVehiclePhotos.length > 0 && (
                <div className="space-y-2 mt-4">
                  <h3 className="text-sm font-medium text-gray-300">Fotos del Vehículo ({currentVehiclePhotos.length})</h3>
                  <div className="flex flex-wrap gap-4">
                    {currentVehiclePhotos.map((photo, index) => (
                      <div key={photo.id || index} className="relative group">
                        <img 
                          src={getImageUrl(photo.url)} 
                          alt={`Vehículo ${index + 1}`} 
                          className="w-32 h-32 object-cover rounded-md border border-border shadow-sm"
                        />
                        {/* Botón X que aparece al pasar el mouse por encima */}
                        <button
                          type="button"
                          onClick={() => handleDeletePhoto(photo.id)}
                          className="absolute top-1 right-1 bg-red-600 text-white w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-700 shadow-md"
                          title="Eliminar foto"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {/* ------------------------------------------- */}

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