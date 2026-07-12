/**
 * Extra per-object properties we want Fabric to include in toJSON / toObject.
 * Fabric's default toObject drops unknown properties; passing this list to
 * canvas.toJSON(EXTRA_PROPS) preserves them.
 */
export const EXTRA_PROPS: string[] = [
  'comment',
  '_filterState',
  // Text curve state (kind + strength) so the Curve slider can re-shape a
  // curve after save/load and undo/redo.
  'curveKind',
  'curveAmount',
  // Solid fill remembered before a destructive text effect (outline/hollow/
  // neon) so the 'None' effect can restore it.
  'origFill',
];
