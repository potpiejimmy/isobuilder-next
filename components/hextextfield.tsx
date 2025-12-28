import React, { useState, useEffect } from 'react';
import TextField, { TextFieldProps } from '@mui/material/TextField';

interface HexTextFieldProps extends Omit<TextFieldProps, 'onChange' | 'value'> {
  maxLength?: number;
  value?: string;
  emitImmediate?: boolean;
  onChange?: (value: string) => void;
}

const HexTextField: React.FC<HexTextFieldProps> = ({ 
  maxLength, 
  onChange,
  value,
  emitImmediate = false,
  ...otherProps 
}) => {
  const [localValue, setLocalValue] = useState(value || '');

  // Sync local value with external value prop
  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = event.target.value;
    
    // Filter to only allow hexadecimal characters
    newValue = newValue.replace(/[^0-9a-fA-F]/g, '');
    
    // Convert to uppercase
    newValue = newValue.toUpperCase();
    
    // Apply maxLength if specified
    if (maxLength && newValue.length > maxLength) {
      newValue = newValue.slice(0, maxLength);
    }
    
    // Update local state
    setLocalValue(newValue);
    
    // Emit immediately if configured
    if (emitImmediate && onChange) {
      onChange(newValue);
    }
  };

  const handleBlur = () => {
    // Emit value to parent only when losing focus (if not emitting immediately)
    if (!emitImmediate && onChange) {
      onChange(localValue);
    }
  };

  return (
    <TextField
      {...otherProps}
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      slotProps={{
        ...otherProps.slotProps,
        htmlInput: {
          ...otherProps.slotProps?.htmlInput,
          maxLength: maxLength,
        },
      }}
      sx={{
        ...otherProps.sx,
        width: `${maxLength ? maxLength+1 : 100}ch`,
        '& input': {
          fontFamily: 'monospace',
        },
      }}
    />
  );
};

export default HexTextField;
