import { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { postUserGrade, postUserPosition } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface UseExerciseGradeOptions {
  exerciseId: string;
  unidad: number;
  exerciseNumber: number;
}

interface UseExerciseGradeReturn {
  grade: number;
  gradeModalOpen: boolean;
  saving: boolean;
  setGrade: (grade: number) => void;
  setGradeModalOpen: (open: boolean) => void;
  openGradeModal: (calculatedGrade: number) => void;
  saveGrade: (continueToNext?: boolean) => Promise<void>;
  handleClose: () => void;
  handleGoBack: () => void;
  handleNextExercise: () => void;
}

export function useExerciseGrade({
  exerciseId,
  unidad,
  exerciseNumber,
}: UseExerciseGradeOptions): UseExerciseGradeReturn {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [grade, setGrade] = useState(0);
  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const currentExerciseIndex = parseInt(searchParams.get('exerciseIndex') || '0');

  const openGradeModal = (calculatedGrade: number) => {
    setGrade(calculatedGrade);
    setGradeModalOpen(true);
  };

  const saveGrade = async (continueToNext: boolean = false) => {
    setSaving(true);
    try {
      // Envía la nota con formato base64 como el sistema viejo
      const roundedGrade = Number(grade.toFixed(2));
      await postUserGrade(exerciseId, roundedGrade, String(unidad));
      
      // Actualiza la posición del usuario
      await postUserPosition({
        unidad: Number(id) || unidad,
        position: exerciseNumber,
      });

      toast({
        title: 'Progreso guardado',
        description: 'Tu calificación ha sido registrada correctamente',
      });

      setGradeModalOpen(false);

      if (continueToNext) {
        handleNextExercise();
      } else {
        handleGoBack();
      }
    } catch (error) {
      console.error('Error saving grade:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar tu progreso. Intenta nuevamente.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setGradeModalOpen(false);
  };

  const handleGoBack = () => {
    // Navegar al menú del módulo
    navigate(`/modulo/${id || unidad}`);
  };

  const handleNextExercise = () => {
    // Incrementar exerciseIndex para ir al siguiente ejercicio
    const nextExerciseIndex = currentExerciseIndex + 1;
    navigate(`/modulo/${id || unidad}?exerciseIndex=${nextExerciseIndex}`);
  };

  return {
    grade,
    gradeModalOpen,
    saving,
    setGrade,
    setGradeModalOpen,
    openGradeModal,
    saveGrade,
    handleClose,
    handleGoBack,
    handleNextExercise,
  };
}
