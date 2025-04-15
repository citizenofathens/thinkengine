# GPT App (Svelte)

## How to use frontend

1. **Install dependencies** (run in `gpt-app` folder):
   ```bash
   npm install
   ```
2. **Start the dev server**:
   ```bash
   npm run dev
   ```
3. **Open your browser** to the address shown in the terminal (usually http://localhost:5173/).

You should see the GPT App main page. Edit `src/MainPage.svelte` to customize your main page!

## How to use backent

(run in `gpt-app` folder):

uvicorn thinkengine:app --reload --host 0.0.0.0 --port 8000