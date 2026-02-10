<script>
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { marked } from 'marked';
	import hljs from 'highlight.js';
	import { aboutState } from './aboutState.svelte';

	let { accentColor } = $props();

	const PAGE_ID = 'ginkohub-main';
	const API_URL = 'https://ghp-tools.vercel.app/api';

	let comments = $state([]);
	let author = $state('');
	let content = $state('');
	let isLoading = $state(false);
	let isPosting = $state(false);
	let error = $state('');
	// Removed local showForm state

	// Load comments
	async function loadComments() {
		isLoading = true;
		try {
			const res = await fetch(`${API_URL}/comments/${PAGE_ID}`);
			if (!res.ok) throw new Error('Failed to load comments');
			comments = await res.json();
		} catch (e) {
			error = e.message;
		} finally {
			isLoading = false;
		}
	}

	// Post comment
	async function postComment() {
		if (!content.trim() || isPosting) return;

		isPosting = true;
		error = '';
		try {
			const res = await fetch(`${API_URL}/comments/${PAGE_ID}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					author: author.trim() || 'Anonymous',
					content: content.trim()
				})
			});

			const data = await res.json();
			if (data.error) throw new Error(data.error);

			content = '';
			await loadComments();
		} catch (e) {
			error = e.message;
		} finally {
			isPosting = false;
		}
	}

	// Vote logic
	async function vote(commentId, type) {
		try {
			const res = await fetch(`${API_URL}/comments/${PAGE_ID}/${commentId}/vote`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ type })
			});
			const data = await res.json();
			if (data.error) {
				alert(data.error);
			} else {
				// Update local state for immediate feedback, then sync
				comments = comments.map((c) => {
					if (c.id === commentId) {
						return {
							...c,
							ups: type === 'up' ? c.ups + 1 : c.ups,
							downs: type === 'down' ? c.downs + 1 : c.downs
						};
					}
					return c;
				});
			}
		} catch (e) {
			console.error('Vote failed:', e);
		}
	}

	onMount(() => {
		loadComments();
		// Configure marked if not already done globally
		marked.setOptions({
			highlight: function (code, lang) {
				const language = hljs.getLanguage(lang) ? lang : 'plaintext';
				return hljs.highlight(code, { language }).value;
			},
			langPrefix: 'hljs language-'
		});
	});
</script>

<div class="space-y-8 pt-12 border-t border-slate-800/50">
	<header class="flex items-center justify-between gap-4">
		<h2 class="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
			Neural Guestbook
		</h2>
		<div class="flex items-center gap-4 flex-1">
			<div class="h-[1px] flex-1 bg-slate-800/50"></div>
			<button
				onclick={() => aboutState.toggleGuestbookForm()}
				class="text-[8px] font-black uppercase border border-slate-800 px-3 py-1 hover:bg-white hover:text-black transition-all"
				title="Toggle Transmission Form"
			>
				{aboutState.guestbookFormOpen ? '- Cancel' : '+ Add Transmission'}
			</button>
		</div>
	</header>

	<!-- Post Form -->
	{#if aboutState.guestbookFormOpen}
		<div
			class="bg-white/5 backdrop-blur-md border border-white/10 p-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300"
		>
			<textarea
				id="comment-content"
				bind:value={content}
				placeholder="Transmission content... (Markdown supported)"
				rows="2"
				class="w-full bg-black/40 border border-white/5 p-2 text-xs text-white outline-none focus:border-white/20 transition-all resize-none"
			></textarea>

			<div class="flex gap-2">
				<input
					id="comment-author"
					bind:value={author}
					placeholder="Identity (Anonymous)"
					class="flex-1 bg-black/40 border border-white/5 p-2 text-[10px] text-white outline-none focus:border-white/20 transition-all"
				/>
				<button
					onclick={postComment}
					disabled={isPosting || !content.trim()}
					class="px-4 text-[9px] font-black uppercase tracking-widest transition-all active:scale-[0.95] disabled:opacity-50"
					style="background-color: {accentColor}; color: #000;"
				>
					{isPosting ? '...' : 'TRANSMIT'}
				</button>
			</div>
			{#if error}
				<p
					class="text-[8px] font-mono text-rose-500 uppercase text-center bg-rose-950/10 border border-rose-900/30 px-2 py-1 mt-1"
				>
					{error}
				</p>
			{/if}
		</div>
	{/if}

	<!-- Comments List -->
	<div class="space-y-2">
		{#if isLoading}
			<div class="flex justify-center py-10">
				<div
					class="w-6 h-6 border-2 border-slate-800 border-t-white rounded-full animate-spin"
				></div>
			</div>
		{:else if comments.length === 0}
			<div class="text-center py-10 text-slate-600 text-[10px] uppercase tracking-widest">
				No transmissions detected in this sector.
			</div>
		{:else}
			{#each comments as comment (comment.id)}
				<div
					class="bg-white/5 backdrop-blur-sm border border-white/5 p-5 space-y-3 relative overflow-hidden group hover:border-white/20 transition-all duration-300"
					in:fly={{ y: 20, duration: 400 }}
				>
					<div class="flex justify-between items-start">
						<div class="flex flex-col">
							<span
								class="text-xs font-serif italic font-bold text-slate-200 group-hover:text-white transition-colors"
								>{comment.author}</span
							>
							<span class="text-[7px] text-slate-600 font-mono uppercase tracking-widest">
								{new Date(comment.timestamp).toLocaleString()}
							</span>
						</div>
						<div class="flex gap-1">
							<button
								onclick={() => vote(comment.id, 'up')}
								class="flex items-center gap-1.5 px-2 py-1 border border-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group/up"
							>
								<span
									class="text-[10px] group-hover/up:scale-110 transition-transform grayscale group-hover/up:grayscale-0"
									>👍</span
								>
								<span class="text-[9px] font-mono text-slate-500 group-hover/up:text-emerald-500"
									>{comment.ups || 0}</span
								>
							</button>
							<button
								onclick={() => vote(comment.id, 'down')}
								class="flex items-center gap-1.5 px-2 py-1 border border-white/5 hover:border-rose-500/50 hover:bg-rose-500/5 transition-all group/down"
							>
								<span
									class="text-[10px] group-hover/down:scale-110 transition-transform grayscale group-hover/down:grayscale-0"
									>👎</span
								>
								<span class="text-[9px] font-mono text-slate-500 group-hover/down:text-rose-500"
									>{comment.downs || 0}</span
								>
							</button>
						</div>
					</div>

					<div
						class="text-xs text-slate-400 leading-relaxed font-inter prose-invert prose-sm max-w-none markdown-content group-hover:text-slate-300 transition-colors"
					>
						{@html marked.parse(comment.content)}
					</div>
				</div>
			{/each}
		{/if}
	</div>
</div>

<style>
	:global(.markdown-content p) {
		margin-bottom: 0.75rem;
	}
	:global(.markdown-content p:last-child) {
		margin-bottom: 0;
	}
	:global(.markdown-content code) {
		background: rgba(255, 255, 255, 0.1);
		padding: 0.1rem 0.2rem;
		border-radius: 0;
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
		font-size: 0.85em;
	}
	:global(.markdown-content pre) {
		background: rgba(255, 255, 255, 0.05);
		padding: 1rem;
		border-radius: 0;
		overflow-x: auto;
		margin: 1rem 0;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}
</style>
