import { stepCountIs } from '@openrouter/agent';
import { openrouter } from '../config/agent.config';
import { weatherTool } from '../skills/weatherSkill';

// Run the Agent Loop
async function runAgent() {
  console.log("Starting agent...");

  const result = openrouter.callModel({
    // You can use any of the 400+ models on OpenRouter
    model: 'openrouter/free', 
    input: 'What is the weather in San Francisco?',
    tools: [weatherTool],
    
    // Safety check: Prevents the agent from looping infinitely 
    // if it gets confused and keeps calling tools.
    stopWhen: stepCountIs(5), 
  });

  // Stream the final response to the console
  for await (const chunk of result.getTextStream()) {
    process.stdout.write(chunk);
  }
  console.log(); // Print a final newline
}

runAgent().catch(console.error);
