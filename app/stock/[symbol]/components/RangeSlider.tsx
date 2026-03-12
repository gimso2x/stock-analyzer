'use client';

interface RangeSliderProps {
  label: string;
  current: number;
  min: number;
  max: number;
  minLabel?: string;
  symbol?: string;
  isKRW?: boolean;
}

export default function RangeSlider({ 
  label, 
  current, 
  min, 
  max, 
  minLabel, 
  symbol = '$',
  isKRW = false
}: RangeSliderProps) {
  // Calculate percentage position
  const range = max - min;
  const position = ((current - min) / range) * 100;
  const clampedPosition = Math.min(Math.max(position, 0), 100);

  const formatPrice = (val: number) => {
    return isKRW ? `${Math.round(val).toLocaleString()}` : val.toFixed(2);
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        {minLabel && <span className="text-xs text-slate-500">{minLabel}</span>}
      </div>
      
      <div className="relative pt-6 pb-2">
        {/* Track */}
        <div className="h-1.5 w-full bg-slate-200 rounded-full" />
        
        {/* Marker (Current Price) */}
        <div 
          className="absolute top-0 transition-all duration-500 ease-out flex flex-col items-center"
          style={{ left: `${clampedPosition}%`, transform: 'translateX(-50%)' }}
        >
          <span className="text-sm font-bold text-slate-900 mb-1">
            {formatPrice(current)}
          </span>
          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-slate-800" />
        </div>
      </div>
      
      <div className="flex justify-between mt-1">
        <span className="text-xs text-slate-400">{formatPrice(min)}</span>
        <span className="text-xs text-slate-400">{formatPrice(max)}</span>
      </div>
    </div>
  );
}
