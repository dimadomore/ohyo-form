#!/usr/bin/env node

const args = process.argv.slice(2);

const hasFlag = (flag) => args.includes(flag);
const getArgValue = (prefix, fallback) => {
  const match = args.find((arg) => arg.startsWith(`${prefix}=`));
  return match ? match.slice(prefix.length + 1) : fallback;
};

const isLive = hasFlag("--live");
const dryRun = !isLive;

const baseUrl = getArgValue(
  "--url",
  process.env.APP_URL || "http://localhost:3000",
).replace(/\/$/, "");

const path = "/api/cron/reminders";
const url = `${baseUrl}${path}${dryRun ? "?dryRun=1" : ""}`;

const headers = {};
if (process.env.CRON_SECRET) {
  headers.Authorization = `Bearer ${process.env.CRON_SECRET}`;
}

console.log(`\nRunning reminders job: ${dryRun ? "DRY RUN" : "LIVE"}`);
console.log(`GET ${url}\n`);

try {
  const response = await fetch(url, { method: "GET", headers });
  const text = await response.text();

  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    payload = text;
  }

  if (!response.ok) {
    console.error("Request failed:", response.status, response.statusText);
    console.error(payload);
    process.exit(1);
  }

  console.log(JSON.stringify(payload, null, 2));
  console.log("\nDone.\n");
} catch (error) {
  console.error("Failed to call reminders endpoint:");
  console.error(error);
  process.exit(1);
}

