# Permissions are architecture

## The agent that deleted the wrong thing

I had an agent with permission to run shell commands. Free rein. I trusted the prompt to keep it polite.

It did, for three weeks. Then it ran a cleanup script, decided that an old directory was unused, and removed it. The directory contained a year of work I had not backed up.

The model did nothing wrong. It read the task, reasoned about it, took an action consistent with the task. The task was ambiguous. The action was destructive. The harness let it happen.

I got the directory back from a ZFS snapshot, which I now thank every day. The point stands. The harness was the thing that should have stopped that command. It did not, because it was not designed to.

## The spectrum from read-only to autonomous

Every tool sits somewhere on a spectrum.

Read-only tools. The agent can learn things. It cannot change anything. File reads, database queries, web fetches. Safe to run without supervision.

Reversible writes. The agent can change things, but the changes can be undone easily. Writing to a scratch directory, editing a file that is under version control, creating a draft.

Irreversible writes. The agent can change things that cannot be easily undone. Sending an email, making a payment, deleting a file that is not under version control, publishing a post.

The spectrum is not optional. Every action the agent can take lives on it. The harness has to treat each region differently.

## Asking is a tool

The first instinct when building permissions is to make a list of allowed commands and a list of blocked commands. This works until it does not. The real world has too many edge cases.

The better pattern is to make "ask the user" one of the agent's tools. The agent can do anything on the read-only end of the spectrum. It can do most things on the reversible end. For the irreversible end, it has to call a tool called `confirm` and wait.

This puts the user in the loop exactly where they should be. Not on every step. Not never. On the steps that are hard to reverse.

My own rule now: any command that touches the filesystem outside a sandbox, any command that sends something to another human, any command that spends money. Those get a `confirm` call. Everything else runs.

## The sandbox is the harness's best friend

The easiest way to keep an agent from doing damage is to give it less to damage.

Run the agent in a directory it owns and nothing else. Run shell commands in a container that resets between sessions. Expose a database user with read-only permissions unless a specific task needs writes. Point the agent at a test account, not the production one.

A sandboxed agent that wants to destroy the world can only destroy the sandbox. That is a fine tradeoff.

The harness makes the sandbox. The agent lives in it. This is architecture, not caution.

## Least privilege is the default

Every permission the agent has is a permission it will eventually exercise at the wrong moment. Models do not hold back forever. Given enough runs, an agent will try every tool at every point in its allowed space.

This is actually fine. It is how they explore. The question is whether the allowed space contains anything dangerous.

Least privilege is the only workable answer. The agent gets the permissions it needs for the current task, not the full set. When the task changes, the permissions change. A session that is writing a cover letter does not need access to your email. A session that is scheduling meetings does not need access to your filesystem.

The harness enforces this by scoping permissions per task. The agent does not know what it cannot do. It only sees the tools that are safe for the job in front of it.

## Approval is expensive, automation is dangerous

There is a real tension between asking the user too much and asking too little.

Ask too much and the agent is useless. The user spends more time confirming than they would spend doing the task themselves. The agent becomes a form they are filling out.

Ask too little and the agent is scary. Every session is a dice roll. The user either trusts it and regrets it, or never trusts it and abandons it.

The harness's job is to pick the right threshold. My rule of thumb: anything that the user would want to know about if it failed, the agent should ask about before doing. Anything the user would not notice either way, the agent should just do.

The threshold is specific to your application. Getting it right is one of the most important design decisions you will make.

## Permissions are architecture

The first time an agent does something you did not want it to do, you will be tempted to patch the prompt. "Do not delete files unless explicitly told to." This does not work. Prompts are guidelines. The model drifts. The next session the prompt will be ignored because the task made it seem irrelevant.

Permissions are not prompts. Permissions are walls. The harness either lets the agent do something or does not. The model does not get a vote.

If something matters, put it in the architecture, not the prose.
