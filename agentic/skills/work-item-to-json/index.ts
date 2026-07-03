import { tool } from "@openrouter/agent";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";
import { openrouter } from "../../config/agent.config";

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

    // Read the prompt template from skill.md
    const templatePath = path.resolve(__dirname, "skill.md");
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Prompt template not found at: ${templatePath}`);
    }
    const template = fs.readFileSync(templatePath, "utf8");
    const prompt = template.replace("{{markdownContent}}", markdownContent);

    const result = openrouter.callModel({
      model: "openrouter/free",
      input: prompt,
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
