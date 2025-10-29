// types.ts
export interface SelectOption {
  value: string | number;
  label: string;
  badge?: string;
  badgeVariant?: string;
}

export interface LazySelectProps {
  loadOptions: () => Promise<SelectOption[]>;
  value?: string | number | (string | number)[];
  onChange: (value: string | number | (string | number)[]) => void;
  placeholder?: string;
  disabled?: boolean;
  isMulti?: boolean;
  id?: string;
  className?: string;
}

// LazySelect.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Form, Spinner, Dropdown } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const LazySelect: React.FC<LazySelectProps> = ({
  loadOptions,
  value,
  onChange,
  placeholder = "Select an option...",
  disabled = false,
  isMulti = false,
  id,
  className = ""
}) => {
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load options when dropdown is opened
  const handleToggle = async (isOpen: boolean): Promise<void> => {
    setIsOpen(isOpen);
    
    if (isOpen && !hasLoaded && !isLoading) {
      setIsLoading(true);
      try {
        const loadedOptions = await loadOptions();
        setOptions(loadedOptions);
        setHasLoaded(true);
      } catch (error) {
        console.error('Error loading options:', error);
        setOptions([]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSelect = (selectedValue: string | number): void => {
    if (isMulti) {
      const currentValue = Array.isArray(value) ? value : [];
      const newValue = currentValue.includes(selectedValue)
        ? currentValue.filter(v => v !== selectedValue)
        : [...currentValue, selectedValue];
      onChange(newValue);
    } else {
      onChange(selectedValue);
      setIsOpen(false);
    }
  };

  const getSelectedLabel = (): string => {
    if (isMulti && Array.isArray(value) && value.length > 0) {
      const selectedLabels = value.map(val => {
        const option = options.find(opt => opt.value === val);
        return option ? option.label : String(val);
      });
      return selectedLabels.join(', ');
    }
    
    if (!isMulti && value !== undefined && value !== null && value !== '') {
      const option = options.find(opt => opt.value === value);
      return option ? option.label : String(value);
    }
    
    return placeholder;
  };

  const isSelected = (optionValue: string | number): boolean => {
    if (isMulti) {
      return Array.isArray(value) && value.includes(optionValue);
    }
    return value === optionValue;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <Dropdown 
      show={isOpen} 
      onToggle={handleToggle}
      ref={dropdownRef}
      className={`w-100 ${className}`}
    >
      <Dropdown.Toggle 
        variant="outline-secondary" 
        className="w-100 d-flex justify-content-between align-items-center text-start"
        disabled={disabled || isLoading}
        id={id}
      >
        <span className="text-truncate">{getSelectedLabel()}</span>
        {isLoading && (
          <Spinner animation="border" size="sm" className="ms-2" />
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu className="w-100" style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {isLoading ? (
          <Dropdown.Item disabled>
            <div className="d-flex justify-content-center align-items-center">
              <Spinner animation="border" size="sm" className="me-2" />
              Loading options...
            </div>
          </Dropdown.Item>
        ) : options.length === 0 ? (
          <Dropdown.Item disabled>No options available</Dropdown.Item>
        ) : (
          options.map((option) => (
            <Dropdown.Item
              key={option.value}
              onClick={() => handleSelect(option.value)}
              active={isSelected(option.value)}
              className="d-flex align-items-center"
            >
              {isMulti && (
                <Form.Check
                  type="checkbox"
                  checked={isSelected(option.value)}
                  readOnly
                  className="me-2"
                />
              )}
              <span className="flex-grow-1">{option.label}</span>
              {option.badge && (
                <span className={`badge ${option.badgeVariant || 'bg-secondary'} ms-2`}>
                  {option.badge}
                </span>
              )}
            </Dropdown.Item>
          ))
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default LazySelect;