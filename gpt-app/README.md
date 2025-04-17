# GPT App (Svelte)

## How to use frontend

1. **Install dependencies** (run in `gpt-app` folder):
   ```bash
   pnpm install
   ```
2. **Start the dev server**:
   ```bash
   pnpm run dev
   ```
3. **Open your browser** to the address shown in the terminal (usually http://localhost:5173/).

You should see the GPT App main page. Edit `src/MainPage.svelte` to customize your main page!

## How to use backent

(run in `gpt-app` folder):
venv\Scripts\activate
# if use --reload then can't kill the process in terminal
# uvicorn thinkengine:app  --host 0.0.0.0 --port 8000 
(run in `gpt-app\domains\llm-categorize-domain\llm-categorizer\src>` folder)
uvicorn app.main:app --host 0.0.0.0 --port 8000