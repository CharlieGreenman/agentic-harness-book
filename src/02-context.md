# Context is a resource

## The agent that stopped remembering

I had an agent doing research for me. It would spend 40 minutes on a task, pulling documents, summarizing them, cross-referencing. Good work. Until one day it handed me a final summary that contradicted something it had established in the second turn of the same session.

The claim it contradicted was still in the context window. I checked. The model had all 180,000 tokens of history available. It just was not using them anymore.

This was the thing that broke my mental model of context. I had been thinking of the context window as memory. As in: if it fits, the model remembers it. What I learned the hard way is that context is a resource, and putting more into it makes the model use it less.

## Attention is not free

When a model reads a prompt, every token has to be compared against every other token. That is what attention does. The math behind it is roughly quadratic in the length of the input, and while the implementations have gotten clever, the underlying pressure has not gone away.

A 200,000-token context does not give the model 200,000 tokens of equal focus. It gives the model a budget to spread across 200,000 tokens. Double the input, halve the attention per token, roughly. The model does not tell you when this is happening. It just quietly gets worse at finding things.

The pattern is well-documented now. Researchers call it the "lost in the middle" effect. Information at the very start of the context gets good attention. Information at the very end gets good attention. Information in the middle gets progressively less.

For agents, the middle is where most of the work lives. The tool results, the intermediate reasoning, the facts the agent established on turn three that it will need on turn fifteen. If the session runs long enough, all of that ends up in the middle.

## Two failure modes I had to learn to spot

The first: context collapse. The session keeps running, tokens keep accumulating, and the model quietly loses track of what it knew. It does not announce this. Its answers just start being worse. It stops using tools it should use. It forgets rules you established earlier.

For a long time I thought this was a model quality issue. It is not. It is a harness issue. The harness let the session grow past the point where the model could hold it coherently, and did not intervene.

The second: context pollution. I was loading too much into the prefix on every turn. Old tool results, cached data, instructions for modes I was not in. The signal-to-noise ratio was terrible. The model was spending most of its attention on material that did not matter for the task at hand.

The fix for collapse is different from the fix for pollution. Collapse is about letting sessions end. Pollution is about being careful what goes in.

## What the harness should do for you

Three decisions live in the harness here.

What gets loaded. The harness decides what instructions, what tool definitions, what context to put into every call. This is the pollution vector. If the harness loads everything always, every call is a mess.

When to summarize. At some point a session has enough history that keeping it all verbatim is doing more harm than good. Good harnesses compress older turns into summaries. Bad harnesses let the session grow until the model breaks.

When to stop. Sometimes the right move is to not continue a session at all. Start fresh. Carry forward only what matters. A harness that makes it easy to spawn new sessions with clean context is a harness that can keep the model performing.

## Compaction is not summarization

The first time I ran into agent context compaction, I thought it was a smart feature. The harness had noticed my session was getting long, summarized the earlier turns, and continued on a compressed history.

It worked, mostly. Then it did not.

The compacted summary had dropped a constraint I had established on turn four. The agent, reading only the summary, no longer knew about the constraint. It proceeded confidently in a direction I had explicitly ruled out. The constraint was not in the summary because the summarizer did not recognize it as important.

Compaction is lossy. Every harness that does it is making judgment calls about what matters, and those judgment calls are invisible to you unless you check.

The practical lesson: if a constraint has to survive the whole session, put it somewhere the harness will not throw away. The system prompt. An always-loaded instruction file. A durable note the harness promises not to compact. The context window is not a safe place for anything you cannot afford to lose.

## What to load on every turn

A short list, worth being honest about.

Instructions the model genuinely needs every turn. The tone of voice, the workflow rules, the hard constraints.

Tool definitions, but only for tools in scope for the current work. If your agent has 40 tools and today's job uses four of them, loading all 40 is lighting money on fire and distracting the model at the same time.

Nothing else. Everything else the agent can fetch on demand. That is what tools are for.

## Context is a resource

The framing I want to leave you with is this. Treat the context window like memory in a computer, not like a hard drive. Every byte in it is working memory. Every byte is costing you attention. Every byte is competing with every other byte for the model's focus.

A good harness is ruthless about what goes in. A bad harness assumes more is better.

More is not better. More is the problem.
