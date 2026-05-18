import BusinessLayout from '@/src/shared/components/layouts/BusinessLayout';
import BuyCoinsPanel from '@/src/components/wallet/BuyCoinsPanel';

export default function BuyCoinsPage() {
  return (
    <BusinessLayout>
      <BuyCoinsPanel
        checkoutPath="/business/checkout"
        manualCheckoutPath="/business/manual-checkout"
        subtitle="Top up in Ethiopian Birr (ETB). Coins fund your campaigns and marketplace actions on AACP."
      />
    </BusinessLayout>
  );
}
