function arabicNumber(number: number): string {
	return number.toString().replace(/\d/g, (digit) => {
		return '٠١٢٣٤٥٦٧٨٩'[parseInt(digit)];
	});
}

interface ISurah {
	number: number;
	name: string;
	englishName: string;
	englishTranslation: string;
	numberOfAyahs: number;
	revelationType: string;
}

class Surah implements ISurah {
	number: number;
	name: string;
	englishName: string;
	englishTranslation: string;
	numberOfAyahs: number;
	revelationType: string;

	constructor(surah: ISurah) {
		this.number = surah.number;
		this.name = surah.name;
		this.englishName = surah.englishName;
		this.englishTranslation = surah.englishTranslation;
		this.numberOfAyahs = surah.numberOfAyahs;
		this.revelationType = surah.revelationType;
	}

	numberArabic(): string {
		return arabicNumber(this.number);
	}

	numberOfAyahsArabic(): string {
		return arabicNumber(this.numberOfAyahs);
	}
}

interface IAyah {
	number: number;
	text: string;
	numberInSurah: number;
	juz: number;
	manzil: number;
	page: number;
	ruku: number;
	hizbQuarter: number;
	sajda: boolean;
}

class Ayah implements IAyah {
	number: number;
	text: string;
	numberInSurah: number;
	juz: number;
	manzil: number;
	page: number;
	ruku: number;
	hizbQuarter: number;
	sajda: boolean;

	constructor(ayah: IAyah) {
		this.number = ayah.number;
		this.text = ayah.text;
		this.numberInSurah = ayah.numberInSurah;
		this.juz = ayah.juz;
		this.manzil = ayah.manzil;
		this.page = ayah.page;
		this.ruku = ayah.ruku;
		this.hizbQuarter = ayah.hizbQuarter;
		this.sajda = ayah.sajda;
	}

	numberArabic(): string {
		return arabicNumber(this.number);
	}

	numberInSurahArabic(): string {
		return arabicNumber(this.numberInSurah);
	}
}

interface IEdition {
	identifier: string;
	language: string;
	name: string;
	englishName: string;
	format: string;
	type: string;
	direction: string;
}

class Edition implements IEdition {
	identifier: string;
	language: string;
	name: string;
	englishName: string;
	format: string;
	type: string;
	direction: string;

	constructor(edition: IEdition) {
		this.identifier = edition.identifier;
		this.language = edition.language;
		this.name = edition.name;
		this.englishName = edition.englishName;
		this.format = edition.format;
		this.type = edition.type;
		this.direction = edition.direction;
	}
}

class QuranView {
	allSurahs = $state<ISurah[] | null>(null);
	selectedSurah = $state<number>(0);

	constructor() {
		this.loadSurahs();
		this.loadCaches();
	}

	async loadCaches() {
		// get surah cache
		const cachedSurahs = localStorage.getItem('quran_all_surah');
		if (cachedSurahs) {
			this.allSurahs = JSON.parse(cachedSurahs);
		}

		// get selected surah cache
		const cachedSelectedSurah = localStorage.getItem('quran_selected_surah');
		if (cachedSelectedSurah) {
			this.selectedSurah = Number(cachedSelectedSurah);
		}
	}

	async loadSurahs() {
		this.allSurahs = await this.fetchSurahs();
	}

	getCurrentSurah(): ISurah | null {
		return this.getSurahInfo(this.selectedSurah);
	}

	getPreviousSurah(): ISurah | null {
		return this.getSurahInfo(this.selectedSurah - 1);
	}

	getNextSurah(): ISurah | null {
		return this.getSurahInfo(this.selectedSurah + 1);
	}

	getSurahInfo(surahNumber: number): ISurah | null {
		if (!this.allSurahs) return null;
		return this.allSurahs[surahNumber];
	}

	getAllSurahs(): ISurah[] | null {
		return this.allSurahs;
	}

	async fetchEditions(): Promise<IEdition[]> {
		return fetch('https://api.alquran.cloud/v1/editions')
			.then((response) => response.json())
			.then((data) => data.editions.map((edition: IEdition) => new Edition(edition)));
	}

	async fetchSurahs(): Promise<ISurah[]> {
		return fetch('https://api.alquran.cloud/v1/surah')
			.then((response) => response.json())
			.then((data) => data.surahs.map((surah: ISurah) => new Surah(surah)));
	}

	async fetchAyahs(surahNumber: number): Promise<IAyah[]> {
		return fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`)
			.then((response) => response.json())
			.then((data) => data.ayahs.map((ayah: IAyah) => new Ayah(ayah)));
	}

	async fetchAyahsEdition(surahNumber: number, edition: string): Promise<IAyah[]> {
		return fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/${edition}`)
			.then((response) => response.json())
			.then((data) => data.ayahs.map((ayah: IAyah) => new Ayah(ayah)));
	}
}
