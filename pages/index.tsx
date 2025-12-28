import { useState } from 'react';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import { parseAndConvertPastedString } from '../utils/ebcdic';
import { BmpComponent } from '@/components/bmp';
import IsoFieldComponent from '@/components/isofield';
import HexTextField from '@/components/hextextfield';

export default function Home() {
  const [hexValue, setHexValue] = useState('01000000000000000000');
  const [messageType, setMessageType] = useState('0100');
  const [bmp0, setBmp0] = useState<number[]>([]);
  const [bmp1, setBmp1] = useState<number[]>([]);
  const [bmps, setBmps] = useState<Record<number,string>>({});

  const isodef: Record<number, {label: string, lenlen?: number, len?: number, len_emv?: number, alpha_emv?: boolean, alpha?: boolean}> = {
     2: {label:"TRACK2PAN", lenlen:2},
     3: {label:"AKZ", len:3},
     4: {label:"AMOUNT", len:6},
     6: {label:"AMOUNT ACQ", len:6},
     7: {label:"DATETIME", len:5},
    11: {label:"TRANSACT NO.", len:3},
    12: {label:"TIME", len:3},
    13: {label:"DATE", len:2},
    14: {label:"EXPIRYDATE", len:2},
    16: {label:"DATE EXCH. RATE", len:2},
    18: {label:"MERCHANTTYPE", len:2},
    20: {label:"COUNTRYCODE", len:2},
    22: {label:"ENTRYMODE", len:2},
    23: {label:"CARDSEQNO", len:2},
    24: {label:"NETWORKID", len:2},
    25: {label:"CONDITIONCODE", len:1},
    26: {label:"MAXPIN", len:1},
    27: {label:"MAXLEN AZREF", len:1},
    28: {label:"ACQUIRER CHARGE", len:5},
    30: {label:"ISSUER CHARGE", len:4},
    32: {label:"ACQUIRER ID", lenlen:2},
    33: {label:"COMPID", lenlen:2},
    34: {label:"TRACK3PAN", lenlen:2},
    35: {label:"TRACK2", lenlen:2},
    36: {label:"SOURCE ACCOUNT", len:5},
    37: {label:"REF NO.", len:6},
    38: {label:"AZREF", len:3, len_emv:6, alpha_emv:true},
    39: {label:"RC", len:1, len_emv:2, alpha_emv:true},
    41: {label:"ATMID", len:4, len_emv:8, alpha_emv:true},
    42: {label:"BANKCODE", len:8, len_emv:15, alpha_emv:true},
    43: {label:"ATMLOCATION", len:40, alpha:true},
    47: {label:"ACQ ACCT DTA", lenlen:3},
    49: {label:"COUNTRYKEY", len:2},
    51: {label:"CURRENCYCODE ISSUER", len:2},
    52: {label:"PAC", len:8},
    53: {label:"SECURITYDATA", len:8},
    54: {label:"SURCHARGE AMOUNT", lenlen:3},
    55: {label:"CHIPDATA", lenlen:3},
    57: {label:"SESSIONKEY", lenlen:3},
    58: {label:"ALT AMOUNT", lenlen:3},
    59: {label:"AUTH ID", lenlen:3},
    60: {label:"ACQ ACCOUNT", lenlen:3},
    61: {label:"ONLINE TIME", lenlen:3},
    62: {label:"TELCODATA", lenlen:3},
    63: {label:"RETRY COUNTER", lenlen:3},
    64: {label:"MAC", len:8},
   110: {label:"SECURITY DATA", lenlen:4},
   128: {label:"MAC2", len:8}
  }

  const fieldLabel = (no: number): string => {
    return isodef[no] ? isodef[no].label : '<unknown>';
  }

  const emv = (): boolean => { // EMV AKZ ...3 or international (ECI)
    return (bmps[3] && bmps[3].endsWith('3')) || !!(messageType && messageType.startsWith('01'));
  }

  const bitmapToHex = (bmp: number[], offset=0) => {
    let res = new Array(64).fill('0');
    for (let i in bmp) {
      res[bmp[i]-1-offset] = '1';
    }
    return BigInt('0b1'+res.join("")).toString(16).substring(1);
  }

  const hexToBitmap = (hex: string, offset=0) => {
    let bmp = [];
    let res = BigInt('0x1'+hex).toString(2).substring(1);
    for (let i=0; i<64; i++) {
      if (res.charAt(i)=='1') bmp.push(i+offset+1);
    }
    return bmp;
  }

  const build = (useBmp0?: number[], useBmp1?: number[], useBmps?: Record<number,string>) => {
    const currentBmp0 = useBmp0 ?? bmp0;
    const currentBmp1 = useBmp1 ?? bmp1;
    const currentBmps = useBmps ?? bmps;
    //if (this._parsing) return;
    let res = messageType;
    res += bitmapToHex(currentBmp0);
    if (currentBmp0[0]==1) res += bitmapToHex(currentBmp1,64);
    for (let i in currentBmp0) {
      if (currentBmp0[i]>1 && currentBmps[currentBmp0[i]]) res += currentBmps[currentBmp0[i]];
    }
    if (currentBmp0[0]==1) {
      for (let i in currentBmp1) {
        if (currentBmps[currentBmp1[i]]) res += currentBmps[currentBmp1[i]];
      }
    }
    setHexValue(res);
    //this.msgs = [];
  }

  const parse = (msg: string) => {
    //this._parsing = true;
    let offset = 0;
    setMessageType(msg.substr(offset,4));
    offset += 4;
    setBmp0(hexToBitmap(msg.substr(offset,16)));
    offset += 16;
    if (bmp0[0]==1) {
      setBmp1(hexToBitmap(msg.substr(offset,16), 64));
      offset += 16;
    }
    for (let i in bmp0) {
      let no = bmp0[i];
      if (no>1 && isodef[no]) {
        offset = parseField(msg, offset, no);
      }
    }
    if (bmp0[0]==1) {
      for (let i in bmp1) {
        let no = bmp1[i];
        if (isodef[no]) {
          offset = parseField(msg, offset, no);
        }
      }
    } else {
      setBmp1([]);
    }
    //this.msgs = [];
    //if (offset != msg.length) {
    //  this.msgs.push({severity:'error', summary:'Invalid message', detail:'Invalid message length, expected length is '+offset/2});
    //} else {
    //  this.msgs.push({severity:'success', summary:'Message okay', detail:'Message successfully parsed'});
    //}
    //setTimeout(()=>this._parsing = false, 500);
  }

  const parseField = (msg: string, offset: number, no: number) => {
    let len = emv() && isodef[no].len_emv ? isodef[no].len_emv! : isodef[no].len!;
    if (isodef[no].lenlen) {
      let lena = msg.substr(offset, isodef[no].lenlen*2);
      len = parseInt(lena.replace(/[fF]/g,''));
      len += isodef[no].lenlen;
    }
    bmps[no] = msg.substr(offset, len*2);
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
  };

  return (
    <div className="flex flex-col gap-3 m-5">
        <Paper>
          <div className="p-5 flex flex-col gap-2">
            <h1 className="text-xl font-bold">ISO 8583 Message</h1>
            <HexTextField
              className="w-full" 
              label="HEX" 
              variant="outlined" 
              value={hexValue}
              onChange={handleHexChange}
              onPaste={handlePaste}
              emitImmediate={true}
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
                  <td className='text-sm'>BMP 0<br/>Primary BMP</td>
                  <td>
                    <BmpComponent selectedValues={bmp0} onChange={b0=>{setBmp0(b0);build(b0);}}></BmpComponent>
                  </td>
                </tr>
                {bmp0.map(no => (
                  <tr key={`bmp-${no}`}>
                    {no === 1 && <>
                      <td className='text-sm'>BMP 1<br/>Secondary BMP</td>
                      <td><BmpComponent startNo={65} selectedValues={bmp1} onChange={b1=>{setBmp1(b1);build(undefined, b1);}}></BmpComponent></td>
                    </>}
                    {no > 1 && <>
                      <td className='text-sm'>BMP {no}<br/>{fieldLabel(no)}</td>
                      <td><IsoFieldComponent init={bmps[no]} no={no} def={isodef[no]} emv={emv()} onChange={bmpChange}></IsoFieldComponent></td>
                    </>}
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
