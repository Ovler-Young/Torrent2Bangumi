// this is to communicate with bangumi.tv
// env BANGUMI_API_KEY
import { env } from 'hono/adapter';
import { Env } from './index';


export async function getCalander(c: any) {
	const { BANGUMI_API_KEY } = env<{ BANGUMI_API_KEY: string }>(c);
	const res = await fetch('https://api.bgm.tv/calendar', {
		headers: {
			Authorization: `Bearer ${BANGUMI_API_KEY}`,
		},
	});
	let response: JSON = await res.json();
	return response;
}
