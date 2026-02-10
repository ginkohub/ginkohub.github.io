<script lang="ts">
	import { onMount } from 'svelte';
	import { appState } from '$lib/state/appState.svelte';
	import { i18n } from '$lib/state/i18n.svelte';

	let typedText = $state('');
	let fullText = $derived(i18n.t('intro.body'));
	let interval: any;

	function startTyping(text: string) {
		clearInterval(interval);
		typedText = '';
		let i = 0;
		interval = setInterval(() => {
			if (i < text.length) {
				typedText += text[i];
				i++;
			} else {
				clearInterval(interval);
			}
		}, 25);
	}

	// Restart typing when text changes (language switch)
	$effect(() => {
		startTyping(fullText);
	});

	onMount(() => {
		return () => clearInterval(interval);
	});
</script>

<div class="max-w-2xl mx-auto py-12 px-6 text-center space-y-8">
	<div
		class="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4 animate-fade-in"
	>
		<span class="text-[8px] font-black uppercase tracking-[0.4em] text-slate-500"
			>{i18n.t('intro.status')}</span
		>
	</div>

	<h1 class="text-3xl md:text-4xl font-serif italic text-white leading-tight">
		{i18n.t('intro.title')} <span style="color: var(--accent-color)">{appState.persona}</span>.
	</h1>

	<div class="relative py-8 min-h-[140px] md:min-h-[120px]">
		<p class="text-md md:text-lg text-slate-300 font-light leading-relaxed font-mono">
			{typedText}<span class="animate-pulse border-r-2 border-white ml-1"></span>
		</p>
	</div>

	<div class="pt-8 flex flex-col items-center gap-6 animate-fade-in delay-500">
		<button
			onclick={() => (appState.activeTabLabel = 'about')}
			class="px-8 py-3 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-sm transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
		>
			{i18n.t('intro.button')}
		</button>

		<div class="flex items-center gap-4 text-slate-600">
			<span class="w-8 h-px bg-current"></span>
			<span class="text-[8px] font-bold uppercase tracking-widest">{i18n.t('intro.protocol')}</span>
			<span class="w-8 h-px bg-current"></span>
		</div>
	</div>
</div>

<style>
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	.animate-fade-in {
		animation: fadeIn 1.5s ease-out forwards;
	}
	.delay-500 {
		animation-delay: 0.5s;
		opacity: 0;
	}
</style>
