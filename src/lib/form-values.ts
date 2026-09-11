/**
 * Pulls the named fields out of a FormData as plain strings so a failed
 * action can hand them back to the form.
 *
 * Only ever call this with an explicit list of field names. Passing the whole
 * FormData through would sooner or later send a password or a card number
 * back down the wire.
 */
export function keepValues(formData: FormData, fields: readonly string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const field of fields) {
    const value = formData.get(field);
    if (typeof value === "string") out[field] = value;
  }
  return out;
}
