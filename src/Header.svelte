<script>
  import { money, population, time, demand } from './store.js';
  import HelpModal from './HelpModal.svelte';
  
  let showHelp = false;
</script>

<header>
  <div class="stat">
    <span class="label">Money</span>
    <span class="value">${$money}</span>
  </div>
  <div class="stat">
    <span class="label">Population</span>
    <span class="value">{$population}</span>
  </div>
  <div class="stat">
    <span class="label">Time</span>
    <span class="value">{$time}</span>
  </div>
  
  <div class="rci-container">
    <div class="rci-label">RCI</div>
    <div class="bars">
      <div class="bar-group">
        <div class="bar-track">
          <div class="bar res" style="height: {Math.max(5, Math.min(100, $demand.residential))}%"></div>
        </div>
        <span class="bar-label">R</span>
      </div>
      <div class="bar-group">
        <div class="bar-track">
          <div class="bar com" style="height: {Math.max(5, Math.min(100, $demand.commercial))}%"></div>
        </div>
        <span class="bar-label">C</span>
      </div>
      <div class="bar-group">
        <div class="bar-track">
          <div class="bar ind" style="height: {Math.max(5, Math.min(100, $demand.industrial))}%"></div>
        </div>
        <span class="bar-label">I</span>
      </div>
    </div>
  </div>

  <button class="help-btn" on:click={() => showHelp = true} title="Legend & Help">?</button>
</header>

{#if showHelp}
  <HelpModal on:close={() => showHelp = false} />
{/if}

<style>
  header {
    display: flex;
    justify-content: center;
    gap: 2rem;
    padding: 1rem;
    background: #1a1a1a;
    color: white;
    border-bottom: 1px solid #333;
    width: 100%;
    margin-bottom: 1rem;
    position: relative;
  }
  
  .help-btn {
    position: absolute;
    right: 1.5rem;
    top: 50%;
    transform: translateY(-50%);
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #2a2a2a;
    border: 1px solid #444;
    color: #aaa;
    font-weight: bold;
    font-family: monospace;
    font-size: 1.1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    padding: 0;
  }
  
  .help-btn:hover {
    background: #333;
    color: white;
    border-color: #666;
  }

  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .label {
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    opacity: 0.6;
  }
  
  .value {
    font-size: 1.5rem;
    font-weight: bold;
    font-family: monospace;
  }

  .rci-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-left: 1rem;
    padding-left: 1rem;
    border-left: 1px solid #444;
  }

  .rci-label {
    font-size: 0.7rem;
    opacity: 0.6;
    margin-bottom: 2px;
  }

  .bars {
    display: flex;
    gap: 4px;
    height: 30px;
    /* Remove align-items: flex-end so groups stretch to full height */
  }

  .bar-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%; 
  }

  .bar-track {
    flex-grow: 1;
    width: 10px;
    display: flex;
    align-items: flex-end;
    background: #2a2a2a;
    border-radius: 2px;
  }

  .bar {
    width: 100%;
    background: #555;
    transition: height 0.3s;
    border-radius: 2px;
  }

  .bar.res { background: #4ade80; }
  .bar.com { background: #60a5fa; }
  .bar.ind { background: #facc15; }

  .bar-label {
    font-size: 0.6rem;
    margin-top: 2px;
    opacity: 0.8;
  }
</style>
