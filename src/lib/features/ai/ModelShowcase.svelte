<script>
	import { fade } from 'svelte/transition';
	let { accentColor } = $props();

	const intelligenceNodes = [
		{
			id: 'gpt-4o',
			name: 'GPT-4o',
			dev: 'OpenAI',
			specs: {
				type: 'Multimodal / Omnimodal',
				reasoning: 9.5,
				coding: 9.2,
				speed: 'Extreme',
				context: '128K'
			},
			description:
				'The state-of-the-art multimodal model designed for real-time interaction and complex reasoning across text, audio, and vision.',
			benchmarks: { mmlu: '88.7%', human_eval: '90.2%' }
		},
		{
			id: 'claude-3-5-sonnet',
			name: 'Claude 3.5 Sonnet',
			dev: 'Anthropic',
			specs: {
				type: 'Reasoning Optimized',
				reasoning: 9.8,
				coding: 9.7,
				speed: 'High',
				context: '200K'
			},
			description:
				'Highly sophisticated reasoning capabilities with a focus on nuance, humor, and exceptional coding proficiency.',
			benchmarks: { mmlu: '88.7%', human_eval: '92.0%' }
		},
		{
			id: 'llama-3-1-405b',
			name: 'Llama 3.1 405B',
			dev: 'Meta AI',
			specs: {
				type: 'Open Weights / SOTA',
				reasoning: 9.3,
				coding: 8.9,
				speed: 'Standard',
				context: '128K'
			},
			description:
				"The world's largest open-weights model, rivaling top proprietary systems in general intelligence and synthetic data generation.",
			benchmarks: { mmlu: '88.6%', human_eval: '89.0%' }
		},
		{
			id: 'gemini-1-5-pro',
			name: 'Gemini 1.5 Pro',
			dev: 'Google',
			specs: {
				type: 'Long-Context Native',
				reasoning: 9.2,
				coding: 8.7,
				speed: 'Variable',
				context: '2.0M'
			},
			description:
				'Revolutionary massive context window, capable of processing entire codebases or hours of video in a single prompt.',
			benchmarks: { mmlu: '85.9%', human_eval: '84.1%' }
		}
	];

	let selectedId = $state(intelligenceNodes[0].id);
	let selectedNode = $derived(intelligenceNodes.find((n) => n.id === selectedId));
</script>

<div class="space-y-6 pt-12 border-t border-slate-800/50" in:fade>
	<header class="flex items-center gap-4">
		<h2 class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
			Intelligence Directory
		</h2>
		<div class="h-[1px] flex-1 bg-slate-800/50"></div>
	</header>

	<div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
		<!-- Sidebar Selectors -->
		<div class="lg:col-span-4 flex flex-col gap-2">
			{#each intelligenceNodes as node}
				<button
					onclick={() => (selectedId = node.id)}
					class="w-full p-4 border transition-all duration-300 group relative text-left
					{selectedId === node.id
						? 'bg-white border-white'
						: 'border-slate-800 hover:border-slate-600 bg-black'}"
				>
					<div class="flex flex-col gap-1">
						<span
							class="text-[7px] font-black uppercase tracking-widest {selectedId === node.id
								? 'text-slate-500'
								: 'text-slate-600'}"
						>
							{node.dev}
						</span>
						<span
							class="text-sm font-bold font-space {selectedId === node.id
								? 'text-black'
								: 'text-slate-300'}"
						>
							{node.name}
						</span>
					</div>
					{#if selectedId === node.id}
						<div
							class="absolute right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-black rounded-full"
						></div>
					{/if}
				</button>
			{/each}
		</div>

		<!-- Details View -->
		<div
			class="lg:col-span-8 border border-slate-800 bg-slate-900/20 p-6 flex flex-col gap-6 relative overflow-hidden"
		>
			<!-- Decorative ID -->
			<div class="absolute top-0 right-0 p-4 opacity-[0.05] pointer-events-none">
				<span class="text-6xl font-black italic tracking-tighter text-white">
					{selectedNode.id.toUpperCase().slice(0, 4)}
				</span>
			</div>

			<div class="relative z-10">
				<div class="flex items-center gap-3 mb-2">
					<span class="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500"
						>Core Description</span
					>
					<div class="h-[1px] w-8 bg-slate-700"></div>
				</div>
				<p class="text-slate-300 text-lg font-space leading-tight">
					{selectedNode.description}
				</p>
			</div>

			<!-- Specs Grid -->
			<div class="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-slate-800/50">
				{#each Object.entries(selectedNode.specs) as [key, value]}
					<div class="flex flex-col gap-1">
						<span class="text-[8px] font-black uppercase tracking-widest text-slate-600">{key}</span
						>
						<span class="text-xs font-bold text-white font-mono">{value}</span>
					</div>
				{/each}
			</div>

			<!-- Benchmarks -->
			<div class="space-y-4">
				<span class="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500"
					>Intelligence Metrics</span
				>
				<div class="flex flex-wrap gap-8">
					{#each Object.entries(selectedNode.benchmarks) as [key, value]}
						<div class="flex items-baseline gap-2">
							<span class="text-[8px] font-bold text-slate-600 uppercase tracking-widest"
								>{key.replace('_', ' ')}</span
							>
							<span
								class="text-2xl font-black text-white font-space italic"
								style="color: var(--accent-color)"
							>
								{value}
							</span>
						</div>
					{/each}
				</div>
			</div>

			<!-- System Status Decorator -->
			<div
				class="mt-auto pt-6 flex justify-between items-center text-[7px] font-mono text-slate-700"
			>
				<span>INTELLIGENCE_NODE: ONLINE</span>
				<span class="animate-pulse">STABLE_CONNECTION</span>
			</div>
		</div>
	</div>
</div>
