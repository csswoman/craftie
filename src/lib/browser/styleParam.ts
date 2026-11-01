const STYLE_PARAM = 'style';

/** Id of a curated style requested through `/?style=<id>`, or `null`. */
export function readStyleParam(): string | null {
  try {
    return new URLSearchParams(window.location.search).get(STYLE_PARAM);
  } catch {
    return null;
  }
}

/** Removes the param so reloading does not re-apply the style over later edits. */
export function clearStyleParam(): void {
  try {
    const url = new URL(window.location.href);
    url.searchParams.delete(STYLE_PARAM);
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  } catch {
    // Best-effort only.
  }
}
