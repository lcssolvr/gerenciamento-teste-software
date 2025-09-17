<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="logo">
          <div class="logo-icon">
            <svg viewBox="0 0 24 24" fill="currentColor" class="logo-svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <span class="logo-text">TestFlow</span>
        </div>
        <h1 class="welcome-title">Bem-vindo ao TestFlow</h1>
        <p class="welcome-subtitle">Insira suas credenciais para continuar</p>
      </div>

      <div class="login-form">

        <form @submit.prevent="signIn">
          <Input
            v-model="email"
            type="email"
            label="E-mail"
            placeholder="email@exemplo.com"
            icon="email"
            required
            :error="emailError"
          />

          <Input
            v-model="password"
            type="password"
            label="Senha"
            placeholder="••••••••"
            icon="lock"
            required
            :error="passwordError"
          />

          <Button 
            type="submit" 
            variant="primary" 
            full-width 
            class="sign-in-btn"
            :disabled="isLoading"
          >
            {{ isLoading ? 'Signing in...' : 'Sign in' }}
          </Button>
        </form>

        <div class="login-footer">
          <a href="#" class="forgot-password">Esqueceu a senha?</a>
          <div class="signup-link">
            Precisa de uma conta? <a href="#" @click="showSignUp">Cadastre-se</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Button from '../../components/common/Button.vue'
import Input from '../../components/common/Input.vue'

export default {
  name: 'Login',
  components: {
    Button,
    Input
  },
  data() {
    return {
      email: '',
      password: '',
      emailError: '',
      passwordError: '',
      isLoading: false
    }
  },
  methods: {
    async signIn() {
      this.clearErrors()
      
      if (!this.validateForm()) {
        return
      }

      this.isLoading = true
      
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        this.$router.push('/dashboard')
      } catch (error) {
        console.error('Login error:', error)
        this.passwordError = 'Invalid email or password'
      } finally {
        this.isLoading = false
      }
    },
    
    validateForm() {
      let isValid = true
      
      if (!this.email) {
        this.emailError = 'Email is required'
        isValid = false
      } else if (!this.isValidEmail(this.email)) {
        this.emailError = 'Please enter a valid email'
        isValid = false
      }
      
      if (!this.password) {
        this.passwordError = 'Password is required'
        isValid = false
      } else if (this.password.length < 6) {
        this.passwordError = 'Password must be at least 6 characters'
        isValid = false
      }
      
      return isValid
    },
    
    isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(email)
    },
    
    clearErrors() {
      this.emailError = ''
      this.passwordError = ''
    },
    
    showSignUp() {
      console.log('Show sign up modal')
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  padding: 40px;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.logo-icon {
  width: 48px;
  height: 48px;
  background: #2c3e50;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.logo-svg {
  width: 28px;
  height: 28px;
  color: white;
}

.logo-text {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
}

.welcome-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.welcome-subtitle {
  color: #666;
  font-size: 14px;
}

.google-btn {
  margin-bottom: 24px;
  padding: 12px 20px;
  border: 1px solid #ddd;
  color: #333;
}

.google-btn:hover {
  background-color: #f8f9fa;
  border-color: #ccc;
}

.google-icon {
  width: 20px;
  height: 20px;
  margin-right: 12px;
}

.divider {
  text-align: center;
  margin: 24px 0;
  position: relative;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #e9ecef;
}

.divider span {
  background: white;
  padding: 0 16px;
  color: #666;
  font-size: 12px;
  font-weight: 500;
}

.sign-in-btn {
  margin-top: 8px;
  padding: 12px 20px;
}

.login-footer {
  margin-top: 32px;
  text-align: center;
}

.forgot-password {
  color: #007bff;
  text-decoration: none;
  font-size: 14px;
  margin-bottom: 16px;
  display: inline-block;
}

.forgot-password:hover {
  text-decoration: underline;
}

.signup-link {
  font-size: 14px;
  color: #666;
}

.signup-link a {
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
}

.signup-link a:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .login-card {
    padding: 24px;
  }
  
  .welcome-title {
    font-size: 20px;
  }
}
</style>

