import React from 'react';
import './DateRangePicker.css';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onChange: (start: string, end: string) => void;
  disabled?: boolean;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onChange,
  disabled = false
}) => {
  const setPreset = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    onChange(start.toISOString().split('T')[0], end.toISOString().split('T')[0]);
  };

  const setThisMonth = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    onChange(start.toISOString().split('T')[0], end.toISOString().split('T')[0]);
  };

  return (
    <div className="date-range-picker">
      <div className="date-range-inputs">
        <div className="date-input-group">
          <label>De</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onChange(e.target.value, endDate)}
            disabled={disabled}
          />
        </div>
        <span className="date-separator">até</span>
        <div className="date-input-group">
          <label>Até</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onChange(startDate, e.target.value)}
            disabled={disabled}
          />
        </div>
      </div>
      <div className="date-presets">
        <button type="button" onClick={() => setPreset(7)} disabled={disabled}>7 dias</button>
        <button type="button" onClick={() => setPreset(30)} disabled={disabled}>30 dias</button>
        <button type="button" onClick={setThisMonth} disabled={disabled}>Este mês</button>
        <button type="button" onClick={() => setPreset(90)} disabled={disabled}>90 dias</button>
      </div>
    </div>
  );
};

export default DateRangePicker;
