<script>
  import Sidebar from './Sidebar.svelte';
  let sidebar = {};

  
  function buildSidebar(result) {
  // If result is in the new format: { 결과: [ {문장, 카테고리}, ... ] }
  if (result.결과 && Array.isArray(result.결과)) {
    let sidebar = {};
    for (const item of result.결과) {
      const cat = item.카테고리 || '분류 안됨';
      if (!sidebar[cat]) sidebar[cat] = [];
      sidebar[cat].push(item.문장);
    }
    return sidebar;
  }
  // If result is already in {category: [sentences]} format, just return it
  return result;
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
      const newSidebar = buildSidebar(data.result);

      // Merge newSidebar into sidebar (preserve existing memos)
      for (const [cat, sentences] of Object.entries(newSidebar)) {
        if (!sidebar[cat]) {
          sidebar[cat] = [];
        }
        for (const sentence of sentences) {
          if (!sidebar[cat].includes(sentence)) {
            sidebar[cat].push(sentence);
          }
        }
      }
    } else {
      analysisResult = data.detail || 'Error occurred.';
      // Do NOT clear sidebar here!
    }
  } catch (err) {
    analysisResult = 'Network error or server not reachable.';
    // Do NOT clear sidebar here!
  }
}

  let message = "Welcome to GPT App! good";
  let memoText = "";
  let analysisResult = "";

  
</script>

<main>
  <h1>{message}</h1>
  <p>This is your Svelte main page. Edit <code>src/MainPage.svelte</code> to customize.</p>

  <div class="main-layout">
  <Sidebar {sidebar} />
  <div class="content">
    <h1>{message}</h1>
    <p>This is your Svelte main page. Edit <code>src/MainPage.svelte</code> to customize.</p>

    <div class="memo-section">
      <label for="memo">Write your memo:</label>
      <textarea id="memo" bind:value={memoText} rows="5" placeholder="Type your memo here..."></textarea>
      <button on:click={handleAnalyze}>Categorize & Analyze</button>
    </div>

    {#if analysisResult}
      <div class="analysis-result">
        <h2>Analysis Result</h2>
        <pre>{analysisResult}</pre>
      </div>
    {/if}
  </div>
</div>
</main>

<style>
.main-layout {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 260px;
  min-width: 220px;
  background: #f7f7fa;
  border-right: 1px solid #e0e0e0;
  padding: 1rem;
  box-sizing: border-box;
}

.content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 80vh;
    font-family: Arial, sans-serif;
  }
  h1 {
    color: #4f46e5;
    margin-bottom: 0.5em;
  }
.memo-section {
  margin-top: 2em;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.memo-section textarea {
  width: 350px;
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
}

.memo-section button:hover {
  background: #3730a3;
}

.analysis-result {
  margin-top: 2em;
  padding: 1em;
  background: #f1f5f9;
  border-radius: 8px;
  width: 400px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  text-align: left;
}

.analysis-result {
  margin-top: 2rem;
  background: #f9f9f9;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 8px #0001;
}

</style>
