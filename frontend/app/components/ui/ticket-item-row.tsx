'use client';

import { Trash2 } from 'lucide-react';
import { FormInput } from '@/app/components/ui/text_form';
import { FormSelect } from '@/app/components/ui/selector_form';

interface Item {
  material: string;
  amount: string;
  unit_type: string;
}

interface Props {
  index: number;
  item: Item;
  materials: any[];
  onChange: (index: number, field: string, value: string) => void;
  onRemove: (index: number) => void;
}

export function TicketItemRow({ index, item, materials, onChange, onRemove }: Props) {
  return (
    <div className="flex flex-wrap md:flex-nowrap gap-4 items-end bg-background/50 p-3 rounded-md border border-border/50 transition-all hover:border-blue-500/30">
      <div className="flex-1 min-w-[200px]">
        <FormSelect 
          label="Material" 
          name={`item_mat_${index}`}
          data={materials}
          value={item.material}
          onChange={(e) => onChange(index, 'material', e.target.value)}
          required
        />
      </div>
      
      <div className="w-32">
        <FormInput 
          label="Cantidad" 
          name={`item_amt_${index}`}
          type="number"
          step="0.01"
          value={item.amount}
          onChange={(e) => onChange(index, 'amount', e.target.value)}
          required
        />
      </div>

      <div className="w-40">
        <label className="block text-sm font-medium mb-1">Unidad</label>
        <select 
          className="w-full bg-background border border-border rounded p-2 text-black h-[42px] focus:ring-2 focus:ring-blue-500 outline-none"
          value={item.unit_type}
          onChange={(e) => onChange(index, 'unit_type', e.target.value)}
        >
          <option value="KG">Kilogramos</option>
          <option value="PZ">Piezas</option>
        </select>
      </div>

      <button 
        type="button" 
        onClick={() => onRemove(index)}
        className="bg-red-500/10 hover:bg-red-600 text-red-500 hover:text-white p-2.5 rounded transition-all mb-[1px]"
        title="Eliminar material"
      >
        <Trash2 size={20} />
      </button>
    </div>
  );
}