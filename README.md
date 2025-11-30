# n8n-nodes-bloomyearth

Official n8n node for Bloomy Earth.

This node lets you:
- Plant trees and generate certificates (`POST /v1/trees`)
- Offset emissions by tonne (`POST /v1/offset-by-tonne`)
- Check your Tree Credits balance (`GET /v1/credits`)

You’ll need:
- A Bloomy Earth account
- Your API key (used as `x-api-key`)
- Your `organizationId`

Once installed into n8n, create a “Bloomy Earth API” credential with your API key, then add the **Bloomy Earth** node to your workflow and choose the operation you need.
