<script>
	import { fade, scale } from 'svelte/transition';

	let {
		show = $bindable(false),
		title = 'SYSTEM ALERT',
		message = '',
		closeOnOutside = true,
		onConfirm = () => {}
	} = $props();

	function close() {
		show = false;
		onConfirm();
	}

	function handleBackdropClick() {
		if (closeOnOutside) close();
	}

	// Lock body scroll when modal is open
	$effect(() => {
		if (show) {
			const originalOverflow = document.body.style.overflow;
			document.body.style.overflow = 'hidden';
			return () => {
				document.body.style.overflow = originalOverflow;
			};
		}
	});
</script>

{#if show}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md pointer-events-auto cursor-pointer"
		style="-webkit-backdrop-filter: blur(12px);"
		transition:fade={{ duration: 200 }}
		onclick={handleBackdropClick}
	>
		<div
			class="w-full max-w-[90%] md:max-w-md bg-slate-950 border border-slate-800 p-6 rounded-none relative overflow-y-auto max-h-[90vh] group shadow-[0_0_50px_rgba(0,0,0,0.5)] cursor-default"
			transition:scale={{ start: 0.9, duration: 300, opacity: 0 }}
			onclick={(e) => e.stopPropagation()}
		>
			<!-- Decorative corner lines -->
			<div class="absolute top-0 left-0 w-8 h-[1px] bg-white opacity-30"></div>
			<div class="absolute top-0 left-0 w-[1px] h-8 bg-white opacity-30"></div>
			<div class="absolute bottom-0 right-0 w-8 h-[1px] bg-white opacity-30"></div>
			<div class="absolute bottom-0 right-0 w-[1px] h-8 bg-white opacity-30"></div>

			<!-- Header -->
			<div class="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
				<h2
					class="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2"
				>
					<span class="w-2 h-2 bg-red-500 animate-pulse"></span>
					{title}
				</h2>
				<span class="text-[8px] font-mono text-slate-600"
					>ID: {Math.random().toString(16).slice(2, 8).toUpperCase()}</span
				>
			</div>

			<!-- Body -->
			<div class="py-4">
				<p class="text-white font-space text-lg leading-relaxed tracking-tight">
					{message}
				</p>
			</div>

			<!-- Footer/Action -->
			<div class="mt-8 flex justify-end">
				<button
					onclick={close}
					class="w-full md:w-auto px-8 py-4 md:py-2 bg-white text-black text-[11px] md:text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-colors active:scale-95"
				>
					OK
				</button>
			</div>

			<!-- Background noise/texture -->
			<div class="absolute inset-0 pointer-events-none opacity-[0.03] bg-scanline"></div>
		</div>
	</div>
{/if}
