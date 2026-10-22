# Recoverable editor drafts

News pages, event pages, the new-event form, event resource dialogs and manual event ordering autosave to browser localStorage. Records are isolated by authenticated account and content identity. Recovery only runs inside the editor; public rendering and the CMS API never read these records. No autosave path calls a publication API.

Every committed input is saved without a debounce. Plain-text contentEditable fields update on input using an unmanaged text node so the cursor stays in place. Completed uploads persist their references, titles and positions. Resource dialogs also retain edits not yet applied. An interrupted upload itself cannot be resumed.

The editor's Borradores menu lists pending work in the current browser. Reloading an edited page recovers its draft. Successful explicit publication or discard removes the corresponding draft; validation/network failures retain it. A published-content mismatch produces a review notice. Concurrent tabs use compare-before-write and require a choice rather than overwriting another tab's draft. Storage failures are visible and trigger the browser's leave-page warning.

Drafts are local to the browser profile and site origin; they are not device synchronization or backups after clearing browser data. Other admin/settings forms retain their existing behavior.

Verification: `node scripts/test-recoverable-drafts.cjs`, `node scripts/test-content-block-editor.cjs`, `node scripts/test-event-order.cjs`, `node scripts/test-event-inline-resources.mjs`, and `npm run build`. The isolated browser fixture is `node scripts/test-event-publication.mjs --serve` (127.0.0.1:4192, in-memory database, no production credentials). Check public GET responses before and after reload/recovery; only explicit publication may alter them.
