import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  DASHBOARD_PREVIEW_PATH,
  dashboardPreviewEnabled,
  PREVIEW_LEVELS,
  parseStaffFunctions,
  previewLevel,
} from './dashboard-preview';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('dashboardPreviewEnabled', () => {
  it('is on in development and test, off in production (read per call)', () => {
    vi.stubEnv('NODE_ENV', 'development');
    expect(dashboardPreviewEnabled()).toBe(true);
    vi.stubEnv('NODE_ENV', 'test');
    expect(dashboardPreviewEnabled()).toBe(true);
    vi.stubEnv('NODE_ENV', 'production');
    expect(dashboardPreviewEnabled()).toBe(false);
  });
});

describe('DASHBOARD_PREVIEW_PATH', () => {
  it('matches the prefix and its children only', () => {
    expect(DASHBOARD_PREVIEW_PATH.test('/painel-preview')).toBe(true);
    expect(DASHBOARD_PREVIEW_PATH.test('/painel-preview/dono-da-plataforma')).toBe(true);
    expect(DASHBOARD_PREVIEW_PATH.test('/painel-previewx')).toBe(false);
    expect(DASHBOARD_PREVIEW_PATH.test('/painel-preview-foo')).toBe(false);
    expect(DASHBOARD_PREVIEW_PATH.test('/x/painel-preview')).toBe(false);
  });
});

describe('PREVIEW_LEVELS / previewLevel', () => {
  it('lists the 7 levels in order, platform first', () => {
    expect(PREVIEW_LEVELS.map((l) => l.slug)).toEqual([
      'dono-da-plataforma',
      'admin-da-plataforma',
      'suporte-da-plataforma',
      'dono-do-cliente',
      'admin-do-cliente',
      'equipe-do-cliente',
      'membro',
    ]);
    expect(PREVIEW_LEVELS.map((l) => l.group)).toEqual([
      'platform',
      'platform',
      'platform',
      'tenant',
      'tenant',
      'tenant',
      'tenant',
    ]);
  });

  it('resolves an allow-listed slug and refuses anything else', () => {
    expect(previewLevel('membro')?.role).toBe('member');
    expect(previewLevel('MEMBRO')).toBeNull();
    expect(previewLevel('../inicio')).toBeNull();
    expect(previewLevel('')).toBeNull();
  });
});

describe('parseStaffFunctions', () => {
  it('without the simulator, the reference default: support and moderation, support active', () => {
    expect(parseStaffFunctions({})).toEqual({
      functions: ['atendimento', 'moderacao'],
      active: 'atendimento',
    });
  });

  it('simular=1 with no funcoes is the empty set', () => {
    expect(parseStaffFunctions({ simular: '1' })).toEqual({ functions: [], active: null });
  });

  it('keeps only allow-listed ids, in canonical order, from a string or a repeated param', () => {
    expect(parseStaffFunctions({ simular: '1', funcoes: 'loja' })).toEqual({
      functions: ['loja'],
      active: 'loja',
    });
    expect(
      parseStaffFunctions({ simular: '1', funcoes: ['loja', 'x', 'atendimento', '<b>', 'loja'] }),
    ).toEqual({ functions: ['atendimento', 'loja'], active: 'atendimento' });
  });

  it('the active tab is aba when granted, else the first granted function', () => {
    expect(
      parseStaffFunctions({ simular: '1', funcoes: ['atendimento', 'conteudo'], aba: 'conteudo' })
        .active,
    ).toBe('conteudo');
    expect(
      parseStaffFunctions({ simular: '1', funcoes: ['atendimento', 'conteudo'], aba: 'loja' })
        .active,
    ).toBe('atendimento');
    expect(parseStaffFunctions({ aba: 'moderacao' }).active).toBe('moderacao');
    expect(parseStaffFunctions({ aba: ['moderacao', 'x'] }).active).toBe('atendimento');
  });
});
