# Memory is not context

## The agent that forgot everything every morning

I built an assistant agent I chatted with daily. Project notes, todos, decisions, little running conversations that extended across weeks.

Except they did not extend. Every morning I would open a new session and the agent had no idea who I was, what we had been working on, or what I had told it yesterday. It greeted me like a stranger, every time.

This is the gap between context and memory. The context window is a working space. Memory is what persists when the working space gets wiped.

My agent did not have memory. It had context, and the context ended when I closed the session.

## Context is a scratchpad

Think of the context window as a scratchpad the model gets at the start of each session. Everything the model sees during the session lives there. When the session ends, the scratchpad is thrown away.

That is fine for one-shot tasks. It is terrible for anything that spans multiple sessions.

The mistake I see most often is treating the context window as memory. Stuffing more and more into the prompt on each new session in the hope that the model will "remember." It does not. Each session starts fresh. The model has never seen you before, no matter what you shoved into its prompt.

## Memory is a harness feature

Memory has to be built. It is not something the model does for you. It is something the harness does on top of the model.

The shape is always the same. A store the harness reads on every session start. A mechanism for writing to the store during or after a session. A policy for what is worth storing.

The store can be a file, a database, a vector index, a JSON blob in the user's home directory. The shape does not matter as much as the discipline. Something durable. Something the harness touches on entry and exit.

When I finally added memory to my daily assistant, it was one file in `~/.myagent/memory.md`. The harness loaded it at session start, injected it into the prompt, and prompted the agent to write to it when it learned something new.

The agent stopped greeting me like a stranger. More importantly, it stopped forgetting decisions I had already made.

## Not all memory is the same

Three kinds of memory I now think about separately.

Facts about the user and their world. Name, role, preferences, recurring projects, people in their life. This is slow-moving. Written once, referenced often. Belongs in a persistent file the agent reads but rarely writes to.

State of ongoing work. What the user was doing last session. What decisions were made. What is still open. This is faster-moving. The harness should write to it at the end of a session and load it at the start of the next.

Retrievable knowledge. Documents, notes, references. Too big to load every time. The harness stores it and the agent fetches it when relevant.

Conflating these is how memory systems get confused. The facts belong in the prompt. The state belongs in a session handoff. The knowledge belongs in retrieval.

## Memory pollution

I made the first memory system I built write too much. Every minor fact got saved. "User opened a file at 3pm." "User prefers tabs over spaces." "User said hi."

Six weeks in, the memory file was ten thousand lines of noise. The agent was loading all of it into every session. Every session started with the agent's attention split across thousands of irrelevant facts.

Memory has to be curated. The harness cannot save everything. The agent cannot be trusted to decide what matters in the moment. Some mechanism has to keep the memory file honest.

The one that works for me: a size cap. The harness will not let the memory file exceed some number of lines. When it does, the harness prompts the agent to summarize and prune. The file stays lean. The prompt stays fast. The signal-to-noise stays high.

## The harness is the librarian

The job of the memory layer is not to remember everything. It is to remember the right things. That is a librarian job, not a hoarder job.

A good harness has a point of view on what goes into memory. A user's long-term preferences? Yes. The last thing the user asked about? Usually yes. The timestamp of every tool call? Almost never.

Without a point of view, the memory fills with junk and the agent gets slower and dumber over time. I have seen this happen more than once.

## Memory is not context

If you want your agent to feel like a coworker instead of a stranger, it has to remember. The model will not do this for you. The harness has to.

Keep memory separate from context. Curate what you save. Load it on session start and write to it on session end. Treat it like a small, durable database, not like an infinite prompt.

An agent without memory is an amnesiac. An agent with too much memory is a hoarder. The harness decides which one you get.
