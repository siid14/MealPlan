<script>
  let mode = 'login';
  let username = '';
  let password = '';
  let preferences = [];
  let error = '';

  const validPreferences = ['ketogenic', 'vegetarian', 'gluten-free'];

  function handlePreferenceToggle(preference) {
    if (preferences.includes(preference)) {
      preferences = preferences.filter(p => p !== preference);
    } else {
      preferences = [...preferences, preference];
    }
  }

  async function handleSubmit() {
    try {
      // Clear previous errors
      error = '';

      // Create the request body
      const body = mode === 'login' 
        ? { username, password }
        : { username, password, preferences };

      console.log('Sending request with body:', body); 

      const response = await fetch(`/api/users/${mode}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Authentication failed');
      }

      if (mode === 'register') {
        // Switch to login after successful registration
        mode = 'login';
        username = '';
        password = '';
        preferences = [];
      } else {
        // Handle successful login
        localStorage.setItem('token', data.token);
        window.location.href = '/profile';
      }
    } catch (err) {
      console.error('Form submission error:', err);
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
        on:click={() => {
          mode = 'login';
          error = '';
        }}>
        Login
      </button>
      <button 
        class:active={mode === 'register'} 
        on:click={() => {
          mode = 'register';
          error = '';
        }}>
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

      {#if mode === 'register'}
        <div class="form-group">
          <label>Dietary Preferences</label>
          <div class="preferences-list">
            {#each validPreferences as preference}
              <div class="preference-item">
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    checked={preferences.includes(preference)}
                    on:change={() => handlePreferenceToggle(preference)}
                  />
                  <span class="preference-text">{preference}</span>
                </label>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <button type="submit" class="submit-button">
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
    color: #111827;
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
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
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
    color: #374151;
  }

  input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    transition: border-color 0.2s;
  }

  input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }

  .preferences-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .preference-item {
    display: flex;
    align-items: center;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }

  .preference-text {
    text-transform: capitalize;
  }

  .submit-button {
    width: 100%;
    padding: 0.75rem;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.2s;
  }

  .submit-button:hover {
    background: #2563eb;
  }

  .submit-button:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
  }
</style>