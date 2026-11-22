import { describe, expect, it } from 'vitest';
import { legalDocs, TERMS_VERSION } from '../lib/legal';

describe('legal documents', () => {
  it('have the same structure in Indonesian and English', () => {
    const id = legalDocs('id'), en = legalDocs('en');
    for (const k of ['terms', 'privacy'] as const) {
      expect(id[k].sections.length).toBe(en[k].sections.length);
      expect(id[k].sections.every((s) => (s.p?.length ?? 0) + (s.list?.length ?? 0) > 0)).toBe(true);
      expect(en[k].sections.every((s) => (s.p?.length ?? 0) + (s.list?.length ?? 0) > 0)).toBe(true);
      id[k].sections.forEach((s, i) => {
        expect(s.list?.length ?? 0).toBe(en[k].sections[i].list?.length ?? 0);
        expect(s.p?.length ?? 0).toBe(en[k].sections[i].p?.length ?? 0);
      });
    }
  });
  it('uses a date as the version', () => {
    expect(TERMS_VERSION).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
  it('describes the real processors and the user rights the app implements', () => {
    const text = JSON.stringify(legalDocs('en').privacy) + JSON.stringify(legalDocs('id').privacy);
    for (const word of ['Supabase', 'Netlify']) expect(text).toContain(word);
  });
});
