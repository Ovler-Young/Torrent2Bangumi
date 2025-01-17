import { env } from 'hono/adapter';
import { Env } from './index';

interface BangumiImage {
	large: string;
	common: string;
	medium: string;
	small: string;
	grid: string;
}

interface BangumiRatingCount {
	[key: number]: number;
}

interface BangumiRating {
	total: number;
	count: BangumiRatingCount;
	score: number;
}

interface BangumiCollection {
	wish: number;
	collect: number;
	doing: number;
	on_hold: number;
	dropped: number;
}

interface BangumiItem {
	id: number;
	url: string;
	type: number;
	name: string;
	name_cn: string;
	summary: string;
	air_date: string;
	air_weekday: number;
	images: BangumiImage;
	eps: number;
	eps_count: number;
	rating: BangumiRating;
	rank: number;
	collection: BangumiCollection;
}

interface BangumiSipleItem {
	id: number;
	name: string;
	name_cn: string;
	air_date: string;
	air_weekday: number;
	type: number;
}

interface CalendarWeekday {
	en: string;
	cn: string;
	ja: string;
	id: number;
}

interface CalendarDay {
	weekday: CalendarWeekday;
	items: BangumiItem[];
}

async function fetchbgm(url: string, c: any): Promise<any> {
	const { BANGUMI_API_KEY } = env<{ BANGUMI_API_KEY: string }>(c);
	const res = await fetch(url, {
		headers: {
			Authorization: `Bearer ${BANGUMI_API_KEY}`,
			'User-Agent': 'Ovler-Young/Torrent2Bangumi (https://github.com/Ovler-Young/Torrent2Bangumi)',
		},
	});
	let response = await res.json();
	return response;
}

export async function getCalendar(c: any): Promise<BangumiSipleItem[]> {
	const res = await fetchbgm('https://api.bgm.tv/calendar', c);
	let cal = extractCalendar(res);
	return cal;
}

function extractCalendar(calendar: CalendarDay[]): BangumiSipleItem[] {
	const result: BangumiSipleItem[] = [];
	for (const day of calendar) {
		for (const item of day.items) {
			result.push({
				air_weekday: item.air_weekday,
				id: item.id,
				name: item.name,
				name_cn: item.name_cn,
				air_date: item.air_date,
				type: item.type,
			});
		}
	}
	return result;
}

export async function getSubject(id: number, c: any): Promise<any> {
	const res = await fetchbgm(`https://api.bgm.tv/v0/subjects/${id}`, c);
	return res;
}

export async function getEpisodes(id: number, c: any): Promise<any> {
	const res = await fetchbgm(`https://api.bgm.tv/v0/episodes?subject_id=${id}&limit=200&offset=0`, c);
	return res;
}

export async function getEpisode(id: number, c: any): Promise<any> {
	const res = await fetchbgm(`https://api.bgm.tv/v0/episodes/${id}`, c);
	return res;
}

export async function searchChii(keyword: string, c:any): Promise<any[]> {
	const query = `
	  query SubjectSearch($q: String, $type: String) {
		querySubjectSearch(q: $q, type: $type) {
		  result {
			... on Subject {
			  id
			  name
			  nameCN
			  nsfw
			}
		  }
		}
	  }
	`;

	const variables = {
		q: keyword,
		type: 'anime',
	};

	const response = await fetch('https://chii.ai/graphql', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Accept': '*/*',
		},
		body: JSON.stringify({
			operationName: 'SubjectSearch',
			variables,
			query,
		}),
	});

	const data: any = await response.json();
	let searchresult = data.data.querySubjectSearch.result.map((item: any) => ({
		subject_id: item.id,
		name: item.name,
		nameCN: item.nameCN,
		nsfw: item.nsfw,
	}));

	for (let i = 0; i < 4; i++) {
		let episodes = await getEpisodes(searchresult[i].subject_id, c);
		searchresult[i].eps = episodes.data.map((item: any) => ({
			episode_ep: item.ep,
			episode_sort: item.sort,
			episode_id: item.id,
			episode_name: item.name,
			episode_name_cn: item.name_cn,
			airdate: item.airdate,
		}));
		searchresult[i].eps = searchresult[i].eps.filter((item: any) => item.episode_name);
	}

	searchresult = searchresult.map((item: any) => {
		let newItem = { ...item };
		newItem.subject_name = newItem.name;
		newItem.subject_name_cn = newItem.nameCN;
		delete newItem.name;
		delete newItem.nameCN;
		return newItem;
	});

	return searchresult;
}
