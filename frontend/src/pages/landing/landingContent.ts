import type { LucideIcon } from 'lucide-react';
import {
  Sparkles,
  Users,
  LineChart,
  MessageSquare,
  Coins,
  ShieldCheck,
  Star,
  BarChart3,
  Megaphone,
  Handshake,
} from 'lucide-react';

export const PLATFORM_TAGLINE =
  'AI-powered marketplace connecting businesses and creators for smarter advertising collaborations.';

export const HERO_FEATURES = [
  'Gemini-powered advertiser recommendations',
  'Campaign & engagement analytics',
  'Verified profiles with admin approval',
  'Chapa coin wallet & secure payments',
] as const;

export const CORE_CAPABILITIES: {
  title: string;
  description: string;
  icon: LucideIcon;
  span: string;
  tall?: boolean;
}[] = [
  {
    title: 'AI advertiser recommendations',
    description:
      'Business owners receive ranked creator matches scored on niche, platform, engagement rate, followers, budget, and location—powered by the recommendations engine and Gemini.',
    icon: Sparkles,
    span: 'lg:col-span-5 lg:row-span-2',
    tall: true,
  },
  {
    title: 'Opportunities & applications',
    description:
      'Post campaigns as opportunities. Advertisers apply with coins from their wallet; businesses review applicants and manage the full pipeline in one place.',
    icon: Megaphone,
    span: 'lg:col-span-4',
  },
  {
    title: 'Collaboration workspace',
    description:
      'Active partnerships get task boards, deliverables, activity feeds, and workspace chat—structured workflows from match to completion.',
    icon: Handshake,
    span: 'lg:col-span-3 lg:row-span-2',
    tall: true,
  },
  {
    title: 'Marketing & predictive analysis',
    description:
      'Marketing analysis dashboards, AI analytics pipelines for advertisers and businesses, ROI prediction charts, and engagement insights.',
    icon: LineChart,
    span: 'lg:col-span-6',
  },
];

export const TRUST_PILLARS: {
  num: string;
  title: string;
  body: string;
}[] = [
  {
    num: 'I',
    title: 'Profile verification',
    body:
      'Business and advertiser onboarding with document review, admin approval, and suspended-state handling before full platform access.',
  },
  {
    num: 'II',
    title: 'Ratings & reviews',
    body:
      'Post-collaboration reviews and star ratings build trust history on profiles—visible when matching and negotiating.',
  },
  {
    num: 'III',
    title: 'Transparent operations',
    body:
      'Audit trails for super admins, dispute resolution, payment records via Chapa, and platform settings under enterprise controls.',
  },
];

export const PLATFORM_MODULES: {
  title: string;
  detail: string;
  icon: LucideIcon;
}[] = [
  {
    title: 'Creator matching',
    detail:
      'Overlap scoring on niches and platforms plus engagement metrics—businesses discover advertisers; advertisers discover open opportunities.',
    icon: Users,
  },
  {
    title: 'Real-time chat',
    detail:
      'Socket-powered messaging for negotiation, collaboration threads, and admin support—tied to applications and active deals.',
    icon: MessageSquare,
  },
  {
    title: 'Coin wallet',
    detail:
      'ETB coin packs via Chapa (Starter, Popular, Pro). Advertisers spend coins to apply; balances and transactions stay in-wallet.',
    icon: Coins,
  },
  {
    title: 'SSO & social connect',
    detail:
      'Clerk sign-in with Google and Facebook OAuth, TikTok authentication, and profile linking for Instagram, TikTok, YouTube, and Facebook.',
    icon: ShieldCheck,
  },
  {
    title: 'AI ranking & analytics',
    detail:
      'AI analytics and marketing-analysis modules with Gemini pipelines, predictive dashboards, and Facebook analytics pages.',
    icon: BarChart3,
  },
  {
    title: 'Campaign intelligence',
    detail:
      'Business dashboards for campaigns, applicant review, match discovery, and analytics across the owner workflow.',
    icon: Star,
  },
];

export const ROLE_PATHS = [
  {
    role: 'Business owner',
    actions: 'Post opportunities, review applications, fund collaborations, run AI business analytics.',
  },
  {
    role: 'Advertiser',
    actions: 'Browse campaigns, apply with coins, manage matches, showcase verified social metrics.',
  },
] as const;
