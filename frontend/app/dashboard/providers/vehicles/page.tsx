import { lusitana } from "@/app/ui/fonts"
import { fetchData } from "@/app/lib/data"
import { DynamicTable } from '../../../components/dynamic-table';
import { Words_diccionary } from "@/app/lib/diccionary";
import { AddButton } from "@/app/components/ui/add_button";
import Link from "next/dist/client/link";

export default async function TableExamplePage() {
  const sampleData = await fetchData('vehicles');

  return (
    <>
    <div> 
      -------------------------------------------------------------------
    </div>
    <div className="bg-background p-8 text-white" style={lusitana.style}>
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{Words_diccionary.vehicles}</h1>
        </div>

        <div className="flex justify-end">
          <Link href="/dashboard/providers/vehicles/add">
            <AddButton>
              Agregar nuevo vehículo
            </AddButton>
          </Link>
        </div>

        <div className="space-y-6">
          <div>
            <DynamicTable data={sampleData} url="/dashboard/providers/vehicles/" deleteAPIRoute="vehicles/"/>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}