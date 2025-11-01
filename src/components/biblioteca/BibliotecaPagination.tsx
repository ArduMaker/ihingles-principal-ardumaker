import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BibliotecaPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const BibliotecaPagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: BibliotecaPaginationProps) => {
  const renderPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <Button
          key={i}
          onClick={() => onPageChange(i)}
          className={`w-10 h-10 ${
            currentPage === i
              ? 'bg-[#C5D82E] text-[#2D5016] hover:bg-[#B5C828]'
              : 'bg-[#E8F5E9] text-heading hover:bg-[#C8E6C9]'
          }`}
        >
          {i}
        </Button>
      );
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-4 mt-8">
      <span className="text-heading mr-4">
        Página {currentPage} de {totalPages}
      </span>
      
      <Button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        variant="outline"
        className="w-10 h-10 p-0 border-2 border-[#2D5016]"
      >
        <ChevronLeft className="w-5 h-5" />
      </Button>

      {renderPageNumbers()}

      <Button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        variant="outline"
        className="w-10 h-10 p-0 border-2 border-[#2D5016]"
      >
        <ChevronRight className="w-5 h-5" />
      </Button>
    </div>
  );
};
