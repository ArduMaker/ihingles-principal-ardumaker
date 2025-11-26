export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  shield?: string;
  subtitle?: string;
  phone?: string;
  country?: string;
  city?: string;
  time?: string;
}

export interface LearningSkill {
  skill: string;
  value: number;
}

export interface UserProfile extends User {
  skills: LearningSkill[];
  unitsCompleted: number;
  totalUnits: number;
  consecutiveDays: number;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  message?: string;
}
