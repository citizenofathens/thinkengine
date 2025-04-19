<script>
  // This component displays organized information about the selected data
  export let selectedItem = null;
  export let rawData = {};
  
  // Computed property to extract metadata for the selected item
  $: metadata = getMetadataForItem(selectedItem, rawData);
  
  function getMetadataForItem(item, data) {
    if (!item || !data || !data.결과) return {};
    
    // Find the item in the raw data
    const foundItem = data.결과?.find(entry => entry.문장 === item);
    
    if (foundItem) {
      // Return all properties except for the sentence itself
      const { 문장, ...rest } = foundItem;
      return rest;
    }
    
    return {};
  }
</script>

<div class="data-details">
  {#if selectedItem}
    <div class="item-card">
      <h3>Selected Item</h3>
      <p class="item-text">{selectedItem}</p>
      
      <div class="metadata-section">
        <h4>Metadata</h4>
        {#if Object.keys(metadata).length > 0}
          <dl>
            {#each Object.entries(metadata) as [key, value]}
              <dt>{key}</dt>
              <dd>
                {#if typeof value === 'object'}
                  <pre>{JSON.stringify(value, null, 2)}</pre>
                {:else}
                  {value}
                {/if}
              </dd>
            {/each}
          </dl>
        {:else}
          <p class="no-data">No additional metadata available for this item.</p>
        {/if}
      </div>
    </div>
  {:else}
    <div class="placeholder">
      <p>Select an item from the sidebar to view details</p>
    </div>
  {/if}
</div>

<style>
  .data-details {
    padding: 1rem;
    height: 100%;
  }
  
  .item-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    padding: 1.5rem;
  }
  
  .item-text {
    background: #f7f7fa;
    padding: 1rem;
    border-radius: 6px;
    border-left: 4px solid #4f46e5;
    margin-bottom: 1.5rem;
  }
  
  .metadata-section {
    margin-top: 1.5rem;
  }
  
  h3 {
    margin-top: 0;
    color: #333;
    border-bottom: 1px solid #eee;
    padding-bottom: 0.5rem;
    margin-bottom: 1rem;
  }
  
  h4 {
    color: #555;
    margin-bottom: 0.75rem;
  }
  
  dl {
    display: grid;
    grid-template-columns: max-content 1fr;
    gap: 0.5rem 1rem;
  }
  
  dt {
    font-weight: bold;
    color: #666;
  }
  
  dd {
    margin: 0;
  }
  
  pre {
    background: #f5f5f5;
    padding: 0.5rem;
    border-radius: 4px;
    overflow: auto;
    font-size: 0.85rem;
  }
  
  .placeholder {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
    font-style: italic;
    background: #f9f9f9;
    border-radius: 8px;
  }
  
  .no-data {
    color: #888;
    font-style: italic;
  }
</style>
