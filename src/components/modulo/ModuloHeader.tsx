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
    <div className="space-y-4 md:space-y-6">
      {/* Hero Image */}
      <div className="relative h-32 md:h-40 lg:h-48 rounded-lg overflow-hidden">
        <img 
          src={heroImage}
          alt={title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = '/placeholder.svg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
          <div className="p-4 md:p-6 w-full">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">{category}</h1>
          </div>
        </div>
      </div>

      {/* Title and Stats */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-3 md:gap-4">
        <div className="flex-1">
          <h2 className="text-xl md:text-2xl font-bold text-heading">{title}</h2>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 mt-2 text-xs md:text-sm text-muted-foreground">
            <span>Ejercicios total: {currentExercise}/{totalExercises}</span>
            <span>{category}: {categoryProgress}</span>
          </div>
        </div>
        <Button
          variant="outline"
          className="shrink-0 w-full sm:w-auto"
          onClick={() => navigate(-1)}
        >
          <RotateCcw className="h-4 w-4" />
          Atrás
        </Button>
      </div>

      {/* Instructions */}
      <p className="text-sm md:text-base text-foreground">{instructions}</p>
    </div>
  );
};
