import { useState } from 'react';
import Paper from '@mui/material/Paper';
import { parseAndConvertPastedString } from '../utils/ebcdic';
import { BmpComponent } from '@/components/bmp';
import IsoFieldComponent from '@/components/isofield';
import HexTextField from '@/components/isotextfield';
import { Alert } from '@mui/material';

export const isodef: Record<number, {label: string, lenlen?: number, len?: number, len_emv?: number, alpha_emv?: boolean, alpha?: boolean}> = {
     2: {label:"Primary Account Number", lenlen:2},
     3: {label:"Processing Code", len:3},
     4: {label:"Amount, Transaction", len:6},
     5: {label:"Amount, Settlement", len:6},
     6: {label:"Amount, Acquirer", len:6},
     7: {label:"Date and Time, Transmission", len:5},
     8: {label:"Amount, Cardholder Billing Fee", len:4},
     9: {label:"Conv. Rate, Settlement", len:4},
    10: {label:"Conv. Rate, Cardholder Billing", len:4}, 
    11: {label:"System Trace Audit Number", len:3},
    12: {label:"Time, Local Transaction", len:3},
    13: {label:"Date, Local Transaction", len:2},
    14: {label:"Date, Expiration", len:2},
    15: {label:"Date, Settlement", len:2},
    16: {label:"Date, Exchange Rate", len:2},
    17: {label:"Date, Capture", len:2},
    18: {label:"Merchant Type", len:2},
    19: {label:"Acqu. Inst. Country Code", len:2},
    20: {label:"Country Code", len:2},
    21: {label:"Forw. Inst. Country Code", len:2},
    22: {label:"Entry Mode", len:2},
    23: {label:"Card Sequence Number", len:2},
    24: {label:"Network ID", len:2},
    25: {label:"Condition Code", len:1},
    26: {label:"Capture Code, Max PIN", len:1},
    27: {label:"Max. Length AZ Ref.", len:1},
    28: {label:"Acquirer Charge", len:5},
    29: {label:"Settlement Fee", len:5},
    30: {label:"Issuer Charge", len:4},
    31: {label:"Settlement Processing Fee", len:4},
    32: {label:"Acquirer ID", lenlen:2},
    33: {label:"Computer ID", lenlen:2},
    34: {label:"Track 3 PAN", lenlen:2},
    35: {label:"Track 2 Data", lenlen:2},
    36: {label:"Source Account", len:5},
    37: {label:"Ref No.", len:6},
    38: {label:"AZ Ref.", len:3, len_emv:6, alpha_emv:true},
    39: {label:"Response Code", len:1, len_emv:2, alpha_emv:true},
    40: {label:"Service Restriction Code", len:2},
    41: {label:"ATM ID", len:4, len_emv:8, alpha_emv:true},
    42: {label:"Bank Code", len:8, len_emv:15, alpha_emv:true},
    43: {label:"ATM Location", len:40, alpha:true},
    44: {label:"Additional Response Data", lenlen:2, alpha:true},
    45: {label:"Track 1 Data", lenlen:2},
    46: {label:"Additional Data - ISO", lenlen:3},
    47: {label:"Acquirer Account Data", lenlen:3},
    48: {label:"Additional Data - Private", lenlen:3},
    49: {label:"Country Key", len:2},
    50: {label:"Currency Code, Settlement", len:2},
    51: {label:"Currency Code Issuer", len:2},
    52: {label:"PIN / PAC", len:8},
    53: {label:"Security Data", len:8},
    54: {label:"Surcharge Amount", lenlen:3},
    55: {label:"Chip Data", lenlen:3},
    56: {label:"Reserved ISO", lenlen:3},
    57: {label:"Session Key", lenlen:3},
    58: {label:"Alt Amount", lenlen:3},
    59: {label:"Auth ID", lenlen:3},
    60: {label:"Acquirer Account", lenlen:3},
    61: {label:"Online Time", lenlen:3},
    62: {label:"Telco Data", lenlen:3},
    63: {label:"Retry Counter", lenlen:3},
    64: {label:"MAC", len:8},
    65: {label:"Bitmap, Tertiary", len:8},
    66: {label:"Settlement Code", len:1},
    67: {label:"Extended Payment Code", len:1},
    68: {label:"Receiving Inst. Country Code", len:2},
    69: {label:"Settlement Inst. Country Code", len:2},
    70: {label:"Network Management Info Code", len:2},
    71: {label:"Message Number", len:2},
    72: {label:"Last Msg. Number", len:2},
    73: {label:"Action Date", len:3},
    74: {label:"Credits, Number", len:5},
    75: {label:"Credits, Reversal Number", len:5},
    76: {label:"Debits, Number", len:5},
    77: {label:"Debits, Reversal Number", len:5},
    78: {label:"Transfer, Number", len:5},
    79: {label:"Transfer, Reversal Number", len:5},
    80: {label:"Inquiries, Number", len:5},
    81: {label:"Authorizations, Number", len:5},
    82: {label:"Credits, Amount", len:6},
    83: {label:"Credits, Reversal Amount", len:6},
    84: {label:"Debits, Amount", len:6},
    85: {label:"Debits, Reversal Amount", len:6},
    86: {label:"Transfer, Amount", len:8},
    87: {label:"Transfer, Reversal Amount", len:8},
    88: {label:"Inquiries, Amount", len:8},
    89: {label:"Authorizations, Amount", len:8},
    90: {label:"Original Data Elements", len:21},
    91: {label:"File Update Code", len:1},
    92: {label:"File Security Code", len:1},
    93: {label:"Response Indicator", len:3},
    94: {label:"Service Indicator", len:4},
    95: {label:"Replacement Amounts", len:21},
    96: {label:"Message Security Code", len:4},
    97: {label:"Amount, Net Settlement", len:9},
    98: {label:"Payee", lenlen:2, alpha:true},
    99: {label:"Settlement Institution ID", lenlen:2},
   100: {label:"Receiving Inst. ID", lenlen:2},
   101: {label:"File Name", lenlen:2, alpha:true},
   102: {label:"Account ID 1", lenlen:2, alpha:true},
   103: {label:"Account ID 2", lenlen:2, alpha:true},
   104: {label:"Transaction Description", lenlen:3, alpha:true},
   110: {label:"Security Data", lenlen:4},
   128: {label:"MAC2", len:8}
}

export const lenOf = (no: number, emv: boolean): number => {
  let def = isodef[no];
  if (!def || !def.len) return 0;
  return emv && def.len_emv ? def.len_emv : def.len;
};

export const buildLengthField = (no: number,val: string): string => {
  let def = isodef[no];
  if (!def || !def.lenlen) return '';
  const fieldLen = val ? Math.round(val.length / 2) : 0;
  const lens = ('' + (Math.pow(10, def.lenlen) + fieldLen)).substr(1);
  return 'F' + lens.split('').join('F');
};

export default function Home() {
  const [hexValue, setHexValue] = useState('01000000000000000000');
  const [messageType, setMessageType] = useState('0100');
  const [bmp0, setBmp0] = useState<number[]>([]);
  const [bmp1, setBmp1] = useState<number[]>([]);
  const [bmps, setBmps] = useState<Record<number,string>>({});
  const [alert, setAlert] = useState<{severity: 'success' | 'info' | 'warning' | 'error', summary: string, detail: string} | null>(null);

  const fieldLabel = (no: number): string => {
    return isodef[no] ? isodef[no].label : '<unknown>';
  }

  const emv = (useBmp3?: string, useMessageType?: string): boolean => { // EMV AKZ ...3 or international (ECI)
    const currentBmp3 = useBmp3 ?? bmps[3];
    const currentMessageType = useMessageType ?? messageType;
    return (currentBmp3 && currentBmp3.length===6 && currentBmp3.endsWith('3')) || !!(currentMessageType && currentMessageType.startsWith('01'));
  }

  const bitmapToHex = (bmp: number[], offset=0) => {
    let res = new Array(64).fill('0');
    for (let i in bmp) {
      res[bmp[i]-1-offset] = '1';
    }
    return BigInt('0b1'+res.join("")).toString(16).substring(1).toUpperCase();
  }

  const hexToBitmap = (hex: string, offset=0) => {
    let bmp = [];
    let res = BigInt('0x1'+hex).toString(2).substring(1);
    for (let i=0; i<64; i++) {
      if (res.charAt(i)=='1') bmp.push(i+offset+1);
    }
    return bmp;
  }

  const buildField = (val: string, no: number): string => {
    let def = isodef[no];
    let e = buildLengthField(no, val) + (val || '');
    if (e.length % 2) e += '0';
    if (lenOf(no, emv())) {
       while (e.length < lenOf(no, emv()) * 2) e += '00';
    }
    return e;
  }

  const build = (useBmp0?: number[], useBmp1?: number[], useBmps?: Record<number,string>) => {
    const currentBmp0 = useBmp0 ?? bmp0;
    const currentBmp1 = useBmp1 ?? bmp1;
    const currentBmps = useBmps ?? bmps;
    let res = messageType;
    res += bitmapToHex(currentBmp0);
    if (currentBmp0[0]==1) res += bitmapToHex(currentBmp1,64);
    for (let i in currentBmp0) {
      if (currentBmp0[i]>1) res += buildField(currentBmps[currentBmp0[i]],currentBmp0[i]);
    }
    if (currentBmp0[0]==1) {
      for (let i in currentBmp1) {
        res += buildField(currentBmps[currentBmp1[i]],currentBmp1[i]);
      }
    }
    setHexValue(res);
    setAlert(null);
  }

  const parse = (msg: string) => {
    let offset = 0;
    setMessageType(msg.substr(offset,4));
    offset += 4;
    let currentBmp0 = hexToBitmap(msg.substr(offset,16));
    let currentBmp1: number[] = [];
    setBmp0(currentBmp0);
    offset += 16;
    if (currentBmp0[0]==1) {
      currentBmp1 = hexToBitmap(msg.substr(offset,16), 64);
      setBmp1(currentBmp1);
      offset += 16;
    }
    let parsedBmps: Record<number,string> = {};
    for (let i in currentBmp0) {
      let no = currentBmp0[i];
      if (no>1 && isodef[no]) {
        offset = parseField(msg, offset, no, parsedBmps);
      }
    }
    if (currentBmp0[0]==1) {
      for (let i in currentBmp1) {
        let no = currentBmp1[i];
        if (isodef[no]) {
          offset = parseField(msg, offset, no, parsedBmps);
        }
      }
    } else {
      setBmp1([]);
    }
    setBmps(parsedBmps);
    setAlert(null);
    if (offset != msg.length) {
     setAlert({severity:'error', summary:'Invalid message', detail:'Invalid message length, expected length is '+offset/2});
    } else {
     setAlert({severity:'success', summary:'Message okay', detail:'Message successfully parsed'});
    }
  }

  const parseField = (msg: string, offset: number, no: number, parsedBmps: Record<number,string>) => {
    let len = emv(parsedBmps[3], msg.substr(offset,4)) && isodef[no].len_emv ? isodef[no].len_emv! : isodef[no].len!;
    if (isodef[no].lenlen) {
      let lena = msg.substr(offset, isodef[no].lenlen*2);
      len = parseInt(lena.replace(/[fF]/g,''));
      offset += isodef[no].lenlen * 2;
    }
    parsedBmps[no] = msg.substr(offset, len*2);
    offset += len*2;
    return offset;
  }

  const bmpChange = (event: { no: number; val: string }) => {
    bmps[event.no] = event.val;
    build(undefined, undefined, bmps);
  }

  const handleHexChange = (value: string) => {
    setHexValue(value);
    // Update message type from first 4 characters
    setMessageType(value.substring(0, 4).padEnd(4, '0'));
    parse(value);
  };

  const handleMessageTypeChange = (value: string) => {
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
    parse(newValue);
  };

  return (
    <div className="flex flex-col gap-3 m-5">
        {alert && <Alert severity={alert.severity}>
          <strong>{alert.summary}:</strong> {alert.detail}
        </Alert>}
        <Paper>
          <div className="p-5 flex flex-col gap-2">
            <h1 className="text-xl font-bold">ISO 8583 Message</h1>
            <HexTextField
              className="w-full" 
              label="HEX" 
              fullWidth={true}
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
            <table className="border-collapse main">
              <tbody>
                <tr>
                  <td className='text-sm'>Message Type</td>
                  <td>
                    <HexTextField variant='standard' value={messageType} onChange={handleMessageTypeChange}
                      maxLength={4}
                      placeholder="0000"
                    />
                  </td>
                </tr>
                <tr>
                  <td className='text-sm'>BMP 0<br/>Bitmap, Primary</td>
                  <td>
                    <BmpComponent selectedValues={bmp0} onChange={b0=>{setBmp0(b0);build(b0);}}></BmpComponent>
                  </td>
                </tr>
                {bmp0.map(no => (
                  <tr key={`bmp-${no}`}>
                    {no === 1 && <>
                      <td className='text-sm'>BMP 1<br/>Bitmap, Secondary</td>
                      <td><BmpComponent startNo={65} selectedValues={bmp1} onChange={b1=>{setBmp1(b1);build(undefined, b1);}}></BmpComponent></td>
                    </>}
                    {no > 1 && <>
                      <td className='text-sm'>
                        BMP {no}<br/>{fieldLabel(no)}
                        {no===3 && emv() && <div><img width="32" src="emvchip.png"/></div>}
                      </td>
                      <td><IsoFieldComponent init={bmps[no]} no={no} def={isodef[no]} emv={emv()} onChange={bmpChange}></IsoFieldComponent></td>
                    </>}
                  </tr>
                ))}
                {bmp1.map(no => (
                  <tr key={`bmp-${no}`}>
                    <td className='text-sm'>BMP {no}<br/>{fieldLabel(no)}</td>
                    <td><IsoFieldComponent init={bmps[no]} no={no} def={isodef[no]} emv={emv()} onChange={bmpChange}></IsoFieldComponent></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Paper>
        <Paper><div className="p-5">ISO 8583 Message Builder and Parser</div></Paper>
    </div>
  );
}
