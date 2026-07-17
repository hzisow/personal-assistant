#!/usr/bin/env node
// Encrypt a brief JSON for the public app repo.
//
//   node tools/encrypt-brief.mjs 2026-07-17
//
// Reads  briefs/<date>.json         (plaintext, private repo — source of truth)
// Writes app/data/<date>.enc.json   (AES-256-GCM ciphertext, safe to publish)
//        app/data/index.json        (plaintext list of available dates)
//
// Passphrase comes from state/app-passphrase.txt (private repo, gitignored from
// the public mirror) or the $BRIEF_PASSPHRASE env var. The scheme is
// PBKDF2-HMAC-SHA256 (250k iters) → AES-256-GCM, byte-for-byte compatible with
// the browser Web Crypto decrypt in app/index.html.
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { randomBytes, pbkdf2Sync, createCipheriv } from "node:crypto";

const ITER = 250000;
const date = process.argv[2];
if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
  console.error("usage: node tools/encrypt-brief.mjs YYYY-MM-DD");
  process.exit(1);
}
const pass = (process.env.BRIEF_PASSPHRASE ||
  (existsSync("state/app-passphrase.txt") ? readFileSync("state/app-passphrase.txt", "utf8") : "")).trim();
if (!pass) { console.error("No passphrase (state/app-passphrase.txt or $BRIEF_PASSPHRASE)."); process.exit(1); }

const plaintext = readFileSync(`briefs/${date}.json`);            // encrypt raw bytes
const salt = randomBytes(16), iv = randomBytes(12);
const key = pbkdf2Sync(pass, salt, ITER, 32, "sha256");
const c = createCipheriv("aes-256-gcm", key, iv);
const body = Buffer.concat([c.update(plaintext), c.final()]);
const ct = Buffer.concat([body, c.getAuthTag()]);                // tag appended → matches Web Crypto
const blob = { v: 1, alg: "AES-256-GCM", kdf: "PBKDF2-SHA256", iter: ITER,
  salt: salt.toString("base64"), iv: iv.toString("base64"), ct: ct.toString("base64") };
writeFileSync(`app/data/${date}.enc.json`, JSON.stringify(blob));

// Rebuild the date index (newest first).
const dates = readdirSync("app/data")
  .filter(f => /^\d{4}-\d{2}-\d{2}\.enc\.json$/.test(f))
  .map(f => f.slice(0, 10)).sort().reverse();
writeFileSync("app/data/index.json",
  JSON.stringify({ schema: 1, latest: dates[0], dates }, null, 0));

console.log(`encrypted → app/data/${date}.enc.json  (${dates.length} day(s) in index)`);
