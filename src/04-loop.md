# The loop is the product

## The agent that would not stop

I set an agent to work on a bug. It ran. It tried a fix. The fix did not work. It tried another. That did not work either. It tried a third, which broke a test. It tried to fix the test by disabling it. Then it tried to fix the failing build by reverting a file it had not touched.

Six hours later I came back to find 47 commits on a branch, a test suite that no longer ran, and a cheerful message that the agent was still working on it.

The model was fine. The loop was broken.

## A loop with no stop condition is a bug

Every agent runtime has a loop. Call the model, read the response, dispatch any tool calls, feed the results back, call the model again. The loop is simple. The mistakes are not.

The first mistake most harnesses make is letting the loop run until the model decides to stop. This works in demos. It does not work in production. The model does not have a reliable internal sense of "I am done." If there is any prompt-shaped reason to keep going, it will keep going. Forever, if you let it.

A loop needs exit conditions that are not up to the model.

## Step budgets

The simplest stop condition is a step count. The agent gets N turns to solve the problem. After N, the harness stops it, whether or not it thinks it is finished.

I used to resist this because it felt arbitrary. Who knows how many turns a task really needs. You pick the number and cap it.

The number is less important than the existence. Without a cap, the loop is unbounded. With a cap, you can actually reason about cost, latency, and failure.

I run most of my agents with a budget of 30 to 50 steps. The ones that need more than that almost always should have been broken into subagents instead.

## Time budgets

Step budgets catch runaway loops. Time budgets catch the other problem: an agent that gets stuck on a tool that takes forever.

I had an agent that called a flaky third-party API. The API would occasionally take 90 seconds to respond. Once in a while it would take 20 minutes. The agent, following its instructions, would patiently wait. The user, following their instructions, would patiently go insane.

A 30-second-per-tool-call ceiling fixed this. The tool now either responds or times out and returns an error. The agent handles the error like any other error. The world keeps spinning.

## Recovery is part of the loop

The loop has to answer a question the model cannot answer. When a tool fails, what happens next.

The lazy answer is "feed the error to the model and let it decide." Sometimes that works. Often the model retries the exact same call and gets the exact same error, because nothing has changed between attempts.

The harness has to be the thing that decides, after some number of identical failures, that the loop is in a bad state and should either escalate or stop. The model, left alone, will happily retry forever.

The simplest rule: if the same tool returns the same error three times in a row, stop the loop and report. This has caught more runaway agents for me than any other single piece of logic.

## The loop shapes what the agent can do

A loop with generous step and time budgets, good recovery, and clean telemetry feels like magic. The agent explores, tries things, recovers, eventually finishes. You watch it and think the model is impressive.

A loop without any of those things, running the same model, looks like a random number generator.

The loop is the product. The model is a component. The experience your users have is the experience of your loop.

## What a good loop looks like

Exit conditions the model cannot override. Step cap. Time cap. Failure cap. The agent can announce it is done, but it cannot keep going past the harness's limits.

Visibility into where it is. Which step, which tool, how much of the budget remains. If you cannot see this, you cannot debug it.

Graceful handling of failure. Tool errors surface as information the agent can work with, not as exceptions that crash the run. Identical repeated failures trigger a halt.

A clear finished state. When the loop ends, it ends somewhere definite. Results in a known location. Exit code that means something. Not "the process just stopped."

## The loop is the product

Whatever you think your agent is, the experience of using it is the experience of the loop that runs it. Every architectural decision in this book eventually hits the loop: caching, context, tools, delegation, memory, permissions. The loop is where they all meet.

Build the loop like it is the product. It is.
