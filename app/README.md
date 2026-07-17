# brief — the app

Static PWA for Henry's daily brief, served by GitHub Pages at
**https://brief.henryzisow.com**. This directory is mirrored to the public
`hzisow/brief` repo. The source of truth lives in the private
`hzisow/personal-assistant` repo; the morning routine encrypts each brief and
publishes the ciphertext here.

- `index.html` — the whole app (Airbnb-style UI, passphrase gate, decrypt, render)
- `manifest.webmanifest`, `sw.js`, `icons/` — installable PWA
- `data/<date>.enc.json` — AES-256-GCM ciphertext of each brief (unreadable without the passphrase)
- `data/index.json` — plaintext list of available dates

Privacy: only encrypted blobs are ever published. Decryption happens entirely
in the browser after the passphrase is entered (PBKDF2-SHA256 → AES-256-GCM).
