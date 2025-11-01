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
  'https://images.unsplash.com/photo-1528459199957-0ff28496a7f6?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1513001900722-370f803f498d?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1579762593131-4d28a2d8263e?w=400&h=400&fit=crop',
];

export const BibliotecaResultCard = ({
  document,
  onToggleFavorite,
}: BibliotecaResultCardProps) => {
  const [isFavorite, setIsFavorite] = useState(document.isFavorite);
  const thumbnailIndex = parseInt(document.id) % thumbnails.length;

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
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  <span>128 descargas</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button className="bg-[#2D5016] hover:bg-[#234010] text-[#C5D82E]">
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Documento
                </Button>
                <Button
                  variant="outline"
                  className="border-2 border-[#2D5016] text-heading hover:bg-[#2D5016] hover:text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Descargar
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
