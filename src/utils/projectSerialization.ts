/**
 * Extra per-object properties we want Fabric to include in toJSON / toObject.
 * Fabric's default toObject drops unknown properties; passing this list to
 * canvas.toJSON(EXTRA_PROPS) preserves them.
 */
export const EXTRA_PROPS: string[] = ['comment', '_filterState'];
