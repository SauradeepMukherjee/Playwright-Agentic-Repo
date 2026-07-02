import { OpenRouter } from '@openrouter/agent';

// Initialize the OpenRouter client (automatically uses OPENROUTER_API_KEY from environment)
export const openrouter = new OpenRouter({
  // Optional: Add these headers if you want your app to show up on OpenRouter rankings
  // httpReferer: "https://your-app-url.com",
  // appTitle: "My Awesome Agent",
});
