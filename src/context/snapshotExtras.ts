import type { WorkspaceSnapshot } from '@lib/studio/workspaceSnapshot';

/** Snapshot fields owned by the workspace controller, not by the palette context. */
export type SnapshotExtras = Pick<WorkspaceSnapshot, 'typography' | 'canvasView'>;

/** Extras of the most recently restored snapshot; `token` changes on every restore. */
export type RestoredSnapshotExtras = {
  extras: SnapshotExtras;
  token: number;
};

export function extrasFromSnapshot(snapshot: WorkspaceSnapshot): SnapshotExtras {
  return { typography: snapshot.typography, canvasView: snapshot.canvasView };
}

/** Structural equality, so the controller can skip redundant context updates. */
export function sameExtras(a: SnapshotExtras, b: SnapshotExtras): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
