---
title: "The Double Standard Game: Opposing AI While Building Everything With It"
date: "2026-03-29"
description: "Everyone's got an opinion on AI. Most of them are built on AI. Let's talk about that."
tags: ["AI", "unscripted", "double standard", "tech", "honest take"]
---

## Let's be honest for a second.

There's a very specific type of person on the internet right now.

They write long threads about how AI is ruining creativity.
They speak on panels about the dangers of AI replacing human work.
They post LinkedIn essays titled "Why I Choose Human Over AI."

And then they go home and open Cursor, ask Claude to write their backend, use ChatGPT to draft that very essay, and ship a product where 80% of the code was generated.

I'm not calling them hypocrites.

I'm calling it **the double standard game** - and almost everyone is playing it.

---

## The Context

We're at a weird inflection point.

AI went from a research lab curiosity to the backbone of how most software gets built - in under two years. That's genuinely disorienting. People haven't had time to form clean opinions. So they form *loud* ones instead.

"AI-generated content is trash."
*- posted from a blog drafted with AI, edited by a human, published with an AI-suggested headline.*

"We need to protect human jobs."
*- said by someone who cut their team in half because AI handled the rest.*

The gap between what people say about AI and what they actually do with it is massive. And it keeps growing.

---

## The Specific Double Standard I Keep Seeing

Here's the pattern in tech:

**Front-facing:** Anti-AI messaging. Emphasize craft. Talk about the human touch. Build a brand around "we do it the right way."

**Back-end reality:** Claude writes the boilerplate. Cursor handles refactors. GPT-4 does the first pass on every new feature. Midjourney for assets. AI for SEO. AI for emails. AI for onboarding flows.

And here's the thing - **there's nothing wrong with using AI to build things.** I do it. It's fast. It works. It's the right tool.

What's weird is the *performance* of not doing it.

Why the act?

---

## Why People Play This Game

A few reasons, none of them evil:

**1. Fear of devaluation.**
If clients or followers think the work was "just AI," they might not pay the same price. So you hide it. Understandable. Still a lie.

**2. Identity protection.**
A lot of people built their identity around being a craftsman, a writer, a coder. AI challenges that identity. So they attack AI publicly while quietly using it privately to stay competitive. Classic cognitive dissonance.

**3. Social signaling.**
Being skeptical of AI sounds thoughtful. It sounds like you have principles. It sounds like you care about ethics. It's a clean position to hold in public. The alternative - saying "yeah, I use AI for basically everything" - sounds lazy, even when it isn't.

**4. Genuine complexity.**
Some people actually do have mixed feelings. They use AI, feel weird about it, and haven't resolved that tension yet. The public stance and private behavior don't match because the internal conflict hasn't been resolved.

---

## What This Blog Is Built On

I'm not going to pretend.

This site? Built with AI assistance. Components, structure, logic - a lot of it went through Claude. This post? I wrote the thoughts. The sentences? Some were shaped with AI help. The code running this? Definitely had AI in the loop.

Does that make it less mine? I don't think so. I directed it. I edited it. I decided what stayed and what went. The ideas are mine. The intent is mine.

But the *tool* I used was AI. And I'm not going to perform otherwise.

---

## The Real Conversation We Should Be Having

Instead of "AI vs. Human" - which is a fake war - the real question is:

**What are you responsible for when you ship something?**

If you use AI to write code and don't understand it, that's a problem. Not because AI wrote it - because *you're responsible for it* and you don't understand what you shipped.

If you use AI to write content and it's dishonest or wrong, that's a problem. Same reason.

If you use AI to build faster, ship cleaner, explore ideas you'd have never reached alone - and you *own* the output - that's just leverage. That's what tools are for.

The standard shouldn't be "did a human make every line?" The standard should be **"do you own what you put out?"**

---

## Open Source Is the Loudest Player in This Game

This one stings a little because open source is supposed to be about transparency.

I recently saw a file in a real open source project. One line. It said:

> *"This file enforces the project's prohibition on AI-generated contributions."*

A whole file. Dedicated to banning AI. In a codebase that uses automated tooling, dependency bots, and AI-assisted CI pipelines underneath.

That's the double standard in its most literal form - written, committed, and merged into the repo.

Walk into any major open source community right now and you'll find:

- Maintainers who gate-keep PRs with "no AI-generated code" policies
- READMEs that proudly say "100% human written"
- Contribution guides that explicitly ban AI assistance
- Discord mods removing people for "using AI to answer questions"

Meanwhile, the *same* maintainers are:

- Using GitHub Copilot to write test boilerplate
- Asking Claude to help debug a gnarly issue at 2am
- Using AI to draft the release notes and changelogs
- Running CI pipelines built with AI-generated YAML configs

The "no AI" policy is often performative purity. A way to signal seriousness. A gatekeeping mechanism that has nothing to do with code quality and everything to do with community identity.

The actual question - **is the contribution correct, tested, and maintained?** - gets replaced with **"did a human suffer to write it?"**

That's not open source values. That's hazing.

And the real irony? Some of the most celebrated open source tools right now - the ones with thousands of stars, the ones everyone uses - have AI-generated code quietly sitting inside them. Nobody checked. Nobody knew. The contribution landed because it was *good*, not because of how it was made.

Open source was built on the idea that **the best idea wins, regardless of who it comes from.**

Quietly using AI while publicly banning it is the most anti-open-source move possible.

---

## The Actual Line That Matters: Supportive vs. Dependent

Here's where I want to be clear about my own position - because this isn't a "use AI for everything, no questions asked" take.

**AI should be supportive. Not a dependency.**

There's a real difference:

**Supportive AI** - you understand the problem, you have the solution in your head, and AI helps you get there faster. You could do it without it. It just removes friction. You own the output completely.

**Dependent AI** - you don't understand the problem. You paste an error into ChatGPT, copy the answer, and ship it. You can't explain what changed or why it works. If AI goes down, you're stuck.

The first one makes you sharper. The second one makes you fragile.

When an open source project bans AI, they're often reacting to the *second* pattern - contributors pasting AI slop without understanding it, flooding issue trackers with hallucinated fixes, submitting PRs they can't defend in review.

That's a real problem. But the solution isn't banning the tool. It's raising the standard for what "understanding your contribution" means.

**Enforce comprehension. Not the method.**

If you can explain every line, defend every decision, and maintain what you shipped - it doesn't matter how you got there. That's ownership. That's the bar.

If you can't do that - whether you wrote it yourself or copied it from AI - it's not ready.

The goal was never "humans typed every character." The goal was always **working software, built by people who understand it.**

AI gets you there faster. It doesn't get you there for free.

---

## The Uncomfortable Mirror

Here's the real reason the double standard game is uncomfortable to watch:

It means people are ashamed of the most useful tool they have.

Think about that. We built something genuinely powerful, started using it to do better work, and then developed a *social performance* around pretending we don't.

That's not a technology problem. That's a confidence problem.

You don't have to announce AI on every post. But you also don't have to build a brand on opposing something you rely on to stay relevant.

---

## Just say it.

You use AI. So do I. So does almost everyone in tech right now.

It doesn't make the work fake. It doesn't make you a fraud. It doesn't mean you have no skill.

It means you're using the most powerful leverage available in 2026 to build things that matter to you.

The double standard game is exhausting. And it's unnecessary.

Drop the act. Own the tools. Be responsible for what you ship.

That's it.
