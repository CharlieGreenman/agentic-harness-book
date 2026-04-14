# Evals or vibes

## The prompt change that made everything worse

I tweaked a prompt. Added a sentence I thought would help the agent handle edge cases. Watched a few sessions. They looked good. Shipped it.

A week later a user sent me a transcript where the agent had gone off the rails on a task it used to handle cleanly. I went to reproduce. Could not. The task worked in my hands. I blamed the user's environment, closed the ticket.

Three more tickets came in. Same task, different users. I was forced to admit the prompt change had caused a regression. I reverted it. The tickets stopped.

The whole thing cost me two weeks. It was avoidable. I had changed the prompt and shipped without running it against the last hundred real sessions to check what I had broken. I had trusted the vibes.

Vibes lie.

## You cannot tell if an agent is better by looking at one session

An agent is a probabilistic system. The same input can produce different outputs. A session that looks good to you is one sample from a distribution you cannot see.

You watch three sessions with the new prompt. They look good. Did the new prompt help? You have no idea. Three samples from a noisy distribution is not evidence of anything.

The only way to know if a change helped is to run it against a lot of cases and measure. If the success rate went up and cost went down, you improved. If not, you did not. Watching does not tell you. Measuring does.

Every successful agent team I have seen has an eval harness. Every unsuccessful one is shipping by vibes.

## What to actually evaluate

Three things I now measure on every change.

Correctness. Did the agent complete the task the way the user wanted. This is the one people think of first. It is usually the hardest to measure well, because correctness for a real task is complicated.

Cost. How many tokens did it use, how much time did it take, how many tool calls did it make. Correctness that takes triple the tokens is not obviously an improvement.

Stability. The same input run ten times, how similar are the outputs. Not identical. Similar in a way a user would recognize as consistent behavior. High variance is its own bug.

You need numbers for all three. Without cost and stability, a correctness improvement can secretly be making the agent worse on the axes that actually matter to your users.

## Evals are a dataset, not a test

The mistake I see most often is treating evals like unit tests. Write a dozen cases, check them, call it good. This does not catch regressions in the real population of tasks. It catches regressions on the dozen cases you happened to think of.

An eval set is a dataset. It should reflect the distribution of tasks your agent actually sees. That means a lot of cases. Hundreds, often thousands. Most of them pulled from real usage, not written from scratch.

Build the eval set by sampling real sessions. Label the outcomes. Keep the dataset fresh. Retire old cases when they stop being representative. Add new cases when you see failures.

An eval set that does not change is an eval set that slowly loses signal.

## The model as a judge

Evaluating a thousand sessions by hand is not possible. Evaluating them by exact match is not possible either, because the same task has many correct outputs.

The working pattern is to use a model as the judge. You run the agent against your dataset. Then you run another model call, with a rubric, that grades the output.

The model judge is not perfect. It disagrees with human judges about five to ten percent of the time in my experience. For most evals, this is fine, because you are measuring deltas. If the judge is consistently biased and you compare version A to version B under the same judge, the bias cancels.

Calibrate the judge against human judgment on a small sample. Then trust the judge on the large sample. Re-calibrate periodically. The judge drifts too.

## The harness is what runs the evals

Running evals is not something you do once in a while. It is something you do on every change. Every prompt edit, every tool edit, every model version. The evals have to be easy enough to run that skipping them feels wrong.

If your harness makes evals a ceremony, they will not run. If your harness makes evals a command you can type in thirty seconds and walk away from, they will run on every change.

I will not work in a harness that does not have eval infrastructure anymore. It is not a nice-to-have. It is how you avoid shipping regressions.

## Evals or vibes

The choice in this chapter is in the title. You can evaluate your agent with real data and real measurements, or you can evaluate it by watching a few sessions and going with your gut.

Gut is wrong often enough that it is not a strategy. It is hope.

Evals are the only thing that tells you the truth. Build them early. Run them often. Trust them more than you trust yourself.
