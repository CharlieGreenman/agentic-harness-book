# Caching is the harness's job

## The thing nobody tells you about long sessions

I was looking at a token report at the end of a long day. A personal project I had been pushing hard. A kind of agent that submitted job applications for me. I had a column showing input tokens per message and another column showing cache reads. Most rows looked fine. A few rows did not.

One message, somewhere in the middle of a session that had been running for an hour, showed input tokens of 144,000. Cache reads on that same message: 1,800.

The message right before it showed input tokens of 400 and cache reads of 110,000. A normal cache hit.

Same model. Same conversation. Same project. Something between those two messages had wiped the cache prefix and forced the model to re-read the entire conversation as fresh input. I had been billed for it, and I had not noticed, because the only thing the harness showed me at the time was that the session was still running.

I went back and counted. In that one session there were five of those moments. Five times the cache had collapsed and the model had reprocessed roughly 100,000 tokens of conversation history at full price. The session cost about 14 dollars. Without those five moments it would have cost about 2.

That was the moment I realized the harness was the thing causing this, not the model.

## What caching actually depends on

Prompt caching looks simple from the outside. Send a prefix that matches what you sent before, pay a fraction of the normal rate. Every major provider advertises this as a headline feature now.

The fine print is where it gets interesting.

Caching works on bytes, not on meaning. The model hashes the start of your input, finds a match in its cache, skips the re-processing, and bills you at the reduced rate for everything that matched. The moment the bytes near the front diverge even slightly, the hash breaks, and everything after it has to be reprocessed from scratch at the full rate.

Three things sit in that prefix on every call.

Your system prompt. Whatever the harness pins at the start of every conversation. For most agent harnesses this includes the names and signatures of every tool the agent can call.

Your instruction files. The CLAUDE.md, AGENTS.md, or equivalent that the harness loads from the project root. Also anything the harness chooses to pin as always-loaded context.

Your conversation history. Once the session has more than a few turns, the whole history is part of the prefix, and every new turn relies on all of it being byte-identical to what was sent last turn.

If any one of those three shifts, the cache breaks. If it shifts near the front, nothing after it is cached either.

This is the whole story. Every caching problem I have seen in real agent work is some variation of: the harness is changing the prefix between turns without the user knowing.

## Two harness mistakes I made

The first one I caught by reading my own config file. The agent harness I was using had a field called `instructions` that listed files to inject into every session's context. I had set it up months earlier and had not thought about it since. It contained a glob that loaded every mode file, every data file, every template, and a hundred-kilobyte scanner config, all on every single call.

About 360 kilobytes of content that the agent mostly did not need, loaded from scratch every turn.

The fix took one pull request. I stripped the instructions field down to a single one-kilobyte file that genuinely was needed every time, and moved everything else into the skill router, which loads a file only when the mode being run actually needs it. Scanning jobs? Load the scanner config. Writing a cover letter? Do not load the scanner config.

Average input tokens per message dropped by about 70 percent overnight. Nothing else changed. Same model. Same workflows. I had just stopped paying to re-read 360 kilobytes of irrelevant context on every call.

The second mistake was harder to see. Even with a clean instruction prefix, some of my sessions were still generating those 144,000-token cache-miss rows.

These sessions had a pattern. They were all long. They all used the browser automation tool heavily, doing one form fill after another. Each tool call produced a tool result, and each tool result went into the conversation history, and somewhere along the way the accumulation of tool results was shifting the prefix enough that the cache kept dying.

The fix was not a config change. It was a rule. The harness now tells the agent, in its always-loaded instructions, that multi-step tool workflows have to be delegated to subagents. Each subagent is a fresh session with a short history. The main session becomes an orchestrator: it picks the work, dispatches, collects results. It does not drive the tools itself.

One long session full of tool calls burns tokens. Twenty short sessions with a few tool calls each cache cleanly. Same work, roughly one-fifth the effective token cost.

## Why this is a harness problem, not a model problem

When I talk about token costs with other people building agents, the first thing they reach for is the model. Switch to a cheaper one. Wait for the next release. Use the free tier and live with the rate limits.

The model is the lever they know how to pull.

What I am trying to convince you of in this chapter is that the bill you are getting is shaped almost entirely by the harness. Not by the model. The harness decides what is in the prefix. The harness decides how long sessions get to run. The harness decides whether the agent is allowed to delegate or has to do the work itself.

The model just bills you for the consequences.

A model change might cut your rate by half. A harness change can cut your effective token count by a factor of five or ten. The math is not close.

## How to actually see what's happening

You cannot fix this if you cannot see it. Most of the agent harnesses I have worked in bury the per-call token counts somewhere. In a local database. In a log file. In a stats command that averages everything together and hides the outliers.

The single most useful thing I have built for myself in this space is a small script that queries the harness's local database and produces one row per message, showing which session the message was part of, its input tokens, its cache read tokens, and the ratio between them.

Any row where input is high and cache read is low is a cache-miss you are paying for. Any row where input is low and cache read is high is a cache-hit you are getting for free. The pattern that matters is: where are the misses, and what did the harness do on the turn that caused them?

Running that report once a day for a week taught me more about my agent than any amount of staring at agent output. You can build the same thing against any harness that stores its sessions locally. It is usually a hundred lines of code.

Without the report you are guessing. With it, you can see exactly which sessions are healthy and which ones are quietly hemorrhaging.

## The rules that survived

Three things I now apply to every harness I work in.

Load instruction files on demand, not globally. If a file is only needed for one mode, only load it in that mode. The agent does not need to read your 100-kilobyte config on every turn just because one of the modes eventually wants to scan it.

For multi-step tool workflows, delegate to subagents. A session that is about to do 20 browser form fills is going to cache-bust. A main session that dispatches 20 subagents, each doing one form fill, will cache cleanly. The subagent pattern is the single biggest lever you have against long-session token burn.

Always have a token report you can run. Not in some aggregated dashboard. A flat list of messages with their input and cache read counts. Look at it daily. Look at it after any session that felt expensive. Build the habit of reading your own telemetry.

None of these is exotic. All three are things the harness can help you do, or help you fail at, depending on how it is built.

## Caching is the harness's job

It is easy to think of caching as an implementation detail. Something the model provider handles, something that happens below your concern. It is not. The caching behavior you get is shaped by the harness, end to end. The prefix it pins, the context it injects, the sessions it allows to grow unbounded, the telemetry it does or does not give you.

A healthy harness and an unhealthy one, running the same agent, on the same model, will show effective token costs an order of magnitude apart. I have seen it. I have caused it. I have fixed it.

If your harness is not helping you with caching, it is working against you. There is no middle ground.
