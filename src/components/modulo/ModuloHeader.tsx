import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ModuloHeaderProps {
  title: string;
  heroImage: string;
  totalExercises: number;
  currentExercise: number;
  category: string;
  categoryProgress: string;
  instructions: string;
}

export const ModuloHeader = ({
  title,
  heroImage,
  totalExercises,
  currentExercise,
  category,
  categoryProgress,
  instructions
}: ModuloHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      {/* Hero Image */}
      <div className="relative h-48 rounded-lg overflow-hidden">
        <img 
          src={heroImage}
          alt={title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = '/placeholder.svg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
          <div className="p-6 w-full">
            <h1 className="text-4xl font-bold text-white">{category}</h1>
          </div>
        </div>
      </div>

      {/* Title and Stats */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-heading">{title}</h2>
          <div className="flex gap-6 mt-2 text-sm text-muted-foreground">
            <span>Ejercicios total: {currentExercise}/{totalExercises}</span>
            <span>{category}: {categoryProgress}</span>
          </div>
        </div>
        <Button
          variant="outline"
          className="shrink-0"
          onClick={() => navigate(-1)}
        >
          <RotateCcw className="h-4 w-4" />
          Atrás
        </Button>
      </div>

      {/* Instructions */}
      <p className="text-base text-foreground">{instructions}</p>
    </div>
  );
};
