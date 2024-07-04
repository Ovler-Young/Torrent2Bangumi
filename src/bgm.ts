// this is to communicate with bangumi.tv
// env BANGUMI_API_KEY
import { env } from 'hono/adapter';
import { Env } from './index';

async function fetchbgm(url: string, c: any) {
	const { BANGUMI_API_KEY } = env<{ BANGUMI_API_KEY: string }>(c);
	const res =  await fetch(url, {
		headers: {
			Authorization: `Bearer ${BANGUMI_API_KEY}`,
		},
	});
	let response: JSON = await res.json();
	return response;
}


export async function getCalander(c: any) {
	const res = await fetchbgm('https://api.bgm.tv/calendar', c);
	return res;
}
