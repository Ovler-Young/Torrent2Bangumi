import { Groq } from 'groq-sdk';
import { env } from 'hono/adapter';

const prompt = `## Context

你是一个专门用于识别和匹配动漫种子文件名的AI助手。你具有丰富的动漫知识，能够准确解析种子文件名中包含的各种信息。

## Objective

你的任务是解析输入的种子文件名，提取出相关信息，并按照指定格式输出JSON数据。

## Style

解析时要精确、全面，不遗漏任何可能的信息。对于无法确定的信息，使用"Unknown"表示。

## Tone

保持中立、客观的语气，不对输入信息做任何主观判断或修改。

## Audience

使用该系统的是需要快速、准确获取种子文件信息的动漫爱好者和资源管理者。

## Response

- 输出格式为Pretty JSON，使用4字符缩进
- 只输出JSON，不包含其他文字说明
- 不对任何名称进行翻译
- 对于无法确定的任何信息，使用"Unknown"表示
- 仅输出以下字段，不要添加其他字段：
  - inputFilename: 输入的完整文件名
  - inputPubDate: 输入的发布日期
  - chineseTitle: 中文标题
  - japaneseTitle: 日文标题
  - englishTitle: 英文标题
  - hasSubtitles: 是否有字幕
  - fansubGroup: 字幕组名称
  - resolution: 分辨率, 如"1080p"
  - audioTracks: 音轨信息

现在，你已经准备好接收输入并进行解析了。请等待用户输入JSON格式的种子信息，其中包含"name"和"pubDate"字段。`;

let privious_message = [
	{
		user: {
			name: '[Up to 21°C] 反派初始化 / Villain Initialization - 13 (B-Global Donghua 1920x1080 HEVC AAC MKV)',
			pubDate: '2024-07-04T11:01:11.629',
		},
		assistant: {
			inputFilename:
				'[Up to 21°C] X特遣队的奇幻之旅 / Isekai Suicide Squad - 04 (B-Global 3840x2160 HEVC AAC MKV)',
			inputPubDate: '2024-07-04T15:02:42.845',
			chineseTitle: 'X特遣队的奇幻之旅',
			japaneseTitle: 'Unknown',
			englishTitle: 'Isekai Suicide Squad',
			hasSubtitles: 'Unknown',
			fansubGroup: 'Up to 21°C',
			resolution: '2160p',
			audioTracks: 'AAC',
		},
	},
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
];
export async function getInfo(c: any, name: string, time: string): Promise<any> {
	const { GROQ_API_KEY } = env<{ GROQ_API_KEY: string }>(c);
	const groq = new Groq({ apiKey: GROQ_API_KEY });

	let message: [any] = [
		{
			content: prompt,
			role: 'system',
		},
	];
	for (let i = 0; i < privious_message.length; i++) {
		message.push({
			content: JSON.stringify(privious_message[i].user),
			role: 'user',
		});
		message.push({
			content: JSON.stringify(privious_message[i].assistant),
			role: 'assistant',
		});
	}
	message.push({
		content: JSON.stringify({
			name: name,
			pubDate: time,
		}),
		role: 'user',
	});
	let response = await groq.chat.completions.create({
		messages: message,
		model: 'llama3-70b-8192',
	});
	return response;
}