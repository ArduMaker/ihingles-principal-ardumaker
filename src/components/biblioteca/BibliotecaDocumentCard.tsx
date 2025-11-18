import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { BibliotecaDocument } from '@/types';

interface BibliotecaDocumentCardProps {
  document: BibliotecaDocument;
  onToggleFavorite: (documentId: string) => void;
}

const documentIcons = {
  pdf: '/bibloteca/pdf.svg',
  word: '/bibloteca/word.svg',
  image: '/bibloteca/image.svg',
  ppt: '/bibloteca/image.svg',
};

export const BibliotecaDocumentCard = ({ 
  document, 
  onToggleFavorite 
}: BibliotecaDocumentCardProps) => {
  const [isFavorite, setIsFavorite] = useState(document.isFavorite);

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    onToggleFavorite(document.id);
  };

  return (
    <Card className="p-6 relative bg-white border-2 border-gray-200 hover:border-[#2D5016] transition-colors">
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <img 
            src={documentIcons[document.type]} 
            alt={document.type}
            className="w-12 h-12"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-heading mb-1">{document.title}</h4>
          <p className="text-sm text-muted-foreground mb-2">{document.subtitle}</p>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {document.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Actualizado: {document.updatedAt}
            </span>
            {document.url ? (
              <a
                href={document.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#009A47] hover:text-[#007A37] font-semibold"
              >
                Ver Documento
              </a>
            ) : (
              <span className="text-sm text-muted-foreground">Sin enlace</span>
            )}
          </div>
        </div>
        <button 
          onClick={handleToggleFavorite}
          className="absolute top-4 right-4"
        >
          <img 
            src={isFavorite ? '/bibloteca/cora_big.svg' : '/bibloteca/cora_empty.svg'}
            alt="Favorite"
            className="w-6 h-6"
          />
        </button>
      </div>
    </Card>
  );
};
