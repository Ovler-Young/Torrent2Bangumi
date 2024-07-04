import { Groq } from 'groq-sdk';
import { env } from 'hono/adapter';

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

现在，你已经准备好接收输入并进行解析了。请等待用户输入JSON格式的种子信息，其中包含"name"和"pubDate"字段。`;

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
export async function getInfo(c: any, name: string, time?: string): Promise<any> {
	const { GROQ_API_KEY } = env<{ GROQ_API_KEY: string }>(c);
	const groq = new Groq({ apiKey: GROQ_API_KEY });

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
	let retryCount = 0;
	let temperature = 0.2;
	let response: any;

	do {
		try {
			let groqResponse = await groq.chat.completions.create({
				messages: message,
				model: 'llama3-70b-8192',
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

	return response;
}
