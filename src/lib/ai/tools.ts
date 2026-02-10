import type { ToolConfig, ToolModule } from '$lib/types';

// Dynamic tool discovery using Vite's glob import (recursive)
// We scan both .js and .ts files
const handlerModules = import.meta.glob<ToolModule>('./handlers/**/*.{js,ts}', { eager: true });

/**
 * Automatically aggregated AI Tool Schemas for Puter.js
 */
export const tools: ToolConfig[] = Object.entries(handlerModules)
	.filter(([_, mod]) => mod && mod.config && mod.handler)
	.map(([_, mod]) => mod.config);

/**
 * Returns a mapping of tool names to their implementation logic.
 * Requires access to the main application state.
 */
export function getHandlers(state: any): Record<string, (args: any) => Promise<string>> {
	const handlers: Record<string, (args: any) => Promise<string>> = {};

	Object.entries(handlerModules).forEach(([_, mod]) => {
		if (mod && mod.config && mod.handler) {
			handlers[mod.config.name] = mod.handler(state);
		}
	});

	return handlers;
}
