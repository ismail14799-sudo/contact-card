# Protected Contact Card

An English / Russian contact card with field selection, contact-file exports and QR sharing. The public page opens in a locked state. No personal contact profile, portrait plaintext or decryption key is embedded in this repository.

## Encryption model

- Contact snapshots are encrypted in the browser with AES-256-GCM, a fresh random 256-bit key, a random 96-bit IV and a 128-bit authentication tag.
- The encrypted contact snapshot and its key travel only in the complete QR link's URL fragment. They are not published in repository files or sent in the initial page HTTP request.
- The portrait is stored as an authenticated encrypted binary asset. Its independent decryption key is included inside a contact snapshot only when the portrait is selected.
- A direct visit to the website or repository without a complete card link reveals the generic interface and encrypted portrait bytes. A missing/wrong key, modified ciphertext or malformed payload fails closed.
- Field selection happens before encryption. Omitted values, Russian job-title variants and the portrait key are removed from restricted snapshots rather than hidden with CSS.
- All encryption uses the platform Web Crypto API. There is no custom cipher or external encryption service. Separate additional-authenticated-data labels bind contact and portrait ciphertext to their intended purposes.

The full link is a bearer capability: anyone holding it can decrypt, copy and forward its selected details. Sharing a link publicly also shares its key publicly. The application does not authenticate the real-world identity of a contact or prevent a recipient from saving data.

## Hosting and clean history

Deploy this directory's root to GitHub Pages over HTTPS. This release must be published in a fresh repository history containing only this allowlisted source and `data/portrait.enc`. Never copy the original unencrypted portrait, private launch material, screenshots, previous commits, `private/`, `artifacts/` or internal preview fixtures into the public repository.

The earlier unencrypted working repository remains private. The public release does not inherit its history. Site code is public; the decryption keys are not.

The robots exclusion and noindex metadata reduce ordinary indexing. Confidentiality depends on encryption and keeping complete QR links private, not on crawler compliance.

## Owner and recipient workflow

The privately supplied owner launch link saves the master profile on that device only, then removes the setup fragment from the address bar. Browser storage is device-local. It is not an authenticated cloud dashboard or encrypted-at-rest password vault.

Recipients receiving a normal card link decrypt a selected snapshot without storing the full profile as an owner profile. **Choose** changes the preview and creates a new encrypted snapshot. The built-in sharing actions and address bar then use that selection. A recipient cannot enable fields absent from their snapshot.

Editing the local profile creates new links. Existing snapshots stay unchanged. A printed QR represents the snapshot and key created at that time. This static version has no remote revocation, expiry or access tracking.

## Offline and export behavior

- Web QR: opens the encrypted card. A first-time recipient needs internet to load the public application and encrypted portrait.
- Offline Contact QR: contains the chosen contact information directly as a compact vCard. It is intentionally readable to compatible QR readers without internet and does not contain the portrait or any encryption key.
- VCF, text, PDF and offline HTML exports intentionally contain the selected readable data. They are generated locally after opening the card; they are not hosted in this repository.
- The service worker caches only the generic application shell, never decrypted profiles, keys or portrait plaintext. It does not make first-time website visits work offline.

## Validation

Run `node --test tests/core.test.cjs tests/secure.test.cjs`. Security checks cover authenticated round trips, wrong keys, ciphertext tampering, missing parameters, purpose separation, independent Node AES-GCM interoperability, field omission, key omission and QR capacity. The release audit scans every publishable file for actual profile strings and generated secrets and rejects plaintext images or private paths.

Prepared on 2026-10-21. No analytics, remote fonts or third-party QR endpoints are used. The vendored QR generator retains its MIT notice in `vendor/`.
