type PercentageSliderProps = {
  label: string;
  helper?: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
};

export default function PercentageSlider({
  label,
  helper,
  value,
  onChange,
  min = 0,
  max = 100,
}: PercentageSliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-bold text-gray-900 dark:text-white">{label}</span>
        <span className="text-sm font-black text-aacp-olive">{value}%</span>
      </div>
      {helper && <p className="text-xs text-gray-500">{helper}</p>}
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-aacp-olive"
      />
    </div>
  );
}
