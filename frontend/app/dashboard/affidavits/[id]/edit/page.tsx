'use client';

import { useState, useEffect } from 'react';
import { lusitana } from "@/app/ui/fonts";
import { fetchData, patchData } from "@/app/lib/data";
import { FormInput } from '@/app/components/ui/text_form';
import { FormSelect } from '@/app/components/ui/selector_form';
import { AddButton } from '@/app/components/ui/add_button';
import { useRouter, useParams } from 'next/navigation';

export default function EditAffidavitPage() {

  interface SelectOption {
    id: number | string;
    name: string;
  }

  const router = useRouter();
  const { id } = useParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [providers, setProviders] = useState([]);
  const [tickets, setTickets] = useState<SelectOption[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<any[]>([]);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [affidavit, setAffidavit] = useState<any>(null);
  const [vehicleData, setVehicleData] = useState({
    truck_brand: '', truck_model: '', truck_plate: '', truck_color: ''
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [provs, data] = await Promise.all([
          fetchData('providers/'),
          fetchData(`affidavits/${id}/get_affidavit_by_id/`),
        ]);

        const [ticks, actualTicket] = await Promise.all([
          fetchData('tickets/get_tickets_without_delivery_note/'), // En edición quizás quieras ver todos los tickets o incluir el actual
          fetchData(`tickets/${data.ticket}/get_actual_ticket/`)
        ])
        //se usa el 0 porque esta devolviendo un array de un solo item y al unirse estaba metiendo un array dentro de otro
        //y hacia que el map no funcionara, esta funcion siempre va a devolver 1 solo ticket
        const allAvailableTickets = [actualTicket[0], ...ticks]
        

        setProviders(provs.map((p: any) => ({ id: p.id, name: p.name })));
        setTickets(allAvailableTickets.map((t: any) => ({ id: t.id, name: `Ticket #${t.ticket_number}` })));
        setAffidavit(data);
        setSelectedProvider(data.provider.toString());
        setVehicleData({
          truck_brand: data.truck_brand,
          truck_model: data.truck_model,
          truck_plate: data.truck_plate,
          truck_color: data.truck_color
        });
      } catch (err) {
        setError("Error al cargar datos.");
      } finally {
        setInitialLoading(false);
      }
    };
    loadData();
  }, [id]);

  useEffect(() => {
    if (selectedProvider) {
      fetchData(`vehicles/${selectedProvider}/get_vehicles_by_provider/`)
        .then(res => setFilteredVehicles(res.map((v: any) => ({
          id: v.id, name: `${v.plate} - ${v.brand}`, fullData: v
        }))))
        .catch(() => setFilteredVehicles([]));
    }
  }, [selectedProvider]);

  const handleVehicleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const vehicleId = e.target.value;
    const vehicle = filteredVehicles.find((v: any) => v.id === parseInt(vehicleId));
    if (vehicle?.fullData) {
      setVehicleData({
        truck_brand: vehicle.fullData.brand,
        truck_model: vehicle.fullData.model,
        truck_plate: vehicle.fullData.plate,
        truck_color: vehicle.fullData.color
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const payload = Object.fromEntries(new FormData(e.currentTarget).entries());

    try {
      const result = await patchData(`affidavits/${id}/update_affidavit/`, payload);
      if (result?.error) setError(result.error);
      else router.push('/dashboard/affidavits');
    } catch (err) {
      setError("Error al actualizar.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <div className="p-8 text-white">Cargando datos...</div>;

  return (
    <div className="bg-background p-8 text-white min-h-screen" style={lusitana.style}>
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Editar Declaración Jurada #{id}</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-card p-6 rounded-lg border border-border grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormSelect label="Ticket" name="ticket" data={tickets} defaultValue={affidavit.ticket} required />
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Proveedor</label>
              <select name="provider" value={selectedProvider} className="bg-background border border-border rounded-md p-2 text-black h-[42px]" onChange={(e) => setSelectedProvider(e.target.value)} required>
                {providers.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Cambiar Vehículo</label>
              <select 
                disabled={!selectedProvider || (selectedProvider !== "" && filteredVehicles.length === 0)}
                className="bg-background border border-border rounded-md p-2 text-black h-[42px]" onChange={handleVehicleChange}>
                <option value="">Mantener actual</option>
                {filteredVehicles.map((v: any) => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
              {selectedProvider && filteredVehicles.length === 0 && (
                    <span className="text-red-400 text-xs mt-1 animate-pulse">
                    * Este proveedor no tiene vehículos registrados.
                    </span>
                )}
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg border border-border">
            <h2 className="text-lg font-semibold mb-4 text-blue-400">Datos del Vehículo (Seleccione un vehículo arriba para autocompletar)</h2>
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
              <FormInput label="Dirección" name="start_address" defaultValue={affidavit.start_address} required />
              <div className="grid grid-cols-2 gap-2">
                <FormInput label="Ciudad" name="start_city" defaultValue={affidavit.start_city} required />
                <FormInput label="Estado" name="start_state" defaultValue={affidavit.start_state} required />
              </div>
              <FormInput label="Fecha Salida" name="startdate" type="date" defaultValue={affidavit.startdate?.substring(0,10)} required />
            </div>
            <div className="space-y-4">
              <h3 className="font-bold border-b border-border pb-1">Destino</h3>
              <FormInput label="Dirección" name="end_address" defaultValue={affidavit.end_address} required />
              <div className="grid grid-cols-2 gap-2">
                <FormInput label="Ciudad" name="end_city" defaultValue={affidavit.end_city} required />
                <FormInput label="Estado" name="end_state" defaultValue={affidavit.end_state} required />
              </div>
              <FormInput label="Fecha Llegada" name="enddate" type="date" defaultValue={affidavit.enddate?.substring(0,10)} required />
            </div>
          </div>

          <div className="flex justify-end gap-4 items-center">
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <AddButton type="submit" disabled={loading}>{loading ? 'Actualizando...' : 'Guardar Cambios'}</AddButton>
          </div>
        </form>
      </div>
    </div>
  );
}