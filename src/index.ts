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
	return c.text('Hello Hono!');
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
