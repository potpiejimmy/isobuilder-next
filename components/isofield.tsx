import TextField from '@mui/material/TextField';
import React, { useState, useEffect } from 'react';

interface IsoFieldProps {
  def?: any;
  no?: number;
  emv?: boolean;
  init?: string;
  onChange?: (data: { no: number; val: string }) => void;
}

export const IsoFieldComponent: React.FC<IsoFieldProps> = ({ 
  def, 
  no, 
  emv = false, 
  init, 
  onChange 
}) => {
  const [_val, setVal] = useState<string>('');
  const [_parsing, setParsing] = useState<boolean>(false);

  // EBCDIC conversion table
  const e2a = [
    0,  1,  2,  3,156,  9,134,127,151,141,142, 11, 12, 13, 14, 15,
   16, 17, 18, 19,157,133,  8,135, 24, 25,146,143, 28, 29, 30, 31,
  128,129,130,131,132, 10, 23, 27,136,137,138,139,140,  5,  6,  7,
  144,145, 22,147,148,149,150,  4,152,153,154,155, 20, 21,158, 26,
   32,160,161,162,163,164,165,166,167,168, 91, 46, 60, 40, 43, 33,
   38,169,170,171,172,173,174,175,176,177, 93, 36, 42, 41, 59, 94,
   45, 47,178,179,180,181,182,183,184,185,124, 44, 37, 95, 62, 63,
  186,187,188,189,190,191,192,193,194, 96, 58, 35, 64, 39, 61, 34,
  195, 97, 98, 99,100,101,102,103,104,105,196,197,198,199,200,201,
  202,106,107,108,109,110,111,112,113,114,203,204,205,206,207,208,
  209,126,115,116,117,118,119,120,121,122,210,211,212,213,214,215,
  216,217,218,219,220,221,222,223,224,225,226,227,228,229,230,231,
  123, 65, 66, 67, 68, 69, 70, 71, 72, 73,232,233,234,235,236,237,
  125, 74, 75, 76, 77, 78, 79, 80, 81, 82,238,239,240,241,242,243,
   92,159, 83, 84, 85, 86, 87, 88, 89, 90,244,245,246,247,248,249,
   48, 49, 50, 51, 52, 53, 54, 55, 56, 57,250,251,252,253,254,255
  ];

  // Initialize value from init prop
  useEffect(() => {
    if (_parsing) return;
    let v = '';
    if (init) {
      v = init;
      if (def && def.lenlen) {
        // remove length field:
        v = v.substr(def.lenlen * 2);
      }
    }
    setVal(v);
    setTimeout(() => emitVal(v), 0);
  }, [init, def]);

  const mask = (): string => {
    if (!def) return '';
    return '00'.repeat(len());
  };

  const lengthField = (): string => {
    if (!def || !def.lenlen) return '';
    const fieldLen = _val ? Math.round(_val.length / 2) : 0;
    const lens = ('' + (Math.pow(10, def.lenlen) + fieldLen)).substr(1);
    return 'F' + lens.split('').join('F');
  };

  const len = (): number => {
    if (!def || !def.len) return 0;
    return emv && def.len_emv ? def.len_emv : def.len;
  };

  const valAlpha = (): string => {
    return ebcdicHexToAscii(_val);
  };

  const emitVal = (v: string) => {
    let e = lengthField();
    e += v.replace(/_/g, '');
    if (e.length % 2) e += '0';
    if (len()) {
      while (e.length < len() * 2) e += def.alpha ? '40' : '00';
    }
    if (onChange) {
      onChange({ no: no!, val: e });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParsing(true);
    const newVal = e.target.value;
    setVal(newVal);
    emitVal(newVal);
    setTimeout(() => setParsing(false), 500);
  };

  // Utility functions
  const ebcdicHexToAscii = (hexstring: string): string => {
    try {
      const buffer = Buffer.from(hexstring, 'hex');
      return ebcdicToAscii(buffer);
    } catch {
      return '';
    }
  };

  const ebcdicToAscii = (buf: Buffer): string => {
    const result = new Uint8Array(buf.length);
    for (let i = 0; i < buf.length; i++) {
      result[i] = e2a[buf[i]];
    }
    return Buffer.from(result).toString();
  };

  const asciiToEbcdic = (input: string): Buffer => {
    const result = [];
    for (let i = 0; i < input.length; i++) {
      for (let j = 0; j < e2a.length; j++) {
        if (e2a[j] === input.charCodeAt(i)) {
          result.push(j);
          break;
        }
      }
    }
    return Buffer.from(result);
  };

  // Helper function to create a mask pattern for the input
  const createMaskPattern = (maskStr: string): string => {
    return maskStr.replace(/a/g, '[A-Fa-f0-9]');
  };

  return (
    <div className="iso-field">
      {len() > 0 && (
        <TextField variant='standard' 
          sx={{ width: (len() * 2 + 2) + 'ch' }}
          value={_val}
          onChange={handleChange}
          slotProps={{
            htmlInput: {
              maxLength: len() * 2,
              pattern: '[A-Fa-f0-9]*'
            }
          }}
          placeholder={mask()}
          style={{ fontFamily: 'monospace' }}
        />
      )}
      
      {def && def.lenlen && (
        <div className='flex flex-row gap-1 items-center'>
          <div>{lengthField()}</div>
          <TextField variant='standard' 
            sx={{ width: 100 + 'ch' }}
            value={_val}
            onChange={handleChange}
            slotProps={{
              htmlInput: {
                pattern: '[A-Fa-f0-9]*'
              }
            }}
            placeholder="Enter hex"
            style={{ fontFamily: 'monospace' }}
          />
          {_val.length % 2 === 1 && <span> 0</span>}
        </div>
      )}
      
      {def && (def.alpha || (emv && def.alpha_emv)) && (
        <div>{valAlpha()}</div>
      )}
    </div>
  );
};

export default IsoFieldComponent;
