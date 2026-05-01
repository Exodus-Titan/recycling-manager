'use client';

import { useState, useEffect } from 'react';
import { lusitana } from "@/app/ui/fonts";
import { fetchData, postData } from "@/app/lib/data";
import { FormInput } from '@/app/components/ui/text_form';
import { FormSelect } from '@/app/components/ui/selector_form';
import { AddButton } from '@/app/components/ui/add_button';
import { useRouter } from 'next/navigation';
import { TicketItemRow } from '../../../components/ui/ticket-item-row';
import { Plus } from 'lucide-react';

export default function AddDeliveryNotePage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Estados para datos maestros
  const [providers, setProviders] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [allVehicles, setAllVehicles] = useState<any[]>([]); // Todos los vehículos
  const [filteredVehicles, setFilteredVehicles] = useState<any[]>([]); // Solo del proveedor
  const [addresses, setAddresses] = useState<any[]>([]); // Direcciones del proveedor
  const [endAddresses, setEndAddresses] = useState<any[]>([]); // Direcciones de destino
  const [materials, setMaterials] = useState([]);
  const [items, setItems] = useState([{ material: '', amount: '', unit_type: 'KG' }]);

  // Estados para la lógica del formulario
  const [selectedProvider, setSelectedProvider] = useState('');
  const [vehicleData, setVehicleData] = useState({
    truck_brand: '',
    truck_model: '',
    truck_plate: '',
    truck_color: ''
  });
  const [startAddressData, setStartAddressData] = useState({
    start_address: '',
    start_city: '',
    start_state: ''
  });
  const [endAddressData, setEndAddressData] = useState({
    end_address: '',
    end_city: '',
    end_state: ''
  });
  
  const [isAddressSelected, setIsAddressSelected] = useState(false);
  const [isEndAddressSelected, setIsEndAddressSelected] = useState(false);

  useEffect(() => {
    Promise.all([
        fetchData('providers/'),
        fetchData('origin-addresses/get_addresses/'),
        fetchData('materials/')
        // fetchData('tickets/get_tickets_without_delivery_note/')
    ]).then(([provs, addresses, mats]) => {
        // Para Proveedores:
        setProviders(provs.map((p: any) => ({
        id: p.id,
        name: p.name // O el campo que uses para el nombre
        })));

        setEndAddresses(addresses.map((a: any) => ({
          id: a.id,
          name: a.address,
          fullData: a
        })));

        setMaterials(mats);

        // Para Tickets: Mapeamos ticket_number a 'name'
        // const formattedTickets = ticks.map((t: any) => ({
        // id: t.id,
        // name: `Ticket #${t.ticket_number}` // Esto es lo que aparecerá en el select
        // }));

        // setTickets(formattedTickets);
    });
    }, []);

  // Lógica: Cuando cambia el proveedor, filtramos vehículos y las direcciones de origen 
  useEffect(() => {
    const updateProviderData = async () => {
      if (selectedProvider) {
        try {
          // Llamada al endpoint específico por ID
          const vehicles = await fetchData(`vehicles/${selectedProvider}/get_vehicles_by_provider/`);
          setFilteredVehicles(vehicles.map((v: any) => ({
            id: v.id,
            name: `${v.plate} - ${v.brand}`,
            fullData: v // Guardamos todo el objeto para el autocompletado
          })));

          const addresses = await fetchData(`addresses/${selectedProvider}/get_address_by_provider_id/`);
          setAddresses(addresses.map((a: any) => ({
            id: a.id,
            name: a.address,
            fulldata: a
          })));

        } catch (err) {
          console.error("Error al obtener vehículos o direcciones:", err);
          setFilteredVehicles([]);
          setAddresses([]);
        }
      } else {
        setVehicleData({ truck_brand: '', truck_model: '', truck_plate: '', truck_color: '' });
        setStartAddressData({ start_address: '', start_city: '', start_state: '' });
        setIsAddressSelected(false);
        setFilteredVehicles([]);
        setAddresses([]);
      }
      // Limpiar campos de vehículo si cambia el proveedor
    };

    updateProviderData();
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

  const handleItemChange = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const addItem = () => setItems([...items, { material: '', amount: '', unit_type: 'KG' }]);
  
  const removeItem = (index: number) => {
    if (items.length > 1) setItems(items.filter((_, i) => i !== index));
  };

  const handleStartAddressChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const addressId = e.target.value;
    const address = addresses.find((a: any) => a.id === parseInt(addressId));
    
    if (address?.fulldata) {
      setIsAddressSelected(true);
      const d = address.fulldata;
      setStartAddressData({
        start_address: d.address,
        start_city: d.city,
        start_state: d.state
      });
    }else{
      setIsAddressSelected(false);
    }
  };

  const handleEndAddressChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const addressId = e.target.value;
    const address = endAddresses.find((a: any) => a.id === parseInt(addressId));
    
    if (address?.fullData) {
      setIsEndAddressSelected(true);
      const d = address.fullData;
      setEndAddressData({
        end_address: d.address,
        end_city: d.city,
        end_state: d.state
      });
    }else{
      setIsEndAddressSelected(false);
    }
  };


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const rawData = Object.fromEntries(formData.entries());

    const payload: any = {};
    for (const key in rawData) {
      if (!key.startsWith('item_')) {
        payload[key] = rawData[key];
      }
    }

    payload.items = items;

    try {
      const result = await postData('delivery-notes/save_delivery_note/', payload);
      if (result?.error) setError(result.error);
      else router.push('/dashboard/delivery-notes');
    } catch (err) {
      setError("Error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background p-8 text-white min-h-screen" style={lusitana.style}>
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Crear Nota de Entrega</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECCIÓN 1: RELACIONES PRINCIPALES */}
          <div className="bg-card p-6 rounded-lg border border-border grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* <FormSelect label="Ticket" name="ticket" data={tickets} required /> */}

            <FormInput label="Número de Nota de Entrega" name="delivery_note_number" required  />
            
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Proveedor</label>
                <select 
                    name="provider"
                    className="bg-background border border-border rounded-md p-2 text-black h-[42px]"
                    onChange={(e) => setSelectedProvider(e.target.value)}
                    required
                >
                    <option value="">Seleccione Proveedor</option>
                    {providers.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Vehículo del Proveedor</label>
                <select 
                    disabled={!selectedProvider || (selectedProvider !== "" && filteredVehicles.length === 0)}
                    className="bg-background border border-border rounded-md p-2 text-black h-[42px] disabled:opacity-50"
                    onChange={handleVehicleChange}
                >
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

          {/* SECCIÓN 2: DATOS DEL VEHÍCULO (AUTOCOMPLETADOS) */}
          <div className="bg-card p-6 rounded-lg border border-border">
            <h2 className="text-lg font-semibold mb-4 text-blue-400">
                Datos del Vehículo (Seleccione un vehículo arriba para autocompletar)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormInput label="Marca" name="truck_brand" value={vehicleData.truck_brand} readOnly />
                <FormInput label="Modelo" name="truck_model" value={vehicleData.truck_model} readOnly />
                <FormInput label="Placa" name="truck_plate" value={vehicleData.truck_plate} readOnly />
                <FormInput label="Color" name="truck_color" value={vehicleData.truck_color} readOnly />
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg border border-border space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-2">
              <h2 className="text-xl font-semibold">Desglose de Materiales</h2>
              <button type="button" onClick={addItem} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-sm transition-all shadow-lg">
                <Plus size={18} /> Añadir Fila
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <TicketItemRow 
                  key={index}
                  index={index}
                  item={item}
                  materials={materials}
                  onChange={handleItemChange}
                  onRemove={removeItem}
                />
              ))}
            </div>
          </div>

          {/* SECCIÓN 3: RUTA Y FECHAS */}
          <div className="bg-card p-6 rounded-lg border border-border grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
                <h3 className="font-bold border-b border-border pb-1">Origen</h3>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Dirección del Proveedor</label>
                  <select 
                      disabled={!selectedProvider || (selectedProvider !== "" && addresses.length === 0)}
                      className="bg-background border border-border rounded-md p-2 text-black h-[42px] disabled:opacity-50"
                      onChange={handleStartAddressChange}
                  >
                      <option value="">Seleccione Dirección</option>
                      {addresses.map((v: any) => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                  {selectedProvider && addresses.length === 0 && (
                      <span className="text-red-400 text-xs mt-1 animate-pulse">
                      * Este proveedor no tiene direcciones registradas.
                      </span>
                  )}
              </div>
              
                {isAddressSelected ?
                  (<div key="address-autocomplete">
                    <FormInput label="Dirección" name="start_address" required value={startAddressData.start_address} readOnly/>
                    <div className="grid grid-cols-2 gap-2 pt-2">
                        <FormInput label="Ciudad" name="start_city" required value={startAddressData.start_city} readOnly/>
                        <FormInput label="Estado" name="start_state" required value={startAddressData.start_state} readOnly/>
                    </div>
                  </div>

                  ) : (
                  <div key="address-manual">
                    <FormInput label="Dirección" name="start_address" required/>
                    <div className="grid grid-cols-2 gap-2 pt-2">
                        <FormInput label="Ciudad" name="start_city" required/>
                        <FormInput label="Estado" name="start_state" required/>
                    </div>
                  </div>
                )}
                <FormInput label="Fecha/Hora Salida" name="startdate" type="date" required />
            </div>


            <div className="space-y-4">
              <h3 className="font-bold border-b border-border pb-1">Destino</h3>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Dirección de Destino</label>
                <select 
                    className="bg-background border border-border rounded-md p-2 text-black h-[42px] disabled:opacity-50"
                    onChange={handleEndAddressChange}
                >
                    <option value="">Seleccione Dirección</option>
                    {endAddresses.map((v: any) => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </div>
              <div className="space-y-4">
                  {isEndAddressSelected ?
                    (
                    <div key="end-address-autocomplete">
                      <FormInput label="Dirección" name="end_address" required value={endAddressData.end_address} readOnly/>
                      <div className="grid grid-cols-2 gap-2 pt-2">
                          <FormInput label="Ciudad" name="end_city" required value={endAddressData.end_city} readOnly/>
                          <FormInput label="Estado" name="end_state" required value={endAddressData.end_state} readOnly/>
                      </div>
                    </div>
                    )
                    :
                    (
                    <div key="end-address-manual">  
                      <FormInput label="Dirección" name="end_address" required />
                      <div className="grid grid-cols-2 gap-2 pt-2">
                          <FormInput label="Ciudad" name="end_city" required />
                          <FormInput label="Estado" name="end_state" required />
                      </div>
                    </div>
                    )
                  }
                  <FormInput label="Fecha/Hora Llegada" name="enddate" type="date" required />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 items-center">
             {error && <p className="text-red-500 text-sm">{error}</p>}
             <AddButton type="submit" disabled={loading}>
                {loading ? 'Guardando...' : 'Crear Nota de Entrega'}
             </AddButton>
          </div>
        </form>
      </div>
    </div>
  );
}