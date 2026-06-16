import React from 'react';

interface DonutChartProps {
  value?: number; // 0 to 100, if single value representation
  data?: { label: string; value: number; color: string }[]; // if multi-category representation
  size?: number;
  thickness?: number;
  centerText?: string;
  centerLabel?: string;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  value,
  data,
  size = 140,
  thickness = 14,
  centerText,
  centerLabel,
}) => {
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  // Option 1: Single percentage value
  if (value !== undefined) {
    const percent = Math.min(Math.max(value, 0), 100);
    const strokeDashoffset = circumference - (percent / 100) * circumference;
    const dispText = centerText || `${percent}%`;

    return (
      <div className="flex flex-col items-center justify-center">
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
            {/* Background Circle */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke="#1e293b"
              strokeWidth={thickness}
            />
            {/* Foreground Progress */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke="#3b82f6"
              strokeWidth={thickness}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xl font-bold text-slate-100">{dispText}</span>
            {centerLabel && <span className="text-2xs text-slate-500 font-semibold uppercase tracking-wider mt-0.5">{centerLabel}</span>}
          </div>
        </div>
      </div>
    );
  }

  // Option 2: Multi-category dataset
  if (data && data.length > 0) {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let accumulatedAngle = 0;

    const segments = data.map((item) => {
      const percentage = total > 0 ? (item.value / total) * 100 : 0;
      const strokeDashoffset = circumference - (percentage / 100) * circumference;
      const rotation = (accumulatedAngle / total) * 360 - 90;
      accumulatedAngle += item.value;

      return {
        ...item,
        percentage,
        strokeDashoffset,
        rotation,
      };
    });

    const dispText = centerText || String(total);

    return (
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="relative shrink-0" style={{ width: size, height: size }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {/* Base Circle */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke="#1e293b"
              strokeWidth={thickness}
            />
            {/* Segment Rings */}
            {segments.map((seg, idx) => (
              <circle
                key={idx}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={seg.color}
                strokeWidth={thickness}
                strokeDasharray={circumference}
                strokeDashoffset={seg.strokeDashoffset}
                transform={`rotate(${seg.rotation} ${center} ${center})`}
                className="transition-all duration-500 ease-out origin-center"
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xl font-bold text-slate-100">{dispText}</span>
            {centerLabel && <span className="text-2xs text-slate-500 font-semibold uppercase tracking-wider mt-0.5">{centerLabel}</span>}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2">
          {segments.map((seg, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
              <span className="text-slate-300 font-medium">{seg.label}:</span>
              <span className="text-slate-100 font-bold">{seg.value}</span>
              <span className="text-slate-500 font-semibold">({Math.round(seg.percentage)}%)</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};
