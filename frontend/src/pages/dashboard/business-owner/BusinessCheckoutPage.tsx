import { useLocation } from 'react-router-dom';
import BusinessLayout from '@/src/shared/components/layouts/BusinessLayout';
import ChapaCheckoutPanel from '@/src/components/wallet/ChapaCheckoutPanel';
import { COIN_PACKS } from '@/src/shared/constants/coinPacks';

const defaultPack = {
  coins: COIN_PACKS.popular.coins,
  price: COIN_PACKS.popular.priceEtb,
  title: `${COIN_PACKS.popular.coins} Coins Package`,
};

export default function BusinessCheckoutPage() {
  const location = useLocation();
  const packDetails = location.state?.pack || defaultPack;

  return (
    <BusinessLayout>
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 md:py-12">
        <ChapaCheckoutPanel
          packDetails={packDetails}
          returnUrl="/wallet"
          buyCoinsPath="/business/buy-coins"
        />
      </main>
    </BusinessLayout>
  );
}
