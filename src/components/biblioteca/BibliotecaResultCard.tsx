import { useState } from 'react';
import { Eye, Download, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BibliotecaDocument } from '@/types';

interface BibliotecaResultCardProps {
  document: BibliotecaDocument;
  onToggleFavorite: (documentId: string) => void;
}

const documentIcons = {
  pdf: '/bibloteca/pdf.svg',
  word: '/bibloteca/word.svg',
  image: '/bibloteca/image.svg',
  ppt: '/bibloteca/image.svg',
};

// Mock images for document thumbnails
const thumbnails = [
  '/bibloteca/pdf.svg',
  '/bibloteca/pdf.svg',
  '/bibloteca/pdf.svg',
];

export const BibliotecaResultCard = ({
  document,
  onToggleFavorite,
}: BibliotecaResultCardProps) => {
  const [isFavorite, setIsFavorite] = useState(document.isFavorite);
  const numericId = parseInt(String(document.id).replace(/\D/g, ''), 10) || 0;
  const thumbnailIndex = numericId % thumbnails.length;

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    onToggleFavorite(document.id);
  };

  return (
    <Card className="p-6 bg-[#F5F9F3] border-2 border-[#C8E6C9] hover:border-[#2D5016] transition-colors relative">
      <div className="flex gap-6">
        {/* Thumbnail */}
        <div className="flex-shrink-0">
          <img
            src={thumbnails[thumbnailIndex]}
            alt={document.title}
            className="w-32 h-32 object-cover rounded-lg"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3 mb-2">
            <img
              src={documentIcons[document.type]}
              alt={document.type}
              className="w-10 h-10 flex-shrink-0"
            />
            <div className="flex-1">
              <h3 className="text-xl font-bold text-heading mb-1">
                {document.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                {document.subtitle}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {document.description}
              </p>

              <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Actualizado: {document.updatedAt}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  className="bg-[#2D5016] hover:bg-[#234010] text-[#C5D82E]"
                  onClick={() => {
                    if (document.url) window.open(document.url, '_blank', 'noopener');
                  }}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Documento
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Favorite Button */}
        <button onClick={handleToggleFavorite} className="absolute top-6 right-6">
          <img
            src={isFavorite ? '/bibloteca/cora_big.svg' : '/bibloteca/cora_empty.svg'}
            alt="Favorite"
            className="w-8 h-8"
          />
        </button>
      </div>
    </Card>
  );
};
