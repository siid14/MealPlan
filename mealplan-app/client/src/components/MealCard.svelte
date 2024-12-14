<script>
    export let title = '';
    export let diets = [];
    export let image = '';
  
    // Props for meal data
    export let meals = {
      props: ['title', 'diets', 'image']
    };
  </script>
  
  <div class="meal-card">
    <img src={image} alt={title} class="meal-image" />
    <div class="meal-content">
      <h3>{title}</h3>
      <div class="diet-tags">
        {#each diets as diet}
          <span class="diet-tag">{diet}</span>
        {/each}
      </div>
    </div>
  </div>
  
  <style>
    .meal-card {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s;
    }
  
    .meal-card:hover {
      transform: translateY(-2px);
    }
  
    .meal-image {
      width: 100%;
      height: 200px;
      object-fit: cover;
    }
  
    .meal-content {
      padding: 1rem;
    }
  
    h3 {
      margin: 0 0 0.5rem 0;
      color: #374151;
    }
  
    .diet-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
  
    .diet-tag {
      background: #e5e7eb;
      color: #374151;
      padding: 0.25rem 0.5rem;
      border-radius: 9999px;
      font-size: 0.75rem;
    }
  </style>