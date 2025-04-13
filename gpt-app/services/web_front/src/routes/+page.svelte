<!-- src/routes/+page.svelte -->
<script lang="ts">
	let text = '';
	let message = '';
	const base = import.meta.env.VITE_API_BASE;

	const submit = async () => {
		const res = await fetch(`${base}/memo/create`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ text })
		});
		const data = await res.json();
		message = data.message ?? data.detail;
	};
</script>

<h1>메모 입력</h1>
<textarea bind:value={text} rows="5" cols="40"></textarea>
<br />
<button on:click={submit}>메모 생성</button>
<p>{message}</p>
