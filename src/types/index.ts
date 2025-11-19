// Global interfaces and types for the application

export interface ApiResponse<T> {
  data: T;
  error?: string;
  success: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  avatar: string;
  featured?: string;
}

export interface Stat {
  id: string;
  value: string;
  label: string;
  icon: string;
}

export interface JourneyStep {
  id: string;
  title: string;
  description: string;
  level: string;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
  label?: string;
}

export interface CommunityBenefit {
  id: string;
  title: string;
  description: string;
  icon: string;
}

// Dashboard interfaces
export interface DashboardStat {
  id: string;
  label: string;
  value: string;
  change: string;
  subtitle: string;
  icon: string;
}

export interface SkillProgress {
  id: string;
  name: string;
  userProgress: number;
  averageProgress: number;
}

export interface RecentUnit {
  id: string;
  name: string;
  progress: number;
}

export interface PendingExercise {
  id: string;
  title: string;
  type: 'grammar' | 'listening' | 'reading';
  timeAgo: string;
}

// Unidades interfaces
export interface Unit {
  id: string;
  number: number;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'locked';
  isLocked: boolean;
}

export interface LevelProgress {
  levelId: string;
  levelName: string;
  levelImage: string;
  levelDescription: string;
  units: UnitDetail[];
  totalUnits: number;
  completedUnits: number;
  isLocked: boolean;
}

export interface OverallProgress {
  totalCompleted: number;
  totalUnits: number;
  percentage: number;
  levelProgress: {
    levelName: string;
    completed: number;
    total: number;
  }[];
}

// Unidad detail interfaces
export interface UnitDetail extends Unit {
  caseImage: string;
  progress: number;
}

// Biblioteca interfaces
export interface BibliotecaDocument {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  type: 'pdf' | 'word' | 'image' | 'ppt';
  url?: string;
  unitId: string;
  unitName: string;
  updatedAt: string;
  isFavorite: boolean;
}

export interface BibliotecaUnit {
  id: string;
  name: string;
  documentCount: number;
}

export interface BibliotecaFilters {
  unitId: string;
  documentTypes: string[];
  searchQuery: string;
}
