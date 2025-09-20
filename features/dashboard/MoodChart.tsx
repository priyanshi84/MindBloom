import React, { useMemo, useState } from 'react';
import { Card } from '../../components/Card';
import { MoodEntry } from '../../types';
import { Icon } from '../../components/Icon';

const moodOptions = [
  { level: 9, emoji: '😄', label: 'Happy', color: '#22C55E' },
  { level: 8, emoji: '😊', label: 'Proud', color: '#a3e635' },
  { level: 7, emoji: '🙏', label: 'Grateful', color: '#38bdf8' },
  { level: 6, emoji: '🙂', label: 'Calm', color: '#10B981' },
  { level: 5, emoji: '😐', label: 'Okay', color: '#F59E0B' },
  { level: 4, emoji: '🥱', label: 'Tired', color: '#64748b' },
  { level: 3, emoji: '😟', label: 'Anxious', color: '#F97316' },
  { level: 2, emoji: '😫', label: 'Stressed', color: '#dc2626' },
  { level: 1, emoji: '😔', label: 'Sad', color: '#EF4444' },
];

interface MoodChartProps {
  data: MoodEntry[];
}

const MoodChart: React.FC<MoodChartProps> = ({ data }) => {
  const [tooltip, setTooltip] = useState<{ x: number, y: number, entry: MoodEntry } | null>(null);

  const sortedData = useMemo(() => {
    if (!data) return [];
    // Sort by date ascending
    return [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data]);
  
  const width = 500;
  const height = 180;
  const padding = { top: 10, right: 20, bottom: 25, left: 35 };
  
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  
  const yScale = (level: number) => padding.top + chartHeight - ((level - 1) / 8) * chartHeight;
  
  const xScale = (index: number) => {
    if (sortedData.length <= 1) return padding.left + chartWidth / 2;
    return padding.left + (index / (sortedData.length - 1)) * chartWidth;
  };
  
  const pathData = useMemo(() => {
    if (sortedData.length < 2) return '';
    return sortedData
      .map((entry, index) => {
        const x = xScale(index);
        const y = yScale(entry.level);
        return `${index === 0 ? 'M' : 'L'} ${x},${y}`;
      })
      .join(' ');
  }, [sortedData, xScale, yScale]);
  
  const areaPathData = useMemo(() => {
      if (!pathData) return '';
      return `${pathData} L ${xScale(sortedData.length - 1)},${height - padding.bottom} L ${xScale(0)},${height - padding.bottom} Z`;
  }, [pathData, sortedData.length, xScale, height, padding.bottom]);


  const formatDate = (dateString: string) => {
      const date = new Date(dateString + 'T00:00:00');
      return date.toLocaleString('en-IN', { day: 'numeric', month: 'short' });
  }

  return (
    <Card className="p-4 md:p-6">
      <h3 className="font-bold mb-4 text-lg">Mood Over Time</h3>
      {sortedData.length < 2 ? (
        <div className="flex flex-col items-center justify-center h-48 text-center text-slate-500">
            <Icon name="ChartBar" className="w-10 h-10 mb-2 opacity-50" />
            <p className="font-medium">Not enough data yet.</p>
            <p className="text-xs">Log your mood for at least two days to see your trend chart.</p>
        </div>
      ) : (
        <div className="w-full h-full">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" aria-labelledby="chart-title" role="img">
                <title id="chart-title">A line chart showing mood levels over time.</title>
                <defs>
                    <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <g className="grid-lines">
                    {[1, 3, 5, 7, 9].map(level => (
                        <line 
                            key={`grid-${level}`}
                            x1={padding.left}
                            y1={yScale(level)}
                            x2={width - padding.right}
                            y2={yScale(level)}
                            className="stroke-slate-200"
                            strokeWidth="1"
                            strokeDasharray="2,3"
                        />
                    ))}
                </g>
                <g className="y-axis-labels">
                    {moodOptions.map(({ level, emoji }) => (
                        <text 
                            key={`label-${level}`}
                            x={padding.left - 15}
                            y={yScale(level)}
                            dy="0.3em"
                            className="text-sm fill-current text-slate-600"
                            textAnchor="middle"
                        >
                           {emoji}
                        </text>
                    ))}
                </g>
                 <g className="x-axis-labels">
                    {sortedData.map((entry, index) => {
                        const shouldShowLabel = sortedData.length <= 10 || index === 0 || index === sortedData.length - 1 || index % Math.floor(sortedData.length / 5) === 0;
                        if (!shouldShowLabel) return null;

                        return (
                            <text
                                key={`date-label-${index}`}
                                x={xScale(index)}
                                y={height - padding.bottom + 15}
                                className="text-[10px] fill-current text-slate-500"
                                textAnchor="middle"
                            >
                                {formatDate(entry.date)}
                            </text>
                        );
                    })}
                </g>
                <path d={areaPathData} fill="url(#moodGradient)" />
                <path d={pathData} className="fill-none stroke-violet-500" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <g className="data-points">
                    {sortedData.map((entry, index) => (
                        <circle
                            key={`point-${entry.id}`}
                            cx={xScale(index)}
                            cy={yScale(entry.level)}
                            r={tooltip?.entry.id === entry.id ? 7 : 5}
                            className="fill-violet-500 stroke-white transition-all duration-150 cursor-pointer"
                            strokeWidth="2"
                            onMouseEnter={() => setTooltip({ x: xScale(index), y: yScale(entry.level), entry })}
                            onMouseLeave={() => setTooltip(null)}
                        />
                    ))}
                </g>
                {tooltip && (
                    <g transform={`translate(${tooltip.x}, ${tooltip.y})`} className="pointer-events-none transition-opacity duration-150" style={{ opacity: 1 }}>
                        <foreignObject x="-70" y="-70" width="140" height="55">
                            <div className="bg-white rounded-lg p-2 text-xs shadow-xl flex items-center gap-2 border border-slate-200 animate-fade-in">
                                <span className="text-2xl">{moodOptions.find(m => m.level === tooltip.entry.level)?.emoji}</span>
                                <div className="text-left">
                                    <p className="font-bold text-slate-800">{moodOptions.find(m => m.level === tooltip.entry.level)?.label}</p>
                                    <p className="text-slate-500">{formatDate(tooltip.entry.date)}</p>
                                </div>
                            </div>
                        </foreignObject>
                    </g>
                )}
            </svg>
        </div>
      )}
    </Card>
  );
};

export default MoodChart;