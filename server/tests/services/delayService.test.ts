import { describe, it, expect } from 'vitest';
import { delay } from '../../src/services/delayService.js';

describe('delay', () => {
  it('resolves after the specified time', async () => {
    const start = Date.now();
    await delay(50);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(40);
    expect(elapsed).toBeLessThan(200);
  });

  it('resolves with void', async () => {
    const result = await delay(10);
    expect(result).toBeUndefined();
  });
});
