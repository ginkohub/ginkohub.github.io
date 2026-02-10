import localesData from '$lib/data/locales.json';

type LocaleData = typeof localesData.en;
type Language = keyof typeof localesData;

class I18nManager {
	lang = $state<Language>('en');

	constructor() {
		if (typeof window !== 'undefined') {
			const saved = localStorage.getItem('ginkohub_lang') as Language;
			if (saved && localesData[saved]) {
				this.lang = saved;
			} else {
				const browserLang = navigator.language.split('-')[0] as Language;
				if (localesData[browserLang]) {
					this.lang = browserLang;
				}
			}
		}
	}

	setLang(newLang: Language) {
		this.lang = newLang;
		if (typeof window !== 'undefined') {
			localStorage.setItem('ginkohub_lang', newLang);
			document.documentElement.lang = newLang;
		}
	}

	t(key: string, vars: Record<string, string | number> = {}): string {
		const keys = key.split('.');
		let current: any = localesData[this.lang];

		for (const k of keys) {
			if (current[k] === undefined) return key;
			current = current[k];
		}

		let text = current as string;
		Object.entries(vars).forEach(([k, v]) => {
			text = text.replace(`{${k}}`, String(v));
		});

		return text;
	}
}

export const i18n = new I18nManager();
