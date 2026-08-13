import "server-only";

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { PlatformDatabase } from "@/lib/platform/types";

const DB_VERSION = 1;
const DB_DIR = path.join(process.cwd(), "data", "platform");
const DB_PATH = path.join(DB_DIR, "db.json");
const DB_TMP = path.join(DB_DIR, "db.json.tmp");

let writeQueue: Promise<void> = Promise.resolve();

export function emptyDatabase(): PlatformDatabase {
  return {
    version: DB_VERSION,
    organizations: [],
    users: [],
    invitations: [],
    subscriptions: [],
    integrations: [],
    landingPages: [],
    passwordResets: [],
    auditLogs: [],
  };
}

async function ensureDir(): Promise<void> {
  await mkdir(DB_DIR, { recursive: true });
}

export async function readDatabase(): Promise<PlatformDatabase> {
  try {
    const raw = await readFile(DB_PATH, "utf8");
    const parsed = JSON.parse(raw) as PlatformDatabase;
    return {
      ...emptyDatabase(),
      ...parsed,
      version: DB_VERSION,
    };
  } catch {
    return emptyDatabase();
  }
}

async function writeDatabaseUnsafe(db: PlatformDatabase): Promise<void> {
  await ensureDir();
  const payload = JSON.stringify({ ...db, version: DB_VERSION }, null, 2);
  await writeFile(DB_TMP, payload, "utf8");
  await rename(DB_TMP, DB_PATH);
}

/** Serialized read-modify-write to avoid concurrent corruption. */
export async function updateDatabase<T>(
  mutator: (db: PlatformDatabase) => T | Promise<T>,
): Promise<T> {
  let result!: T;
  writeQueue = writeQueue.then(async () => {
    const db = await readDatabase();
    result = await mutator(db);
    await writeDatabaseUnsafe(db);
  });
  await writeQueue;
  return result;
}

export async function replaceDatabase(db: PlatformDatabase): Promise<void> {
  await updateDatabase((current) => {
    current.organizations = db.organizations;
    current.users = db.users;
    current.invitations = db.invitations;
    current.subscriptions = db.subscriptions;
    current.integrations = db.integrations;
    current.landingPages = db.landingPages;
    current.passwordResets = db.passwordResets;
    current.auditLogs = db.auditLogs;
  });
}

export function getDbPath(): string {
  return DB_PATH;
}
