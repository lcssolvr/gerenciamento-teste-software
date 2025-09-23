/**
 * Script simples para definir custom claims no Firebase Auth.
 * Uso:
 *   1) Preencha seu .env com as credenciais do Admin SDK
 *   2) Rode: node scripts/setClaims.js <UID> <role> [clientId]
 *      Ex.: node scripts/setClaims.js 123abc admin
 *           node scripts/setClaims.js 456def client CLIENT_DOC_ID
 */
require('dotenv').config();
const admin = require('../src/config/firebase');

async function main() {
  const [,, uid, role, clientId] = process.argv;
  if (!uid || !role) {
    console.log('Uso: node scripts/setClaims.js <UID> <role> [clientId]');
    process.exit(1);
  }
  const claims = { role };
  if (role === 'client' && clientId) claims.clientId = clientId;
  await admin.auth().setCustomUserClaims(uid, claims);
  console.log('Claims definidas para', uid, claims);
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
