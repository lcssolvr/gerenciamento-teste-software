<template>
  <div class="dashboard-layout">
    <Sidebar />
    <div class="main-content">
      <div class="page-header">
        <div>
          <h1 class="page-title">Tests</h1>
          <p class="page-subtitle">Gerencie casos de teste por projeto, com evidências.</p>
        </div>
        <div class="page-actions">
          <select v-model="projectId" class="select">
            <option disabled value="">Selecione um projeto</option>
            <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.name }}</option>
          </select>
          <button class="primary-btn" :disabled="!projectId" @click="openCreate = true">Novo Teste</button>
        </div>
      </div>

      <Card v-if="!projectId">
        <p>Escolha um projeto para visualizar seus testes.</p>
      </Card>

      <Card v-else>
        <div class="tests-list">
          <div v-for="t in tests" :key="t.id" class="test-item">
            <div class="test-head">
              <div>
                <h3 class="test-title">{{ t.title }}</h3>
                <p class="test-sub">{{ t.description }}</p>
              </div>
              <select v-model="t.status" @change="updateTest(t)" class="select small">
                <option value="todo">todo</option>
                <option value="running">running</option>
                <option value="passed">passed</option>
                <option value="failed">failed</option>
              </select>
            </div>

            <div class="test-body">
              <div class="steps">
                <strong>Passos:</strong>
                <ul>
                  <li v-for="(s, i) in (t.steps || [])" :key="i">{{ s }}</li>
                </ul>
              </div>
              <div class="evidences">
                <strong>Evidências:</strong>
                <div class="evidence-actions">
                  <input type="file" @change="onFile($event, t)" />
                </div>
                <ul class="evidence-list">
                  <li v-for="(ev,i) in (t.evidences || [])" :key="ev.path" class="evidence-item">
                    <a :href="ev.url" target="_blank" rel="noopener">{{ ev.name || ev.path }}</a>
                    <button class="danger-btn xs" @click="removeEvidence(t, ev.path)">Remover</button>
                  </li>
                </ul>
              </div>
            </div>

            <div class="test-foot">
              <button class="danger-btn" @click="deleteTest(t)">Excluir Teste</button>
            </div>
          </div>
        </div>
      </Card>

      <!-- Create modal simples -->
      <Card v-if="openCreate" class="modal">
        <h3>Novo Teste</h3>
        <div class="form-grid">
          <Input v-model="form.title" placeholder="Título" />
          <Input v-model="form.description" placeholder="Descrição" />
          <Input v-model="stepsText" placeholder="Passos (separe por ; )" />
        </div>
        <div class="modal-actions">
          <button class="primary-btn" @click="createTest">Salvar</button>
          <button class="secondary-btn" @click="openCreate=false">Cancelar</button>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup>
import Sidebar from '../components/layout/Sidebar.vue'
import Card from '../components/common/Card.vue'
import Input from '../components/common/Input.vue'
import { ref, onMounted, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import { api } from '../services/api'
import { uploadEvidence } from '../services/storage'

const store = useAuthStore()
const projects = ref([])
const projectId = ref('')
const tests = ref([])
const openCreate = ref(false)

const form = ref({ title: '', description: '' })
const stepsText = ref('')

async function loadProjects() {
  const token = store.token.value
  const res = await api('/api/projects', { token })
  projects.value = res.data || []
  if (!projectId.value && projects.value.length) projectId.value = projects.value[0].id
}

async function loadTests() {
  if (!projectId.value) return
  const token = store.token.value
  const res = await api(`/api/projects/${projectId.value}/tests`, { token })
  tests.value = res.data || []
}

async function createTest() {
  const token = store.token.value
  const payload = {
    title: form.value.title,
    description: form.value.description,
    steps: stepsText.value ? stepsText.value.split(';').map(s => s.trim()).filter(Boolean) : []
  }
  await api(`/api/projects/${projectId.value}/tests`, { method:'POST', body: payload, token })
  openCreate.value = false
  form.value = { title:'', description:'' }
  stepsText.value = ''
  await loadTests()
}

async function updateTest(t) {
  const token = store.token.value
  await api(`/api/projects/${projectId.value}/tests/${t.id}`, { method:'PATCH', body: { status: t.status }, token })
}

async function deleteTest(t) {
  const token = store.token.value
  await api(`/api/projects/${projectId.value}/tests/${t.id}`, { method:'DELETE', token })
  await loadTests()
}

async function onFile(evt, t) {
  const file = evt.target.files?.[0]
  if (!file) return
  const info = await uploadEvidence(projectId.value, t.id, file)
  const token = store.token.value
  await api(`/api/projects/${projectId.value}/tests/${t.id}/evidence`, { method:'POST', body: info, token })
  await loadTests()
  evt.target.value = ''
}

async function removeEvidence(t, path) {
  const token = store.token.value
  // chama o backend que apaga no Storage e remove do doc
  await api(`/api/projects/${projectId.value}/tests/${t.id}/evidence`, { method:'DELETE', body: { path }, token })
  await loadTests()
}

onMounted(async () => {
  await store.initAuth()
  await loadProjects()
  await loadTests()
})

watch(projectId, async () => {
  await loadTests()
})
</script>

<style scoped>
.select { padding: 8px; }
.select.small { padding: 6px; }
.tests-list { display: grid; gap: 16px; }
.test-item { display: grid; gap: 8px; border-bottom: 1px solid rgba(0,0,0,.1); padding-bottom: 12px; }
.test-head { display: flex; justify-content: space-between; align-items: center; }
.test-title { margin: 0; }
.test-sub { margin: 4px 0 0; opacity: .8; }
.test-body { display: grid; gap: 12px; }
.evidence-list { list-style: none; padding-left: 0; display: grid; gap: 6px; }
.evidence-item { display: flex; gap: 10px; align-items: center; }
.modal { position: fixed; right: 24px; bottom: 24px; max-width: 480px; z-index: 5; }
.primary-btn { padding: 8px 12px; }
.secondary-btn { padding: 8px 12px; }
.danger-btn { padding: 8px 12px; background: #c0392b; color: #fff; border: none; cursor: pointer; }
.danger-btn.xs { padding: 4px 8px; font-size: 12px; }
.page-actions { display: flex; gap: 12px; align-items: center; }
.form-grid { display: grid; gap: 10px; }
</style>
