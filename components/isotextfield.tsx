import React, { useState, useEffect } from 'react';
import TextField, { TextFieldProps } from '@mui/material/TextField';

interface IsoTextFieldProps extends Omit<TextFieldProps, 'onChange' | 'value'> {
  maxLength?: number;
  value?: string;
  fullWidth?: boolean;
  onChange?: (value: string) => void;
}

const IsoTextField: React.FC<IsoTextFieldProps> = ({ 
  maxLength, 
  onChange,
  value,
  fullWidth = false,
  ...otherProps 
}) => {

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
    
    // Emit immediately if configured
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <TextField
      {...otherProps}
      value={value}
      onChange={handleChange}
      slotProps={{
        ...otherProps.slotProps,
        htmlInput: {
          ...otherProps.slotProps?.htmlInput,
          maxLength: maxLength,
        },
      }}
      sx={{
        ...otherProps.sx,
        width: fullWidth ? '100%' : `${maxLength ? maxLength+2  : 100}ch`,
        '& input': {
          fontFamily: 'monospace',
        },
      }}
    />
  );
};

export default IsoTextField;
