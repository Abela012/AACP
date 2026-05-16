import FormField, { inputClass } from './FormField';

type CurrencyInputProps = {
  label: string;
  helper?: string;
  example?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
};

export default function CurrencyInput({
  label,
  helper,
  example,
  value,
  onChange,
  error,
  required,
  placeholder = '0',
}: CurrencyInputProps) {
  return (
    <FormField label={label} helper={helper} example={example} error={error} required={required}>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">ETB</span>
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^\d.,]/g, ''))}
          placeholder={placeholder}
          className={inputClass + ' pl-12'}
        />
      </div>
    </FormField>
  );
}
