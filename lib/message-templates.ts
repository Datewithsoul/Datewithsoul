import { prisma } from "@/lib/prisma";
export * from "./message-templates-types";
import {
  TEMPLATE_DEFINITIONS,
  LoadedTemplate,
  renderTemplate,
} from "./message-templates-types";

/**
 * Ensure table exists in database safely.
 */
let isTableChecked = false;
export async function ensureMessageTemplateTable() {
  if (isTableChecked) return;
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "MessageTemplate" (
        "id" TEXT NOT NULL,
        "key" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "category" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "variables" TEXT[] DEFAULT ARRAY[]::TEXT[],
        "enabled" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "MessageTemplate_pkey" PRIMARY KEY ("id")
      );
    `);
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "MessageTemplate_key_key" ON "MessageTemplate"("key");
    `);
    isTableChecked = true;
  } catch (error) {
    console.warn("Could not ensure MessageTemplate table:", error);
  }
}

/**
 * Fetch all templates with their database overrides or default values.
 */
export async function getAllMessageTemplates(): Promise<LoadedTemplate[]> {
  await ensureMessageTemplateTable();

  let dbTemplates: { key: string; content: string; enabled: boolean; updatedAt: Date }[] = [];
  try {
    dbTemplates = await prisma.messageTemplate.findMany({
      select: { key: true, content: true, enabled: true, updatedAt: true },
    });
  } catch (err) {
    console.warn("Error loading MessageTemplate from DB:", err);
  }

  const dbMap = new Map(dbTemplates.map((t) => [t.key, t]));

  return TEMPLATE_DEFINITIONS.map((def) => {
    const found = dbMap.get(def.key);
    return {
      key: def.key,
      title: def.title,
      description: def.description,
      category: def.category,
      content: found?.content ?? def.defaultContent,
      defaultContent: def.defaultContent,
      variables: def.variables,
      enabled: found?.enabled ?? true,
      updatedAt: found?.updatedAt,
    };
  });
}

/**
 * Get a specific template by key, returning rendered text and enabled status.
 */
export async function getRenderedMessage(
  key: string,
  variables: Record<string, string | number | undefined | null>
): Promise<{ text: string; enabled: boolean }> {
  await ensureMessageTemplateTable();

  const def = TEMPLATE_DEFINITIONS.find((t) => t.key === key);
  let content = def?.defaultContent ?? "";
  let enabled = true;

  try {
    const dbRecord = await prisma.messageTemplate.findUnique({
      where: { key },
      select: { content: true, enabled: true },
    });
    if (dbRecord) {
      content = dbRecord.content;
      enabled = dbRecord.enabled;
    }
  } catch {
    // If DB fails, fallback to default definition
  }

  return {
    text: renderTemplate(content, variables),
    enabled,
  };
}
