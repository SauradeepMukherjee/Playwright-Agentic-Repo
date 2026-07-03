import { stepCountIs } from '@openrouter/agent';
import { openrouter } from '../config/agent.config';
import { convertRequirementTool } from '../skills/work-item-to-json';

async function runRequirementAgent() {
  console.log("Starting Dedicated Requirement Parsing Agent...");

  const result = openrouter.callModel({
    model: 'openrouter/free', 
    input: 'Please convert the requirement markdown file at "requirements/req_1.md" into a structured JSON file.',
    tools: [convertRequirementTool],
    stopWhen: stepCountIs(5), 
  });

  // Stream the final response to the console
  for await (const chunk of result.getTextStream()) {
    process.stdout.write(chunk);
  }
  console.log(); // Print a final newline
}

runRequirementAgent().catch(console.error);
