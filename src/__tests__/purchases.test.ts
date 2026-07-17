import {
  isValidMockCardNumber,
  isValidMockCvc,
  isValidMockExpiry,
  purchaseRestartViaMock,
} from '../purchases/mockCheckout';

describe('mock restart purchase', () => {
  test('accepts the stripe-style test card', async () => {
    const result = await purchaseRestartViaMock({
      cardNumber: '4242 4242 4242 4242',
      expiry: '12/30',
      cvc: '123',
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.method).toBe('mock');
  });

  test('rejects a wrong card number', async () => {
    const result = await purchaseRestartViaMock({
      cardNumber: '4000 0000 0000 0002',
      expiry: '12/30',
      cvc: '123',
    });
    expect(result.ok).toBe(false);
  });

  test('validates card helpers', () => {
    expect(isValidMockCardNumber('4242424242424242')).toBe(true);
    expect(isValidMockExpiry('12/30')).toBe(true);
    expect(isValidMockExpiry('13/30')).toBe(false);
    expect(isValidMockCvc('12')).toBe(false);
    expect(isValidMockCvc('123')).toBe(true);
  });
});
