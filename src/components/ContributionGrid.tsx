import { useState } from 'react';

interface ContributionGridProps {
  data: Record<string, number>;
  levels: {
    low: number;
    medium: number;
    high: number;
  };
  unit: string;
  onCellClick?: (date: string) => void;
  enableTooltip?: boolean;
  interactive?: boolean;
  size?: 'small' | 'default';
  timeRange?: 'full-year' | '6-months' | 'first-half' | 'second-half';
}

const ContributionGrid = ({
  data,
  levels,
  unit,
  onCellClick,
  enableTooltip = true,
  interactive = true,
  size = 'default',
  timeRange = 'first-half'
}: ContributionGridProps) => {
  const [hoveredCell, setHoveredCell] = useState<{
    date: string;
    value: number;
    dayOfWeek: number;
    week: number;
    future: boolean;
    formattedDate: string;
  } | null>(null);
  
  const getContributionLevel = (value: number, future = false) => {
    if (future || value === 0) {
      return 'bg-empty'; // Use theme-aware empty state color
    }
    
    // Calculate intensity based on value ranges
    let intensity = 0;
    if (value <= levels.low) {
      intensity = (value / levels.low) * 0.25;
    } else if (value <= levels.medium) {
      intensity = 0.25 + ((value - levels.low) / (levels.medium - levels.low)) * 0.25;
    } else if (value <= levels.high) {
      intensity = 0.5 + ((value - levels.medium) / (levels.high - levels.medium)) * 0.25;
    } else {
      intensity = 0.75 + Math.min((value - levels.high) / levels.high * 0.25, 0.25);
    }

    // Map intensity to tailwind classes
    const colorClass = (() => {
      if (intensity <= 0.25) return 'bg-green-900';
      if (intensity <= 0.5) return 'bg-green-700';
      if (intensity <= 0.75) return 'bg-green-500';
      return 'bg-green-300';
    })();

    return colorClass;
  };

  const getDateRange = () => {
    const now = new Date();
    const year = now.getFullYear();
    
    // Fix date ranges to avoid overlap and include all months properly
    if (timeRange === 'first-half') {
      return {
        start: new Date(year, 0, 1),     // Jan 1
        end: new Date(year, 5, 30)       // June 30 (end of June)
      };
    } else if (timeRange === 'second-half') {
      return {
        start: new Date(year, 6, 1),     // July 1
        end: new Date(year, 11, 31)      // Dec 31
      };
    } else if (timeRange === '6-months') {
      const start = new Date(now);
      start.setMonth(now.getMonth() - 6);
      start.setDate(1);
      return { start, end: now };
    }

    // Full year
    return {
      start: new Date(year, 0, 1),
      end: new Date(year, 11, 31)
    };
  };

  const generateGridData = () => {
    const days = [];
    const { start, end } = getDateRange();
    const startDay = start.getUTCDay();
    const adjustedStart = new Date(start);
    adjustedStart.setUTCDate(adjustedStart.getUTCDate() - startDay);

    let week = 0;
    const currentDate = new Date(adjustedStart);

    while (currentDate <= end) {
      for (let day = 0; day < 7; day++) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const value = data[dateStr] || 0;

        days.push({
          date: dateStr,
          value,
          dayOfWeek: day,
          week,
          future: currentDate > new Date(),
          formattedDate: currentDate.toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        });

        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
      }
      week++;
    }

    return { days, totalWeeks: week };
  };

  // Modify the month labels generation to ensure exact month boundaries
  const getMonthLabels = () => {
    const { start, end } = getDateRange();
    const months = [];
    const currentDate = new Date(start);
    const startDay = start.getDay(); // Changed from getUTCDay
    const adjustedStart = new Date(start);
    adjustedStart.setDate(adjustedStart.getDate() - startDay); // Changed from setUTCDate

    while (currentDate <= end) {
      if (currentDate.getTime() > end.getTime()) break;
      
      // Calculate week position for current month
      const monthStartWeek = Math.floor((currentDate.getTime() - adjustedStart.getTime()) / (7 * 24 * 60 * 60 * 1000));
      
      // Get last day of current month
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      if (monthEnd > end) break; // Skip if month end is beyond range
      
      const monthEndWeek = Math.floor((monthEnd.getTime() - adjustedStart.getTime()) / (7 * 24 * 60 * 60 * 1000));
      const centerWeek = monthStartWeek + Math.floor((monthEndWeek - monthStartWeek) / 2);
      
      months.push({
        month: currentDate.toLocaleString('default', { month: 'short' }),
        startWeek: centerWeek,
        visible: true
      });
      
      // Move to first day of next month
      currentDate.setMonth(currentDate.getMonth() + 1);
      currentDate.setDate(1);
    }
    return months;
  };

  const { days, totalWeeks } = generateGridData();
  // Smaller cells for grid view
  const cellSize = size === 'small' ? 'w-2.5 h-2.5' : 'w-2.5 h-2.5';  
  const gridGap = size === 'small' ? 'gap-[3px]' : 'gap-[2px]';

  return (
    <div className="relative w-full">
      <div className="h-5 relative mb-0.5">
        {getMonthLabels().map((monthData, i) => (
          <div
            key={i}
            className="absolute text-[10px] text-gray-400 -translate-x-1/2 font-medium"
            style={{
              left: `${(monthData.startWeek / totalWeeks) * 100}%`
            }}
          >
            {monthData.month}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <div 
          className={`grid grid-rows-7 grid-flow-col ${gridGap}`}
          style={{
            background: 'transparent',
            padding: '3px',
            borderRadius: '4px',
          }}
        >
          {days.map((day, i) => (
            <div
              key={i}
              className={`
                ${cellSize}
                ${getContributionLevel(day.value, day.future)}
                ${interactive ? 'cursor-pointer' : ''}
                transition-all duration-200
                hover:ring-1 hover:ring-blue-400
                rounded-sm
              `}
              onClick={() => interactive && onCellClick?.(day.date)}
              onMouseEnter={() => setHoveredCell(day)}
              onMouseLeave={() => setHoveredCell(null)}
            />
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-400 justify-start px-3">
          <span>Less</span>
          {[0, levels.low, levels.medium, levels.high].map((level) => (
            <div
              key={level}
              className={`w-3 h-3 rounded-sm ${getContributionLevel(level)}`}
              title={`${level} ${unit}`} 
            />
          ))}
          <span>More</span>
        </div>
      </div>

      {enableTooltip && hoveredCell && (
        <div 
          className="absolute bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg z-10 text-sm"
          style={{
            left: `${(hoveredCell.week / totalWeeks) * 100}%`,
            top: `${(hoveredCell.dayOfWeek / 7) * 100 + 20}%`,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="font-medium">{hoveredCell.formattedDate}</div>
          <div className="text-gray-300">
            {hoveredCell.value} {unit}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContributionGrid;