
# Codeforces Problem Recommender — Frontend

A clean, frontend-only (HTML/CSS/JS) UI that calls a Hugging Face Space (Gradio) to generate personalized Codeforces problem recommendations. No server or build step required — just open locally or host as a static site.

## ✨ Features

- Personalized recommendations by Codeforces handle
- Optional topic filters (graphs, DP, math, etc.)
- Pure static assets (HTML/CSS/JS)

## 🧱 Tech Stack

- Vanilla HTML/CSS/JS
- [`@gradio/client`](https://www.npmjs.com/package/@gradio/client) (CDN) to call  Space from the browser
- [`marked.js`](https://github.com/markedjs/marked) to render Markdown returned by the Space

## 📁 Structure

```
/
├─ index.html    # UI (layout + styles) + script tags
├─ app.js        # Frontend logic and Space API calls
└─ vendor/       # (optional) self-hosted @gradio/client bundle
```

## 🚀 Quick Start

1. Set your Space handle in `app.js`:
	```js
	// app.js
	const SPACE = "Sai-ganesh-09/CF_Problem_Recommender";
	const ENDPOINT = "/recommend";
	```
	Prefer a named endpoint in your Space (`api_name="recommend"` on the Gradio click handler).  
	If not named, set `ENDPOINT` to the actual route your Space exposes (e.g., `/handle_recommendation`).

2. Serve statically (so ES module imports load):
	```sh
	npx serve .
	# or
	python3 -m http.server 8080
	```
	Open the printed URL (e.g., http://localhost:3000/).

3. Use it:
	- Enter a Codeforces username
	- (Optionally) pick topics
	- Click **Get Personalized Recommendations**

## ⚙️ Configuration

- **Space target:**  
  Handle form (default in `app.js`):
  ```js
  const SPACE = "Sai-ganesh-09/CF_Problem_Recommender";
  ```
  Full URL form (works the same):
  ```js
  const SPACE = "https://sai-ganesh-09-cf-problem-recommender.hf.space/";
  ```

- **Topics:**  
  Defined in `app.js` (`COMMON_TOPICS`) and rendered as checkboxes.

- **CDN-free option (optional):**
	```sh
	npm i @gradio/client@0.16.1
	mkdir -p vendor
	cp node_modules/@gradio/client/dist/index.min.js vendor/gradio-client.js
	```
	Then in `app.js`:
	```js
	import { Client } from "./vendor/gradio-client.js";
	```

## 🧩 How It Works

- On load, `app.js` connects to your Space:
	```js
	import { Client } from "https://cdn.jsdelivr.net/npm/@gradio/client/dist/index.min.js";
	const app = await Client.connect(SPACE);
	```
- On submit:
	```js
	const res = await app.predict("/recommend", [username, topics, numProblems]);
	```
- The UI renders:
	- Profile (Markdown → HTML via marked)
	- Recommendations (HTML returned by the Space)

## 🙏 Credits

- Hugging Face Spaces & Gradio
- Codeforces community & API (consumed by your Space backend)
