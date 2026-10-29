import { index, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import type { WizardData } from "@/lib/tracksetup/types";

export const configurations = pgTable(
  "configurations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    storeName: text("store_name").notNull(),
    storeUrl: text("store_url").notNull(),
    myshopifyDomain: text("myshopify_domain").notNull(),
    mode: text("mode").notNull(),
    platforms: text("platforms").array().notNull(),
    packageSize: text("package_size").notNull().default("0"),
    payload: jsonb("payload").$type<WizardData>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("configurations_created_at_idx").on(t.createdAt)],
);

export type ConfigurationRow = typeof configurations.$inferSelect;
export type NewConfiguration = typeof configurations.$inferInsert;
