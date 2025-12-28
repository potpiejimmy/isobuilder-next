import React, { useState, useEffect } from 'react';

interface BmpProps {
  selectedValues?: number[];
  startNo?: number;
  onChange?: (values: number[]) => void;
}

export const BmpComponent: React.FC<BmpProps> = ({ 
  selectedValues: initialSelectedValues = [], 
  startNo = 1,
  onChange 
}) => {
  const [bitmap, setBitmap] = useState<number[]>([]);
  const [selectedValues, setSelectedValues] = useState<number[]>(initialSelectedValues);

  useEffect(() => {
    const newBitmap: number[] = [];
    for (let i = 0; i < 64; i++) {
      newBitmap[i] = startNo + i;
    }
    setBitmap(newBitmap);
  }, [startNo]);

  useEffect(() => {
    setSelectedValues(initialSelectedValues);
  }, [initialSelectedValues]);

  const handleCheckboxChange = (value: number) => {
    let newSelectedValues: number[];
    if (selectedValues.includes(value)) {
      newSelectedValues = selectedValues.filter(v => v !== value);
    } else {
      newSelectedValues = [...selectedValues, value];
    }
    
    newSelectedValues.sort((a, b) => a - b);
    setSelectedValues(newSelectedValues);
//    console.log("Selected bitmap values:", newSelectedValues);
    
    if (onChange) {
      onChange(newSelectedValues);
    }
  };

  return (
    <table className="border-collapse">
      <thead>
        <tr>
          {bitmap.map((i) => (
            <th key={`header-${i}`} className="align-bottom text-center text-[0.85em]">
              <span className="[writing-mode:vertical-rl] rotate-180 whitespace-nowrap inline-block">{i}</span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          {bitmap.map((i) => (
            <td key={`cell-${i}`} className="border-none p-0 text-center">
              <input
                type="checkbox"
                name="groupname"
                value={i}
                checked={selectedValues.includes(i)}
                onChange={() => handleCheckboxChange(i)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  );
};

export default BmpComponent;
