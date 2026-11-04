import { describe, it, expect } from 'vitest';
import {
  parseVirtualDesignerCommand,
  buildDeterministicDraft,
  computeSafeInscriptionSize,
} from '#/lib/virtual-designer-assistant';

describe('Deterministic Virtual Designer Assistant', () => {
  it('builds a cast bronze plaque draft with dynamic vector preview and safe margins', () => {
    const cmd = 'Zaprojektuj tablicę pamiątkową z brązu dla prof. Jerzego Nowickiego 1938 — 2019';
    const parsed = parseVirtualDesignerCommand(cmd);
    expect(parsed.intent).toBe('create_bronze_plaque');
    expect(parsed.productId).toBe('5');

    const draft = buildDeterministicDraft(parsed);
    expect(draft.success).toBe(true);
    expect(draft.productId).toBe('5');
    expect(draft.designerHref).toBe('/bronze-plaque/inscriptions');
    expect(draft.previewUrl).toContain('/api/virtual-assistant?draftId=');
    expect(draft.imageData).toContain('data:image/svg+xml;base64,');
    expect(draft.svgPreview).toContain('JERZY NOWICKI');
    expect(draft.snapshot.widthMm).toBe(450);
    expect(draft.snapshot.heightMm).toBe(300);
    expect(draft.snapshot.inscriptions.length).toBeGreaterThanOrEqual(4);
    expect(draft.snapshot.selectedMotifs.length).toBe(1);

    // Verify long text fits comfortably within safe margins
    const subLine = draft.snapshot.inscriptions.find((i) => i.id === 'l-bronze-3');
    expect(subLine).toBeDefined();
    expect(subLine!.sizeMm).toBeLessThanOrEqual(11);
  });

  it('respects custom bronze plaque dimensions when explicitly requested', () => {
    const cmd = 'Tablica z brązu 380x280 dla Jana Nowaka 1950 — 2021';
    const parsed = parseVirtualDesignerCommand(cmd);
    expect(parsed.widthMm).toBe(380);
    expect(parsed.heightMm).toBe(280);

    const draft = buildDeterministicDraft(parsed);
    expect(draft.snapshot.widthMm).toBe(380);
    expect(draft.snapshot.heightMm).toBe(280);
  });

  it('computes safe inscription sizes dynamically to prevent border overflow', () => {
    // 32 chars on 450mm plaque -> safe size around 10.5-11mm
    const sizeOnWide = computeSafeInscriptionSize('DISTINGUISHED SCHOLAR AND MENTOR', 11, 450);
    expect(sizeOnWide).toBe(11);

    // Extreme long text (50 chars) -> automatically scaled down
    const sizeLong = computeSafeInscriptionSize('VERY LONG ACADEMIC TITLE HONORING DISTINGUISHED PROFESSOR', 16, 450);
    expect(sizeLong).toBeLessThan(10);
    expect(sizeLong).toBeGreaterThanOrEqual(8);
  });

  it('builds a companion headstone draft with base vases in African Black', () => {
    const cmd = 'Nagrobek podwójny dla Stanisława i Marii Kowalskich z wazonami';
    const parsed = parseVirtualDesignerCommand(cmd);
    expect(parsed.intent).toBe('create_companion_headstone');
    expect(parsed.productId).toBe('124');

    const draft = buildDeterministicDraft(parsed);
    expect(draft.success).toBe(true);
    expect(draft.productId).toBe('124');
    expect(draft.designerHref).toBe('/traditional-engraved-headstone/inscriptions');
    expect(draft.previewUrl).toContain('/api/virtual-assistant?draftId=');
    expect(draft.svgPreview).toContain('STANISŁAW');
    expect(draft.svgPreview).toContain('MARIA');
    expect(draft.snapshot.headstoneMaterialUrl).toContain('African-Black');
    expect(draft.snapshot.selectedAdditions.length).toBe(2);
    expect(draft.snapshot.inscriptions.some((i) => i.text.includes('STANISŁAW'))).toBe(true);
    expect(draft.snapshot.inscriptions.some((i) => i.text.includes('MARIA'))).toBe(true);
  });

  it('builds a full monument draft with headstone, base, ledger and kerbset', () => {
    const cmd = 'Grobowiec rodzinny dla rodziny Wiśniewskich z African Black';
    const parsed = parseVirtualDesignerCommand(cmd);
    expect(parsed.intent).toBe('create_full_monument');
    expect(parsed.productId).toBe('101');

    const draft = buildDeterministicDraft(parsed);
    expect(draft.success).toBe(true);
    expect(draft.productId).toBe('101');
    expect(draft.designerHref).toBe('/traditional-engraved-full-monument/inscriptions');
    expect(draft.previewUrl).toContain('/api/virtual-assistant?draftId=');
    expect(draft.svgPreview).toContain('WIŚNIEWSCY');
    expect(draft.snapshot.showLedger).toBe(true);
    expect(draft.snapshot.showKerbset).toBe(true);
    expect(draft.snapshot.inscriptions.some((i) => i.target === 'base')).toBe(true);
    expect(draft.snapshot.inscriptions.some((i) => i.target === 'ledger')).toBe(true);
  });

  it('accurately personalizes laser-etched headstone for Helen Davis (not Anna Nowak)', () => {
    const cmd = 'Laser-etched granite headstone for Helen Davis 1948 — 2020';
    const parsed = parseVirtualDesignerCommand(cmd);
    expect(parsed.intent).toBe('create_laser_etched');
    expect(parsed.productId).toBe('4');
    expect(parsed.names?.singleName).toBe('HELEN DAVIS');

    const draft = buildDeterministicDraft(parsed);
    expect(draft.success).toBe(true);
    expect(draft.productId).toBe('4');
    expect(draft.designerHref).toBe('/laser-etched-black-granite-headstone/inscriptions');
    expect(draft.previewUrl).toContain('/api/virtual-assistant?draftId=');
    expect(draft.imageData).toContain('data:image/svg+xml;base64,');

    // Crucial verification: The personalized dynamic preview MUST contain HELEN DAVIS and NEVER Anna Nowak
    expect(draft.svgPreview).toContain('HELEN DAVIS');
    expect(draft.svgPreview).toContain('1948 — 2020');
    expect(draft.svgPreview).not.toContain('ANNA NOWAK');
    expect(draft.snapshot.inscriptions.some((i) => i.text === 'HELEN DAVIS')).toBe(true);
    expect(draft.snapshot.inscriptions.every((i) => i.color.toLowerCase() === '#ffffff')).toBe(true);
  });
});
