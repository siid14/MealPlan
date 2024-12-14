<script>
    let mode = 'login';
    let username = '';
    let password = '';
    let error = '';
  
    async function handleSubmit() {
      try {
        const endpoint = mode === 'login' ? '/api/users/login' : '/api/users/register';
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });
  
        const data = await response.json();
  
        if (!response.ok) {
          throw new Error(data.error || 'Authentication failed');
        }
  
        if (mode === 'register') {
          // Switch to login after successful registration
          mode = 'login';
          username = '';
          password = '';
        } else {
          // Handle successful login
          localStorage.setItem('token', data.token);
          window.location.href = '/profile';
        }
      } catch (err) {
        error = err.message;
      }
    }
  </script>
  
  <div class="auth-container">
    <div class="auth-card">
      <h1>MealPlan App</h1>
      
      <div class="mode-toggle">
        <button 
          class:active={mode === 'login'} 
          on:click={() => mode = 'login'}>
          Login
        </button>
        <button 
          class:active={mode === 'register'} 
          on:click={() => mode = 'register'}>
          Register
        </button>
      </div>
  
      {#if error}
        <div class="error">
          {error}
        </div>
      {/if}
  
      <form on:submit|preventDefault={handleSubmit}>
        <div class="form-group">
          <label for="username">Username</label>
          <input
            id="username"
            type="text"
            bind:value={username}
            required
            placeholder="Enter username"
          />
        </div>
  
        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            type="password"
            bind:value={password}
            required
            placeholder="Enter password"
          />
        </div>
  
        <button type="submit">
          {mode === 'login' ? 'Login' : 'Register'}
        </button>
      </form>
    </div>
  </div>
  
  <style>
    .auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 1rem;
      background-color: #f9fafb;
    }
  
    .auth-card {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 400px;
    }
  
    h1 {
      text-align: center;
      margin-bottom: 1.5rem;
    }
  
    .mode-toggle {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
  
    .mode-toggle button {
      flex: 1;
      padding: 0.5rem;
      border: 1px solid #e5e7eb;
      background: none;
      cursor: pointer;
    }
  
    .mode-toggle button.active {
      background: #3b82f6;
      color: white;
      border-color: #3b82f6;
    }
  
    .error {
      background: #fee2e2;
      color: #dc2626;
      padding: 0.75rem;
      border-radius: 4px;
      margin-bottom: 1rem;
    }
  
    .form-group {
      margin-bottom: 1rem;
    }
  
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
  
    input {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #e5e7eb;
      border-radius: 4px;
    }
  
    button[type="submit"] {
      width: 100%;
      padding: 0.75rem;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
  
    button[type="submit"]:hover {
      background: #2563eb;
    }
  </style>