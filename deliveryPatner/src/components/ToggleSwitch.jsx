import React from 'react';

const ToggleSwitch = ({
  id,
  checked,
  onChange,
  label,
  disabled = false,
  className = '',
  labelClassName = '',
  switchClassName = '',
  onColor = 'bg-green-500',
  offColor = 'bg-red-500'
}) => {
  return (
    <label 
      className={`flex items-center cursor-pointer select-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      htmlFor={id}
    >
      <div className={`relative ${switchClassName}`}>
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="sr-only"
        />
        <div
          className={`block w-10 h-6 rounded-full transition-colors ${
            checked ? onColor : offColor
          }`}
        ></div>
        <div
          className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
            checked ? 'translate-x-4' : ''
          }`}
        ></div>
      </div>
      {label && (
        <span className={`ml-2 text-sm font-medium ${labelClassName}`}>
          {label}
        </span>
      )}
    </label>
  );
};

export default ToggleSwitch; 