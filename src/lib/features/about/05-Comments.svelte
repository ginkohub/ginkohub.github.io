<script>
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { marked } from 'marked';
	import hljs from 'highlight.js';

	let { accentColor } = $props();

	const PAGE_ID = 'ginkohub-main';
	const API_URL = 'https://ghp-tools.vercel.app/api';

	let comments = $state([]);
	let author = $state('');
	let content = $state('');
	let isLoading = $state(false);
	let isPosting = $state(false);
	let error = $state('');

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
				// Optional: reload to ensure exact counts from server
				// loadComments(); 
			}
		} catch (e) {
			console.error('Vote failed:', e);
		}
	}

	onMount(() => {
		loadComments();
		// Configure marked if not already done globally
		marked.setOptions({
			highlight: function(code, lang) {
				const language = hljs.getLanguage(lang) ? lang : 'plaintext';
				return hljs.highlight(code, { language }).value;
			},
			langPrefix: 'hljs language-'
		});
	});
</script>

<div class="space-y-8 pt-12 border-t border-slate-800/50">
	<header class="flex items-center gap-4">
		<h2 class="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
			Neural Guestbook
		</h2>
		<div class="h-[1px] flex-1 bg-slate-800/50"></div>
	</header>

	<!-- Post Form -->
	<div class="bg-slate-900/20 border border-slate-800 p-6 rounded-2xl space-y-4">
		<div class="flex flex-col md:flex-row gap-4">
			<div class="flex-1 space-y-1">
				<label for="comment-author" class="text-[7px] font-bold uppercase text-slate-500 tracking-widest ml-1">Identity</label>
				<input
					id="comment-author"
					bind:value={author}
					placeholder="Anonymous"
					class="w-full bg-black border border-slate-800 p-3 text-xs text-white outline-none focus:border-white/20 rounded-xl transition-all"
				/>
			</div>
		</div>
		<div class="space-y-1">
			<label for="comment-content" class="text-[7px] font-bold uppercase text-slate-500 tracking-widest ml-1">Transmission</label>
			<textarea
				id="comment-content"
				bind:value={content}
				placeholder="Share your thoughts... (Markdown supported)"
				rows="3"
				class="w-full bg-black border border-slate-800 p-3 text-xs text-white outline-none focus:border-white/20 rounded-xl transition-all resize-none"
			></textarea>
		</div>
		<button
			onclick={postComment}
			disabled={isPosting || !content.trim()}
			class="w-full py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-[0.98] disabled:opacity-50 rounded-xl"
			style="background-color: {accentColor}; color: #000;"
		>
			{isPosting ? 'TRANSMITTING...' : 'POST TRANSMISSION'}
		</button>
		{#if error}
			<p class="text-[9px] font-mono text-rose-500 uppercase text-center">{error}</p>
		{/if}
	</div>

	<!-- Comments List -->
	<div class="space-y-4">
		{#if isLoading}
			<div class="flex justify-center py-10">
				<div class="w-6 h-6 border-2 border-slate-800 border-t-white rounded-full animate-spin"></div>
			</div>
		{:else if comments.length === 0}
			<div class="text-center py-10 text-slate-600 text-[10px] uppercase tracking-widest">
				No transmissions detected in this sector.
			</div>
		{:else}
			{#each comments as comment (comment.id)}
				<div 
					class="bg-black border border-slate-800 p-5 rounded-2xl space-y-3 relative overflow-hidden group"
					in:fly={{ y: 20, duration: 400 }}
				>
					<div class="flex justify-between items-start">
						<div class="flex flex-col">
							<span class="text-xs font-bold text-white font-space">{comment.author}</span>
							<span class="text-[8px] text-slate-600 font-mono uppercase">
								{new Date(comment.timestamp).toLocaleString()}
							</span>
						</div>
						<div class="flex gap-2">
							<button 
								onclick={() => vote(comment.id, 'up')}
								class="flex items-center gap-1.5 px-2 py-1 border border-slate-800 rounded-lg hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group/up"
							>
								<span class="text-[10px] group-hover/up:scale-110 transition-transform">👍</span>
								<span class="text-[9px] font-mono text-slate-500">{comment.ups || 0}</span>
							</button>
							<button 
								onclick={() => vote(comment.id, 'down')}
								class="flex items-center gap-1.5 px-2 py-1 border border-slate-800 rounded-lg hover:border-rose-500/50 hover:bg-rose-500/5 transition-all group/down"
							>
								<span class="text-[10px] group-hover/down:scale-110 transition-transform">👎</span>
								<span class="text-[9px] font-mono text-slate-500">{comment.downs || 0}</span>
							</button>
						</div>
					</div>

					<div class="text-xs text-slate-300 leading-relaxed font-space prose-invert prose-sm max-w-none markdown-content">
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
		border-radius: 0.25rem;
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
		font-size: 0.85em;
	}
	:global(.markdown-content pre) {
		background: rgba(255, 255, 255, 0.05);
		padding: 1rem;
		border-radius: 0.75rem;
		overflow-x: auto;
		margin: 1rem 0;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}
</style>
