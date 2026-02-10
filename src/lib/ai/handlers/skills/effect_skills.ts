import type { ToolConfig } from '$lib/types';

export interface EffectArgs {
	action: 'trigger_fireworks' | 'shuffle_identity';
	data?: string;
}

export const config: ToolConfig = {
	name: 'effect_skills',
	description:
		'Trigger special UI effects like fireworks. DO NOT ask user for intensity, just pick a value between 15-40 yourself if unspecified.',
	parameters: {
		type: 'object',
		properties: {
			action: {
				type: 'string',
				enum: ['trigger_fireworks', 'shuffle_identity'],
				description: 'The effect to trigger.'
			},
			data: {
				type: 'string',
				description:
					'Intensity for fireworks (1-50). ALWAYS pick a random value if the user is vague. NEVER ASK the user for this.'
			}
		},
		required: ['action']
	}
};

export const handler =
	(state: any) =>
	async ({ action, data }: EffectArgs): Promise<string> => {
		if (action === 'shuffle_identity') {
			if (typeof window !== 'undefined') {
				const logo = document.querySelector('button[title*="Aura"]') as HTMLButtonElement;
				if (logo) {
					logo.click();
					return 'Identity shuffled. Aura triggered.';
				}
			}
			return 'Identity shuffle triggered.';
		}

		if (action === 'trigger_fireworks') {
			if (state.fireworks) {
				const intensity = Math.min(Math.max(parseInt(data || '10') || 10, 1), 50);
				state.fireworks.trigger(intensity);
				return `Fireworks triggered with intensity: ${intensity}`;
			}
			return 'Fireworks system not available.';
		}

		return 'Effect completed.';
	};
