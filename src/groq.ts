import { Groq } from 'groq-sdk';
import { env } from 'hono/adapter';
import { searchChii, getEpisodes } from './bgm';

const matchPrompt = `## Context

你是一个专门用于识别和匹配动漫种子文件名的AI助手。你具有丰富的动漫知识，能够准确解析种子文件名中包含的各种信息。

## Objective

你的任务是解析输入的种子文件名，提取出相关信息，并按照指定格式输出JSON数据。

## Style

解析时要精确、全面，不遗漏任何可能的信息。对于无法确定的信息，使用"Unknown"表示。

## Tone

在处理japaneseTitle时，如果遇到Hepburn罗马字拼写：
1. 识别罗马字拼写的日语标题
2. 将其准确转换为原始的日文假名和汉字
3. 在japaneseTitle字段中使用转换后的日文，而不是原始的罗马字

## Response

- 输出格式为Pretty JSON，使用4字符缩进
- 只输出JSON，不包含其他文字说明
- 不对任何名称进行翻译
- 对于无法确定的任何信息，使用"Unknown"表示
- 仅输出以下字段，不要添加其他字段：
  - inputFilename: 输入的完整文件名
  - inputPubDate: 输入的发布日期
  - chineseTitle: 中文标题
  - japaneseTitle: 日文标题（对于日语标题，如果遇到Hepburn罗马字拼写，需要将其转换为原始的日文假名和汉字。）
  - englishTitle: 英文标题
  - hasSubtitles: 是否有字幕
  - fansubGroup: 字幕组名称
  - resolution: 分辨率, 如"1080p"
  - audioTracks: 音轨信息

现在，你已经准备好接收输入并进行解析了。请等待用户输入JSON格式的种子信息，其中包含"name"和"pubDate"字段。
`;

let privious_message = [
	{
		user: {
			name: '[喵萌奶茶屋&LoliHouse] 身为魔王的我娶了奴隶精灵为妻、该如何爱她才好？ / Madome - 12 [WebRip 1080p HEVC-10bit AAC][简繁内封字幕][END]',
			pubDate: '2024-07-04T10:00:42.234',
		},
		assistant: {
			inputFilename:
				'[喵萌奶茶屋&LoliHouse] 身为魔王的我娶了奴隶精灵为妻、该如何爱她才好？ / Madome - 12 [WebRip 1080p HEVC-10bit AAC][简繁内封字幕][END]',
			inputPubDate: '2024-07-04T10:00:42.234',
			chineseTitle: '身为魔王的我娶了奴隶精灵为妻、该如何爱她才好？',
			japaneseTitle: 'Unknown',
			englishTitle: 'Madome',
			hasSubtitles: true,
			fansubGroup: '喵萌奶茶屋&LoliHouse',
			resolution: '1080p',
			audioTracks: 'AAC',
		},
	},
	{
		user: {
			name: '[小满云电工作室]不时轻声地以俄语遮羞的邻座艾莉同学 - S01E01 [简体内封] [1080P] [HEVC] [AAC]',
			pubDate: '2024-07-04T03:07:57.534201',
		},
		assistant: {
			inputFilename:
				'[小满云电工作室]不时轻声地以俄语遮羞的邻座艾莉同学 - S01E01 [简体内封] [1080P] [HEVC] [AAC]',
			inputPubDate: '2024-07-04T03:07:57.534201',
			chineseTitle: '不时轻声地以俄语遮羞的邻座艾莉同学',
			japaneseTitle: 'Unknown',
			englishTitle: 'Unknown',
			hasSubtitles: true,
			fansubGroup: '小满云电工作室',
			resolution: '1080p',
			audioTracks: 'AAC',
		},
	},
	{
		user: {
			name: '[jibaketa合成&音频压制][ViuTV粤语]美妙宠物 光之美少女！ / Wonderful Precure! - 08 [粤语+无字幕] (WEB 1920x1080 AVC AAC YUE)',
			pubDate: '2024-07-02T23:57:07.161',
		},
		assistant: {
			inputFilename:
				'[jibaketa合成&音频压制][ViuTV粤语]美妙宠物 光之美少女！ / Wonderful Precure! - 08 [粤语+无字幕] (WEB 1920x1080 AVC AAC YUE)',
			inputPubDate: '2024-07-02T23:57:07.161',
			chineseTitle: '美妙宠物 光之美少女！',
			japaneseTitle: 'Unknown',
			englishTitle: 'Wonderful Precure!',
			hasSubtitles: false,
			fansubGroup: 'jibaketa',
			resolution: '1080p',
			audioTracks: 'AAC',
		},
	},
	{
		user: {
			name: '[爱恋字幕社&猫恋汉化组][4月新番][恋语轻唱][Sasayaku You ni Koi wo Utau][10][1080p][MP4][GB][简日双语]',
			pubDate: '2024-07-02T21:00:00',
		},
		assistant: {
			inputFilename:
				'[爱恋字幕社&猫恋汉化组][4月新番][恋语轻唱][Sasayaku You ni Koi wo Utau][10][1080p][MP4][GB][简日双语]',
			inputPubDate: '2024-07-02T21:00:00',
			chineseTitle: '恋语轻唱',
			japaneseTitle: 'ささやくように恋を唄う',
			englishTitle: 'Unknown',
			hasSubtitles: true,
			fansubGroup: '爱恋字幕社&猫恋汉化组',
			resolution: '1080p',
			audioTracks: 'MP4',
		},
	},
];

const matchSubjectPrompt = `## Context

你是一个专门用于识别和匹配动漫种子文件名的AI助手。你具有丰富的动漫知识，能够准确解析种子文件名中包含的各种信息。现在，你还需要根据提供的搜索结果来匹配最合适的动漫信息。

搜索结果如下：
{{searchResponse}}

## Objective

你的任务是解析输入的JSON数据，该数据包含了之前解析的种子文件名信息。然后，你需要根据提供的搜索结果，找到最匹配的动漫条目，并将其信息合并到输入数据中。

## Style

解析和匹配时要精确、全面，不遗漏任何可能的信息。对于无法确定的信息，使用"Unknown"表示。

## Response

- 输出格式为Pretty JSON，使用4字符缩进
- 只输出JSON，不包含其他文字说明
- 不对任何名称进行翻译
- 对于无法确定的任何信息，使用"Unknown"表示
- 在原有输入的基础上，添加以下字段：
  - subject_id: 匹配到的动漫条目的ID
  - name: 匹配到的动漫条目的原名
  - nsfw: 匹配到的动漫条目的nsfw标志
- 用匹配到的动漫条目的nameCN替换原有的chineseTitle
- 如果没有找到匹配的条目，新增的字段（subject_id, name, nsfw）应设为null

现在，你已经准备好接收输入并进行解析和匹配了。请等待用户输入JSON格式的种子信息，其中包含之前解析的结果。
`;

const matchEpisodesPrompt = `## Context

你是一个专门用于识别和匹配动漫种子文件名的AI助手。你具有丰富的动漫知识，能够准确解析种子文件名中包含的各种信息。现在，你还需要根据提供的集数信息来匹配最合适的一集。

集数信息如下：
{{episodesData}}

## Objective

你的任务是解析输入的JSON数据，该数据包含了之前解析和匹配的种子文件名信息。然后，你需要根据提供的集数信息，找到最匹配的一集，并将其信息合并到输入数据中。

## Style

解析和匹配时要精确、全面，不遗漏任何可能的信息。对于无法确定的信息，使用null表示。

## Tone

保持专业、客观的语气。不需要额外的解释或评论。

## Response

- 输出格式为Pretty JSON，使用4字符缩进
- 只输出JSON，不包含其他文字说明
- 不对任何名称进行翻译
- 对于无法确定的任何信息，使用null表示
- 在原有输入的基础上，添加以下字段：
  - episode_id: 匹配到的集数的ID
  - ep: 匹配到的集数的集数
  - airdate: 匹配到的集数的播出日期
  - duration_seconds: 匹配到的集数的时长（秒）
- 如果没有找到匹配的集数，新增的字段应设为null

匹配规则：
1. 优先匹配输入数据中的集数信息（如果有）
2. 如果输入数据中没有集数信息，则匹配最新的一集
3. 如果所有集数都是未来日期，则匹配第一集

现在，你已经准备好接收输入并进行解析和匹配了。请等待用户输入JSON格式的种子信息，其中包含之前解析和匹配的结果。
`;

interface matchRequest {
	name: string;
	pubDate: string;
}

interface matchResponse {
	inputFilename: string;
	inputPubDate: string;
	chineseTitle: string | null;
	japaneseTitle: string | null;
	englishTitle: string | null;
	hasSubtitles: boolean | null;
	fansubGroup: string | null;
	resolution: string | null;
	audioTracks: string | null;
}

async function groqChat(c: any, message: any, model?: string, temperature?: number): Promise<any> {
	const { GROQ_API_KEY } = env<{ GROQ_API_KEY: string }>(c);
	const groq = new Groq({ apiKey: GROQ_API_KEY });
	let retryCount = 0;
	temperature = temperature || 0.2;
	let response: any;

	do {
		try {
			let groqResponse = await groq.chat.completions.create({
				messages: message,
				model: model || 'llama3-8b-8192',
				temperature: temperature,
			});

			let response_text = groqResponse.choices[0].message.content;
			if (!(response_text === null || response_text === '')) {
				response = JSON.parse(response_text);
				break;
			}
		} catch (error) {
			retryCount++;
			if (retryCount >= 3) {
				throw new Error('Failed to parse JSON after 3 attempts');
			}
			temperature /= 2;
		}
	} while (retryCount < 3);

	// if any of the fields are "Unknown", change them to null
	for (let key in response) {
		if (response[key] === 'Unknown') {
			response[key] = null;
		}
	}
	return response;
}

export async function getInfo(c: any, name: string, time?: string): Promise<matchResponse> {
	let message: [any] = [
		{
			content: matchPrompt,
			role: 'system',
		},
	];
	for (let i = 0; i < privious_message.length; i++) {
		message.push({
			content: JSON.stringify(privious_message[i].user, null, 4),
			role: 'user',
		});
		message.push({
			content: JSON.stringify(privious_message[i].assistant, null, 4),
			role: 'assistant',
		});
	}
	message.push({
		content: JSON.stringify({
			name: name,
			pubDate: time || new Date().toISOString(),
		}),
		role: 'user',
	});

	let response = await groqChat(c, message);

	return response;
}

export async function generateResponse(c: any, keyword: string, time?: string): Promise<any> {
	let matchResponse: matchResponse = await getInfo(c, keyword, time);
	let { chineseTitle, japaneseTitle, englishTitle } = matchResponse;
	let searchResponse = await searchChii(japaneseTitle || englishTitle || chineseTitle || keyword);

	let prompt = matchSubjectPrompt.replace(
		'{{searchResponse}}',
		JSON.stringify(searchResponse, null, 4)
	);
	let message: [any] = [
		{
			content: prompt,
			role: 'system',
		},
	];

	message.push({
		content: JSON.stringify(matchResponse, null, 4),
		role: 'user',
	});

	let response = await groqChat(c, message);

	if (response.subject_id) {
		let episodes = await getEpisodes(response.subject_id, c);

		let episodesRemoveDesc = episodes.data.map((item: any) => {
			let { desc, ...rest } = item;
			return rest;
		});

		prompt = matchEpisodesPrompt.replace(
			'{{episodesData}}',
			JSON.stringify(episodesRemoveDesc, null, 4)
		);

		message = [
			{
				content: prompt,
				role: 'system',
			},
		];

		message.push({
			content: JSON.stringify(response, null, 4),
			role: 'user',
		});

		response = await groqChat(c, message);

		if (response.episode_id) {
			response.subject_name = response.name;
			let episode = episodes.data.find((item: any) => item.id === response.episode_id);
			for (let key in episode) {
				response[key] = episode[key];
				console.log(key, episode[key]);
			}
			response.episode_name = episode.name;
		}
	}

	return response;
}
