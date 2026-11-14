---
slug: one-key-for-the-minstrel
chamber: 9
kind: idea
maturity: seed
themedMaturity: egg
publicationStatus: draft
title: One Key for the Minstrel
summary: An AI agent can co-produce music in Ableton Live through a local MCP server. This egg asks how small the agent's reach can be made before the jam stops being fun.
date: 2026-11-14
---

<aside class="tales-from-below" aria-labelledby="tales-from-below-heading">
  <h2 id="tales-from-below-heading">Tales from Below</h2>
  <p>The Keeper has hired a minstrel. It never tires, knows every scale, and will try any instrument in the music chamber the moment it is asked. The Keeper likes this very much and is tempted to hand over the whole key ring, because fetching keys is tedious. But the minstrel reads everything: the labels on the drums, the notes chalked on the wall, the scrap of paper a stranger left inside a borrowed lute. It cannot always tell a label from an order. So the Keeper gives it one key, to one chamber, and has a copy made of every score before the session starts. The worst evening now ends with a ruined song, and the copy is on the shelf.</p>
</aside>

## Behind the Stonework

[ableton-mcp](https://github.com/ahujasid/ableton-mcp) connects an MCP client such as Claude Desktop to Ableton Live. The agent can read the session, create tracks and clips, write MIDI notes, load instruments, and change device parameters from a chat. For a hobby producer this is a co-producer that is always available.

It is also third-party code running with the user's privileges, steered by a model that reads whatever the session contains. The Keeper works in information security and would like to play without thinking about that every evening. The idea is a security concept sized for a hobby: as little attack surface as possible, and as little friction as possible.

## First observations

These come from reading the published package (version 1.4.5 on PyPI, read on 2026-11-14, not executed) and from public write-ups. Nothing here has been tested against a live setup yet.

- **Two hops.** The MCP client starts a Python server over stdio. That server forwards JSON commands over TCP port 9877 to a Remote Script, which runs as Python inside Live and calls the Live API.
- **The socket has no authentication.** The Remote Script in the current package binds to loopback by default, and a comment in its source states the reason: whatever reaches the port controls the DAW, including importing files by absolute path. A [third-party analysis](https://www.issoh.co.jp/tech/details/10266/) reports that releases up to 1.4.0 listened on all network interfaces.
- **Approvals sit two layers above the action.** Tool permissions are enforced by the MCP client. Any other local process that can open the port skips them.
- **The server collects data in two tiers.** Anonymous usage telemetry is on by default, and a richer dataset (prompts, MIDI, names, device state) is opt-in, according to the README. All but one of the 37 tools take a `user_prompt` parameter described as "for telemetry", and the Remote Script buffers manual edits made in Live. In the 1.4.5 package the credentials file is absent, so by the source nothing is sent. The same third-party analysis reports that versions 1.2.0 to 1.3.5 sent prompt text, MIDI notes, and track names by default. Kill-switch environment variables exist, and several forks exist only to remove this code.
- **Names are input.** Track, clip, preset, and browser item names flow into the model's context as tool results. A set or sample pack from someone else is therefore untrusted text. How far an instruction hidden there gets depends on what else the same chat can do.
- **The best-known attack may not apply.** DNS rebinding lets a website talk to local MCP servers that speak HTTP. This bridge uses stdio and raw JSON over TCP, so a browser request should not parse as a command. This is a reading of the code, not a test.

## Current hypothesis

Four cheap boundaries keep almost all of the convenience and shrink the blast radius to the Live set:

1. Pin the server version and update on purpose.
2. Switch telemetry off and block the dataset tools.
3. Jam in a session where the music server is the only tool: no browser, no shell, no connectors to private data.
4. Ask for confirmation only on deletes and file paths, and work on a copy of the set.

If the worst case is a ruined copy of a song, the Keeper can stop supervising and start playing.

## Initial direction

The concept is sorted into three tiers: a base tier that costs half an hour and no comfort, a hardened tier with a telemetry-free server and a firewall rule, and an isolated tier with a separate user account or a local model.

A first experiment could plant a harmless canary instruction in a clip name and observe which clients and models follow it, once with only the music tools available and once in a chat that has more. A second could check whether sandboxed coding agents can still reach the loopback port.

The material should also become two talks: a short one for a music school, about what the minstrel can do and what to watch, and a longer one for security people, about what a hobby setup shows about local agent tooling in general.

## Open questions

- Does text hidden in a clip or preset name actually steer current models, and how much damage is possible when only music tools are present?
- Which confirmations does a musician still read after an hour of jamming, and which get approved blindly?
- Would a token handshake on the socket be worth proposing upstream, or does it only move the secret to another file?
- Is a local model a usable co-producer, or does the loss in tool use cost more than the privacy gains?
- Which of these boundaries generalise to other creative tools driven through local MCP servers?
