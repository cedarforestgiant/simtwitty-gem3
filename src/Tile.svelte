<script>
  import { build, selectedTool } from './store.js';
  
  export let x;
  export let y;
  export let tile;

  function handleClick() {
    build(x, y, $selectedTool);
  }
  
  $: color = getColor(tile.type, tile.population);
  
  function getColor(type, pop) {
    // Base colors
    let base;
    switch (type) {
      case 'residential': base = [74, 222, 128]; break; // #4ade80 (green-400)
      case 'commercial': base = [96, 165, 250]; break; // #60a5fa (blue-400)
      case 'industrial': base = [250, 204, 21]; break; // #facc15 (yellow-400)
      case 'road': return '#4b5563';
      case 'park': return '#14532d';
      default: return '#f3f4f6';
    }

    // Darken based on population
    // Max expected pop is around 50 for Res, 25 for Com/Ind
    const maxPop = type === 'residential' ? 50 : 25;
    const intensity = Math.min(1, pop / maxPop);
    
    // Darken by reducing lightness (simplified by mixing with black)
    // We'll just reduce the RGB values by up to 40%
    const factor = 1 - (intensity * 0.4);
    
    return `rgb(${Math.floor(base[0] * factor)}, ${Math.floor(base[1] * factor)}, ${Math.floor(base[2] * factor)})`;
  }

  function getCarColor(traffic) {
    // Traffic > 5 is heavy (red), < 2 is light (green/yellow)
    if (traffic > 5) return '#ef4444'; // Red
    if (traffic > 2) return '#fbbf24'; // Amber
    return '#4ade80'; // Green
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-interactive-supports-focus -->
<div 
  class="tile" 
  style="background-color: {color};"
  on:click={handleClick}
  role="button"
>
  {#if tile.population > 0}
    <span class="pop">{tile.population}</span>
  {:else if tile.type === 'road'}
    {#if tile.traffic > 0}
      <div class="traffic-container" style="animation-duration: {3 / (1 + tile.traffic * 0.1)}s">
        <div class="car" style="background-color: {getCarColor(tile.traffic)}"></div>
      </div>
    {:else}
      <span class="road-mark">•</span>
    {/if}
  {/if}
</div>

<style>
  .tile {
    width: 30px;
    height: 30px;
    border: 1px solid rgba(0,0,0,0.05);
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 10px;
    color: #333;
    user-select: none;
    transition: background-color 0.2s;
    position: relative;
    overflow: hidden;
  }
  .tile:hover {
    filter: brightness(0.95);
    border-color: rgba(0,0,0,0.2);
  }
  .pop {
    font-weight: bold;
    color: white;
    text-shadow: 
      -1px -1px 0 #000,  
      1px -1px 0 #000,
      -1px 1px 0 #000,
      1px 1px 0 #000;
    z-index: 2;
    font-size: 11px;
  }
  .road-mark {
    color: rgba(255,255,255,0.3);
  }
  
  .traffic-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    animation: moveTraffic linear infinite;
    pointer-events: none;
  }
  
  .car {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    box-shadow: 0 0 2px rgba(0,0,0,0.5);
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  
  @keyframes moveTraffic {
    0% { transform: translate(-15px, -15px); opacity: 0; }
    20% { opacity: 1; }
    80% { opacity: 1; }
    100% { transform: translate(15px, 15px); opacity: 0; }
  }
</style>