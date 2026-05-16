import BusinessLayout from '@/src/shared/components/layouts/BusinessLayout';
import BuyCoinsPanel from '@/src/components/wallet/BuyCoinsPanel';

export default function BuyCoinsPage() {
  return (
    <BusinessLayout>
      <BuyCoinsPanel
        checkoutPath="/business/checkout"
        manualCheckoutPath="/business/manual-checkout"
        subtitle="Top up your account to access premium features and post more campaigns. Prices are in Ethiopian Birr (ETB)."
      />
    </BusinessLayout>
  );
}
