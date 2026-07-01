import React from 'react';

interface BarChartProps {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
  valueFormatter?: (val: number) => string;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  height = 180,
  color = '#6366f1', // indigo-500
  valueFormatter = (val) => String(val),
}) => {
  if (data.length === 0) {
    return <div className="text-center text-xs text-slate-500 py-6">No data available</div>;
  }

  // Dimensions
  const width = 500;
  const paddingLeft = 60;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Values
  const values = data.map((d) => d.value);
  const maxVal = Math.max(...values, 1);
  
  // Calculate bar spacing
  const barWidth = (chartWidth / data.length) * 0.6;
  const spacing = (chartWidth / data.length) * 0.4;

  const bars = data.map((d, index) => {
    const barHeight = (d.value / maxVal) * chartHeight;
    const x = paddingLeft + index * (barWidth + spacing) + spacing / 2;
    const y = paddingTop + chartHeight - barHeight;
    return { x, y, barHeight, ...d };
  });

  // Simple Y ticks (4 lines)
  const ticks = [0, 0.33, 0.66, 1].map((p) => Math.round(maxVal * p));

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible">
        {/* Grid lines and Ticks */}
        {ticks.map((tick, index) => {
          const y = paddingTop + chartHeight - (tick / maxVal) * chartHeight;
          return (
            <g key={index} className="opacity-40">
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="#334155"
                strokeWidth="1"
              />
              <text
                x={paddingLeft - 8}
                y={y + 4}
                fill="#94a3b8"
                fontSize="9"
                fontWeight="600"
                textAnchor="end"
              >
                {valueFormatter(tick)}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {bars.map((bar, index) => (
          <g key={index} className="group cursor-pointer">
            <rect
              x={bar.x}
              y={bar.y}
              width={barWidth}
              height={bar.barHeight}
              fill={color}
              rx="4"
              className="transition-all duration-300 hover:brightness-110"
            />
            {/* Tooltip on hover */}
            <rect
              x={bar.x + barWidth / 2 - 35}
              y={bar.y - 28}
              width="70"
              height="20"
              rx="4"
              fill="#1e293b"
              stroke="#475569"
              strokeWidth="1"
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
            />
            <text
              x={bar.x + barWidth / 2}
              y={bar.y - 15}
              fill="#f8fafc"
              fontSize="9"
              fontWeight="bold"
              textAnchor="middle"
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
            >
              {valueFormatter(bar.value)}
            </text>
          </g>
        ))}

        {/* X Axis Labels */}
        {bars.map((bar, index) => (
          <text
            key={index}
            x={bar.x + barWidth / 2}
            y={height - 8}
            fill="#94a3b8"
            fontSize="10"
            fontWeight="500"
            textAnchor="middle"
          >
            {bar.label}
          </text>
        ))}
      </svg>
    </div>
  );
};

