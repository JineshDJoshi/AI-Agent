#!/bin/bash

# Set environment variables
export LIVEKIT_URL=wss://frontdesk-ai-agent-b87jmkpz.livekit.cloud
export LIVEKIT_API_KEY=APIqR3aVAJcjpTf
export LIVEKIT_API_SECRET=SvK75p2fQ5exBBiTQp5Mj9fM0TigDMTiMBzRL0RhDVoA
export OPENAI_API_KEY=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

# Start voice agent
python agent.py start

