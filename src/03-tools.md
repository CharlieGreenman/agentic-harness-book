# Tools are a UI

## The tool nobody could use

I had a tool called `search` that took seven parameters. Query, filter, limit, sort, cursor, include_metadata, namespace. I wrote it. I thought it was flexible and clean.

The agent used it correctly about 40 percent of the time. The other 60 percent, it would leave parameters off and get empty results, or pass the filter in the wrong shape, or set limit to 1 when it clearly wanted more. I spent two weeks blaming the model.

Then I deleted four of the parameters and renamed one. Success rate jumped to 85 percent overnight. Same model. Same task. The tool had been the problem the whole time.

This is when I stopped thinking of tools as functions and started thinking of them as a UI.

## The model is your user

The model reads your tool definitions the way a user reads a form. The name of the tool is the label. The description is the helper text. The parameters are the fields. If the form is confusing, the user fills it out wrong. The model is no different.

A tool called `search` with seven parameters is a form with seven fields where most of them are optional and none of them are obviously required. A tool called `find_documents` that takes a single `query` string is a form with one field and a clear ask. Guess which one gets filled out correctly more often.

Every parameter you add to a tool is a decision you are asking the model to make. Every decision is an opportunity to get it wrong.

## Error messages are instructions

When a tool fails, the error message is the next thing the model reads. That message is training data for the model's next attempt.

I used to return errors like `"invalid input"`. The agent would shrug and try the same thing slightly differently. Usually it would fail again.

I changed the error to `"filter must be a JSON object, not a string. Example: {\"status\": \"open\"}"`. The agent started recovering on the first retry, ninety-plus percent of the time.

The error is where the model learns. If you leave the error vague, the model stays confused. If you make the error do the teaching, the model adapts.

## The three tools I kept merging

I had three tools: `list_files`, `read_file`, `search_files`. Separate endpoints. Separate parameters. The agent was constantly calling the wrong one. `list` when it should have searched. `read` on a path it had not listed.

I merged them into one tool called `files` with a `mode` parameter. List, read, search. The agent picked the mode correctly because the mode was labeled and all three lived in one place.

This is not a general rule. Sometimes three tools is the right answer. The general point is that the shape of your tool surface is a choice, and that choice is shaping the model's behavior more than most people realize.

## Naming matters more than I thought

`execute_query` vs `run_sql`. Same thing, different word. Different success rate.

`get_user` vs `fetch_user` vs `load_user`. Not interchangeable to the model. The model has seen a million code samples and has strong priors about what each of those verbs does.

When in doubt, I check what the open-source world calls the operation. If half of GitHub calls it `fetch`, calling it `get` is fighting a current.

This feels dumb to care about. It is not. The model's priors about common verbs are strong, and using the expected name is free. Using the wrong name is a tax you pay on every call.

## What a good tool looks like

A short checklist I run through now before I ship a tool.

Does the name describe the outcome, not the implementation. `send_email`, not `smtp_relay`.

Are required parameters actually required. If two of your four parameters have defaults, maybe the tool is trying to do two things.

Does the description tell the model when to use it, not just what it does. "Use this when you need X. Do not use it when you need Y."

Is the error actionable. Can the model fix the problem from reading the error alone.

Does the output have a predictable shape. The model tolerates inconsistency badly. A tool that sometimes returns a list and sometimes returns a single object will trip the model up on every other call.

## The harness decides the UI

The tools you expose are the agent's world. If the harness gives the agent ten well-designed tools, the agent looks smart. If the harness gives the agent fifty half-designed tools, the agent looks dumb.

Same model. Same task. The harness is what made the difference.

Tools are a UI. Design them like one.
