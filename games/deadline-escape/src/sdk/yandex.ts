/**
 * Yandex Games SDK facade — DEV_MOCK outside platform.
 * Contract: LoadingAPI.ready, GameplayAPI start/stop, RV, interstitial.
 */
export type RewardPlacement = "revive" | "x2";
export type InterstitialReason = "between_runs" | "after_fail";

export interface YandexFacade {
  init(): Promise<void>;
  loadingReady(): void;
  gameplayStart(): void;
  gameplayStop(): void;
  showRewarded(placement: RewardPlacement): Promise<boolean>;
  showInterstitial(reason: InterstitialReason): Promise<boolean>;
  isMock: boolean;
}

declare global {
  interface Window {
    YaGames?: { init: () => Promise<YsdkLike> };
    ysdk?: YsdkLike;
  }
}

interface YsdkLike {
  features?: {
    LoadingAPI?: { ready: () => void };
    GameplayAPI?: { start: () => void; stop: () => void };
  };
  adv?: {
    showFullscreenAdv?: (opts: { callbacks?: { onClose?: (wasShown: boolean) => void; onError?: () => void } }) => void;
    showRewardedVideo?: (opts: {
      callbacks?: {
        onRewarded?: () => void;
        onClose?: () => void;
        onError?: () => void;
      };
    }) => void;
  };
}

function wait(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

class MockSdk implements YandexFacade {
  isMock = true;
  private ready = false;
  private gameplay = false;

  async init(): Promise<void> {
    await wait(200);
  }

  loadingReady(): void {
    if (this.ready) return;
    this.ready = true;
  }

  gameplayStart(): void {
    this.gameplay = true;
  }

  gameplayStop(): void {
    this.gameplay = false;
  }

  async showRewarded(_placement: RewardPlacement): Promise<boolean> {
    await wait(500);
    return true;
  }

  async showInterstitial(_reason: InterstitialReason): Promise<boolean> {
    await wait(350);
    return true;
  }
}

class LiveSdk implements YandexFacade {
  isMock = false;
  constructor(private ysdk: YsdkLike) {}

  async init(): Promise<void> {
    /* already inited */
  }

  loadingReady(): void {
    this.ysdk.features?.LoadingAPI?.ready?.();
  }

  gameplayStart(): void {
    this.ysdk.features?.GameplayAPI?.start?.();
  }

  gameplayStop(): void {
    this.ysdk.features?.GameplayAPI?.stop?.();
  }

  showRewarded(_placement: RewardPlacement): Promise<boolean> {
    return new Promise((resolve) => {
      let rewarded = false;
      const adv = this.ysdk.adv;
      if (!adv?.showRewardedVideo) {
        resolve(false);
        return;
      }
      adv.showRewardedVideo({
        callbacks: {
          onRewarded: () => {
            rewarded = true;
          },
          onClose: () => resolve(rewarded),
          onError: () => resolve(false),
        },
      });
    });
  }

  showInterstitial(_reason: InterstitialReason): Promise<boolean> {
    return new Promise((resolve) => {
      const adv = this.ysdk.adv;
      if (!adv?.showFullscreenAdv) {
        resolve(false);
        return;
      }
      adv.showFullscreenAdv({
        callbacks: {
          onClose: () => resolve(true),
          onError: () => resolve(false),
        },
      });
    });
  }
}

let facade: YandexFacade | null = null;

export async function createYandexSdk(): Promise<YandexFacade> {
  if (facade) return facade;
  try {
    if (window.YaGames?.init) {
      const ysdk = await window.YaGames.init();
      window.ysdk = ysdk;
      facade = new LiveSdk(ysdk);
      return facade;
    }
  } catch {
    /* fall through to mock */
  }
  facade = new MockSdk();
  return facade;
}

export function getSdk(): YandexFacade {
  if (!facade) throw new Error("SDK not initialized");
  return facade;
}
