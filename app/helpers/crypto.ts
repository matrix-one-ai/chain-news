export function hexStringToArrayBuffer(hexString: string): ArrayBuffer {
    const bytes = new Uint8Array(hexString.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    return bytes.buffer;
  }
