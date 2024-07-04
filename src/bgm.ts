import { env } from 'hono/adapter';
import { Env } from './index';

async function fetchbgm(url: string, c: any): Promise<any> {
	const { BANGUMI_API_KEY } = env<{ BANGUMI_API_KEY: string }>(c);
	const res =  await fetch(url, {
		headers: {
			Authorization: `Bearer ${BANGUMI_API_KEY}`,
		},
	});
	let response = await res.json();
	return response;
}

export async function getCalendar(c: any): Promise<BangumiItem[]> {
	const res = await fetchbgm('https://api.bgm.tv/calendar', c);
	let cal = extractCalendar(res);
	return cal;
}

function extractCalendar(calendar: any[]): any[] {
	const result: any[] = [];
	for (const day of calendar) {
		for (const item of day.items) {
			result.push({
				air_weekday: item.air_weekday,
				id: item.id,
				name: item.name,
				name_cn: item.name_cn,
				air_date: item.air_date,
				type: item.type
			});
		}
	}
	return result;
}
