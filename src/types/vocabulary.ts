// Vocabulary endpoints
export interface VocabularyItem {
  vocabularyType: string;
  vocabularyLevel: string;
  title: string;
  explanation: string;
  example: string;
}

export interface VocabularyResponse {
  data: VocabularyItem[];
  count: number;
  page: string;
}