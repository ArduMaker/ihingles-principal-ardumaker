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
