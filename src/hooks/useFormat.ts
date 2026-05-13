import { useState } from 'react';

const STORAGE_KEY = 'pokecham_format';

export interface Format {
  id: string;
  label: string;
}

export const FORMATS: Format[] = [
  { id: 'ou',                   label: 'シングル OU' },
  { id: 'ubers',                label: 'Ubers' },
  { id: 'doublesou',            label: 'ダブル OU' },
  { id: 'vgc2025',              label: 'VGC 2025' },
  { id: 'battlestadiumsingles', label: 'バトスタ' },
];

export function useFormat() {
  const [format, setFormatState] = useState<string>(
    () => localStorage.getItem(STORAGE_KEY) || 'ou'
  );

  const setFormat = (id: string) => {
    localStorage.setItem(STORAGE_KEY, id);
    setFormatState(id);
  };

  return { format, setFormat };
}
