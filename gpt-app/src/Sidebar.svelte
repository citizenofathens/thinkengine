<script>
  export let sidebar = {
    // Example structure
    // "학습 전략": ["반사적으로 되도록 하면서연습하는거", ...],
    // "개인 습관": ["매일 10분씩 복습하기", ...]
  };

  let selectedCategory = null;
</script>

<aside class="sidebar">
  <h2>카테고리</h2>
  <ul>
    {#each Object.keys(sidebar) as category}
      <li>
        <button
          class:selected={selectedCategory === category}
          on:click={() => selectedCategory = category}
        >
          {category} <span class="count">({sidebar[category].length})</span>
        </button>
      </li>
    {/each}
  </ul>

  {#if selectedCategory}
    <section class="category-details">
      <h3>{selectedCategory}</h3>
      <ul>
        {#each sidebar[selectedCategory] as sentence}
          <li>{sentence}</li>
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