export interface MonetizationAdapter {
  onSessionCompleted(): Promise<void>;
  showRewardedOpportunity(): Promise<boolean>;
  restoreRemoveAdsPurchase(): Promise<boolean>;
}

class OfflineMonetizationAdapter implements MonetizationAdapter {
  async onSessionCompleted(): Promise<void> {
    // Intentional no-op: an ad provider can be injected here without entering game logic.
  }

  async showRewardedOpportunity(): Promise<boolean> {
    return false;
  }

  async restoreRemoveAdsPurchase(): Promise<boolean> {
    return false;
  }
}

export const monetization: MonetizationAdapter = new OfflineMonetizationAdapter();
