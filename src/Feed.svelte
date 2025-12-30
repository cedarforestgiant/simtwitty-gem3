<script>
  import { messages, population, addMessage, time, denizens, queueDenizenResponse, parseMention } from './store.js';
  import { fade, fly } from 'svelte/transition';

  let tweetText = '';
  let selectedAuthor = null;

  // Autocomplete State
  let uniqueAuthors = [];
  let showAutocomplete = false;
  let filterTerm = '';
  let filteredAuthors = [];
  let selectedIndex = 0;
  let textareaRef;
  
  $: {
    // Extract unique authors from messages who have posted
    const names = new Set();
    $messages.forEach(msg => {
      if (msg.author && msg.author.name) {
        names.add(msg.author.name);
      }
    });
    // Convert to array and sort
    uniqueAuthors = Array.from(names).sort();
  }
  
  // Filter authors when term changes
  $: {
    if (filterTerm) {
      filteredAuthors = uniqueAuthors.filter(name => 
        name.toLowerCase().includes(filterTerm.toLowerCase())
      ).slice(0, 5); // Limit to 5 suggestions
    } else {
      filteredAuthors = uniqueAuthors.slice(0, 5);
    }
  }

  function handleInput(e) {
    analyzeText(e.target);
  }
  
  function analyzeText(target) {
    const cursor = target.selectionStart;
    const text = target.value;
    
    // Find the last '@' before the cursor
    const lastAt = text.lastIndexOf('@', cursor - 1);
    
    if (lastAt !== -1) {
      // Check if there are invalid characters (like spaces) between @ and cursor
      // We allow standard username characters. For now, let's say no spaces.
      const textAfterAt = text.slice(lastAt + 1, cursor);
      
      if (!textAfterAt.includes(' ')) {
        showAutocomplete = true;
        filterTerm = textAfterAt;
        selectedIndex = 0;
        return;
      }
    }
    
    showAutocomplete = false;
    filterTerm = '';
  }

  function selectName(name) {
    if (!textareaRef) return;
    
    const cursor = textareaRef.selectionStart;
    const text = tweetText;
    const lastAt = text.lastIndexOf('@', cursor - 1);
    
    if (lastAt !== -1) {
      const before = text.slice(0, lastAt);
      const after = text.slice(cursor);
      tweetText = `${before}@${name} ${after}`;
      
      // Reset state
      showAutocomplete = false;
      filterTerm = '';
      
      // Focus back and set cursor
      setTimeout(() => {
        textareaRef.focus();
        const newCursorPos = lastAt + name.length + 2; // +2 for @ and space
        textareaRef.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }
  }

  function handleTweet() {
    if (tweetText.trim()) {
      addMessage(tweetText, { name: 'Mayor', isSystem: true });
      
      // Check if player @mentioned a denizen
      const mentionedName = parseMention(tweetText);
      if (mentionedName) {
        // Find the denizen by name (case-insensitive)
        const denizen = $denizens.find(d => 
          d.name.toLowerCase() === mentionedName.toLowerCase() && !d.left
        );
        
        if (denizen) {
          // Queue a response from this denizen
          queueDenizenResponse(denizen.name, tweetText);
        }
      }
      
      tweetText = '';
    }
  }

  function handleKeydown(e) {
    if (showAutocomplete && filteredAuthors.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIndex = (selectedIndex + 1) % filteredAuthors.length;
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIndex = (selectedIndex - 1 + filteredAuthors.length) % filteredAuthors.length;
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        selectName(filteredAuthors[selectedIndex]);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        showAutocomplete = false;
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTweet();
    }
  }

  function showProfile(author) {
    if (!author.isSystem) {
      selectedAuthor = author;
    }
  }

  function closeProfile() {
    selectedAuthor = null;
  }
</script>

<div class="feed">
  <h3>SimTwitty Feed</h3>
  
  <div class="tweet-input">
    <textarea 
      bind:this={textareaRef}
      bind:value={tweetText} 
      placeholder="What's happening in the city, Mayor?"
      on:keydown={handleKeydown}
      on:input={handleInput}
      on:click={handleInput}
    ></textarea>
    
    {#if showAutocomplete && filteredAuthors.length > 0}
      <ul class="autocomplete-list">
        {#each filteredAuthors as author, i}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <li 
            class:selected={i === selectedIndex}
            on:click={() => selectName(author)}
            on:mouseenter={() => selectedIndex = i}
          >
            @{author}
          </li>
        {/each}
      </ul>
    {/if}

    <div class="tweet-actions">
      <button on:click={handleTweet} disabled={!tweetText.trim()}>Twit 'em</button>
    </div>
  </div>

  <div class="messages-container">
    {#if $population > 0}
      {#each $messages as msg (msg.id)}
        <div class="tweet" in:fly="{{ y: 20, duration: 300 }}" out:fade>
          <div 
            class="author" 
            class:clickable={!msg.author.isSystem} 
            on:click={() => showProfile(msg.author)}
          >
            @{msg.author.name}
          </div>
          <div class="content">{msg.text}</div>
          <div class="time">{msg.time}</div>
        </div>
      {/each}
    {:else}
      <div class="empty-state">
        <p>No one lives here yet...</p>
      </div>
    {/if}
  </div>

  {#if selectedAuthor}
    <div class="modal-backdrop" on:click={closeProfile} transition:fade>
      <div class="modal" on:click|stopPropagation>
        <div class="modal-header">
          <h4>{selectedAuthor.name}</h4>
          <button class="close-btn" on:click={closeProfile}>&times;</button>
        </div>
        <div class="profile-details">
          <div class="detail-row">
            <span class="label">Home:</span>
            <span class="value">{selectedAuthor.home}</span>
          </div>
          {#if selectedAuthor.work}
          <div class="detail-row">
            <span class="label">Work:</span>
            <span class="value">{selectedAuthor.work}</span>
          </div>
          {/if}
          <div class="detail-row">
            <span class="label">Resident:</span>
            <span class="value">
              {selectedAuthor.since} &rarr; {selectedAuthor.left ? `${selectedAuthor.left}` : 'Now'}
            </span>
          </div>
          
          {#if selectedAuthor.history && selectedAuthor.history.length > 0}
          <div class="history-section">
            <span class="label">History</span>
            <ul class="history-list">
              {#each selectedAuthor.history as event}
                <li>
                  <span class="history-time">{event.time}</span>
                  <span class="history-desc">
                    {#if event.type === 'move_in'}
                      Moved into {event.home}
                    {:else if event.type === 'move'}
                      Moved {event.from} &rarr; {event.to}
                    {:else if event.type === 'new_job'}
                      Started job at {event.work}
                    {:else if event.type === 'fired'}
                      Lost job (fired for absence)
                    {:else if event.type === 'fired_excess'}
                      Laid off (downsizing)
                    {:else if event.type === 'workplace_demolished'}
                      Lost job (workplace closed)
                    {:else if event.type === 'evicted'}
                      Evicted (overcrowding)
                    {:else if event.type === 'evicted_bulldoze'}
                      Evicted (zone demolished)
                    {:else if event.type === 'drift_correction_spawn'}
                      Moved in (correction)
                    {:else if event.type === 'left_city'}
                      Left the city
                    {/if}
                  </span>
                </li>
              {/each}
            </ul>
          </div>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .feed {
    width: 300px;
    background: #f5f8fa;
    border-left: 1px solid #e1e8ed;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
  }

  h3 {
    padding: 1rem;
    margin: 0;
    border-bottom: 1px solid #e1e8ed;
    font-size: 1.2rem;
    color: #1da1f2;
    background: white;
  }

  .tweet-input {
    padding: 1rem;
    background: white;
    border-bottom: 1px solid #e1e8ed;
    position: relative;
  }

  .autocomplete-list {
    position: absolute;
    top: 70px; /* Below textarea */
    left: 1rem;
    width: calc(100% - 2rem);
    background: white;
    border: 1px solid #e1e8ed;
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    z-index: 20;
    margin: 0;
    padding: 0;
    list-style: none;
    max-height: 150px;
    overflow-y: auto;
  }

  .autocomplete-list li {
    padding: 0.5rem;
    cursor: pointer;
    border-bottom: 1px solid #f5f8fa;
    color: #14171a;
    font-size: 0.9rem;
  }

  .autocomplete-list li:last-child {
    border-bottom: none;
  }

  .autocomplete-list li:hover, .autocomplete-list li.selected {
    background-color: #f5f8fa;
    color: #1da1f2;
  }

  .tweet-input textarea {
    width: 100%;
    height: 60px;
    border: 1px solid #e1e8ed;
    border-radius: 4px;
    padding: 0.5rem;
    resize: none;
    font-family: inherit;
    margin-bottom: 0.5rem;
    box-sizing: border-box;
  }

  .tweet-input textarea:focus {
    outline: none;
    border-color: #1da1f2;
  }

  .tweet-actions {
    display: flex;
    justify-content: flex-end;
  }

  .tweet-actions button {
    background: #1da1f2;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 9999px;
    font-weight: bold;
    cursor: pointer;
    font-size: 0.9rem;
  }

  .tweet-actions button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .tweet-actions button:hover:not(:disabled) {
    background: #1a91da;
  }

  .messages-container {
    flex: 1;
    overflow-y: auto;
    padding: 0;
  }

  .empty-state {
    padding: 2rem;
    text-align: center;
    color: #657786;
    font-style: italic;
  }

  .tweet {
    padding: 1rem;
    border-bottom: 1px solid #e1e8ed;
    background: white;
  }

  .tweet:hover {
    background-color: #f5f8fa;
  }

  .author {
    font-weight: bold;
    font-size: 0.9rem;
    margin-bottom: 0.2rem;
    color: #14171a;
  }
  
  .author.clickable {
    color: #1da1f2;
    cursor: pointer;
  }
  
  .author.clickable:hover {
    text-decoration: underline;
  }

  .content {
    font-size: 0.95rem;
    line-height: 1.4;
    color: #14171a;
  }
  
  .time {
    font-size: 0.75rem;
    color: #657786;
    margin-top: 0.5rem;
  }

  /* Modal Styles */
  .modal-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
  }

  .modal {
    background: white;
    width: 80%;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    overflow: hidden;
    animation: popIn 0.2s ease-out;
  }

  @keyframes popIn {
    from { transform: scale(0.9); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }

  .modal-header {
    background: #1da1f2;
    color: white;
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .modal-header h4 {
    margin: 0;
    font-size: 1.1rem;
  }

  .close-btn {
    background: none;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    line-height: 1;
    padding: 0;
  }

  .profile-details {
    padding: 1.5rem;
  }

  .detail-row {
    margin-bottom: 0.8rem;
    display: flex;
    flex-direction: column;
  }

  .detail-row:last-child {
    margin-bottom: 0;
  }

  .label {
    font-size: 0.75rem;
    text-transform: uppercase;
    color: #657786;
    font-weight: bold;
    margin-bottom: 0.2rem;
  }

  .value {
    font-size: 1rem;
    color: #14171a;
  }
  
  .history-section {
    margin-top: 1rem;
    border-top: 1px solid #e1e8ed;
    padding-top: 1rem;
  }
  
  .history-list {
    list-style: none;
    padding: 0;
    margin: 0.5rem 0 0 0;
    max-height: 150px;
    overflow-y: auto;
  }
  
  .history-list li {
    display: flex;
    font-size: 0.85rem;
    margin-bottom: 0.4rem;
    color: #657786;
  }
  
  .history-time {
    font-weight: bold;
    margin-right: 0.5rem;
    min-width: 40px;
  }
</style>
