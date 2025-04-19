<script>
  import { createEventDispatcher } from 'svelte';
  export let sidebar = {};

  let internalSidebar = {};
  let selectedCategory = null;
  let selectedItem = null;
  
  const dispatch = createEventDispatcher();

  // Merge incoming data with existing internalSidebar
  $: mergeSidebarData(sidebar);

  function mergeSidebarData(newData) {
    if (!newData || typeof newData !== 'object') return;

    for (const category in newData) {
      if (!internalSidebar[category]) {
        internalSidebar[category] = [...newData[category]];
      } else {
        // Optionally merge unique values
        const existing = new Set(internalSidebar[category]);
        newData[category].forEach(item => {
          if (!existing.has(item)) {
            internalSidebar[category].push(item);
          }
        });
      }
    }
  }
  
  function selectItem(item) {
    selectedItem = item;
    dispatch('itemSelect', { item });
  }
</script>

<aside class="sidebar">
  <h2>카테고리</h2>
  <ul>
    {#each Object.keys(internalSidebar) as category}
      <li>
        <button
          class:selected={selectedCategory === category}
          on:click={() => selectedCategory = category}
        >
          {category} <span class="count">({internalSidebar[category].length})</span>
        </button>
      </li>
    {/each}
  </ul>

  {#if selectedCategory}
    <section class="category-details">
      <h3>{selectedCategory}</h3>
      <ul>
        {#each internalSidebar[selectedCategory] as sentence}
          <li>
            <button 
              class="item-button {selectedItem === sentence ? 'selected-item' : ''}"
              on:click={() => {
                selectedItem = sentence;
                dispatch('itemSelect', { item: sentence });
              }}
            >
              {sentence}
            </button>
          </li>
        {/each}
      </ul>
    </section>
  {/if}
</aside>

<style>
.sidebar {
  width: 250px;
  background: #f7f7fa;
  border-right: 1px solid #e0e0e0;
  padding: 1rem;
  height: 100vh;
}
.sidebar ul {
  list-style: none;
  padding: 0;
}
.sidebar button {
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  padding: 0.5rem;
  cursor: pointer;
  font-size: 1rem;
}
.sidebar button.selected {
  background: #e6f0fa;
  font-weight: bold;
}
.item-button {
  text-align: left;
  background: none;
  border: none;
  width: 100%;
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 4px;
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}
.item-button:hover {
  background: #f0f0f5;
}
.selected-item {
  background: #e6f0fa !important;
  border-left: 3px solid #4f46e5;
  font-weight: 500;
}
.category-details {
  margin-top: 1rem;
  background: #fff;
  border-radius: 6px;
  padding: 1rem;
  box-shadow: 0 2px 8px #0001;
}
.count {
  color: #888;
  font-size: 0.9em;
}
</style>
