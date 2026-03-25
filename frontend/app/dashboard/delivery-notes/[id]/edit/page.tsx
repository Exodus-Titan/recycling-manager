'use client';

import { useState, useEffect } from 'react';
import { lusitana } from "@/app/ui/fonts";
import { fetchData, patchData } from "@/app/lib/data"; // Usando patchData
import { FormInput } from '@/app/components/ui/text_form';
import { FormSelect } from '@/app/components/ui/selector_form';
import { AddButton } from '@/app/components/ui/add_button';
import { useRouter, useParams } from 'next/navigation';

export default function EditDeliveryNotePage() {

  interface SelectOption {
    id: number | string;
    name: string;
  }
  const router = useRouter();
  const { id } = useParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Datos maestros
  const [providers, setProviders] = useState([]);
  const [tickets, setTickets] = useState<SelectOption[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<any[]>([]);

  // Estado del formulario
  const [selectedProvider, setSelectedProvider] = useState('');
  const [formData, setFormData] = useState<any>(null); // Datos originales de la nota
  const [vehicleData, setVehicleData] = useState({
    truck_brand: '',
    truck_model: '',
    truck_plate: '',
    truck_color: ''
  });

  // 1. Carga inicial: Proveedores, Tickets y la Nota de Entrega específica
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [provs, note] = await Promise.all([
          fetchData('providers/'),
          fetchData(`delivery-notes/${id}/`),
          
        ]);
        
        const [ticks, actualTicket] = await Promise.all([
          fetchData('tickets/get_tickets_without_delivery_note/'), // En edición quizás quieras ver todos los tickets o incluir el actual
          fetchData(`tickets/${note.ticket}/get_actual_ticket/`)
        ])
        //se usa el 0 porque esta devolviendo un array de un solo item y al unirse estaba metiendo un array dentro de otro
        //y hacia que el map no funcionara, esta funcion siempre va a devolver 1 solo ticket
        const allAvailableTickets = [actualTicket[0], ...ticks]
        
        setProviders(provs.map((p: any) => ({ id: p.id, name: p.name })));
        setTickets(allAvailableTickets.map((t: any) => ({ id: t.id, name: `Ticket #${t.ticket_number}` })));
        
        // Seteamos la nota y el proveedor seleccionado para disparar el segundo useEffect
        setFormData(note);
        setSelectedProvider(note.provider.toString());
        
        // Llenamos los campos de vehículo con lo que ya tiene la nota
        setVehicleData({
          truck_brand: note.truck_brand,
          truck_model: note.truck_model,
          truck_plate: note.truck_plate,
          truck_color: note.truck_color
        });
      } catch (err) {
          console.error(err);
          setError("Error al cargar los datos de la nota.");
      }
    };
    loadInitialData();
  }, [id]);

  // 2. Carga de vehículos cuando cambia el proveedor (idéntico a AddPage)
  useEffect(() => {
    const updateVehicles = async () => {
      if (selectedProvider) {
        try {
          const vehicles = await fetchData(`vehicles/${selectedProvider}/get_vehicles_by_provider/`);
          setFilteredVehicles(vehicles.map((v: any) => ({
            id: v.id,
            name: `${v.plate} - ${v.brand}`,
            fullData: v
          })));
        } catch (err) {
          setFilteredVehicles([]);
        }
      }
    };
    updateVehicles();
  }, [selectedProvider]);

  const handleVehicleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const vehicleId = e.target.value;
    const vehicle = filteredVehicles.find((v: any) => v.id === parseInt(vehicleId));
    if (vehicle?.fullData) {
      const d = vehicle.fullData;
      setVehicleData({
        truck_brand: d.brand,
        truck_model: d.model,
        truck_plate: d.plate,
        truck_color: d.color
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());

    try {
      // Usando patchData para la actualización parcial
      const result = await patchData(`delivery-notes/${id}/update_delivery_note/`, payload);
      if (result?.error) setError(result.error);
      else router.push('/dashboard/delivery-notes');
    } catch (err) {
      setError("Error al actualizar la nota.");
    } finally {
      setLoading(false);
    }
  };

  if (!formData) return <div className="p-8 text-white">Cargando...</div>;

  return (
    <div className="bg-background p-8 text-white min-h-screen" style={lusitana.style}>
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Editar Nota de Entrega #{id}</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-card p-6 rounded-lg border border-border grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormSelect 
                label="Ticket" 
                name="ticket" 
                data={tickets} 
                defaultValue={formData.ticket} 
                required 
            />
            
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Proveedor</label>
                <select 
                    name="provider"
                    value={selectedProvider}
                    className="bg-background border border-border rounded-md p-2 text-black h-[42px]"
                    onChange={(e) => setSelectedProvider(e.target.value)}
                    required
                >
                    <option value="">Seleccione Proveedor</option>
                    {providers.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Cambiar Vehículo</label>
                <select 
                    disabled={!selectedProvider || (selectedProvider !== "" && filteredVehicles.length === 0)}
                    className="bg-background border border-border rounded-md p-2 text-black h-[42px] disabled:opacity-50"
                    onChange={handleVehicleChange}
                >
                    <option value="">Mantener actual o seleccionar nuevo</option>
                    {filteredVehicles.map((v: any) => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg border border-border">
            <h2 className="text-lg font-semibold mb-4 text-blue-400">Datos del Vehículo</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormInput label="Marca" name="truck_brand" value={vehicleData.truck_brand} readOnly />
                <FormInput label="Modelo" name="truck_model" value={vehicleData.truck_model} readOnly />
                <FormInput label="Placa" name="truck_plate" value={vehicleData.truck_plate} readOnly />
                <FormInput label="Color" name="truck_color" value={vehicleData.truck_color} readOnly />
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg border border-border grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
                <h3 className="font-bold border-b border-border pb-1">Origen</h3>
                <FormInput label="Dirección" name="start_address" defaultValue={formData.start_address} required />
                <div className="grid grid-cols-2 gap-2">
                    <FormInput label="Ciudad" name="start_city" defaultValue={formData.start_city} required />
                    <FormInput label="Estado" name="start_state" defaultValue={formData.start_state} required />
                </div>
                {/* Formateamos a YYYY-MM-DDThh:mm para datetime-local */}
                <FormInput 
                    label="Fecha Salida" 
                    name="startdate" 
                    type="date" 
                    defaultValue={formData.startdate?.substring(0, 16)} 
                    required 
                />
            </div>

            <div className="space-y-4">
                <h3 className="font-bold border-b border-border pb-1">Destino</h3>
                <FormInput label="Dirección" name="end_address" defaultValue={formData.end_address} required />
                <div className="grid grid-cols-2 gap-2">
                    <FormInput label="Ciudad" name="end_city" defaultValue={formData.end_city} required />
                    <FormInput label="Estado" name="end_state" defaultValue={formData.end_state} required />
                </div>
                <FormInput 
                    label="Fecha Llegada" 
                    name="enddate" 
                    type="date" 
                    defaultValue={formData.enddate?.substring(0, 16)} 
                    required 
                />
            </div>
          </div>

          <div className="flex justify-end gap-4 items-center">
             {error && <p className="text-red-500 text-sm">{error}</p>}
             <AddButton type="submit" disabled={loading}>
                {loading ? 'Actualizando...' : 'Guardar Cambios'}
             </AddButton>
          </div>
        </form>
      </div>
    </div>
  );
}