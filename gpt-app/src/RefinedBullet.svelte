<script>
  export let sentence;
  export let rawData;

  // Find the refined info for this sentence from rawData.결과
  $: refined = rawData?.결과?.find(item => item.문장 === sentence);
</script>

{#if refined}
  <div class="refined-bullet">
    <strong>{refined.문장}</strong>
    <ul>
      {#if refined.카테고리}
        <li><b>카테고리:</b> {refined.카테고리}</li>
      {/if}
      {#if refined.서브카테고리}
        <li><b>서브카테고리:</b> {refined.서브카테고리}</li>
      {/if}
      {#if refined.요약}
        <li><b>요약:</b> {refined.요약}</li>
      {/if}
      {#if refined.키워드}
        <li><b>키워드:</b> {Array.isArray(refined.키워드) ? refined.키워드.join(', ') : refined.키워드}</li>
      {/if}
      {#each Object.entries(refined) as [key, value] (key)}
        {#if !['문장','카테고리','서브카테고리','요약','키워드'].includes(key)}
          <li><b>{key}:</b> {typeof value === 'object' ? JSON.stringify(value) : value}</li>
        {/if}
      {/each}
    </ul>
  </div>
{:else}
  <div class="refined-bullet no-refined">No refined data found.</div>
{/if}

<style>
.refined-bullet {
  padding: 0.5em 0.5em 0.5em 0;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 3px #0001;
}
.refined-bullet ul {
  margin: 0.5em 0 0 1em;
  padding: 0;
  list-style: disc inside;
}
.refined-bullet li {
  margin-bottom: 0.3em;
  font-size: 0.98em;
}
.no-refined {
  color: #aaa;
  font-style: italic;
}
</style>
