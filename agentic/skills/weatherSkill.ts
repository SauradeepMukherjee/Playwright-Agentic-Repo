import { tool } from '@openrouter/agent';
import { z } from 'zod';

// Define your tool with full Type Safety
export const weatherTool = tool({
  name: 'get_weather',
  description: 'Get the current weather for a specific location',
  inputSchema: z.object({
    location: z.string().describe('City name, e.g., San Francisco'),
  }),
  execute: async ({ location }) => {
    console.log(`\n[Agent executing tool...] Fetching weather for ${location}`);
    // In a real app, you would fetch from a weather API here
    return { temperature: 72, condition: 'sunny', location };
  },
});
