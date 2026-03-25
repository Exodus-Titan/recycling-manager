import { lusitana } from "@/app/ui/fonts"
import { fetchData } from "@/app/lib/data"
import { DynamicTable } from '../../components/dynamic-table';
import { Words_diccionary } from "@/app/lib/diccionary";
import { AddButton } from "@/app/components/ui/add_button";
import Link from "next/dist/client/link";

export default async function TableExamplePage() {
  const sampleData = await fetchData('affidavits');

  return (
    <>
    <div> 
      -------------------------------------------------------------------
    </div>
    <div className="bg-background p-8 text-white" style={lusitana.style}>
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{Words_diccionary.affidavits}</h1>
        </div>

        <div className="flex justify-end">
          <Link href="/dashboard/affidavits/add">
            <AddButton>
              Agregar nueva declaración jurada
            </AddButton>
          </Link>
        </div>

        <div className="space-y-6">
          <div>
            <DynamicTable data={sampleData} url="/dashboard/affidavits/" deleteAPIRoute="affidavits/"/>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}