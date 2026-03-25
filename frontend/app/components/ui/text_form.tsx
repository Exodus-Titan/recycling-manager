// components/ui/FormInput.tsx
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
}

export function FormInput({ label, name, ...props }: FormInputProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-sm font-medium text-white">
        {label}
      </label>
      <input
        id={name}
        name={name}
        className="h-10 rounded-md border border-border bg-background cursor-black
                   px-3 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
        {...props}
      />
    </div>
  );
}