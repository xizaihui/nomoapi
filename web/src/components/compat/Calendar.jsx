// Compat layer: Semi Design Calendar → pure implementation (no external deps)
// Semi Calendar API: mode='month', onChange(date), dateGridRender(dateString, date)
import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const Calendar = ({ mode, onChange, dateGridRender, className, style, ...rest }) => {
  const [month, setMonth] = React.useState(new Date());

  const handleMonthChange = (newMonth) => {
    setMonth(newMonth);
    if (onChange) {
      onChange(newMonth);
    }
  };

  // Custom day content renderer to support Semi's dateGridRender
  const renderDay = (day) => {
    const dayNum = day.getDate();
    if (!dateGridRender) {
      return <span>{dayNum}</span>;
    }
    const overlay = dateGridRender(day.toString(), day);
    return (
      <div className='relative w-full h-full flex items-center justify-center'>
        <span className={cn(overlay ? 'opacity-30' : '')}>{dayNum}</span>
        {overlay}
      </div>
    );
  };

  return (
    <div className={cn('w-full', className)} style={style}>
      <div className='flex items-center justify-between mb-3 px-1'>
        <button
          type='button'
          aria-label='上个月'
          onClick={() => {
            const prev = new Date(month);
            prev.setMonth(prev.getMonth() - 1);
            handleMonthChange(prev);
          }}
          className='h-7 w-7 inline-flex items-center justify-center rounded-md border border-input bg-transparent hover:bg-accent hover:text-accent-foreground'
        >
          <ChevronLeft className='h-4 w-4' />
        </button>
        <span className='text-sm font-medium'>
          {month.getFullYear()}年{month.getMonth() + 1}月
        </span>
        <button
          type='button'
          aria-label='下个月'
          onClick={() => {
            const next = new Date(month);
            next.setMonth(next.getMonth() + 1);
            handleMonthChange(next);
          }}
          className='h-7 w-7 inline-flex items-center justify-center rounded-md border border-input bg-transparent hover:bg-accent hover:text-accent-foreground'
        >
          <ChevronRight className='h-4 w-4' />
        </button>
      </div>
      <CalendarGrid month={month} renderDay={renderDay} />
    </div>
  );
};

// Simple month grid
const CalendarGrid = ({ month, renderDay }) => {
  const year = month.getFullYear();
  const m = month.getMonth();
  const firstDay = new Date(year, m, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, m + 1, 0).getDate();
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  const cells = [];
  // Leading empty cells
  for (let i = 0; i < firstDay; i++) {
    cells.push(<td key={`e${i}`} className='p-1' />);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, m, d);
    cells.push(
      <td key={d} className='p-1 text-center align-top'>
        <div className='relative w-10 h-10 mx-auto flex items-center justify-center rounded-md hover:bg-accent text-sm'>
          {renderDay(date)}
        </div>
      </td>
    );
  }

  // Build rows of 7
  const rows = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(<tr key={i}>{cells.slice(i, i + 7)}</tr>);
  }

  return (
    <table className='w-full border-collapse'>
      <thead>
        <tr>
          {weekDays.map((d) => (
            <th key={d} className='p-1 text-center text-xs font-normal text-muted-foreground'>
              {d}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  );
};

Calendar.displayName = 'Calendar';

export { Calendar };
export default Calendar;
