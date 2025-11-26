import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VocabularyItem } from '@/types/vocabulary';

interface VocabularioCardProps {
  item: VocabularyItem;
}

export const VocabularioCard = ({ item }: VocabularioCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-4 mb-2">
          <CardTitle className="text-xl">{item.title}</CardTitle>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="secondary">{item.vocabularyType}</Badge>
            <Badge variant="outline">{item.vocabularyLevel}</Badge>
          </div>
        </div>
        <CardDescription className="text-base">{item.explanation}</CardDescription>
      </CardHeader>
      {item.example && (
        <CardContent>
          <div className="rounded-md bg-muted p-4">
            <p className="text-sm font-medium text-muted-foreground mb-1">Ejemplo:</p>
            <p className="text-sm italic">{item.example}</p>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
