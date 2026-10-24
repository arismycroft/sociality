export function track(event: string, props?: Record<string, unknown>) {
  if (process.env.NODE_ENV !== "production") console.debug("[track]", event, props ?? {});
}
