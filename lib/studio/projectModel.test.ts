import { describe, expect, it } from 'vitest';

import {
  createProject,
  duplicateProject,
  renameProject,
  updateProjectSnapshot,
  normalizeProjectName,
  sortProjectsByUpdatedAt,
  touchProject,
  validateProject,
  type LocalProject,
} from './projectModel';
import { serializeWorkspace, type WorkspaceSnapshot } from './workspaceSnapshot';

function snapshot(): WorkspaceSnapshot {
  return {
    tokenOverridesByTheme: { light: {}, dark: {} },
    clearedSemanticTokens: [],
    roleNames: {},
    lockedRolesByTheme: { light: [], dark: [] },
    savedVibrancy: 50,
    neutralStyle: 'pure',
    forcedStatusSources: {},
    forcedStatusColors: {},
    extractedColors: [{ hex: '#3366FF', prominence: 0.9 }],
    paletteType: 'vivid',
    illustrationSeed: 3,
  };
}

describe('normalizeProjectName', () => {
  it('collapses whitespace and trims', () => {
    expect(normalizeProjectName('  Mi   paleta  ')).toBe('Mi paleta');
  });

  it('clamps overly long names', () => {
    const long = 'a'.repeat(200);
    expect(normalizeProjectName(long)).toHaveLength(80);
  });
});

describe('createProject', () => {
  it('builds a versioned project with equal created/updated stamps', () => {
    const project = createProject('Marca otoño', snapshot(), { id: 'p1', now: 1000 });
    expect(project).not.toBeNull();
    expect(project).toMatchObject({
      version: 1,
      id: 'p1',
      name: 'Marca otoño',
      createdAt: 1000,
      updatedAt: 1000,
      thumbnail: null,
    });
  });

  it('keeps a provided thumbnail', () => {
    const project = createProject('X', snapshot(), {
      id: 'p1',
      now: 1,
      thumbnail: 'data:image/png;base64,AAA',
    });
    expect(project?.thumbnail).toBe('data:image/png;base64,AAA');
  });

  it('rejects an empty name', () => {
    expect(createProject('   ', snapshot(), { id: 'p1', now: 1 })).toBeNull();
  });
});

describe('createProject / validateProject round-trip', () => {
  it('validates a project serialized through storage', () => {
    const project = createProject('Marca', snapshot(), { id: 'p1', now: 2000 })!;
    // Simulate a storage round-trip (snapshot stored as its JSON envelope).
    const stored = JSON.parse(
      JSON.stringify({ ...project, snapshot: serializeWorkspace(project.snapshot) }),
    );
    const result = validateProject(stored);
    expect(result).not.toBeNull();
    expect(result?.id).toBe('p1');
    expect(result?.snapshot).toEqual(project.snapshot);
  });

  it('validates a project whose snapshot is a plain object', () => {
    const project = createProject('Marca', snapshot(), { id: 'p1', now: 2000 })!;
    const envelope = { version: 1, ...project.snapshot };
    const result = validateProject({ ...project, snapshot: envelope });
    expect(result?.snapshot).toEqual(project.snapshot);
  });
});

describe('validateProject rejects malformed input', () => {
  const base = () => ({
    version: 1,
    id: 'p1',
    name: 'Marca',
    createdAt: 1,
    updatedAt: 2,
    snapshot: { version: 1, ...snapshot() },
    thumbnail: null,
  });

  it('rejects non-objects', () => {
    expect(validateProject(null)).toBeNull();
    expect(validateProject('project')).toBeNull();
    expect(validateProject([])).toBeNull();
  });

  it('rejects unknown versions', () => {
    expect(validateProject({ ...base(), version: 2 })).toBeNull();
    expect(validateProject({ ...base(), version: undefined })).toBeNull();
  });

  it('rejects missing or empty id and name', () => {
    expect(validateProject({ ...base(), id: '' })).toBeNull();
    expect(validateProject({ ...base(), id: 42 })).toBeNull();
    expect(validateProject({ ...base(), name: '   ' })).toBeNull();
    expect(validateProject({ ...base(), name: 10 })).toBeNull();
  });

  it('rejects bad timestamps', () => {
    expect(validateProject({ ...base(), createdAt: 'soon' })).toBeNull();
    expect(validateProject({ ...base(), updatedAt: Number.NaN })).toBeNull();
  });

  it('rejects a bad thumbnail type', () => {
    expect(validateProject({ ...base(), thumbnail: 5 })).toBeNull();
  });

  it('rejects an invalid or unknown-shape snapshot', () => {
    expect(validateProject({ ...base(), snapshot: { version: 2, ...snapshot() } })).toBeNull();
    expect(validateProject({ ...base(), snapshot: { nope: true } })).toBeNull();
    expect(validateProject({ ...base(), snapshot: 'not json' })).toBeNull();
  });
});

describe('sortProjectsByUpdatedAt', () => {
  function project(id: string, updatedAt: number): LocalProject {
    return createProject(id, snapshot(), { id, now: 0 })
      ? touchProject(createProject(id, snapshot(), { id, now: 0 })!, updatedAt)
      : (null as never);
  }

  it('orders newest first', () => {
    const sorted = sortProjectsByUpdatedAt([
      project('a', 100),
      project('b', 300),
      project('c', 200),
    ]);
    expect(sorted.map((p) => p.id)).toEqual(['b', 'c', 'a']);
  });

  it('breaks ties deterministically by id', () => {
    const sorted = sortProjectsByUpdatedAt([
      project('z', 100),
      project('a', 100),
      project('m', 100),
    ]);
    expect(sorted.map((p) => p.id)).toEqual(['a', 'm', 'z']);
  });

  it('does not mutate the input', () => {
    const input = [project('a', 1), project('b', 2)];
    const before = input.map((p) => p.id);
    sortProjectsByUpdatedAt(input);
    expect(input.map((p) => p.id)).toEqual(before);
  });
});

describe('project mutations', () => {
  const base = createProject('Cafetería', snapshot(), { id: 'a', now: 1 })!;

  it('renames keeping identity and rejects empty names', () => {
    const renamed = renameProject(base, '  Café  Sur ', 5)!;
    expect(renamed.id).toBe('a');
    expect(renamed.name).toBe('Café Sur');
    expect(renamed.updatedAt).toBe(5);
    expect(renameProject(base, '   ', 5)).toBeNull();
  });

  it('updates the snapshot in place and keeps createdAt', () => {
    const next = { ...snapshot(), illustrationSeed: 9 };
    const updated = updateProjectSnapshot(base, next, 7, 'data:x');
    expect(updated.id).toBe('a');
    expect(updated.createdAt).toBe(1);
    expect(updated.updatedAt).toBe(7);
    expect(updated.snapshot.illustrationSeed).toBe(9);
    expect(updated.thumbnail).toBe('data:x');
  });

  it('duplicates with a new id, copy suffix and fresh timestamps', () => {
    const copy = duplicateProject(base, { id: 'b', now: 9 });
    expect(copy.id).toBe('b');
    expect(copy.name).toBe('Cafetería (copia)');
    expect(copy.createdAt).toBe(9);
    expect(copy.snapshot).toEqual(base.snapshot);
  });

  it('keeps duplicated names within the maximum length', () => {
    const long = { ...base, name: 'x'.repeat(80) };
    expect(duplicateProject(long, { id: 'c', now: 1 }).name.length).toBeLessThanOrEqual(80);
  });
});
