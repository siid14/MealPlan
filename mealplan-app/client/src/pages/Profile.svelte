<script>
    import { onMount } from 'svelte';
    import MealCard from '../components/MealCard.svelte';
  
    let username = '';
    let preferences = [];
    let error = '';
  
    // Fetch user data on mount
    onMount(async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          window.location.href = '/';
          return;
        }
  
        const response = await fetch('/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
  
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
  
        const data = await response.json();
        username = data.user.username;
        preferences = data.user.preferences || [];
      } catch (err) {
        error = err.message;
      }
    });
  
    // Handle preference updates
    async function updatePreferences() {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/users/profile', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ preferences })
        });
  
        if (!response.ok) {
          throw new Error('Failed to update preferences');
        }
      } catch (err) {
        error = err.message;
      }
    }
  </script>
  
  <div class="profile-container">
    <div class="profile-header">
      <h1>Welcome, {username}!</h1>
      {#if error}
        <div class="error-message">
          {error}
        </div>
      {/if}
    </div>
  
    <div class="preferences-section">
      <h2>Dietary Preferences</h2>
      <div class="preferences-options">
        {#each ['ketogenic', 'vegetarian', 'gluten-free'] as pref}
          <label class="preference-option">
            <input
              type="checkbox"
              value={pref}
              bind:group={preferences}
              on:change={updatePreferences}
            />
            {pref}
          </label>
        {/each}
      </div>
    </div>
  </div>
  
  <style>
    .profile-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }
  
    .profile-header {
      margin-bottom: 2rem;
    }
  
    .error-message {
      color: red;
      margin-top: 1rem;
    }
  
    .preferences-section {
      background: #f5f5f5;
      padding: 1rem;
      border-radius: 8px;
    }
  
    .preferences-options {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      margin-top: 1rem;
    }
  
    .preference-option {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem;
      background: white;
      border-radius: 4px;
      cursor: pointer;
    }
  
    input[type="checkbox"] {
      cursor: pointer;
    }
  </style>