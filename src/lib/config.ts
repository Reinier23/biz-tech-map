export const DEBUG = false; // Set to true for development debugging

// Feature flag for map layout engine; default 'dagre'. Can be overridden via localStorage('techmap_layout')
export const MAP_LAYOUT_ENGINE: 'dagre' | 'elk' = 'dagre';

export function getLayoutEngine(): 'dagre' | 'elk' {
  try {
    const v = localStorage.getItem('techmap_layout');
    if (v === 'elk' || v === 'dagre') return v;
  } catch {}
  return MAP_LAYOUT_ENGINE;
}
