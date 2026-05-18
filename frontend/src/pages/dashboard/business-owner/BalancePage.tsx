import BusinessLayout from '@/src/shared/components/layouts/BusinessLayout';
import WalletBalanceView from '@/src/components/wallet/WalletBalanceView';

export default function BalancePage() {
  return (
    <BusinessLayout>
      <WalletBalanceView
        buyCoinsPath="/business/buy-coins"
        subtitle="Manage your coins and view transaction history. Use coins to fund campaigns and platform actions."
      />
    </BusinessLayout>
  );
}
