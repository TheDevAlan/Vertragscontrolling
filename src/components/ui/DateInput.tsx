'use client';

import { forwardRef, useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DateInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  value?: string; // ISO format: YYYY-MM-DD
  onChange?: (e: { target: { name: string; value: string; type: string } }) => void;
  name?: string;
  id?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  placeholder?: string;
}

/**
 * Konvertiert ISO-Datum (YYYY-MM-DD) zu europäischem Format (TT.MM.JJJJ)
 */
const isoToEuropean = (isoDate: string): string => {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  return `${parts[2]}.${parts[1]}.${parts[0]}`;
};

/**
 * Konvertiert europäisches Format (TT.MM.JJJJ) zu ISO-Datum (YYYY-MM-DD)
 */
const europeanToIso = (euroDate: string): string => {
  if (!euroDate) return '';
  // Erlaube auch Eingabe mit / oder -
  const normalized = euroDate.replace(/[\/\-]/g, '.');
  const parts = normalized.split('.');
  if (parts.length !== 3) return '';
  
  const day = parts[0].padStart(2, '0');
  const month = parts[1].padStart(2, '0');
  const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
  
  // Validierung
  const dayNum = parseInt(day, 10);
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);
  
  if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum)) return '';
  if (dayNum < 1 || dayNum > 31) return '';
  if (monthNum < 1 || monthNum > 12) return '';
  if (yearNum < 1900 || yearNum > 2100) return '';
  
  return `${year}-${month}-${day}`;
};

/**
 * Prüft ob ein Datum gültig ist
 */
const isValidDate = (isoDate: string): boolean => {
  if (!isoDate) return true; // Leeres Datum ist okay
  const date = new Date(isoDate);
  return !isNaN(date.getTime());
};

const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  ({ 
    className, 
    label, 
    error, 
    helperText, 
    value = '', 
    onChange,
    name = '',
    id,
    disabled = false,
    required = false,
    placeholder = 'TT.MM.JJJJ',
  }, ref) => {
    const inputId = id || name || label?.toLowerCase().replace(/\s+/g, '-');
    
    // Lokaler State für die Anzeige im europäischen Format
    const [displayValue, setDisplayValue] = useState(isoToEuropean(value));
    const [isFocused, setIsFocused] = useState(false);
    const [showPicker, setShowPicker] = useState(false);

    // Sync mit externem Value
    useEffect(() => {
      if (!isFocused) {
        setDisplayValue(isoToEuropean(value));
      }
    }, [value, isFocused]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newDisplayValue = e.target.value;
      setDisplayValue(newDisplayValue);
      
      // Versuche das Datum zu parsen
      const isoValue = europeanToIso(newDisplayValue);
      
      if (onChange && (isoValue || newDisplayValue === '')) {
        onChange({
          target: {
            name,
            value: isoValue,
            type: 'date',
          },
        });
      }
    };

    const handleBlur = () => {
      setIsFocused(false);
      // Bei Blur: formatiere das Datum korrekt
      if (displayValue) {
        const isoValue = europeanToIso(displayValue);
        if (isoValue && isValidDate(isoValue)) {
          setDisplayValue(isoToEuropean(isoValue));
        }
      }
    };

    const handleNativeDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const isoValue = e.target.value;
      setDisplayValue(isoToEuropean(isoValue));
      setShowPicker(false);
      
      if (onChange) {
        onChange({
          target: {
            name,
            value: isoValue,
            type: 'date',
          },
        });
      }
    };

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type="text"
            inputMode="numeric"
            value={displayValue}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className={cn(
              'w-full px-3 py-2 pr-10 rounded-lg border bg-white text-slate-900 placeholder-slate-400',
              'transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
              error
                ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500'
                : 'border-slate-300 hover:border-slate-400',
              'disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed',
              className
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          />
          <button
            type="button"
            onClick={() => setShowPicker(!showPicker)}
            disabled={disabled}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 disabled:opacity-50"
            tabIndex={-1}
            aria-label="Kalender öffnen"
          >
            <Calendar className="w-5 h-5" />
          </button>
          
          {/* Native Date Picker (versteckt, aber funktional) */}
          {showPicker && (
            <input
              type="date"
              value={value}
              onChange={handleNativeDateChange}
              onBlur={() => setTimeout(() => setShowPicker(false), 200)}
              className="absolute top-full left-0 mt-1 z-10 border border-slate-300 rounded-lg shadow-lg bg-white p-2"
              autoFocus
            />
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 text-sm text-red-600">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="mt-1.5 text-sm text-slate-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

DateInput.displayName = 'DateInput';

export { DateInput };

