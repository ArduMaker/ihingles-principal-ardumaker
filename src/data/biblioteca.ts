import { BibliotecaDocument, BibliotecaUnit } from '@/types';

// Mock data for biblioteca documents — reemplazado con los valores reales del front viejo
const mockDocuments: BibliotecaDocument[] = [
  {
    id: 'g1',
    title: 'Resumen Situaciones Laborales',
    subtitle: '',
    description: 'Resumen con material de apoyo sobre situaciones laborales.',
    type: 'pdf',
    url: 'https://drive.google.com/file/d/1mj-p0N6F64FWiqxQugHFkzERnw5jPmlY/view?',
    unitId: 'general',
    unitName: 'General',
    updatedAt: '01/01/2024',
    isFavorite: false,
  },
  {
    id: 'g2',
    title: 'Resumen Situaciones Académicas',
    subtitle: '',
    description: 'Resumen con material de apoyo sobre situaciones académicas.',
    type: 'pdf',
    url: 'https://drive.google.com/file/d/1hhKgnBP1RZpJhpbxCsU9mXM2Az_Ihghg/view?',
    unitId: 'general',
    unitName: 'General',
    updatedAt: '01/01/2024',
    isFavorite: false,
  },
  {
    id: 'g3',
    title: 'Resumen Situaciones Socio-Turísticas',
    subtitle: '',
    description: 'Resumen con material de apoyo sobre situaciones socio-turísticas.',
    type: 'pdf',
    url: 'https://drive.google.com/file/d/1zYATtjR6OnT7ZL7nJGt_TCucGvtL64Ms/view?',
    unitId: 'general',
    unitName: 'General',
    updatedAt: '01/01/2024',
    isFavorite: false,
  },
  {
    id: 'g4',
    title: 'Skill Level Summaries',
    subtitle: '',
    description: 'Documentos resumen por nivel de habilidad.',
    type: 'pdf',
    url: 'https://drive.google.com/file/d/1kSzgzineu3G0c30vPUihQWU6u5FS7krm/view',
    unitId: 'general',
    unitName: 'General',
    updatedAt: '01/01/2024',
    isFavorite: false,
  },
  {
    id: 'g5',
    title: 'Reglas de Acentuación',
    subtitle: '',
    description: 'Guía de reglas de acentuación en inglés y ejemplos.',
    type: 'pdf',
    url: 'https://drive.google.com/file/d/1Lh1QYqmZKIRskb6lGX35pprlyxvMTZv8/view',
    unitId: 'general',
    unitName: 'General',
    updatedAt: '01/01/2024',
    isFavorite: false,
  },

  { id: '4-1', title: 'FÓRMULAS Present Simple', subtitle: '', description: 'Apuntes y fórmulas sobre Present Simple.', type: 'pdf', url: 'https://drive.google.com/file/d/1-oikIKXMAEGcHuV2c4cg3JHKPFHuAkUI/view?usp=share_link', unitId: '4', unitName: 'Unidad 4', updatedAt: '01/01/2024', isFavorite: false },
  { id: '5-1', title: 'FÓRMULAS Present Continuous', subtitle: '', description: 'Apuntes y fórmulas sobre Present Continuous.', type: 'pdf', url: 'https://drive.google.com/file/d/1ClCFdFtE7BFuenOClYYs3J9KOzgrvN0H/view?usp=share_link', unitId: '5', unitName: 'Unidad 5', updatedAt: '01/01/2024', isFavorite: false },
  { id: '6-1', title: 'FÓRMULAS Past Simple', subtitle: '', description: 'Apuntes y fórmulas sobre Past Simple.', type: 'pdf', url: 'https://drive.google.com/file/d/1TweSDxzqW9ac49uH0CEef0ViKs481Ztx/view?usp=share_link', unitId: '6', unitName: 'Unidad 6', updatedAt: '01/01/2024', isFavorite: false },
  { id: '7-1', title: 'FÓRMULAS Past Continuous', subtitle: '', description: 'Apuntes y fórmulas sobre Past Continuous.', type: 'pdf', url: 'https://drive.google.com/file/d/1ubik3zbJ-ImN0Aete89zCbUksILNVvLD/view?usp=share_link', unitId: '7', unitName: 'Unidad 7', updatedAt: '01/01/2024', isFavorite: false },
  { id: '11-1', title: 'FÓRMULAS Present Perfect Simple', subtitle: '', description: 'Apuntes y fórmulas sobre Present Perfect Simple.', type: 'pdf', url: 'https://drive.google.com/file/d/1OyGx6aerv3A2RrGokJV0ce_ZaAHEz-6u/view?usp=share_link', unitId: '11', unitName: 'Unidad 11', updatedAt: '01/01/2024', isFavorite: false },
  { id: '12-1', title: 'FÓRMULAS Present Perfect Continuous', subtitle: '', description: 'Apuntes y fórmulas sobre Present Perfect Continuous.', type: 'pdf', url: 'https://drive.google.com/file/d/17QSH6JXWlk9Sn3UU-l4rvkoAYnv1kZ2t/view?usp=share_link', unitId: '12', unitName: 'Unidad 12', updatedAt: '01/01/2024', isFavorite: false },
  { id: '14-1', title: 'FÓRMULAS Past Perfect Simple', subtitle: '', description: 'Apuntes y fórmulas sobre Past Perfect Simple.', type: 'pdf', url: 'https://drive.google.com/file/d/1_i-ZipRd8H4zOORQzwrmZSxsZaXr3dDD/view?usp=share_link', unitId: '14', unitName: 'Unidad 14', updatedAt: '01/01/2024', isFavorite: false },
  { id: '15-1', title: 'FÓRMULAS Past Perfect Continuous', subtitle: '', description: 'Apuntes y fórmulas sobre Past Perfect Continuous.', type: 'pdf', url: 'https://drive.google.com/file/d/1M_Gh8NNcH_jn2zHVz90S6OdLSIiiCetU/view?usp=share_link', unitId: '15', unitName: 'Unidad 15', updatedAt: '01/01/2024', isFavorite: false },
  { id: '18-1', title: 'FÓRMULAS Future Simple', subtitle: '', description: 'Apuntes y fórmulas sobre Future Simple.', type: 'pdf', url: 'https://drive.google.com/file/d/1im7RwuW1gLgBNetXvRPaxkvW0o_0lgzH/view?usp=share_link', unitId: '18', unitName: 'Unidad 18', updatedAt: '01/01/2024', isFavorite: false },
  { id: '27-1', title: 'FÓRMULAS Future Continuous', subtitle: '', description: 'Apuntes y fórmulas sobre Future Continuous.', type: 'pdf', url: 'https://drive.google.com/file/d/1OiDRTIMkFd_N3F46X32reEH3BS-ovFDk/view?usp=share_link', unitId: '27', unitName: 'Unidad 27', updatedAt: '01/01/2024', isFavorite: false },
  { id: '28-1', title: 'FÓRMULAS Future Perfect Simple', subtitle: '', description: 'Apuntes y fórmulas sobre Future Perfect Simple.', type: 'pdf', url: 'https://drive.google.com/file/d/1tWqXbf7xB1UeQqMtDlLKshZqOBjo2m-q/view?usp=share_link', unitId: '28', unitName: 'Unidad 28', updatedAt: '01/01/2024', isFavorite: false },
  { id: '31-1', title: 'FÓRMULAS Future Perfect Continuous', subtitle: '', description: 'Apuntes y fórmulas sobre Future Perfect Continuous.', type: 'pdf', url: 'https://drive.google.com/file/d/1QfpbQ7iXHC8m-Owruvf00oTp89STiWbs/view?usp=share_link', unitId: '31', unitName: 'Unidad 31', updatedAt: '01/01/2024', isFavorite: false },
  { id: '39-1', title: 'London Underground Map', subtitle: '', description: 'Mapa del metro de Londres.', type: 'pdf', url: 'https://drive.google.com/file/d/1XugbnXDCqz9fXOa_3VJWNl4cAKDH0lKd/view', unitId: '39', unitName: 'Unidad 39', updatedAt: '01/01/2024', isFavorite: false },
];

// Mock data for units — unidades reales y counts según front viejo
const mockUnits: BibliotecaUnit[] = [
  { id: 'general', name: 'General', documentCount: 5 },
  { id: '4', name: 'Unidad 4', documentCount: 1 },
  { id: '5', name: 'Unidad 5', documentCount: 1 },
  { id: '6', name: 'Unidad 6', documentCount: 1 },
  { id: '7', name: 'Unidad 7', documentCount: 1 },
  { id: '11', name: 'Unidad 11', documentCount: 1 },
  { id: '12', name: 'Unidad 12', documentCount: 1 },
  { id: '14', name: 'Unidad 14', documentCount: 1 },
  { id: '15', name: 'Unidad 15', documentCount: 1 },
  { id: '18', name: 'Unidad 18', documentCount: 1 },
  { id: '27', name: 'Unidad 27', documentCount: 1 },
  { id: '28', name: 'Unidad 28', documentCount: 1 },
  { id: '31', name: 'Unidad 31', documentCount: 1 },
  { id: '39', name: 'Unidad 39', documentCount: 1 },
];

export const get_biblioteca_documents = async (): Promise<BibliotecaDocument[]> => {
  return mockDocuments;
};

export const get_biblioteca_units = async (): Promise<BibliotecaUnit[]> => {
  return mockUnits;
};

export const toggle_document_favorite = async (documentId: string): Promise<boolean> => {
  const doc = mockDocuments.find(d => d.id === documentId);
  if (doc) {
    doc.isFavorite = !doc.isFavorite;
    return doc.isFavorite;
  }
  return false;
};
