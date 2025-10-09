// Mock data for landing page (will be replaced with API calls)

import { Testimonial, Stat, JourneyStep, Feature, CommunityBenefit } from '@/types';

export const mockFeatures: Feature[] = [
  {
    id: '1',
    title: 'Strategic Progression',
    description: 'Master Essential Codes: Syntax - English - Level - Business - Latin - SMB. From CEFR A1/B1/C2 unlock elite communication.',
    icon: 'target',
    label: 'Measurable Milestones'
  },
  {
    id: '2',
    title: 'Real Conversation Focus',
    description: 'Skip theory. Master practical English through executive-tier conversations for a business-ready education.',
    icon: 'message-circle',
    label: 'Immediate Application'
  },
  {
    id: '3',
    title: 'Accent Pride',
    description: 'Your Latin English skills enhancing your authentic voice.',
    icon: 'globe',
    label: 'Cultural Honor'
  }
];

export const mockStats: Stat[] = [
  {
    id: '1',
    value: '90 Days',
    label: 'To conversational fluency',
    icon: 'calendar'
  },
  {
    id: '2',
    value: '300%',
    label: 'Faster progress vs traditional methods',
    icon: 'trending-up'
  },
  {
    id: '3',
    value: '2,500+',
    label: 'Words & contextual phrases',
    icon: 'book-open'
  },
  {
    id: '4',
    value: '98%',
    label: 'Satisfaction rate',
    icon: 'star'
  }
];

export const mockJourneySteps: JourneyStep[] = [
  {
    id: '1',
    title: 'Foundation (Nayire)',
    level: 'Nayire',
    description: 'Master foundational syntax, vocabulary and pronunciation with confidence.'
  },
  {
    id: '2',
    title: 'Combat (Knight)',
    level: 'Knight',
    description: 'Navigate complex conversations and deepen culture skill authenticity.'
  },
  {
    id: '3',
    title: 'Mastery (Duke)',
    level: 'Duke',
    description: 'Lead international teams and negotiations with natural fluency.'
  }
];

export const mockTestimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Carlos Rodríguez',
    role: 'CEO, Tech Startup',
    company: 'San José',
    content: '"As a founder, I went from avoiding English calls to hosting live pitch to believe Valle\'s is the ONLY method making our marketplace."',
    avatar: '/avatars/carlos.jpg',
    featured: 'Raised $2M via English'
  },
  {
    id: '2',
    name: 'Miguel Santos',
    role: 'Director, Multinational Corp',
    company: 'São Paulo',
    content: '"Wow! An English program that directly ties to business gains. I can lead global teams in weeks. Valle\'s changed our marketplace."',
    avatar: '/avatars/miguel.jpg',
    featured: 'Promoted to Global Director'
  },
  {
    id: '3',
    name: 'Fernando López',
    role: 'Senior Product Manager',
    company: 'Mexico City',
    content: '"I\'m genuinely kept the engaged inside the skills. My approach does not just English. San level of innovation."',
    avatar: '/avatars/fernando.jpg',
    featured: '100% Remote Interview'
  }
];

export const mockCommunityBenefits: CommunityBenefit[] = [
  {
    id: '1',
    title: 'Exclusive Networking',
    description: 'Connect with like-minded professionals from across Latin America.',
    icon: 'users'
  },
  {
    id: '2',
    title: 'Live Mentoring Sessions',
    description: 'Weekly group sessions with educators and guest speakers.',
    icon: 'video'
  },
  {
    id: '3',
    title: 'Achievement Recognition',
    description: 'Celebrate milestones and showcase your progress to the community.',
    icon: 'award'
  }
];
