export type Word = { word: string; start: number };
export type Cue = { start: number; end: number; words: Word[] };

export const cues: Cue[] = [
	{ start: 0, end: 21.27, words: [] },
	{
		start: 21.27,
		end: 25.52,
		words: [
			{ word: 'Thought', start: 21.27 },
			{ word: 'I', start: 21.8 },
			{ word: 'found', start: 21.92 },
			{ word: 'a', start: 22.3 },
			{ word: 'way', start: 22.34 }
		]
	},
	{
		start: 25.52,
		end: 29.22,
		words: [
			{ word: 'Thought', start: 25.52 },
			{ word: 'I', start: 25.94 },
			{ word: 'found', start: 26.08 },
			{ word: 'a', start: 26.5 },
			{ word: 'way', start: 26.6 },
			{ word: 'out', start: 27.56 },
			{ word: '(found)', start: 27.74 }
		]
	},
	{
		start: 29.22,
		end: 33.36,
		words: [
			{ word: 'But', start: 29.22 },
			{ word: 'you', start: 29.5 },
			{ word: 'never', start: 29.6 },
			{ word: 'go', start: 30.26 },
			{ word: 'away', start: 30.68 },
			{ word: '(never', start: 31.24 },
			{ word: 'go', start: 32.36 },
			{ word: 'away)', start: 32.94 }
		]
	},
	{
		start: 33.36,
		end: 36.06,
		words: [
			{ word: 'So', start: 33.36 },
			{ word: 'I', start: 33.84 },
			{ word: 'guess', start: 33.94 },
			{ word: 'I', start: 34.34 },
			{ word: 'gotta', start: 34.46 },
			{ word: 'stay', start: 34.94 },
			{ word: 'now', start: 35.7 }
		]
	},
	{
		start: 36.06,
		end: 45.08,
		words: [
			{ word: 'Oh,', start: 36.06 },
			{ word: 'I', start: 37.14 },
			{ word: 'hope', start: 37.2 },
			{ word: 'some', start: 37.56 },
			{ word: 'day', start: 38.1 },
			{ word: "I'll", start: 39.9 },
			{ word: 'make', start: 40.24 },
			{ word: 'it', start: 41.84 },
			{ word: 'out', start: 43.08 },
			{ word: 'of', start: 43.98 },
			{ word: 'here', start: 44.4 }
		]
	},
	{
		start: 45.08,
		end: 53.24,
		words: [
			{ word: 'Even', start: 45.08 },
			{ word: 'if', start: 45.68 },
			{ word: 'it', start: 46.22 },
			{ word: 'takes', start: 46.4 },
			{ word: 'all', start: 47.54 },
			{ word: 'night', start: 48.62 },
			{ word: 'or', start: 50.02 },
			{ word: 'a', start: 50.34 },
			{ word: 'hundred', start: 50.54 },
			{ word: 'years', start: 52.46 }
		]
	},
	{
		start: 53.24,
		end: 61.0,
		words: [
			{ word: 'Need', start: 53.24 },
			{ word: 'a', start: 53.58 },
			{ word: 'place', start: 53.7 },
			{ word: 'to', start: 54.28 },
			{ word: 'hide,', start: 54.84 },
			{ word: 'but', start: 55.86 },
			{ word: 'I', start: 57.78 },
			{ word: "can't", start: 57.82 },
			{ word: 'find', start: 58.96 },
			{ word: 'one', start: 59.84 },
			{ word: 'near', start: 59.9 }
		]
	},
	{
		start: 61.0,
		end: 71.8,
		words: [
			{ word: 'Wanna', start: 61.0 },
			{ word: 'feel', start: 62.14 },
			{ word: 'alive,', start: 63.04 },
			{ word: 'outside', start: 64.86 },
			{ word: 'I', start: 66.56 },
			{ word: "can't", start: 66.76 },
			{ word: 'fight', start: 67.28 },
			{ word: 'my', start: 68.38 },
			{ word: 'fear', start: 69.42 }
		]
	},
	{
		start: 71.8,
		end: 75.68,
		words: [
			{ word: "Isn't", start: 71.8 },
			{ word: 'it', start: 72.5 },
			{ word: 'lovely,', start: 72.66 },
			{ word: 'all', start: 74.5 },
			{ word: 'alone?', start: 74.76 }
		]
	},
	{
		start: 75.68,
		end: 79.82,
		words: [
			{ word: 'Heart', start: 75.68 },
			{ word: 'made', start: 76.46 },
			{ word: 'of', start: 76.7 },
			{ word: 'glass,', start: 76.8 },
			{ word: 'my', start: 77.34 },
			{ word: 'mind', start: 77.82 },
			{ word: 'of', start: 78.44 },
			{ word: 'stone', start: 78.68 }
		]
	},
	{
		start: 79.82,
		end: 84.54,
		words: [
			{ word: 'Tear', start: 79.82 },
			{ word: 'me', start: 80.46 },
			{ word: 'to', start: 80.66 },
			{ word: 'pieces,', start: 80.94 },
			{ word: 'skin', start: 82.64 },
			{ word: 'to', start: 82.98 },
			{ word: 'bone', start: 83.04 }
		]
	},
	{
		start: 84.54,
		end: 92.26,
		words: [
			{ word: 'Hello,', start: 84.54 },
			{ word: 'welcome', start: 86.52 },
			{ word: 'home', start: 87.72 }
		]
	},
	{
		start: 92.26,
		end: 96.5,
		words: [
			{ word: "Walkin'", start: 92.26 },
			{ word: 'out', start: 93.1 },
			{ word: 'of', start: 93.28 },
			{ word: 'time', start: 93.38 }
		]
	},
	{
		start: 96.5,
		end: 100.68,
		words: [
			{ word: "Lookin'", start: 96.5 },
			{ word: 'for', start: 97.04 },
			{ word: 'a', start: 97.42 },
			{ word: 'better', start: 97.58 },
			{ word: 'place', start: 98.02 },
			{ word: "(lookin'", start: 98.54 },
			{ word: 'for', start: 99.12 },
			{ word: 'a', start: 99.7 },
			{ word: 'better', start: 99.72 },
			{ word: 'place)', start: 100.24 }
		]
	},
	{
		start: 100.68,
		end: 105.06,
		words: [
			{ word: "Something's", start: 100.68 },
			{ word: 'on', start: 101.38 },
			{ word: 'my', start: 101.52 },
			{ word: 'mind', start: 101.7 },
			{ word: '(mind)', start: 102.44 }
		]
	},
	{
		start: 105.06,
		end: 107.5,
		words: [
			{ word: 'Always', start: 105.06 },
			{ word: 'in', start: 105.52 },
			{ word: 'my', start: 105.68 },
			{ word: 'head', start: 106.16 },
			{ word: 'space', start: 106.36 }
		]
	},
	{
		start: 107.5,
		end: 116.02,
		words: [
			{ word: 'But', start: 107.5 },
			{ word: 'I', start: 108.2 },
			{ word: 'know', start: 108.3 },
			{ word: 'some', start: 108.52 },
			{ word: 'day', start: 109.12 },
			{ word: "I'll", start: 110.8 },
			{ word: 'make', start: 111.18 },
			{ word: 'it', start: 111.86 },
			{ word: 'out', start: 113.68 },
			{ word: 'of', start: 114.92 },
			{ word: 'here', start: 115.38 }
		]
	},
	{
		start: 116.02,
		end: 123.16,
		words: [
			{ word: 'Even', start: 116.02 },
			{ word: 'if', start: 116.64 },
			{ word: 'it', start: 117.18 },
			{ word: 'takes', start: 117.4 },
			{ word: 'all', start: 119.2 },
			{ word: 'night', start: 119.56 },
			{ word: 'or', start: 121.34 },
			{ word: 'a', start: 121.5 },
			{ word: 'hundred', start: 121.56 },
			{ word: 'years', start: 122.7 }
		]
	},
	{
		start: 123.16,
		end: 132.56,
		words: [
			{ word: 'Need', start: 123.16 },
			{ word: 'a', start: 124.4 },
			{ word: 'place', start: 124.54 },
			{ word: 'to', start: 125.24 },
			{ word: 'hide,', start: 125.76 },
			{ word: 'but', start: 126.8 },
			{ word: 'I', start: 128.28 },
			{ word: "can't", start: 128.88 },
			{ word: 'find', start: 129.92 },
			{ word: 'one', start: 130.78 },
			{ word: 'near', start: 131.72 }
		]
	},
	{
		start: 132.56,
		end: 143.1,
		words: [
			{ word: 'Wanna', start: 132.56 },
			{ word: 'feel', start: 133.06 },
			{ word: 'alive,', start: 133.84 },
			{ word: 'outside', start: 135.72 },
			{ word: 'I', start: 137.66 },
			{ word: "can't", start: 137.72 },
			{ word: 'fight', start: 138.26 },
			{ word: 'my', start: 139.32 },
			{ word: 'fear', start: 140.38 }
		]
	},
	{
		start: 143.1,
		end: 146.6,
		words: [
			{ word: "Isn't", start: 143.1 },
			{ word: 'it', start: 143.46 },
			{ word: 'lovely,', start: 143.58 },
			{ word: 'all', start: 145.44 },
			{ word: 'alone?', start: 145.56 }
		]
	},
	{
		start: 146.6,
		end: 150.76,
		words: [
			{ word: 'Heart', start: 146.6 },
			{ word: 'made', start: 147.36 },
			{ word: 'of', start: 147.58 },
			{ word: 'glass,', start: 147.66 },
			{ word: 'my', start: 148.24 },
			{ word: 'mind', start: 148.48 },
			{ word: 'of', start: 149.32 },
			{ word: 'stone', start: 149.52 }
		]
	},
	{
		start: 150.76,
		end: 155.46,
		words: [
			{ word: 'Tear', start: 150.76 },
			{ word: 'me', start: 151.54 },
			{ word: 'to', start: 151.78 },
			{ word: 'pieces,', start: 151.86 },
			{ word: 'skin', start: 153.58 },
			{ word: 'to', start: 153.86 },
			{ word: 'bone', start: 154.0 }
		]
	},
	{
		start: 155.46,
		end: 161.3,
		words: [
			{ word: 'Hello,', start: 155.46 },
			{ word: 'welcome', start: 157.04 },
			{ word: 'home', start: 158.62 }
		]
	},
	{
		start: 161.3,
		end: 168.62,
		words: [
			{ word: 'Whoa,', start: 161.3 },
			{ word: 'yeah', start: 166.12 }
		]
	},
	{
		start: 168.62,
		end: 170.98,
		words: [
			{ word: 'Yeah,', start: 168.62 },
			{ word: 'ah', start: 170.34 }
		]
	},
	{
		start: 170.98,
		end: 188.78,
		words: [
			{ word: 'Whoa,', start: 170.98 },
			{ word: 'whoa', start: 173.88 }
		]
	},
	{
		start: 188.78,
		end: 190.78,
		words: [
			{ word: 'Hello,', start: 188.78 },
			{ word: 'welcome', start: 190.44 },
			{ word: 'home', start: 191.44 }
		]
	}
];

export const sceneByLine: Record<number, string> = {
	4: 'hope',
	7: 'shards',
	8: 'shards',
	9: 'home',
	13: 'time',
	14: 'time',
	16: 'hope',
	17: 'hope',
	23: 'shards',
	24: 'shards',
	25: 'shards',
	26: 'shards',
	27: 'shards',
	28: 'home',
	29: 'home',
	30: 'home'
};
