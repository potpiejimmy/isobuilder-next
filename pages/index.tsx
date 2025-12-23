import { useState } from 'react';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import { parseAndConvertPastedString } from '../utils/ebcdic';
import { BmpComponent } from '@/components/bmp';

export default function Home() {
  const [hexValue, setHexValue] = useState('01000000000000000000');
  const [messageType, setMessageType] = useState('0100');
  const [bmp0, setBmp0] = useState<number[]>([]);
  const [bmp1, setBmp1] = useState<number[]>([]);
  const [bmps, setBmps] = useState<number[]>([]);

  const handleHexChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    // Only allow hexadecimal characters (0-9, A-F, a-f)
    if (/^[0-9A-Fa-f]*$/.test(value)) {
      setHexValue(value);
      // Update message type from first 4 characters
      setMessageType(value.substring(0, 4).padEnd(4, '0'));
    }
  };

  const handleMessageTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    // Only allow digits 0-9 and max 4 characters
    if (/^[0-9]*$/.test(value) && value.length <= 4) {
      const paddedValue = value.padEnd(4, '0');
      setMessageType(value);
      // Update hexValue with new message type
      setHexValue(paddedValue + hexValue.substring(4));
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pastedText = event.clipboardData.getData('text');
    console.log("Pasted text:", pastedText);

    // Convert the pasted text to pure hex
    const convertedHex = parseAndConvertPastedString(pastedText);
    console.log("Converted to hex:", convertedHex);

    // Get current cursor position
    const target = event.target as HTMLInputElement;
    const start = target.selectionStart || 0;
    const end = target.selectionEnd || 0;

    // Insert converted hex at cursor position
    const newValue = hexValue.substring(0, start) + convertedHex + hexValue.substring(end);
    setHexValue(newValue);
    // Update message type from first 4 characters
    setMessageType(newValue.substring(0, 4).padEnd(4, '0'));
  };

  return (
    <div className="flex flex-col gap-3 m-5">
        <Paper>
          <div className="p-5 flex flex-col gap-2">
            <h1 className="text-xl font-bold">ISO 8583 Message</h1>
            <TextField 
              id="outlined-basic" 
              className="w-full" 
              label="HEX" 
              variant="outlined" 
              value={hexValue}
              onChange={handleHexChange}
              onPaste={handlePaste}
            />
            <span className='text-sm text-gray-500'>Hint: You can paste ASCII text with embedded hex blocks like &lt;0x1A3F&gt; and it will convert to EBCDIC hex.</span>
            Length: {hexValue.length / 2} bytes
          </div>
        </Paper>
        <Paper>
          <div className="p-5 flex flex-col gap-2">
            <h1 className="text-xl font-bold">Message Editor</h1>
            <table className="main">
              <tbody>
                <tr>
                  <td>Message Type</td>
                  <td>
                    <TextField 
                      variant='standard'
                      value={messageType}
                      onChange={handleMessageTypeChange}
                      slotProps={{
                        htmlInput: {
                          maxLength: 4,
                          pattern: '[0-9]*'
                        }
                      }}
                      placeholder="0000"
                      sx={{ width: '3rem' }}
                    />
                  </td>
                </tr>
                <tr>
                  <td>BMP 0<br/>Primary BMP</td>
                  <td>
                    <BmpComponent selectedValues={bmp0}></BmpComponent>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Paper>
        <Paper><div className="p-5">ISO 8583 Message Builder and Parser</div></Paper>
    </div>
  );
}
