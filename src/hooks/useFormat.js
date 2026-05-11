import { useState } from 'react';

const STORAGE_KEY = 'pokecham_format';

export const FORMATS = [
  { id: 'ou',                   label: 'シングル OU' },
  { id: 'ubers',                label: 'Ubers' },
  { id: 'doublesou',            label: 'ダブル OU' },
  { id: 'vgc2025',              label: 'VGC 2025' },
  { id: 'battlestadiumsingles', label: 'バトスタ' },
];

export function useFormat() {
  const [format, setFormatState] = useState(
    () => localStorage.getItem(STORAGE_KEY) || 'ou'
  );

  const setFormat = (id) => {
    localStorage.setItem(STORAGE_KEY, id);
    setFormatState(id);
  };

  return { format, setFormat };
}
