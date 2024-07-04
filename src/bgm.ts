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
				type: item.type
			});
		}
    }
    return result;
}
