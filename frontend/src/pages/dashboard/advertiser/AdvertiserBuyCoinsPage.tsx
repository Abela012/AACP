import { BookOpen, Award, Users, Calendar } from 'lucide-react';
import AdvertiserLayout from '@/src/shared/components/layouts/AdvertiserLayout';
import BuyCoinsPanel from '@/src/components/wallet/BuyCoinsPanel';

export default function AdvertiserBuyCoinsPage() {
  return (
    <AdvertiserLayout>
      <BuyCoinsPanel
        checkoutPath="/advertiser/checkout"
        manualCheckoutPath="/advertiser/manual-checkout"
        subtitle="Top up your account to access premium features and exclusive content. Prices are in Ethiopian Birr (ETB)."
        extraSection={
          <div className="bg-gray-50 dark:bg-white/5 rounded-3xl p-8 md:p-12 mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How to use your coins?</h2>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Coins are the official currency of the AACP platform. Use them to unlock specialized content and
                  services tailored to your professional growth.
                </p>
              </div>
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
                {[
                  { icon: BookOpen, title: 'Premium Modules', desc: 'Access advanced learning tracks and certifications.' },
                  { icon: Users, title: 'Expert Consultations', desc: 'Book 1-on-1 sessions with industry leaders.' },
                  { icon: Award, title: 'Verified Badges', desc: 'Enhance your profile credibility with verified skills.' },
                  { icon: Calendar, title: 'Exclusive Events', desc: 'Register for premium webinars and local meetups.' },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <Icon className="text-emerald-500 w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white mb-1">{title}</h4>
                      <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        }
      />
    </AdvertiserLayout>
  );
}
