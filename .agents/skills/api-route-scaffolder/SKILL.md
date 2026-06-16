# API Route Scaffolder Skill

## Purpose
Generate Next.js API routes (App Router) for StudioFlow backend – agent orchestration, payment webhooks, data export.

## When to Use
- Creating a new endpoint for agent invocation (e.g., `/api/agent/idea-architect`)
- Implementing export endpoints (`/api/export/user-data`)
- Webhook receivers (Flutterwave, optional analytics)

## Folder Structure

```text
app/api/
├── agent/
│   ├── idea-architect/route.ts
│   ├── content-crafter/route.ts
│   ├── product-alchemist/route.ts
│   └── retention-engine/route.ts
├── payments/
│   ├── initialize/route.ts
│   └── verify/route.ts
├── webhooks/
│   └── flutterwave/route.ts
└── export/
    └── user-data/route.ts
```

## Generic Route Template

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Validate input against schema
    // Call appropriate agent (via Antigravity or local function)
    // Return structured response
    return NextResponse.json({ result: "success", data: {} });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // For idempotent fetches, if needed
  return NextResponse.json({ status: "ok" });
}
```

## Example: Agent Invocation Implementation

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { callAntigravityAgent } from '@/lib/antigravity'; // hypothetical client

export async function POST(req: NextRequest) {
  const { ideaText, platform, tone } = await req.json();
  if (!ideaText || !platform) {
    return NextResponse.json({ error: 'Missing ideaText or platform' }, { status: 400 });
  }
  
  const agentResponse = await callAntigravityAgent('ContentCrafter', {
    idea_text: ideaText,
    platform_type: platform,
    tone: tone || 'casual'
  });
  
  // Fallback if agent fails
  if (agentResponse.fallback_used) {
    return NextResponse.json({
      post_body: `Quick tip about ${ideaText.substring(0, 50)}...`,
      prediction_score: 0.5,
      fallback: true
    });
  }
  
  return NextResponse.json(agentResponse);
}
```
