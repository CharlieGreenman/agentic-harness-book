# If you can't see it, it isn't happening

## The bug that lived for a month

I had an agent running in production. Mostly healthy. Success rate around 92 percent. Good enough that nobody was complaining, so nobody was looking.

Nobody looked for a month.

At the end of the month I finally opened the logs and found that the agent was failing a specific subtask almost every time. A date parsing step. The agent would fail, silently fall back to a default, and keep going. The overall task would complete. The user would see the wrong dates and not notice either.

The harness was telling me everything was fine. Nothing was fine. For a month I had been shipping broken output to real users.

The bug was trivial. The bug hiding was the problem.

## Agents are opaque by default

A traditional program is observable because you wrote the code. You know where it branches. You can add logs at the branches.

An agent is not that. An agent's behavior is determined by a model call, and the model's reasoning is not yours to inspect. You can see the inputs. You can see the outputs. Everything in between is a black box.

The temptation is to give up on observability and treat the agent like a service that either works or does not. This is the failure mode. Agents fail in ways that do not look like failures. They produce plausible wrong answers. They retry quietly. They swallow errors and move on.

If you cannot see what the agent did, you cannot tell when it is lying to you.

## The bare minimum

Three streams I now instrument on any agent I build.

Per-step trace. Every turn of the loop, every tool call, every model call. Who called what with what arguments, what came back, how long it took, how much it cost. Flat. Queryable.

Per-session summary. The whole session as one row. Total turns, total cost, total time, outcome. This is what you scroll through to spot weird sessions.

Per-tool stats. How often each tool is called, how often it succeeds, how often it fails, and with what error. A tool whose failure rate silently doubled is the first sign of trouble.

None of this is exotic. All of it is stuff I wish I had built before I needed it.

## Look at the outliers, not the average

The 92 percent success rate that lived with the month-long bug was the average. The average was fine. The eight percent was a specific pattern I had never looked at.

Averages hide problems. Outliers show them.

When I open agent telemetry now, I do not look at the average success rate. I look at the five longest sessions, the five most expensive ones, the five that took the most retries, the five that failed. Each one is a story. Sometimes the story is a rare bug that does not matter. Sometimes it is a hiding bug that does.

The five-of-each review takes ten minutes and catches things averages never will.

## Replay is a superpower

The best observability feature I have ever built into a harness is replay.

Every session is recorded. Every input, every tool response, every model response, in order. At any point in the future I can re-run the session against a different model, a different harness version, a different prompt. The deterministic parts run deterministically. The model call can be replayed against the new model and compared.

This is how I actually know whether a change helped or hurt. Not by looking at the live population and squinting. By replaying a hundred sessions from last week against the new setup and measuring the diff.

Any harness that makes replay easy is a harness I can trust. Any harness that does not is a harness I am guessing with.

## The telemetry no model provider gives you

Every major model provider gives you some telemetry. Token counts. Latency. Maybe cache hits. Not enough.

The telemetry the harness owns is the telemetry that tells you what actually happened. The sequence of tool calls. The reasoning branches. The places where the agent retried. The places where it gave up. The places where it was close to giving up and pulled through.

If the harness does not emit this, nobody does. The model provider does not know your tools. Your downstream consumer does not know your agent. Only the harness can tell you what the agent did.

## If you can't see it, it isn't happening

The reason I opened this chapter with a month-long silent bug is that I have lived through several of them. Every one of them taught me the same lesson. The absence of complaints is not the presence of health.

You do not know if your agent is good. You only know if your telemetry says it is.

Build the telemetry. Look at it. Look at the outliers. Replay the weird ones. The work is boring. The cost of not doing it is not.
