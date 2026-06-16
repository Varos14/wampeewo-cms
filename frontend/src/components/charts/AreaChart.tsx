import React from 'react';

interface AreaChartProps {
  data: { date: string; value: number }[];
  height?: number;
  strokeColor?: string;
  fillColor?: string;
}

export const AreaChart: React.FC<AreaChartProps> = ({
  data,
  height = 160,
  strokeColor = '#3b82f6', // blue-500
  fillColor = 'url(#area-gradient)',
}) => {
  const activeData = data.filter(d => d.value > 0);
  if (activeData.length === 0) {
    return <div className="text-center text-xs text-slate-500 py-6">No data available</div>;
  }

  // Dimension helpers
  const width = 500;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Min/Max calculations
  const values = activeData.map((d) => d.value);
  const maxVal = Math.max(...values, 100); // Scale up to 100%
  const minVal = 0;
  const valRange = maxVal - minVal;

  // Grid / X / Y Mapping
  const points = activeData.map((d, index) => {
    const x = paddingLeft + (index / (activeData.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - ((d.value - minVal) / valRange) * chartHeight;
    return { x, y, ...d };
  });

  const linePath = points.reduce(
    (acc, p, index) => (index === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
    ''
  );

  const fillPath = points.length > 0 
    ? `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`
    : '';

  // Render Y axis ticks
  const yTicks = [0, 25, 50, 75, 100];

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible">
        <defs>
          <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity={0.25} />
            <stop offset="100%" stopColor={strokeColor} stopOpacity={0.0} />
          </linearGradient>
        </defs>

        {/* Grid lines & Y Ticks */}
        {yTicks.map((tick) => {
          const y = paddingTop + chartHeight - (tick / 100) * chartHeight;
          return (
            <g key={tick} className="opacity-40">
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="#334155"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={paddingLeft - 8}
                y={y + 4}
                fill="#94a3b8"
                fontSize="10"
                fontWeight="600"
                textAnchor="end"
              >
                {tick}%
              </text>
            </g>
          );
        })}

        {/* Area Fill */}
        {fillPath && (
          <path
            d={fillPath}
            fill={fillColor}
            className="animate-fade-in"
          />
        )}

        {/* Stroke Line */}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke={strokeColor}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Data points (dots) */}
        {points.map((p, index) => (
          <g key={index} className="group cursor-pointer">
            <circle
              cx={p.x}
              cy={p.y}
              r="4"
              fill={strokeColor}
              stroke="#0f172a"
              strokeWidth="2"
            />
            {/* Tooltip background on hover */}
            <rect
              x={p.x - 25}
              y={p.y - 28}
              width="50"
              height="20"
              rx="4"
              fill="#1e293b"
              stroke="#475569"
              strokeWidth="1"
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
            />
            {/* Tooltip text */}
            <text
              x={p.x}
              y={p.y - 15}
              fill="#f8fafc"
              fontSize="9"
              fontWeight="bold"
              textAnchor="middle"
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
            >
              {p.value}%
            </text>
          </g>
        ))}

        {/* X Axis labels */}
        {points.map((p, index) => (
          <text
            key={index}
            x={p.x}
            y={height - 8}
            fill="#94a3b8"
            fontSize="11"
            fontWeight="500"
            textAnchor="middle"
          >
            {p.date}
          </text>
        ))}
      </svg>
    </div>
  );
};
