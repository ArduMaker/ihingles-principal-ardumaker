export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  shield?: string;
  subtitle?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  message?: string;
}
