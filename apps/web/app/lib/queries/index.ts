/**
 * Query hooks barrel — re-exports per-resource hooks so existing
 * `import { ... } from "~/lib/queries"` callers don't need to change.
 *
 * When adding a new resource, create a new file in this folder and
 * add it here.
 */

export * from "./products";
export * from "./categories";
export * from "./orders";
export * from "./auth";
export * from "./uploads";
export * from "./posts";
export * from "./leads";
export * from "./customers";
export * from "./invoices";
export * from "./tickets";
export * from "./team";
