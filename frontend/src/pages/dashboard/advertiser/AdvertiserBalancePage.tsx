import AdvertiserLayout from '@/src/shared/components/layouts/AdvertiserLayout';
import WalletBalanceView from '@/src/components/wallet/WalletBalanceView';

export default function AdvertiserBalancePage() {
  return (
    <AdvertiserLayout>
      <WalletBalanceView
        buyCoinsPath="/advertiser/buy-coins"
        subtitle="Manage your coins and view transaction history. Applying to a campaign costs 50 coins."
      />
    </AdvertiserLayout>
  );
}
