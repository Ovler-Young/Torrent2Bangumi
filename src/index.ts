import { Hono } from 'hono';
import { cache } from 'hono/cache';
import { prettyJSON } from 'hono/pretty-json';

import { getCalendar, getEpisodes, searchChii } from './bgm';
import { generateResponse } from './groq';

const app = new Hono();
app.get(
	'*',
	cache({
		cacheName: 'my-app',
		cacheControl: 'max-age=3600',
	})
);
app.use(prettyJSON({ space: 4 }));

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	//
	// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
	// MY_SERVICE: Fetcher;
	//
	// Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
	// MY_QUEUE: Queue;
}

app.get('/', c => {
	// html content is stored in index.html
	const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Torrent to Bangumi</title>
	<style>
		body {
			font-family: Arial, sans-serif;
			max-width: 800px;
			margin: 0 auto;
			padding: 20px;
		}
		h1 {
			color: #333;
		}
		form {
			margin-bottom: 20px;
		}
		input, button {
			margin: 10px 0;
			padding: 5px;
		}
		#result {
			white-space: pre-wrap;
			background-color: #f0f0f0;
			padding: 10px;
			border-radius: 5px;
		}
	</style>
</head>
<body>
	<h1>Torrent to Bangumi Demo</h1>
	<form id="resolveForm">
		<input type="text" id="name" placeholder="Torrent name" required><br>
		<input type="text" id="time" placeholder="Torrent creation time" required><br>
		<button type="submit">Resolve</button>
	</form>
	<div id="result"></div>

	<script>
		document.getElementById('resolveForm').addEventListener('submit', async (e) => {
			e.preventDefault();
			const name = document.getElementById('name').value;
			const time = document.getElementById('time').value;

			try {
				const response = await fetch('/resolve', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ name, time }, null, 4),
				});
				const result = await response.json();
				document.getElementById('result').textContent = JSON.stringify(result, null, 4);
			} catch (error) {
				document.getElementById('result').textContent = \`Error: \${error}\`;
			}
		});
	</script>
</body>
</html>
	`;
	return c.html(htmlContent);
});

app.get('/getCalendar', async c => {
	const res = await getCalendar(c);
	return c.json(res);
});

app.post('/resolve', async c => {
	const body = await c.req.json();
	const { name, time: providedTime } = body;
	const time = providedTime ?? new Date().toISOString();
	const res = await generateResponse(c, name, time);
	return c.json(res);
});
app.get('/resolve/:name/:time', async c => {
	const { name, time } = c.req.param();
	const res = await generateResponse(c, name, time);
	return c.json(res);
});
app.get('/resolve/:name', async c => {
	const { name } = c.req.param();
	const res = await generateResponse(c, name);
	return c.json(res);
});

app.get('/getEpisodes/:id', async c => {
	let { id } = c.req.param();
	let subject_id = parseInt(id);
	const res = await getEpisodes(subject_id, c);
	return c.json(res);
});

app.get('/search/:keyword', async c => {
	const { keyword } = c.req.param();
	const res = await searchChii(keyword, c);
	return c.json(res);
});

export default app;
