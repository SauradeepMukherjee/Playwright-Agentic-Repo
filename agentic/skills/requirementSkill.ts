import { tool } from "@openrouter/agent";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";
import { openrouter } from "../config/agent.config";

export const convertRequirementTool = tool({
  name: "convert_requirement_to_json",
  description:
    "Reads a markdown requirement document and parses it into a structured JSON file.",
  inputSchema: z.object({
    filePath: z
      .string()
      .describe(
        'The workspace-relative path to the markdown file (e.g. "requirements/req_1.md")',
      ),
  }),
  execute: async ({ filePath }) => {
    console.log(`\n[Agent executing tool...] Reading file: ${filePath}`);

    // Resolve absolute path
    const resolvedPath = path.resolve(process.cwd(), filePath);
    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`File not found at: ${resolvedPath}`);
    }

    const markdownContent = fs.readFileSync(resolvedPath, "utf8");

    console.log(
      `[Agent executing tool...] Invoking OpenRouter model to parse markdown to JSON...`,
    );

    const result = openrouter.callModel({
      model: "openrouter/free",
      input: `Read the following requirement specification markdown and convert it into a structured JSON object.
      
Requirements Markdown:
${markdownContent}

Your response must be a single, valid JSON object matching the following structure:
{
  "storyId": "e.g., SCRUM-101",
  "title": "Story title",
  "description": "Short description of the user story",
  "applicationUrl": "Target URL",
  "credentials": {
    "username": "Username if provided",
    "password": "Password if provided"
  },
  "acceptanceCriteria": [
    {
      "id": "e.g., AC1, AC2",
      "title": "Acceptance criteria title",
      "scenarios": [
        "List of steps, expectations, and rules under this criterion"
      ]
    }
  ],
  "businessRules": [
    "List of business rules"
  ]
}

Return ONLY the raw JSON output. Do not include any explanations, introduction, or markdown backticks.`,
    });

    const rawText = await result.getText();

    // Clean up potential markdown formatting (e.g. ```json ... ```)
    let cleanedText = rawText.trim();
    if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText
        .replace(/^```[a-zA-Z]*\n/, "")
        .replace(/\n```$/, "");
    }
    cleanedText = cleanedText.trim();

    let jsonObject;
    try {
      jsonObject = JSON.parse(cleanedText);
    } catch (err: any) {
      console.error(
        "Failed to parse model response as JSON. Raw response was:",
        rawText,
      );
      throw new Error(`Model did not return valid JSON: ${err.message}`);
    }

    // Ensure output folder exists
    const outputDir = path.resolve(process.cwd(), "test-results");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Generate output file path
    const fileBasename = path.basename(filePath, path.extname(filePath));
    const outputPath = path.join(outputDir, `${fileBasename}.json`);

    // Write JSON file
    fs.writeFileSync(outputPath, JSON.stringify(jsonObject, null, 2), "utf8");
    console.log(
      `[Agent executing tool...] JSON output successfully written to: ${outputPath}`,
    );

    return {
      success: true,
      message: `Requirements converted to JSON and saved successfully.`,
      outputPath: outputPath,
      data: jsonObject,
    };
  },
});
