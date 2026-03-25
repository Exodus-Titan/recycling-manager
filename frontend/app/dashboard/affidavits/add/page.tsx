'use client';

import { useState, useEffect } from 'react';
import { lusitana } from "@/app/ui/fonts";
import { fetchData, postData } from "@/app/lib/data";
import { FormInput } from '@/app/components/ui/text_form';
import { FormSelect } from '@/app/components/ui/selector_form';
import { AddButton } from '@/app/components/ui/add_button';
import { useRouter } from 'next/navigation';

export default function AddAffidavitPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [providers, setProviders] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState<any[]>([]);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [vehicleData, setVehicleData] = useState({
    truck_brand: '', truck_model: '', truck_plate: '', truck_color: ''
  });

  useEffect(() => {
    Promise.all([
      fetchData('providers/'),
      fetchData('tickets/get_tickets_without_affidavit/') // Ajusta según tu lógica de negocio
    ]).then(([provs, ticks]) => {
      setProviders(provs.map((p: any) => ({ id: p.id, name: p.name })));
      setTickets(ticks.map((t: any) => ({ id: t.id, name: `Ticket #${t.ticket_number}` })));
    });
  }, []);

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
      } else {
        setFilteredVehicles([]);
      }
      setVehicleData({ truck_brand: '', truck_model: '', truck_plate: '', truck_color: '' });
    };
    updateVehicles();
  }, [selectedProvider]);

  const handleVehicleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const vehicleId = e.target.value;
    const vehicle = filteredVehicles.find((v: any) => v.id === parseInt(vehicleId));
    if (vehicle?.fullData) {
      const d = vehicle.fullData;
      setVehicleData({
        truck_brand: d.brand, truck_model: d.model, truck_plate: d.plate, truck_color: d.color
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const payload = Object.fromEntries(new FormData(e.currentTarget).entries());

    try {
      const result = await postData('affidavits/save_affidavit/', payload);
      if (result?.error) setError(result.error);
      else router.push('/dashboard/affidavits');
    } catch (err) {
      setError("Error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background p-8 text-white min-h-screen" style={lusitana.style}>
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Crear Declaración Jurada</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-card p-6 rounded-lg border border-border grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormSelect label="Ticket" name="ticket" data={tickets} required />
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Proveedor</label>
              <select name="provider" className="bg-background border border-border rounded-md p-2 text-black h-[42px]" onChange={(e) => setSelectedProvider(e.target.value)} required>
                <option value="">Seleccione Proveedor</option>
                {providers.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Vehículo</label>
              <select disabled={!selectedProvider || (selectedProvider !== "" && filteredVehicles.length === 0)} className="bg-background border border-border rounded-md p-2 text-black h-[42px] disabled:opacity-50" onChange={handleVehicleChange}>
                <option value="">Seleccione Vehículo</option>
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
              <FormInput label="Dirección" name="start_address" required />
              <div className="grid grid-cols-2 gap-2">
                <FormInput label="Ciudad" name="start_city" required />
                <FormInput label="Estado" name="start_state" required />
              </div>
              <FormInput label="Fecha Salida" name="startdate" type="date" required />
            </div>
            <div className="space-y-4">
              <h3 className="font-bold border-b border-border pb-1">Destino</h3>
              <FormInput label="Dirección" name="end_address" required />
              <div className="grid grid-cols-2 gap-2">
                <FormInput label="Ciudad" name="end_city" required />
                <FormInput label="Estado" name="end_state" required />
              </div>
              <FormInput label="Fecha Llegada" name="enddate" type="date" required />
            </div>
          </div>

          <div className="flex justify-end gap-4 items-center">
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <AddButton type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Crear Declaración'}</AddButton>
          </div>
        </form>
      </div>
    </div>
  );
}