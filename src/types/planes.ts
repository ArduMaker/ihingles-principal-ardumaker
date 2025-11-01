export interface PlanSkill {
  id: string;
  name: string;
  icon: string;
  level: string;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  nivel: string;
  description: string;
  tagline: string;
  backgroundImage: string;
  skills: PlanSkill[];
  buttonColor: string;
  textColor: string;
}
