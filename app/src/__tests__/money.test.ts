import { describe, expect, it } from 'vitest';
import { parseAmount, parseNumber, toInputText } from '../lib/money';
import { formatMoney } from '../lib/format';

describe('typing amounts (Rupiah first)', () => {
  it('reads Indonesian separators', () => {
    expect(parseNumber('12.500', 'id')).toBe(12500);
    expect(parseNumber('1.250.000', 'id')).toBe(1250000);
    expect(parseNumber('1.250,75', 'id')).toBe(1250.75);
    expect(parseNumber('12,5', 'id')).toBe(12.5);
    expect(parseNumber('12.5', 'id')).toBe(12.5);
  });
  it('reads English separators', () => {
    expect(parseNumber('1,250.75', 'en')).toBe(1250.75);
    expect(parseNumber('12,500', 'en')).toBe(12500);
    expect(parseNumber('12.500', 'en')).toBe(12.5);
    expect(parseNumber('1,250,000', 'en')).toBe(1250000);
  });
  it('IDR treats every separator as thousands, in either language', () => {
    for (const lang of ['id', 'en'] as const) {
      expect(parseAmount('1.250.000', 'IDR', lang)).toBe(125_000_000);
      expect(parseAmount('1,250,000', 'IDR', lang)).toBe(125_000_000);
      expect(parseAmount('Rp 50.000', 'IDR', lang)).toBe(5_000_000);
      expect(parseAmount('', 'IDR', lang)).toBe(0);
    }
  });
  it('decimal currencies keep cents', () => {
    expect(parseAmount('12,50', 'USD', 'id')).toBe(1250);
    expect(parseAmount('1,234.50', 'USD', 'en')).toBe(123450);
  });
  it('round-trips through input text', () => {
    expect(toInputText(125_000_000, 'IDR', 'id')).toBe('1.250.000');
    expect(parseAmount(toInputText(125_000_000, 'IDR', 'id'), 'IDR', 'id')).toBe(125_000_000);
    expect(toInputText(1250, 'USD', 'id')).toBe('12,5');
  });
});

describe('Rupiah formatting', () => {
  it('is "Rp" in both languages', () => {
    expect(formatMoney(10_732_500_000, 'IDR', 'id')).toBe('Rp 107.325.000');
    expect(formatMoney(10_732_500_000, 'IDR', 'en')).toBe('Rp 107,325,000');
    expect(formatMoney(-120_000_00, 'IDR', 'id')).toBe('-Rp 120.000');
    expect(formatMoney(500_000_00, 'IDR', 'id', { sign: true })).toBe('+Rp 500.000');
  });
  it('other currencies still use their symbol', () => {
    expect(formatMoney(123450, 'USD', 'en')).toBe('$1,234.50');
  });
});
