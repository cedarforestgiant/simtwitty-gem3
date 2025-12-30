<script>
  import { createEventDispatcher } from 'svelte';
  import { denizens } from './store.js';
  
  const dispatch = createEventDispatcher();
  
  let showDebug = false;
  let searchTerm = '';

  function close() {
    dispatch('close');
  }

  $: filteredDenizens = $denizens.filter(d => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return d.name.toLowerCase().includes(term) || 
             d.home.toLowerCase().includes(term) || 
             (d.work && d.work.toLowerCase().includes(term));
  });
</script>

<div class="modal-backdrop" on:click={close}>
  <div class="modal-content" on:click|stopPropagation>
    <button class="close-btn" on:click={close}>&times;</button>
    <h2>Legend & Help</h2>
    
    <div class="tabs">
        <button class:active={!showDebug} on:click={() => showDebug = false}>Legend</button>
        <button class:active={showDebug} on:click={() => showDebug = true}>Debug Tools</button>
    </div>

    {#if !showDebug}
    <section>
      <h3>Zones</h3>
      <div class="legend-item">
        <div class="swatch res"></div>
        <div class="desc">
          <strong>Residential (Green)</strong>
          <p>Where people live. Darkens as population grows.</p>
        </div>
      </div>
      <div class="legend-item">
        <div class="swatch com"></div>
        <div class="desc">
          <strong>Commercial (Blue)</strong>
          <p>Shops and offices. Needs people and goods.</p>
        </div>
      </div>
      <div class="legend-item">
        <div class="swatch ind"></div>
        <div class="desc">
          <strong>Industrial (Yellow)</strong>
          <p>Factories. Creates jobs and goods.</p>
        </div>
      </div>
      <div class="legend-item">
        <div class="swatch park"></div>
        <div class="desc">
          <strong>Park (Dark Green)</strong>
          <p>Increases happiness of nearby residents.</p>
        </div>
      </div>
    </section>

    <section>
      <h3>Traffic Indicators</h3>
      <p class="section-desc">Moving dots on roads indicate traffic flow.</p>
      
      <div class="legend-item">
        <div class="traffic-swatch">
          <div class="dot green"></div>
        </div>
        <div class="desc">
          <strong>Green Dot</strong>
          <p>Light traffic. Free flowing.</p>
        </div>
      </div>
      <div class="legend-item">
        <div class="traffic-swatch">
          <div class="dot amber"></div>
        </div>
        <div class="desc">
          <strong>Amber Dot</strong>
          <p>Moderate traffic.</p>
        </div>
      </div>
      <div class="legend-item">
        <div class="traffic-swatch">
          <div class="dot red"></div>
        </div>
        <div class="desc">
          <strong>Red Dot</strong>
          <p>Heavy traffic. Congestion may slow growth.</p>
        </div>
      </div>
    </section>
    
    {:else}
    
    <section class="debug-section">
        <h3>Denizen Debugger</h3>
        <input type="text" placeholder="Search name, home, work..." bind:value={searchTerm} class="search-input" />
        
        <div class="stats-row">
            <span>Total: {$denizens.length}</span>
            <span>Active: {$denizens.filter(d => !d.left).length}</span>
            <span>Employed: {$denizens.filter(d => !d.left && d.work).length}</span>
        </div>

        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Home</th>
                        <th>Work</th>
                        <th>Status</th>
                        <th>Missed</th>
                        <th>Unemployed</th>
                    </tr>
                </thead>
                <tbody>
                    {#each filteredDenizens as d}
                    <tr class:left={d.left}>
                        <td>{d.name}</td>
                        <td>{d.home}</td>
                        <td>{d.work || '-'}</td>
                        <td>{d.left ? 'Left' : 'Active'}</td>
                        <td>{d.daysMissed || 0}</td>
                        <td>{d.unemployedDays || 0}</td>
                    </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    </section>
    
    {/if}
  </div>
</div>

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-content {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    width: 90%;
    max-width: 600px;
    position: relative;
    max-height: 90vh;
    overflow-y: auto;
    color: #333;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    display: flex;
    flex-direction: column;
  }
  
  .tabs {
      display: flex;
      gap: 1rem;
      border-bottom: 1px solid #eee;
      margin-bottom: 1rem;
  }
  
  .tabs button {
      background: none;
      border: none;
      padding: 0.5rem 1rem;
      font-size: 1rem;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      color: #666;
  }
  
  .tabs button.active {
      color: #1da1f2;
      border-bottom-color: #1da1f2;
      font-weight: bold;
  }

  .close-btn {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #666;
  }
  
  .close-btn:hover {
    color: #000;
  }

  h2 {
    margin-top: 0;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
  }

  h3 {
    margin: 1.5rem 0 1rem;
    font-size: 1.1rem;
    color: #444;
  }
  
  .section-desc {
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 1rem;
    font-style: italic;
  }

  .legend-item {
    display: flex;
    align-items: flex-start;
    margin-bottom: 1rem;
    gap: 1rem;
  }

  .swatch {
    width: 30px;
    height: 30px;
    border-radius: 4px;
    flex-shrink: 0;
    border: 1px solid rgba(0,0,0,0.1);
  }

  .swatch.res { background: #4ade80; }
  .swatch.com { background: #60a5fa; }
  .swatch.ind { background: #facc15; }
  .swatch.park { background: #14532d; }

  .traffic-swatch {
    width: 30px;
    height: 30px;
    background: #4b5563; /* Road color */
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 2px;
    flex-shrink: 0;
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    box-shadow: 0 0 2px rgba(0,0,0,0.5);
  }

  .dot.green { background: #4ade80; }
  .dot.amber { background: #fbbf24; }
  .dot.red { background: #ef4444; }

  .desc strong {
    display: block;
    margin-bottom: 0.25rem;
    color: #222;
  }

  .desc p {
    margin: 0;
    font-size: 0.9rem;
    color: #555;
    line-height: 1.4;
  }
  
  /* Debug Styles */
  .debug-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
  }
  
  .search-input {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      margin-bottom: 1rem;
      box-sizing: border-box;
  }
  
  .stats-row {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
      font-size: 0.9rem;
      color: #666;
      background: #f9f9f9;
      padding: 0.5rem;
      border-radius: 4px;
  }
  
  .table-container {
      flex: 1;
      overflow-y: auto;
      border: 1px solid #eee;
      max-height: 400px;
  }
  
  table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.85rem;
  }
  
  th {
      text-align: left;
      background: #f1f1f1;
      padding: 0.5rem;
      position: sticky;
      top: 0;
      z-index: 1;
  }
  
  td {
      padding: 0.5rem;
      border-bottom: 1px solid #eee;
  }
  
  tr.left {
      opacity: 0.5;
      background: #f9f9f9;
  }
</style>
