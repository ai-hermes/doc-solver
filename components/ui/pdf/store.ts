import { atom } from 'jotai'
import { IHighlight } from '@/components/ui/react-pdf-highlighter/types';

export const hightlightAtom = atom<IHighlight[]>([]);