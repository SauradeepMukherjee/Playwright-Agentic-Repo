Read the following requirement specification markdown and convert it into a structured JSON object.

Requirements Markdown:
{{markdownContent}}

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

Return ONLY the raw JSON output. Do not include any explanations, introduction, or markdown backticks.
