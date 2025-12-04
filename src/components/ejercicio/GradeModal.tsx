import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface GradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  grade: number;
  saving?: boolean;
  onClose: () => void;
  onGoBack: () => void;
  onNextExercise: () => void;
}

export function GradeModal({
  open,
  onOpenChange,
  grade,
  saving = false,
  onClose,
  onGoBack,
  onNextExercise,
}: GradeModalProps) {
  const percentage = (grade * 100).toFixed(0);
  const isGoodGrade = grade >= 0.7;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Resultado del Ejercicio</DialogTitle>
          <DialogDescription className="text-center">
            Has obtenido una calificación de {percentage}%
          </DialogDescription>
        </DialogHeader>
        <div className="py-6">
          <div className="text-center">
            <div 
              className={`text-6xl sm:text-7xl font-bold mb-3 ${
                isGoodGrade ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'
              }`}
            >
              {percentage}%
            </div>
            <p className="text-muted-foreground text-sm sm:text-base">
              {isGoodGrade ? '¡Excelente trabajo!' : 'Sigue practicando para mejorar'}
            </p>
          </div>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={saving}
            className="w-full sm:w-auto"
          >
            Cerrar
          </Button>
          <Button 
            variant="secondary" 
            onClick={onGoBack}
            disabled={saving}
            className="w-full sm:w-auto"
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Volver al Menú
          </Button>
          <Button 
            onClick={onNextExercise}
            disabled={saving}
            className="w-full sm:w-auto"
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Siguiente Ejercicio
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
