/**
 * Test injectors
 */

import { loadState, saveState } from '../localStorage';

describe('localStorage', () => {
  let store;

  beforeEach(() => {
    store = {
      language: {
        locale: 'de',
      },
    };
  });

  it('should not throw if passed valid state', () => {
    expect(() => loadState()).not.toThrow();
  });

  it('should not throw if passed valid state', () => {
    expect(() => saveState(store)).not.toThrow();
  });
});
