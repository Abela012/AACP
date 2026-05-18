import AdvertiserLayout from '@/src/shared/components/layouts/AdvertiserLayout';
import BuyCoinsPanel from '@/src/components/wallet/BuyCoinsPanel';

export default function AdvertiserBuyCoinsPage() {
  return (
    <AdvertiserLayout>
      <BuyCoinsPanel
        checkoutPath="/advertiser/checkout"
        manualCheckoutPath="/advertiser/manual-checkout"
        subtitle="Top up in Ethiopian Birr (ETB). Coins are used to apply for campaigns (50 coins per application)."
      />
    </AdvertiserLayout>
  );
}
