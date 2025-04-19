<script>
  import Sidebar from './Sidebar.svelte';
  import DataDetails from './DataDetails.svelte';

  let sidebar = {};

  // Utility: Filter out unwanted sidebar keys
  function filterSidebarKeys(sb) {
    return Object.fromEntries(
      Object.entries(sb).filter(
        ([k]) => k !== "classification" && k !== "classification (0)" && k !== ""
      )
    );
  }
  
  function buildSidebar(result) {
    // If result is in the new format: { 결과: [ {문장, 카테고리}, ... ] }
    if (result.결과 && Array.isArray(result.결과)) {
      let newSidebar = {};
      for (const item of result.결과) {
        const cat = item.카테고리 || '분류 안됨';
        if (!newSidebar[cat]) newSidebar[cat] = [];
        newSidebar[cat].push(item.문장);
      }
      return filterSidebarKeys(newSidebar);
    }
    
    // If result has a sidebar field (from backend), use it
    if (result.sidebar) {
      return filterSidebarKeys(result.sidebar);
    }
    
    // If result is already {category: [sentences]}, just filter and return
    return filterSidebarKeys(result);
  }

  async function handleAnalyze() {
    analysisResult = "Analyzing...";
    try {
      const response = await fetch('http://localhost:8000/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memo: memoText })
      });
      const data = await response.json();
      if (response.ok) {
        analysisResult = JSON.stringify(data, null, 2);
        
        // Store the raw data for the details panel
        rawData = data;
        
        // IMPORTANT: Replace sidebar completely instead of merging
        // This ensures old categories like "classification" don't persist
        sidebar = buildSidebar(data);
      } else {
        analysisResult = data.detail || 'Error occurred.';
      }
    } catch (err) {
      analysisResult = 'Network error or server not reachable.';
    }
  }

  let message = "Welcome to GPT App!";
  let memoText = "";
  let analysisResult = "";
  let selectedItem = null;
  let rawData = {};
</script>

<main>
  <div class="main-layout">
    <Sidebar 
      {sidebar} 
      on:itemSelect={e => selectedItem = e.detail.item} 
    />
    <div class="content">
      <h1>{message}</h1>
      <p>This is your Svelte main page. Edit <code>src/MainPage.svelte</code> to customize.</p>

      <div class="memo-section">
        <label for="memo">Write your memo:</label>
        <textarea id="memo" bind:value={memoText} rows="5" placeholder="Type your memo here..."></textarea>
        <button on:click={handleAnalyze}>Categorize & Analyze</button>
      </div>

      {#if analysisResult}
        <div class="analysis-container">
          <div class="analysis-result">
            <h2>Raw Analysis Data</h2>
            <pre>{analysisResult}</pre>
          </div>
          
          <div class="details-panel">
            <h2>Detailed Information</h2>
            <DataDetails selectedItem={selectedItem} rawData={rawData} />
          </div>
        </div>
      {/if}
    </div>
  </div>
</main>

<style>
.main-layout {
  display: flex;
  height: 100vh;
  width: 100%;
}

.content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

main {
  font-family: Arial, sans-serif;
  height: 100vh;
  margin: 0;
  padding: 0;
  width: 100%;
}

h1 {
  color: #4f46e5;
  margin-bottom: 0.5em;
}

.memo-section {
  margin-top: 2em;
  display: flex;
  flex-direction: column;
}

.memo-section textarea {
  width: 100%;
  max-width: 600px;
  margin-bottom: 1em;
  padding: 0.5em;
  font-size: 1em;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  resize: vertical;
}

.memo-section button {
  background: #4f46e5;
  color: white;
  border: none;
  padding: 0.7em 1.5em;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1em;
  transition: background 0.2s;
  align-self: flex-start;
}

.memo-section button:hover {
  background: #3730a3;
}

.analysis-container {
  margin-top: 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  max-width: 1200px;
}

.analysis-result {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  overflow-x: auto;
}

.details-panel {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}


</style>
