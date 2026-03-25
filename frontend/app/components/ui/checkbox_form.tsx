// components/ui/FormCheckbox.tsx
interface FormCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
}

export function FormCheckbox({ label, name, ...props }: FormCheckboxProps) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-md hover:bg-white/5 transition-colors cursor-pointer">
      <div className="relative flex items-center">
        <input
          id={name}
          name={name}
          type="checkbox"
          className="h-5 w-5 cursor-pointer appearance-none rounded border border-border bg-background 
                     checked:bg-blue-600 checked:border-transparent focus:outline-none 
                     focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-background
                     transition-all"
          {...props}
        />
        {/* Este SVG opcional dibuja el check blanco cuando está marcado */}
        <svg
          className="absolute h-3.5 w-3.5 pointer-events-none hidden peer-checked:block text-white left-0.5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <label 
        htmlFor={name} 
        className="text-sm font-medium text-white cursor-pointer select-none"
      >
        {label}
      </label>
    </div>
  );
}