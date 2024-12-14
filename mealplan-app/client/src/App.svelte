<script>
  import { Router, Link, Route } from "svelte-routing";
  import LoginRegisterForm from './pages/LoginRegisterForm.svelte';
  import Profile from './pages/Profile.svelte';
</script>

<main>
  <Router>
    <nav>
      <Link to="/">Login/Register</Link>
      <Link to="/profile">Profile</Link>
    </nav>

    <Route path="/" component={LoginRegisterForm} />
    <Route path="/profile" component={Profile} />
  </Router>
</main>

<style>
  main {
    padding: 1rem;
    max-width: 1200px;
    margin: 0 auto;
  }
</style>