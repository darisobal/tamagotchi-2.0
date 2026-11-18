import { contentScale, scaledTypography } from '../design-system/responsiveMetrics';

describe('responsive design typography', () => {
  it('keeps source typography at 430 px and on wider layouts', () => {
    for (const width of [430, 1024]) {
      expect(scaledTypography({ fontSize: 22, lineHeight: 44 }, contentScale(width)))
        .toEqual({ fontSize: 22, lineHeight: 44 });
    }
  });
  it('keeps feedback proportional to the pet card at narrow widths', () => {
    const scale = contentScale(350);
    expect(scaledTypography({ fontSize: 42, lineHeight: 48 }, scale).fontSize! / 42)
      .toBeCloseTo(302 / 382);
  });
  it('preserves small text and a 16 px minimum for reading text', () => {
    const scale = contentScale(320);
    expect(scaledTypography({ fontSize: 14, lineHeight: 18 }, scale)).toEqual({ fontSize: 14, lineHeight: 18 });
    expect(scaledTypography({ fontSize: 22, lineHeight: 44 }, scale)).toEqual({ fontSize: 16, lineHeight: 32 });
    expect(scaledTypography(undefined, scale)).toEqual({});
  });
});
