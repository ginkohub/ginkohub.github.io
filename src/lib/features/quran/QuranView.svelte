<script>
	import { onMount } from 'svelte';

	const BISMILLAH = 'بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِیمِ';

	let loading = $state(false);

	const QURAN_ALL_SURAH = 'quran_all_surah';
	let allSurah = $state([]);

	const QURAN_SURAH_SELECTED = 'quran_surah_selected';
	let currentSelectedSurah = $state(null);

	const QURAN_CURRENT_AYAH = 'quran_current_ayah';
	let currentAyahs = $state([]);

	function arabicNumber(n) {
		return n.toString().replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)]);
	}

	async function fetchAllSurah() {
		let url = 'https://api.alquran.cloud/v1/surah';
		let response = await fetch(url);
		let data = await response.json();
		allSurah = data.data;
	}

	async function fetchSurah(i) {
		if (!i) return;

		const cachedAyahs = localStorage.getItem(`quran_surah_${i}`);
		if (cachedAyahs && cachedAyahs.length > 2) {
			currentAyahs = JSON.parse(cachedAyahs);
			return;
		}

		let url = `https://api.alquran.cloud/v1/surah/${i}`;
		let response = await fetch(url);
		if (response.status === 200) {
			let data = await response.json();
			currentAyahs = data.data;

			localStorage.setItem(`quran_surah_${i}`, JSON.stringify(currentAyahs));
		}
	}

	function surahChanged(e) {
		const val = e.target.value || e.currentTarget.value;
		const numSurah = Number(val);

		if (numSurah > 0 && numSurah <= allSurah.length) {
			currentSelectedSurah = allSurah[numSurah - 1];
			fetchSurah(numSurah);
		}
	}

	onMount(() => {
		const cachedAllSurah = localStorage.getItem(QURAN_ALL_SURAH);
		if (cachedAllSurah && cachedAllSurah.length > 2) {
			allSurah = JSON.parse(cachedAllSurah);
		} else {
			fetchAllSurah();
		}

		const cachedSelectedSurah = localStorage.getItem(QURAN_SURAH_SELECTED);
		if (cachedSelectedSurah) {
			currentSelectedSurah = JSON.parse(cachedSelectedSurah);
			fetchSurah(currentSelectedSurah?.number);
		}
	});

	$effect(() => {
		if (allSurah && allSurah.length > 0) {
			localStorage.setItem(QURAN_ALL_SURAH, JSON.stringify(allSurah));
		}

		if (currentSelectedSurah) {
			localStorage.setItem(QURAN_SURAH_SELECTED, JSON.stringify(currentSelectedSurah));
		}
	});
</script>

<div id="quran-view" class="w-full">
	<header class="flex flex-col md:flex-row justify-center items-center gap-4">
		<div class="flex items-center gap-4">
			{#if currentSelectedSurah?.number > 1}
				<button
					onclick={surahChanged}
					value={currentSelectedSurah?.number - 1}
					class="px-3 py-1.5 border border-slate-800 text-slate-500 hover:text-white transition-all text-[8px] font-black uppercase tracking-widest bg-slate-900/50 hover:border-slate-600"
					title={allSurah[currentSelectedSurah?.number - 2]?.englishName}>Prev</button
				>
			{/if}
			<select
				onchange={surahChanged}
				class="bg-slate-900
        border border-slate-800 text-white text-[8px]
        font-black uppercase tracking-widest pl-10 pr-6
        py-1.5 outline-none focus:border-white/20 appearance-none
        cursor-pointer hover:bg-slate-800 transition-all min-w-[200px]"
			>
				<option value="0">Select Surah</option>
				{#each allSurah as surah}
					<option value={surah.number} selected={surah.number === currentSelectedSurah?.number}
						>{surah.number}. {surah.englishName} ({surah.numberOfAyahs})</option
					>
				{/each}
			</select>
			{#if currentSelectedSurah?.number < allSurah.length}
				<button
					onclick={surahChanged}
					value={currentSelectedSurah?.number + 1}
					class="px-3 py-1.5 border border-slate-800 text-slate-500 hover:text-white transition-all text-[8px] font-black uppercase tracking-widest bg-slate-900/50 hover:border-slate-600"
					title={allSurah[currentSelectedSurah?.number]?.englishName}>Next</button
				>
			{/if}
		</div>
	</header>
	<div class="mt-8 mb-4 relative">
		{#if currentSelectedSurah}
			<div class="text-3xl font-arabic text-center py-6 border-b border-slate-800 mb-8">
				<h3 class="text-white opacity-90">{currentSelectedSurah.englishName} : {currentSelectedSurah.name}</h3>
				<p class="text-[10px] font-sans uppercase tracking-[0.3em] text-slate-500 mt-2">
					{currentSelectedSurah.englishNameTranslation} • {currentSelectedSurah.revelationType}
				</p>
			</div>

			<div class="quran-ayahs mt-4" dir="rtl">
				<p
					class="text-3xl mb-4 font-arabic text-right leading-[2.5] text-slate-300 text-justify antialiased px-4"
				>
					{#each currentAyahs?.ayahs || [] as ayah}
						<span class="hover:text-[var(--accent-color)] transition-colors duration-300">
							{currentSelectedSurah.number !== 1 &&
							currentSelectedSurah.number !== 9 &&
							ayah.numberInSurah === 1
								? ayah.text.replace(BISMILLAH, '').trim()
								: ayah.text}
						</span>

						<span
							class="inline-flex items-center justify-center text-slate-500 border-slate-800 border-2 rounded-full w-10 h-10 mx-2 text-sm font-sans align-middle"
							style="border-color: rgba(var(--accent-rgb, 255, 255, 255), 0.1)"
						>
							{arabicNumber(ayah.numberInSurah)}
						</span>
					{/each}
				</p>
			</div>
		{:else}
			<div class="flex flex-col items-center justify-center py-20 text-slate-600 opacity-50">
				<div class="text-4xl mb-4">📖</div>
				<p class="text-[10px] uppercase font-black tracking-widest">Select a surah to begin</p>
			</div>
		{/if}
	</div>
</div>
<link
	href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Scheherazade+New:wght@400;700&family=Noto+Naskh+Arabic:wght@400..700&display=swap"
	rel="stylesheet"
/>

<style>
	.font-arabic {
		font-family: 'Amiri', 'Noto Naskh Arabic', serif;
		direction: rtl;
	}
</style>
