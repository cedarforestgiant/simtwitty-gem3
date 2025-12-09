<script>
  import { onMount, onDestroy } from 'svelte';
  import { tick } from './store.js';
  import Header from './Header.svelte';
  import Toolbar from './Toolbar.svelte';
  import Grid from './Grid.svelte';
  import Feed from './Feed.svelte';

  let interval;

  onMount(() => {
    // Game loop: tick every 250ms (4x faster)
    interval = setInterval(() => {
      tick();
    }, 250);
  });

  onDestroy(() => {
    if (interval) clearInterval(interval);
  });
</script>

<div class="app-container">
  <Header />
  
  <div class="content-wrapper">
    <main>
      <Toolbar />
      <div class="game-board">
        <Grid />
      </div>
    </main>
    <aside>
      <Feed />
    </aside>
  </div>
</div>

<style>
  .app-container {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
  }
  
  .content-wrapper {
    display: flex;
    flex: 1;
    overflow: hidden;
  }
  
  main {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem;
    overflow-y: auto;
  }
  
  aside {
    width: 300px;
    height: 100%;
    flex-shrink: 0;
  }
  
  .game-board {
    margin-top: 1rem;
    overflow: auto;
    max-width: 100%;
    padding: 1rem;
  }
</style>
