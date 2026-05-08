/**
 * CMI Payment Gateway - Morocco
 * Centre Monétique Interbancaire (CMI)
 * 
 * Flow:
 * 1. Backend builds a signed form with all params + SHA-512 hash
 * 2. Frontend auto-submits POST form → user lands on CMI payment page
 * 3. User pays on CMI (card, etc.)
 * 4. CMI POSTs result to /api/payment/callback (server-to-server)
 * 5. CMI redirects browser to okUrl or failUrl
 */

import crypto from 'crypto';

// ─────────────────────────────────────────────────────────
// Build the hash CMI expects
// All params sorted alphabetically by key, values joined with |
// Then storeKey appended, then SHA-512 → base64
// ─────────────────────────────────────────────────────────
export function buildCmiHash(params, storeKey) {
  const sortedKeys = Object.keys(params).sort();
  
  // Build the string: val1|val2|val3|...|storeKey
  const hashStr = sortedKeys
    .filter(k => k !== 'hash')        // exclude hash itself
    .map(k => params[k])
    .join('|') + '|' + storeKey;

  return crypto
    .createHash('sha512')
    .update(hashStr, 'utf8')
    .digest('base64');
}

// ─────────────────────────────────────────────────────────
// Build all CMI payment parameters for a given order
// ─────────────────────────────────────────────────────────
export function buildCmiParams({ orderId, amount, customerEmail, customerName }) {
  const {
    CMI_CLIENT_ID,
    CMI_STORE_KEY,
    CMI_STORE_TYPE,
    CMI_TRAN_TYPE,
    CMI_CURRENCY,
    CMI_LANG,
    CMI_OK_URL,
    CMI_FAIL_URL,
    SITE_URL,
  } = process.env;

  // Random string to prevent replay attacks
  const rnd = Date.now().toString();

  const params = {
    clientid:    CMI_CLIENT_ID,
    storetype:   CMI_STORE_TYPE   || '3D_PAY_HOSTING',
    trantype:    CMI_TRAN_TYPE    || 'PreAuth',
    amount:      parseFloat(amount).toFixed(2),
    currency:    CMI_CURRENCY     || '504',      // 504 = MAD
    oid:         String(orderId),
    okUrl:       CMI_OK_URL,
    failUrl:     CMI_FAIL_URL,
    lang:        CMI_LANG         || 'fr',
    rnd:         rnd,
    callbackUrl: `${SITE_URL}/api/payment/callback`,
    email:       customerEmail    || '',
    BillToName:  customerName     || '',
    instalment:  '',               // leave empty for one-shot payment
    TranType:    CMI_TRAN_TYPE    || 'PreAuth',
  };

  // Compute hash and add to params
  params.hash = buildCmiHash(params, CMI_STORE_KEY);

  return params;
}

// ─────────────────────────────────────────────────────────
// Verify the callback signature CMI sends back
// ─────────────────────────────────────────────────────────
export function verifyCmiCallback(callbackParams, storeKey) {
  const received = callbackParams.HASH || callbackParams.hash;
  if (!received) return false;

  // Remove HASH from params before verifying
  const params = { ...callbackParams };
  delete params.HASH;
  delete params.hash;

  const expected = buildCmiHash(params, storeKey);
  return expected === received;
}
