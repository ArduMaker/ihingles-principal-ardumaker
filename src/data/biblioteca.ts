import { BibliotecaDocument, BibliotecaUnit } from '@/types';

// Mock data for biblioteca documents
const mockDocuments: BibliotecaDocument[] = [
  {
    id: '1',
    title: 'Resumen Siruaciones Laborales',
    subtitle: 'PPT- Unidad 4',
    description: 'Documento que detalla los procedimientos administrativos estándar para la gestión de recursos humanos.',
    type: 'ppt',
    unitId: '4',
    unitName: 'Unidad 4',
    updatedAt: '12/05/2023',
    isFavorite: true,
  },
  {
    id: '2',
    title: 'Resumen Siruaciones Laborales',
    subtitle: 'PPT- Unidad 4',
    description: 'Documento que detalla los procedimientos administrativos estándar para la gestión de recursos humanos.',
    type: 'word',
    unitId: '4',
    unitName: 'Unidad 4',
    updatedAt: '12/05/2023',
    isFavorite: true,
  },
  {
    id: '3',
    title: 'Resumen Siruaciones Laborales',
    subtitle: 'PPT- Unidad 4',
    description: 'Documento que detalla los procedimientos administrativos estándar para la gestión de recursos humanos.',
    type: 'pdf',
    unitId: '4',
    unitName: 'Unidad 4',
    updatedAt: '12/05/2023',
    isFavorite: false,
  },
  {
    id: '4',
    title: 'Resumen Siruaciones Laborales',
    subtitle: 'PPT- Unidad 4',
    description: 'Documento que detalla los procedimientos administrativos estándar para la gestión de recursos humanos.',
    type: 'ppt',
    unitId: '4',
    unitName: 'Unidad 4',
    updatedAt: '12/05/2023',
    isFavorite: false,
  },
  {
    id: '5',
    title: 'Manual de Procedimientos',
    subtitle: 'PDF - Unidad 5',
    description: 'Guía completa de procedimientos operativos y administrativos.',
    type: 'pdf',
    unitId: '5',
    unitName: 'Unidad 5',
    updatedAt: '15/05/2023',
    isFavorite: true,
  },
  {
    id: '6',
    title: 'Imágenes de Referencia',
    subtitle: 'IMG - Unidad 6',
    description: 'Colección de imágenes para referencia visual en proyectos.',
    type: 'image',
    unitId: '6',
    unitName: 'Unidad 6',
    updatedAt: '18/05/2023',
    isFavorite: false,
  },
];

// Mock data for units
const mockUnits: BibliotecaUnit[] = [
  { id: 'all', name: 'Todos', documentCount: 23 },
  { id: '4', name: 'Unidad 4', documentCount: 1 },
  { id: '5', name: 'Unidad 5', documentCount: 1 },
  { id: '6', name: 'Unidad 6', documentCount: 1 },
  { id: '7', name: 'Unidad 7', documentCount: 1 },
  { id: '14', name: 'Unidad 14', documentCount: 23 },
  { id: '15', name: 'Unidad 15', documentCount: 1 },
  { id: '18', name: 'Unidad 18', documentCount: 1 },
  { id: '27', name: 'Unidad 27', documentCount: 1 },
  { id: '28', name: 'Unidad 28', documentCount: 1 },
];

export const get_biblioteca_documents = async (): Promise<BibliotecaDocument[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockDocuments;
};

export const get_biblioteca_units = async (): Promise<BibliotecaUnit[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockUnits;
};

export const toggle_document_favorite = async (documentId: string): Promise<boolean> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  const doc = mockDocuments.find(d => d.id === documentId);
  if (doc) {
    doc.isFavorite = !doc.isFavorite;
    return doc.isFavorite;
  }
  return false;
};
