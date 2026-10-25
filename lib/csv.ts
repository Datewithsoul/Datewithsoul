// Excel only reads a CSV as UTF-8 (so Thai shows correctly) when it starts with a BOM
const UTF8_BOM = "﻿";

// Spreadsheet apps run cells starting with these as formulas; customer names come from LINE
const FORMULA_TRIGGERS = ["=", "+", "-", "@", "\t", "\r"];

// A cell containing any of these has to be quoted (RFC 4180)
const QUOTE_TRIGGERS = ['"', ",", "\n", "\r"];

type CsvCell = string | number | null | undefined;

function escapeCell(value: CsvCell) {
  if (value === null || value === undefined) return "";
  if (typeof value === "number") return String(value);
  const safe = FORMULA_TRIGGERS.some((trigger) => value.startsWith(trigger)) ? `'${value}` : value;
  return QUOTE_TRIGGERS.some((trigger) => safe.includes(trigger)) ? `"${safe.replaceAll('"', '""')}"` : safe;
}

export function toCsv(header: string[], rows: CsvCell[][]) {
  return UTF8_BOM + [header, ...rows].map((row) => row.map(escapeCell).join(",")).join("\r\n");
}

export function csvResponse(filename: string, csv: string) {
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}

const HTTP_UNAUTHORIZED = 401;
const HTTP_FORBIDDEN = 403;

const ADMIN_CHECK_FAILURES = {
  unauthenticated: { status: HTTP_UNAUTHORIZED, body: "Unauthorized" },
  forbidden: { status: HTTP_FORBIDDEN, body: "Forbidden" },
} as const;

export function adminCheckFailure(reason: keyof typeof ADMIN_CHECK_FAILURES) {
  const { status, body } = ADMIN_CHECK_FAILURES[reason];
  return new Response(body, { status });
}
