<script>
  import { grid } from './store.js';
  import Tile from './Tile.svelte';
  
  const cols = Array.from({ length: 20 }, (_, i) => i + 1);
  const rows = Array.from({ length: 20 }, (_, i) => String.fromCharCode(65 + i));
</script>

<div class="layout">
  <!-- Top Headers -->
  <div class="header-row">
    <div class="corner"></div>
    {#each cols as col}
      <div class="col-label">{col}</div>
    {/each}
  </div>

  <div class="main-area">
    <!-- Left Headers -->
    <div class="row-labels">
      {#each rows as row}
        <div class="row-label">{row}</div>
      {/each}
    </div>

    <!-- The Grid -->
    <div class="grid-container">
      {#each $grid as row, y}
        <div class="row">
          {#each row as tile, x}
            <Tile {x} {y} {tile} />
          {/each}
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .layout {
    display: inline-flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 10px;
    background: #f0f0f0;
    border-radius: 8px;
  }
  
  .header-row {
    display: flex;
    margin-bottom: 2px;
  }
  
  .corner {
    width: 24px; /* Width of row labels */
    flex-shrink: 0;
    margin-right: 2px;
  }
  
  .col-label {
    width: 30px; /* Match tile width */
    text-align: center;
    font-size: 10px;
    color: #666;
    font-weight: bold;
    user-select: none;
  }
  
  .main-area {
    display: flex;
  }
  
  .row-labels {
    display: flex;
    flex-direction: column;
    margin-right: 2px;
  }
  
  .row-label {
    height: 30px; /* Match tile height */
    width: 24px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 4px;
    font-size: 10px;
    color: #666;
    font-weight: bold;
    user-select: none;
  }

  .grid-container {
    display: flex;
    flex-direction: column;
    border: 4px solid #333;
    background: #333;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }
  .row {
    display: flex;
  }
</style>
