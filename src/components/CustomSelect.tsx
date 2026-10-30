"use client";

import React, { useState, useRef, useEffect } from "react";

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  id: string;
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string | null;
  placeholder?: string;
}

export default function CustomSelect({
  id,
  label,
  options,
  value,
  onChange,
  required,
  error,
  placeholder = "Select an option",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropup, setIsDropup] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    if (!isOpen) {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        if (spaceBelow < 250 && spaceAbove > spaceBelow) {
          setIsDropup(true);
        } else {
          setIsDropup(false);
        }
      }
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className="mb-4 last:mb-0">
      <label htmlFor={id} className="block text-[13px] font-semibold text-text mb-1.5">
        {label} {required && <span className="text-error ml-[2px]">*</span>}
      </label>
      
      {}
      <select
        id={id}
        className="hidden"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        aria-hidden="true"
        tabIndex={-1}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <div
        ref={wrapperRef}
        className={`relative select-none w-full ${isOpen ? "open" : ""} ${
          isDropup ? "dropup" : ""
        }`}
      >
        <div
          ref={triggerRef}
          onClick={toggleDropdown}
          className={`w-full p-[12px_14px] border-[1.5px] border-border rounded-sm font-sans text-[15px] bg-surface cursor-pointer flex justify-between items-center transition-all duration-300 hover:border-text-muted
            ${value ? "text-text" : "text-text-muted"}
            ${isOpen ? "border-border-focus -translate-y-[1px] shadow-[0_4px_12px_rgba(0,0,0,0.05),0_0_0_3px_rgba(79,70,229,0.1)]" : "focus:border-border-focus focus:-translate-y-[1px] focus:shadow-[0_4px_12px_rgba(0,0,0,0.05),0_0_0_3px_rgba(79,70,229,0.1)]"}
          `}
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={`${id}-listbox`}
          aria-labelledby={`${id}-label`}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggleDropdown();
            }
          }}
        >
          {selectedOption ? selectedOption.label : placeholder}
          <div
            className={`w-4 h-4 bg-no-repeat bg-contain transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e\")",
            }}
          />
        </div>

        <div
          id={`${id}-listbox`}
          role="listbox"
          className={`absolute left-0 right-0 bg-white border border-border rounded-sm shadow-lg z-50 max-h-[250px] overflow-y-auto transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
            ${
              isOpen
                ? "opacity-100 visible translate-y-0"
                : "opacity-0 invisible " + (isDropup ? "translate-y-[10px]" : "translate-y-[-10px]")
            }
            ${isDropup ? "bottom-full mb-1" : "top-full mt-1"}
          `}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <div
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                className={`p-[12px_14px] text-[14px] cursor-pointer transition-colors
                  ${
                    isSelected
                      ? "bg-primary text-white font-semibold"
                      : "text-text hover:bg-primary-bg hover:text-primary"
                  }
                `}
                onClick={() => handleSelect(opt.value)}
              >
                {opt.label}
              </div>
            );
          })}
        </div>
      </div>

      {error && (
        <div
          className="text-[12px] text-error mt-1 flex items-center gap-1"
          role="alert"
        >
          {error}
        </div>
      )}
    </div>
  );
}
