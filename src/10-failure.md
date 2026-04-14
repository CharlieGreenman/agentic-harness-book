# Failure is the feature

## The weekend the model was down

On a Saturday at 3am the model provider had an outage. Every session that tried to reach the model got back a 500. My agent, which I was running as a service for a few paying users, started handing back error messages.

For about ninety seconds. Then it started handing back error messages differently. The loop kept calling the model, getting the error, feeding it back into the context, calling again. Each call was a paid request against the fallback provider I had wired in. Each retry compounded the previous retry. The context grew. The cost grew.

By the time I woke up, the agent had burned through three hundred dollars on retries against a provider that had been returning errors the entire time. The outage was four hours long. My bill was larger than my revenue for the week.

The model was down. The harness did not know how to sit still.

## Failure is always going to happen

Every agent you build will run into failures you did not plan for. Networks drop. Model providers throttle. Tools time out. Rate limits hit. Downstream services return weird data. Someone changes an API without telling you.

This is not an edge case. It is the normal state of running a system at scale. Most runs go fine. Some percentage hit something unexpected.

The question is not whether your agent will encounter failure. It is what it does when it does.

## The three failures the harness has to handle

Transient failures. Network blips. Timeouts. Rate limits. The call can reasonably succeed on retry. Retrying is correct.

Persistent failures. The tool is genuinely broken. The provider is down. Retrying will not help. Retrying is wasteful and often harmful.

Silent failures. The call succeeded but the result is wrong. The API returned an empty list that should have had ten items. The tool swallowed an error and returned a default. These are the worst kind because nothing in the response looks wrong.

Each of these needs a different response. A harness that treats them all the same is a harness that fails badly, or retries expensively, or ships silent bugs.

## Backoff and budget

The standard pattern for transient failures is exponential backoff. Retry after one second. Then two. Then four. Then eight. Then give up.

This is not enough on its own. Every retry is a paid request. Every retry grows the context. Every retry delays the user. The harness needs a budget for retries, not just a schedule.

The rule I use: three retries for any single call, max. If the third retry fails, the loop stops and reports. I would rather report a failure to the user than burn another hour retrying against a service that is not coming back.

A retry budget that does not exist is a credit card left on the counter.

## Circuit breakers

After my weekend outage I built a circuit breaker into every service call the agent makes. The pattern is borrowed from traditional systems engineering. It works the same here.

If a service fails more than a threshold rate in a short window, the breaker opens. Further calls to that service fail immediately without being sent. The agent gets an error that says "service is down, cannot retry right now." The agent either adapts, falls back, or gives up.

After some cool-down period, the breaker lets a single probe call through. If it succeeds, the breaker closes and normal traffic resumes. If it fails, the breaker stays open.

This is the thing that would have saved me that weekend. A circuit breaker on the primary model provider would have cut off retries after the first two minutes. The fallback provider would have taken over cleanly. My bill would have been normal.

Circuit breakers are not exotic. They are engineering hygiene. Every harness that talks to external services should have them.

## Silent failures are the worst kind

Most error handling focuses on errors. The scarier class is successes that are actually failures.

The tool call returned successfully with an empty list. Is that because there really were no results, or because a query parameter was wrong and the service ignored it? The agent cannot tell. It takes the empty list at face value and moves on.

The fix is not in the error handling. It is in the tool itself. A tool that returns an empty list should distinguish between "we searched and found nothing" and "we could not search." A tool that returns a default value should flag when the default was used instead of a real result.

Your harness should push tool authors toward these distinctions. A tool whose empty result is ambiguous is a tool that will hide bugs for weeks.

## Degrade, do not crash

When failures happen, the agent has options. It can try harder. It can try differently. It can ask the user. It can give up. It can succeed partially.

The worst option is to crash. The second worst is to pretend everything is fine. The best is to degrade gracefully and tell the user what went wrong.

A good pattern: the agent produces a result even in failure. The result says "I could not finish because X. Here is what I learned before I stopped." The user gets something useful. The debuggability is preserved. The agent's next session can build on the partial result.

Failure is not a terminal state. It is a kind of output. The harness has to make it a good one.

## Failure is the feature

The healthy agents I have built spend a lot of their code on failure. Backoff. Budgets. Breakers. Graceful degradation. Partial results. Useful error reports.

The unhealthy agents I have built spent almost no code on failure. Every one of them blew up in production. Every one of them taught me the same lesson twice.

Your agent is going to fail. The shape of its failures is a feature you are designing, whether you know it or not. Design it well or live with what you get.

Failure is not something that happens to your agent. It is something your harness does. Pick what it does.
