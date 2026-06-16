---
trigger: always_on
---

# Code Style – StudioFlow

## General Principles

- **Mobile-first, lightweight execution** – minimize token usage and response size.
- **Structured over prose** – always prefer JSON, YAML, or markdown lists over free paragraphs.
- **Actionable outputs** – every response must include a `next_action` field or button hint.
- **Deterministic fallbacks** – hardcode templates; avoid generative fallback loops.

## Language & Formatting

### For Agent Prompts (Google Antigravity)
- Use clear system messages that declare the agent role and output schema.
- Example system prompt for Content Crafter:
  > "You are ContentCrafter. Your goal is to generate a platform-ready post from an idea text. Adhere strictly to the requested platform type and tone. Output MUST be valid JSON matching the provided schema."

### Naming Conventions
- **Variables/keys**: `snake_case` (e.g., `idea_text`, `platform_type`).
- **Agent names**: PascalCase (e.g., `IdeaArchitect`, `ProductAlchemist`).
- **File names**: lowercase with hyphens (e.g., `entry-flow.js`).

### Markdown for User-Facing Content
- Use `##` for section titles, `-` for lists.
- Keep lines ≤ 80 characters for readability on mobile.
- Avoid nested markdown beyond 3 levels.

## Output Structure Rules

### Base Output Wrapper
Always include the `output`, `next_step`, and `meta` objects in every agent response:

```json
{
  "output": { 
    // Agent-specific payload here
  },
  "next_step": {
    "label": "Edit in StudioFlow",
    "action": "edit_content"
  },
  "meta": {
    "generation_time_ms": 123,
    "fallback_used": false
  }
}
```

### Example: ContentCrafter Response
```json
{
  "output": {
    "platform_type": "X",
    "post_body": "1/5 🧵 How to turn one idea into 3 content pieces:\n2/5 First, write a hook that stops the scroll...\n3/5 Second, add 3 supporting points...\n4/5 Third, a CTA that asks for RT or reply...\n5/5 That's it. Now go post.",
    "engagement_prediction_score": 0.78
  },
  "next_step": {
    "label": "Post to X now",
    "action": "export_to_x"
  },
  "meta": {
    "generation_time_ms": 450,
    "fallback_used": false
  }
}
```