/**
 * zlibjs の BrowserDictionaryLoader 向けシム。
 * zlibjs の IIFE は strict mode で this=undefined になるため、
 * pako で同等の API を提供する。
 */
import { ungzip } from 'pako';

export const Zlib = {
  Gunzip: class Gunzip {
    constructor(data) {
      this._data = data;
    }
    decompress() {
      return ungzip(this._data);
    }
  }
};
