# Delegation changes the math

## The session that broke everything

A session ran on my machine for 14 hours. It was a job that filled out roughly 200 similar forms, one after the other. I had scoped the work carefully. I had given the agent good tools. I had watched the first few runs and they looked clean.

Fourteen hours. 84 dollars in tokens. A cache-hit rate that started at 94 percent and dropped to 22 percent by the end.

The agent did its job. The math was insane.

I rewrote the job to delegate. A parent session that dispatched to 200 subagent sessions, each handling one form. Twelve minutes. 9 dollars in tokens. Every subagent ran with a clean cache and short history.

Same model. Same work. One-ninth the cost and seventy times faster. All of it was the harness.

## What delegation actually changes

A single long session accumulates context. The context window grows. Cache-hit rates degrade. Attention spreads thinner. Failure in one step contaminates every step after it.

A session that delegates does not accumulate. The parent session hands work to a subagent, the subagent does the work with a short history, returns a short result. The parent keeps its context clean. The subagents each get their own clean context. Nothing contaminates anything.

The math is not linear. A session twice as long does not cost twice as much. It costs more than twice as much, because attention degrades, cache collapses, and the model starts working worse. Splitting a long session into ten short ones is not just ten times faster. It is often ten times better.

## When to delegate

Not every task needs delegation. A five-turn conversation with a user does not need subagents. A research agent that gathers five documents and summarizes them does not need subagents.

The pattern that screams for delegation is: a task that involves doing the same kind of work over and over. Twenty forms to fill. Forty tickets to triage. A hundred files to classify. The repetition is what kills the parent session, and delegation is what saves it.

The second pattern is: a task with a clear hand-off point. The parent session has decided what needs to happen. It does not need to stay in the loop for the doing. The parent is a planner. The subagents are doers.

## The orchestrator pattern

The shape I use most often now is an orchestrator.

The orchestrator session has one job: figure out the plan, dispatch the work, collect the results. It does not use execution tools itself. It uses a single tool called something like `dispatch_subagent` that takes a task description and returns a result.

The subagents have execution tools. They do not know about each other. They do not know about the orchestrator's history. They get a task, they do it, they report back.

The orchestrator's context stays small. The subagents' contexts stay small. The whole system runs cleanly even if the work takes thousands of steps in total.

This is the single biggest lever I have found for scaling agents past the demo stage. No optimization to the model, no clever prompt, no new framework matches what delegation does to the math.

## Two things that can go wrong

Delegation is not free. Two failure modes I have hit.

The parent session still grows. If the parent keeps asking "how did that go?" and the subagent keeps returning detailed reports, the parent accumulates all the reports. Now the parent is the long session. The fix is to have the subagent return a short summary, not a transcript.

The subagent lacks context. The parent knew something from turn three that the subagent needs. The subagent does not know it because the subagent is fresh. The fix is to pass the needed context into the subagent's task description explicitly. Pretend the subagent has amnesia. Give it everything it needs up front, in a short form.

## The harness has to make this easy

If spawning a subagent is a twenty-line change to your agent's code, nobody is going to do it. Delegation has to be one tool call for the agent, one line of config for you.

A harness that makes subagents as cheap as tool calls is a harness that scales. A harness that treats subagents as exotic is a harness that will buckle on real workloads.

## Delegation changes the math

The biggest lesson in this book is this one. You cannot prompt-engineer your way out of a long session. You cannot model-pick your way out of a long session. You cannot cache your way out of a long session.

You have to stop having long sessions.

Delegation is how you stop. Every long task is a short task in a trench coat. Pull off the trench coat and you find ten short tasks that can run in parallel, in fresh context, without any of the decay that killed the long version.

Learn to see the trench coat. Then cut it off.
