import React from 'react';

interface Option {
  value: string;
  label: string;
}

interface Props extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: Option[];
}

export const FormSelect = ({ label, options, ...props }: Props) => {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-bold text-slate-700">{label}</label>
      <select
        {...props}
        className="p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-orzu outline-none transition-all cursor-pointer text-slate-800"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};