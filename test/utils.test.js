const { formatDate } = require('../src/utils');

describe('formatDate', () => {
  it('formata datas corretamente no formato DD/MM/YYYY HH:mm UTC', () => {
    // 2025-12-04 09:07 UTC
    expect(formatDate(Date.UTC(2025, 11, 4, 9, 7))).toBe('04/12/2025 09:07 UTC');
    // 1980-01-01 00:00 UTC
    expect(formatDate(new Date('1980-01-01T00:00:00Z'))).toBe('01/01/1980 00:00 UTC');
    // Limites de mês
    expect(formatDate(new Date('2000-02-29T23:59:00Z'))).toBe('29/02/2000 23:59 UTC');
    // Padding (single digits)
    expect(formatDate(new Date(Date.UTC(2026, 0, 1, 3, 2)))).toBe('01/01/2026 03:02 UTC');
    // Data inválida
    expect(formatDate('Na-invalid')).toBe('NaN/NaN/NaN NaN:NaN UTC');
  });

  it('aceita número, string ou objeto Date como entrada', () => {
    const millis = Date.UTC(2022, 5, 10, 8, 30); // 2022-06-10 08:30 UTC
    expect(formatDate(millis)).toMatch('10/06/2022 08:30 UTC');
    expect(formatDate(new Date(millis))).toMatch('10/06/2022 08:30 UTC');
    expect(formatDate('2022-06-10T08:30:00Z')).toMatch('10/06/2022 08:30 UTC');
  });
});
