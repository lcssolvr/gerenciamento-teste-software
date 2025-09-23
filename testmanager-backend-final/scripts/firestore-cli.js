// scripts/firestore-cli.js
require('dotenv').config()
const admin = require('firebase-admin')

// Inicializa Admin via .env
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  })
}

const db = admin.firestore()
const now = admin.firestore.FieldValue.serverTimestamp()

function toNum (v) { return v == null ? null : Number(v) || null }

async function upsert(ref, data) {
  const snap = await ref.get()
  const base = snap.exists ? { updatedAt: now } : { createdAt: now, updatedAt: now }
  await ref.set({ ...data, ...base }, { merge: true })
  return ref.id
}

// -------- parser robusto (flags ou posicionais) --------
function parseArgs () {
  const out = {}
  const args = process.argv.slice(3) // depois do comando

  // 1) flags --key=value ou --key value
  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (a && a.startsWith('--')) {
      const eq = a.indexOf('=')
      let key, val
      if (eq > -1) {
        key = a.slice(2, eq)
        val = a.slice(eq + 1)
      } else {
        key = a.slice(2)
        val = args[i + 1] && !args[i + 1].startsWith('--') ? args[++i] : true
      }
      out[key] = val
    }
  }

  // 2) fallback: se não veio nenhuma flag, aceita posicionais
  if (Object.keys(out).length === 0) {
    const [a, b, c, d] = args
    const cmd = process.argv[2]
    if (cmd === 'create-user') {
      if (a) out.email = a
      if (b) out.password = b
      if (c) out.fullName = c
      if (d) out.role = d
    } else if (cmd === 'create-client') {
      if (a) out.name = a
      if (b) out.email = b
      if (c) out.cpfCnpj = c
      if (d) out.address = d
    } else if (cmd === 'create-project') {
      if (a) out.name = a
      if (b) out.clientId = b
      if (c) out.description = c
    } else if (cmd === 'create-test') {
      if (a) out.projectId = a
      if (b) out.name = b
      if (c) out.status = c
      if (d) out.order = d
    }
  }

  return out
}

// -------- comandos --------
async function createUser(f) {
  const {
    email, password, fullName = '', role = 'collaborator',
    clientId = null, cpfCnpj = null, address = null
  } = f
  if (!email || !password) throw new Error('Informe --email e --password')

  // cria no Auth (ou reaproveita)
  let user
  try {
    user = await admin.auth().createUser({ email, password, displayName: fullName })
  } catch (e) {
    if (e.code === 'auth/email-already-exists') {
      user = await admin.auth().getUserByEmail(email)
    } else {
      throw e
    }
  }

  // claims
  await admin.auth().setCustomUserClaims(user.uid, { role, clientId })

  // doc no Firestore
  await upsert(db.collection('users').doc(user.uid), {
    email, fullName, role, clientId, cpfCnpj, address, isActive: true
  })

  console.log('✓ User:', user.uid, email, `role=${role}`)
}

async function createClient(f) {
  const { name, email, cpfCnpj = null, phone = null, address = null, notes = null } = f
  if (!name || !email) throw new Error('Informe --name e --email')
  const ref = db.collection('clients').doc()
  const id = await upsert(ref, { name, email, cpfCnpj, phone, address, notes, isActive: true })
  console.log('✓ Client:', id, name)
}

async function createProject(f) {
  const { name, clientId, description = null, status = 'active', estimatedHours = null, notes = null } = f
  if (!name || !clientId) throw new Error('Informe --name e --clientId')
  const ref = db.collection('projects').doc()
  const id = await upsert(ref, {
    name, description, clientId, status,
    estimatedHours: toNum(estimatedHours), actualHours: 0, notes
  })
  console.log('✓ Project:', id, name, 'clientId=', clientId)
}

async function createTest(f) {
  const { projectId, name, description = '', status = 'pending', order = 1, estimatedHours = null, notes = null } = f
  if (!projectId || !name) throw new Error('Informe --projectId e --name')
  const ref = db.collection('projects').doc(projectId).collection('tests').doc()
  const id = await upsert(ref, {
    name, description, status, order: Number(order) || 1,
    estimatedHours: toNum(estimatedHours), actualHours: 0,
    expectedResult: null, actualResult: null, testData: null, notes, evidencePath: null
  })
  console.log('✓ Test:', id, 'projectId=', projectId)
}

async function main() {
  const cmd = process.argv[2]
  const f = parseArgs()

  try {
    if (cmd === 'create-user')         await createUser(f)
    else if (cmd === 'create-client')  await createClient(f)
    else if (cmd === 'create-project') await createProject(f)
    else if (cmd === 'create-test')    await createTest(f)
    else {
      console.log(`Uso:
  node scripts/firestore-cli.js create-user --email=adm@teste.com --password=123456 --fullName="Admin" --role=admin
  node scripts/firestore-cli.js create-client --name="Empresa X" --email=contato@x.com" --cpfCnpj="12.345.678/0001-99" --address="Rua Y, 123"
  node scripts/firestore-cli.js create-project --name="Portal" --clientId=CLIENT_ID --description="Projeto inicial"
  node scripts/firestore-cli.js create-test --projectId=PROJETO_ID --name="Login ok" --status=pending --order=1

# Também funciona com posicionais:
#   create-user  <email> <password> <fullName> <role>
#   create-client <name> <email> <cpfCnpj> <address>
#   create-project <name> <clientId> <description>
#   create-test <projectId> <name> <status> <order>
`)
    }
  } catch (e) {
    console.error('Erro:', e.message)
    process.exitCode = 1
  }
}
main()
