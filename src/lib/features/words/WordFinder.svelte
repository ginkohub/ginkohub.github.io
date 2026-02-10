<script>
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { wordState } from './wordState.svelte';

	// -- State (Runes) --
	let words = $state([]);
	let status = $state('Connecting...');
	let filteredWords = $state([]);
	let searching = $state(false);

	let showSettings = $state(false);

	// Settings
	let language = $state('english');
	let mode = $state('prefix');
	let format = $state('lower');
	let fontSize = $state('medium');
	let limit = $state(200);

	const DB_NAME = 'WordDB';
	const STORE_NAME = 'ws';

	// -- Logic --
	function getSoundex(s) {
		if (!s) return '';
		let a = s.toUpperCase().split(''),
			first = a.shift(),
			result = '',
			map = { BFPV: 1, CGJKQSXZ: 2, DT: 3, L: 4, MN: 5, R: 6 };

		result =
			first +
			a
				.map((v) => {
					for (let k in map) if (k.indexOf(v) !== -1) return map[k];
					return 0;
				})
				.filter((v, i, t) => (i === 0 ? v !== map[first] : v !== t[i - 1]) && v !== 0)
				.join('');

		return (result + '000').slice(0, 4);
	}

	async function initDB() {
		return new Promise((resolve) => {
			const request = indexedDB.open(DB_NAME, 1);
			request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME);
			request.onsuccess = () => resolve(request.result);
		});
	}

	async function fetchWords(db, lang) {
		status = `Loading ${lang} dictionary...`;
		try {
			const res = await fetch(`/${lang}.txt`);
			const text = await res.text();
			const list = text
				.split(/\r?\n/)
				.filter((x) => x.trim())
				.map((w) => w.toLowerCase());
			const tx = db.transaction(STORE_NAME, 'readwrite');
			tx.objectStore(STORE_NAME).put(list, lang);
			return list;
		} catch (e) {
			status = 'Failed to load data!';
			return [];
		}
	}

	async function reloadDatabase() {
		status = 'Clearing cache...';
		words = [];
		filteredWords = [];
		const db = await initDB();
		const tx = db.transaction(STORE_NAME, 'readwrite');
		tx.objectStore(STORE_NAME).delete(language);

		words = await fetchWords(db, language);
		status = `Reloaded: ${words.length.toLocaleString()} words`;
	}

	// Load data when language changes
	$effect(() => {
		const lang = language;
		loadData(lang);
	});

	async function loadData(lang) {
		const db = await initDB();
		const cached = await new Promise((r) => {
			const q = db.transaction(STORE_NAME).objectStore(STORE_NAME).get(lang);
			q.onsuccess = () => r(q.result);
		});

		if (cached) {
			words = cached;
			status = `Ready: ${words.length.toLocaleString()} words (${lang})`;
		} else {
			words = await fetchWords(db, lang);
			status = `Ready: ${words.length.toLocaleString()} words (${lang})`;
		}
	}

	onMount(async () => {
		const saved = localStorage.getItem('ginkohub_word_settings');
		if (saved) {
			try {
				const s = JSON.parse(saved);
				language = s.language ?? 'english';
				mode = s.mode ?? 'prefix';
				format = s.format ?? 'lower';
				fontSize = s.fontSize ?? 'medium';
				limit = s.limit ?? 200;
			} catch (e) {
				console.error('Failed to load settings', e);
			}
		}
	});

	$effect(() => {
		if (typeof window !== 'undefined') {
			const settings = { language, mode, format, fontSize, limit };
			localStorage.setItem('ginkohub_word_settings', JSON.stringify(settings));
		}
	});

	let timeout;
	$effect(() => {
		// Watch for changes in wordState or manual search triggers
		const term = wordState.searchTerm.trim().toLowerCase();
		wordState.searchSignal; // Dependency

		clearTimeout(timeout);

		if (!term || term.length < 2) {
			filteredWords = [];
			searching = false;
			return;
		}

		searching = true;
		timeout = setTimeout(() => {
			performSearch(term);
		}, 200);
	});

	function performSearch(term) {
		const results = [];
		const max = limit;

		if (mode === 'prefix') {
			for (let i = 0; i < words.length; i++) {
				if (words[i].startsWith(term)) {
					results.push(words[i]);
					if (results.length >= max) break;
				}
			}
		} else {
			const sdx = getSoundex(term);
			for (let i = 0; i < words.length; i++) {
				if (getSoundex(words[i]) === sdx) {
					results.push(words[i]);
					if (results.length >= max) break;
				}
			}
		}

		filteredWords = results;
		wordState.results = results; // Feedback to AI
		searching = false;
	}

	function handleCopy(word) {
		navigator.clipboard.writeText(word);
		const t = document.createElement('div');
		t.className = 'copy-toast';
		t.innerText = `Copied: ${word}`;
		document.body.appendChild(t);
		setTimeout(() => t.remove(), 1000);
	}

	let displayStatus = $derived(
		searching
			? 'Searching...'
			: wordState.searchTerm.length >= 2
				? `${filteredWords.length} words found`
				: status
	);

	function portal(node) {
		document.body.appendChild(node);
		return {
			destroy() {
				if (node.parentNode) node.parentNode.removeChild(node);
			}
		};
	}
</script>

<div class="word-container font-inter">
	<div class="search-section">
		<div class="status-indicator">{displayStatus}</div>

		<div class="input-wrapper">
			<input
				type="text"
				bind:value={wordState.searchTerm}
				placeholder="Type to search..."
				disabled={words.length === 0}
				class="main-input font-space"
			/>

			<div class="action-buttons">
				<button
					class="action-btn text-base active:bg-white active:text-black"
					onclick={(e) => {
						e.stopPropagation();
						showSettings = !showSettings;
					}}
					title="Settings"
				>
					⚙️
				</button>
			</div>

			{#if showSettings}
				<!-- Modal Overlay -->
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					use:portal
					class="modal-overlay"
					onclick={() => (showSettings = false)}
					in:fade={{ duration: 200 }}
				>
					<div
						class="settings-modal shadow-2xl"
						onclick={(e) => e.stopPropagation()}
						style="border-color: var(--accent-color)"
						in:fly={{ y: 20, duration: 300 }}
					>
						<div class="modal-header font-space">
							<span class="tracking-[0.2em]">System Configuration</span>
							<button
								class="close-btn"
								onclick={() => (showSettings = false)}
								title="Close settings">CLOSE</button
							>
						</div>

						<div class="space-y-6">
							<!-- Language Selection -->
							<div class="setting-item">
								<span class="setting-label">Lexicon Language</span>
								<div class="grid grid-cols-2 gap-2">
									{#each ['english', 'indonesian'] as lang}
										<button
											onclick={() => (language = lang)}
											class="py-2 text-[9px] font-black uppercase tracking-widest border transition-all
											{language === lang
												? 'bg-white text-black border-white'
												: 'border-slate-800 text-slate-500 hover:border-slate-600'}"
										>
											{lang}
										</button>
									{/each}
								</div>
							</div>

							<!-- Search Method -->
							<div class="setting-item">
								<span class="setting-label">Search Algorithm</span>
								<div class="grid grid-cols-2 gap-2">
									{#each [{ id: 'prefix', label: 'Exact Prefix' }, { id: 'soundex', label: 'Soundex (Phonetic)' }] as m}
										<button
											onclick={() => (mode = m.id)}
											class="py-2 text-[9px] font-black uppercase tracking-widest border transition-all
											{mode === m.id
												? 'bg-white text-black border-white'
												: 'border-slate-800 text-slate-500 hover:border-slate-600'}"
										>
											{m.label}
										</button>
									{/each}
								</div>
							</div>

							<!-- Case Format -->
							<div class="setting-item">
								<span class="setting-label">Casing Protocol</span>
								<div class="grid grid-cols-3 gap-2">
									{#each [{ id: 'lower', label: 'abc' }, { id: 'upper', label: 'ABC' }, { id: 'title', label: 'Abc' }] as f}
										<button
											onclick={() => (format = f.id)}
											class="py-2 text-[9px] font-black uppercase tracking-widest border transition-all
											{format === f.id
												? 'bg-white text-black border-white'
												: 'border-slate-800 text-slate-500 hover:border-slate-600'}"
										>
											{f.label}
										</button>
									{/each}
								</div>
							</div>

							<!-- Size and Limit Row -->
							<div class="grid grid-cols-2 gap-4">
								<div class="setting-item">
									<span class="setting-label">Display Size</span>
									<select
										bind:value={fontSize}
										class="w-full bg-slate-950 border border-slate-800 p-2 text-[10px] font-bold uppercase text-slate-300 outline-none focus:border-white/20"
									>
										<option value="small">Small</option>
										<option value="medium">Medium</option>
										<option value="large">Large</option>
									</select>
								</div>
								<div class="setting-item">
									<span class="setting-label">Return Limit</span>
									<select
										bind:value={limit}
										class="w-full bg-slate-950 border border-slate-800 p-2 text-[10px] font-bold uppercase text-slate-300 outline-none focus:border-white/20"
									>
										<option value={50}>50</option>
										<option value={100}>100</option>
										<option value={200}>200</option>
										<option value={500}>500</option>
									</select>
								</div>
							</div>
						</div>

						<div class="setting-footer pt-6 border-t border-slate-800 mt-8 space-y-3">
							<button
								class="w-full py-3 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:brightness-110 active:scale-95 transition-all"
								style="background-color: var(--accent-color); color: #000;"
								onclick={reloadDatabase}
								title="Force cache refresh and reload dictionary"
							>
								Initialize Database Reload
							</button>
							<p class="text-[7px] text-slate-600 uppercase text-center tracking-widest">
								Configuration is persisted in local sector
							</p>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>

	<div class="results-container font-{fontSize} case-{format}">
		{#if filteredWords.length > 0}
			<div class="word-grid">
				{#each filteredWords as word}
					<button
						class="word-card active:brightness-95 transition-all"
						onclick={() => handleCopy(word)}
						title="Click to copy: {word}"
					>
						{#if mode === 'prefix'}
							<span
								class="match"
								style="color: var(--accent-color); text-decoration-color: var(--accent-color)"
								>{word.slice(0, wordState.searchTerm.trim().length)}</span
							>{word.slice(wordState.searchTerm.trim().length)}
						{:else}
							{word}
						{/if}
					</button>
				{/each}
			</div>
		{:else if wordState.searchTerm.length >= 2 && !searching}
			<div class="empty-state font-space">No words found.</div>
		{/if}
	</div>
</div>

<style>
	.word-container {
		--primary: #f1f5f9;
		--secondary: #94a3b8;
		--border: #1e293b;
		--bg: #000000;
		--hover: #0f172a;
		--text: #f1f5f9;

		width: 100%;
	}

	.search-section {
		margin-bottom: 1.5rem;
	}

	.status-indicator {
		font-size: 10px;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.15em;
		color: var(--secondary);
		margin-bottom: 0.75rem;
		height: 1rem;
	}

	.input-wrapper {
		position: relative;
		display: flex;
		align-items: center;
		border-bottom: 2px solid var(--border);
		transition: border-color 0.3s;
	}

	.input-wrapper:focus-within {
		border-color: var(--accent-color);
	}

	.main-input {
		flex: 1;
		min-width: 0;
		background: transparent;
		border: none;
		color: var(--primary);
		padding: 0.5rem 0;
		font-size: 1.125rem;
		font-weight: 700;
		font-family: 'Space Grotesk', sans-serif;
		outline: none;
	}

	.main-input::placeholder {
		color: var(--secondary);
		opacity: 0.5;
	}

	.action-buttons {
		display: flex;
		gap: 0.5rem;
		flex-shrink: 0;
	}

	.action-btn {
		font-weight: 900;
		letter-spacing: 0.1em;
		padding: 0.5rem 0.75rem;
		border: 1px solid var(--border);
		color: var(--secondary);
		cursor: pointer;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.action-btn:hover {
		border-color: var(--accent-color);
		color: var(--accent-color);
	}

	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.8);
		backdrop-filter: blur(8px);
		z-index: 999;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
	}

	.settings-modal {
		background: var(--bg);
		border: 1px solid var(--border);
		padding: 2rem;
		width: 100%;
		max-width: 400px;
		max-height: 90vh;
		overflow-y: auto;
	}

	.modal-header {
		font-weight: 900;
		text-transform: uppercase;
		font-size: 11px;
		margin-bottom: 2rem;
		color: var(--primary);
		border-bottom: 1px solid var(--border);
		padding-bottom: 0.75rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.close-btn {
		font-size: 9px;
		font-weight: 900;
		cursor: pointer;
		color: var(--secondary);
		transition: color 0.2s;
	}

	.close-btn:hover {
		color: white;
	}

	.setting-item {
		margin-bottom: 1.5rem;
		color: var(--primary);
	}

	.setting-label {
		display: block;
		font-size: 8px;
		font-weight: 800;
		text-transform: uppercase;
		color: var(--secondary);
		margin-bottom: 0.75rem;
		letter-spacing: 0.1em;
	}

	.word-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		gap: 1px;
		background: var(--border);
		border: 1px solid var(--border);
	}

	.word-card {
		background: var(--bg);
		border: none;
		padding: 1rem 0.75rem;
		text-align: left;
		color: var(--text);
		font-weight: 500;
		cursor: pointer;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		transition: background 0.2s;
	}

	.word-card:hover {
		background: var(--hover);
	}

	.match {
		font-weight: 900;
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.empty-state {
		text-align: center;
		padding: 4rem 0;
		color: var(--secondary);
		font-weight: 600;
		letter-spacing: 0.05em;
	}

	.case-lower {
		text-transform: lowercase;
	}
	.case-upper {
		text-transform: uppercase;
	}
	.case-title {
		text-transform: capitalize;
	}

	.font-small {
		font-size: 12px;
	}
	.font-medium {
		font-size: 14px;
	}
	.font-large {
		font-size: 18px;
	}

	.flex-1 {
		flex: 1;
	}
</style>
