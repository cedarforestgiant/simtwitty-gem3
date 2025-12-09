<script>
  import { selectedTool, ZONES, COSTS } from './store.js';

  const tools = [
    { id: ZONES.RESIDENTIAL, label: 'Res', color: '#4ade80' },
    { id: ZONES.COMMERCIAL, label: 'Com', color: '#60a5fa' },
    { id: ZONES.INDUSTRIAL, label: 'Ind', color: '#facc15' },
    { id: ZONES.ROAD, label: 'Road', color: '#4b5563' },
    { id: ZONES.PARK, label: 'Park', color: '#15803d' },
    { id: ZONES.EMPTY, label: 'Bulldoze', color: '#ef4444' } // Bulldoze logic is just setting to empty
  ];
</script>

<div class="toolbar">
  {#each tools as tool}
    <button 
      class:active={$selectedTool === tool.id}
      style="--color: {tool.color}"
      on:click={() => selectedTool.set(tool.id)}
    >
      <span class="label">{tool.label}</span>
      {#if COSTS[tool.id]}
        <span class="cost">${COSTS[tool.id]}</span>
      {/if}
    </button>
  {/each}
</div>

<style>
  .toolbar {
    display: flex;
    gap: 0.5rem;
    padding: 1rem;
    background: #2a2a2a;
    border-radius: 8px;
    margin-bottom: 1rem;
    justify-content: center;
    flex-wrap: wrap;
  }
  
  button {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.5rem 1rem;
    border: 2px solid transparent;
    background: #333;
    color: white;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    min-width: 80px;
  }
  
  button:hover {
    background: #444;
  }
  
  button.active {
    border-color: var(--color);
    background: #444;
    box-shadow: 0 0 10px rgba(0,0,0,0.3);
  }
  
  .label {
    font-weight: bold;
    margin-bottom: 0.2rem;
  }
  
  .cost {
    font-size: 0.8rem;
    opacity: 0.7;
  }
</style>
