<template>
  <div class="sidebar">
    <!-- Cabeçalho -->
    <div class="sidebar-header">
      <div class="logo">
        <div class="logo-icon">
          <svg viewBox="0 0 24 24" fill="currentColor" class="logo-svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        <div class="logo-text">
          <div class="logo-title">TestManager</div>
          <div class="logo-subtitle">Sistema de Testes</div>
        </div>
      </div>
    </div>

    <!-- Navegação -->
    <nav class="sidebar-nav">
      <router-link to="/dashboard" class="nav-item" :class="{ active: $route.path === '/dashboard' }">
        <svg class="nav-icon" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
        </svg>
        <span>Dashboard</span>
      </router-link>

      <router-link to="/users" class="nav-item" :class="{ active: $route.path === '/users' }">
        <svg class="nav-icon" fill="currentColor" viewBox="0 0 24 24">
          <path d="M16 7c0-2.76-2.24-5-5-5s-5 2.24-5 5 2.24 5 5 5 5-2.24 5-5zM12 14c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5z"/>
        </svg>
        <span>Usuários</span>
      </router-link>

      <router-link to="/clients" class="nav-item" :class="{ active: $route.path === '/clients' }">
        <svg class="nav-icon" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
        <span>Clientes</span>
      </router-link>

      <router-link to="/projects" class="nav-item" :class="{ active: $route.path === '/projects' }">
        <svg class="nav-icon" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
        </svg>
        <span>Projetos</span>
      </router-link>
    </nav>

    <!-- Rodapé com menu do usuário -->
    <div class="sidebar-footer">
      <UserFooterMenu />
    </div>
  </div>
</template>

<script setup>
import UserFooterMenu from './UserFooterMenu.vue'
</script>

<style scoped>

.sidebar{
  width: 100%;
  height: 100vh;
  position: sticky; /* ou: static */
  top: 0;

  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  color: white;
  display: flex;
  flex-direction: column;
}

.sidebar-header { padding: 20px; border-bottom: 1px solid rgba(255,255,255,.1); }

.logo { display:flex; align-items:center; }
.logo-icon{
  width:40px;height:40px;background:#3498db;border-radius:50%;
  display:flex;align-items:center;justify-content:center;margin-right:12px;
}
.logo-svg{ width:24px;height:24px;color:#fff }
.logo-title{ font-size:18px;font-weight:600;color:#fff }
.logo-subtitle{ font-size:12px;color:rgba(255,255,255,.7) }

.sidebar-nav{ flex:1; padding:20px 0; }

.nav-item{
  display:flex;align-items:center;padding:12px 20px;
  color:rgba(255,255,255,.8);text-decoration:none;transition:.3s;
  border-left:3px solid transparent;
}
.nav-item:hover{ background:rgba(255,255,255,.1); color:#fff }
.nav-item.active{ background:rgba(52,152,219,.2); color:#fff; border-left-color:#3498db }
.nav-icon{ width:20px;height:20px;margin-right:12px }

.sidebar-footer{ padding:20px; border-top:1px solid rgba(255,255,255,.1) }
</style>
