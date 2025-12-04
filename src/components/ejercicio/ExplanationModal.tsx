import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ExplanationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  explanation: string;
}

export function ExplanationModal({
  open,
  onOpenChange,
  explanation,
}: ExplanationModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Explicación</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p 
            className="text-sm sm:text-base leading-relaxed"
            dangerouslySetInnerHTML={{ __html: explanation }} 
          />
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
