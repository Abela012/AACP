import LandingNav from './components/LandingNav';
import LandingHero from './components/LandingHero';
import LandingDiscovery from './components/LandingDiscovery';
import LandingManifesto from './components/LandingManifesto';
import LandingPlatform from './components/LandingPlatform';
import LandingInvitation from './components/LandingInvitation';
import LandingFooter from './components/LandingFooter';

export default function LandingPage() {
  return (
    <div className="aacp-grain aacp-font-body min-h-screen bg-aacp-cream text-aacp-ink">
      <LandingNav />
      <main>
        <LandingHero />
        <LandingDiscovery />
        <LandingManifesto />
        <LandingPlatform />
        <LandingInvitation />
      </main>
      <LandingFooter />
    </div>
  );
}
