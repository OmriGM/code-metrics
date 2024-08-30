import * as Mixpanel from 'mixpanel';

let mixpanelInstance: Mixpanel.Mixpanel;
const mixpanelToken: string = '4dc82d71555fc589b82d7ba3594254b2';

export const mixpanelService = {
  init: () => {
    if (!mixpanelToken) {
      console.warn('Mixpanel token not found');
      return;
    }
    if (!mixpanelInstance) {
      mixpanelInstance = Mixpanel.init(mixpanelToken, { debug: true });
    }
  },
  trackEvent: (eventName: string, eventProperties: Record<string, string>) => {
    if (mixpanelInstance) {
      mixpanelInstance.track(eventName, {
        ...eventProperties,
      });
    } else {
      console.warn('Mixpanel has not been initialized');
    }
  },
  trackError: (eventName: string, eventProperties: Record<string, string>) => {
    if (mixpanelInstance) {
      mixpanelInstance.track(eventName, {
        ...eventProperties,
        is_error: true,
      });
    } else {
      console.warn('Mixpanel has not been initialized');
    }
  },
};
