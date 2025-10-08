import Store from 'electron-store';

export const store = new Store({
  defaults: {
    layout: {
      sizes: [280, undefined, 420],
      collapsed: { left: false, right: false }
    },
    urls: {
      logos: 'https://app.logos.com/',
      ai: 'https://chat.openai.com/'
    },
    sermons: {},
    hasSeenOnboarding: false
  }
});

