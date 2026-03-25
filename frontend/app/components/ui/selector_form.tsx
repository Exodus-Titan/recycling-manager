// components/ui/FormSelect.tsx
import { cn } from '../../lib/utils';

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  name: string;
  data: any[]; 
}

export function FormSelect({ label, name, data, defaultValue, className, ...props }: FormSelectProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-sm font-medium text-white">
        {label}
      </label>
      <div className="relative">
        <select
          id={name}
          name={name}
          defaultValue={defaultValue || ""} 
          className={cn(
            // Estilos base consistentes con tu FormInput
            "h-10 w-full rounded-md border border-border bg-background px-3 transition-colors",
            "text-black focus:outline-none focus:ring-2 focus:ring-blue-500",
            
            // LA CORRECCIÓN: Quitamos la flecha del navegador por completo
            // appearance-none funciona, pero a veces necesitamos forzarlo
            "appearance-none [&::-ms-expand]:hidden cursor-pointer cursor-black pr-10",
            
            // Reutilizamos className por si quieres pasar estilos extra
            className
          )}
          {...props}
        >
          <option value="" disabled>
            -- Seleccione un {label.toLowerCase()} --
          </option>
          
          {data.map((item) => (
            <option key={item.id} value={item.id} className="bg-card text-black">
              {item.name} - {item.id_number}
            </option>
          ))}
        </select>
        
        {/* EL SVG DE FLECHA: Mantenemos este, que es el estilo manual */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-black">
          <svg className="h-4 w-4 fill-current opacity-70" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>
    </div>
  );
}