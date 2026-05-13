/**
 * zlibjs の BrowserDictionaryLoader 向けシム。
 * zlibjs の IIFE は strict mode で this=undefined になるため、
 * pako で同等の API を提供する。
 */
import { ungzip } from 'pako';

export const Zlib = {
  Gunzip: class Gunzip {
    private _data: Uint8Array;
    constructor(data: Uint8Array) {
      this._data = data;
    }
    decompress(): Uint8Array {
      return ungzip(this._data);
    }
  }
};
