import { ghpFetch } from '$lib/fetcher';

interface Joke {
	setup: string;
	punchline: string;
}

interface Meme {
	title: string;
	url: string;
	author: string;
	ups: number;
	channel: string;
}

class HumorState {
	joke = $state<Joke | null>(null);
	meme = $state<Meme | null>(null);
	selectedChannel = $state<string>('memes');
	loadingJoke = $state<boolean>(false);
	loadingMeme = $state<boolean>(false);

	async fetchJoke() {
		this.loadingJoke = true;
		try {
			const res = await fetch('https://official-joke-api.appspot.com/random_joke');
			const data = await res.json();
			this.joke = data;
		} catch (e) {
			console.error('Direct joke fetch failed, using fallback.', e);
			this.joke = {
				setup: 'Establishing connection to the humor grid...',
				punchline: 'Please wait for the next uplink cycle.'
			};
		} finally {
			this.loadingJoke = false;
		}
	}

	async fetchMeme(channel = 'memes') {
		this.selectedChannel = channel;
		this.loadingMeme = true;
		try {
			const res = await ghpFetch(`https://meme-api.com/gimme/${channel}`);
			if (res.success) {
				// The proxy returns the API response as a stringified JSON inside 'contents'
				const data =
					typeof res.data.contents === 'string' ? JSON.parse(res.data.contents) : res.data;

				this.meme = {
					title: data.title,
					url: data.url,
					author: data.author,
					ups: data.ups,
					channel: channel
				};
			}
		} finally {
			this.loadingMeme = false;
		}
	}
}

export const humorState = new HumorState();
