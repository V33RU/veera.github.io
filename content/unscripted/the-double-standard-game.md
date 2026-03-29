---
title: "Accountability Over Origin: The Industry's Quiet Dependency on AI"
date: "2026-03-29"
description: "The gap between what practitioners say about AI and what they actually do with it has never been wider. It is time to address that honestly."
tags: ["AI", "unscripted", "double standard", "tech", "honest take"]
---

## A Pattern Worth Naming

There is a recognizable profile emerging in the technology industry.

Publicly, these individuals write extensively about how AI undermines creative work. They participate in panel discussions warning against AI displacing human labor. They publish thoughtful essays arguing for human-first development practices.

Privately, the same individuals rely on AI-assisted IDEs for code generation, use large language models to draft the content they publish, and ship products where the majority of the codebase was AI-generated.

This is not a character judgment.

It is **the double standard game** - and it has become widespread enough to warrant an honest conversation.

---

## How We Got Here

The pace of AI adoption in software development has been genuinely disorienting.

In under two years, AI tooling moved from a research novelty to a foundational part of how most software gets built. That shift did not give practitioners enough time to form considered positions. So many defaulted to loud ones instead.

> "AI-generated content is trash."
> *- written in a post drafted with AI assistance, edited by the author, published with an AI-optimized headline.*

> "We need to protect human jobs."
> *- stated by someone whose team was reduced by half after AI absorbed the workload.*

The gap between stated positions and actual practice is significant. And it continues to widen.

---

## The Pattern in Practice

The behavior follows a consistent structure across the industry:

**Public-facing:** Anti-AI messaging. Emphasis on craft, human judgment, and authentic work. Brand positioning around "doing things the right way."

**Operational reality:** AI handles boilerplate, refactoring, first-pass feature development, asset generation, SEO, communications, and onboarding flows.

To be clear: there is nothing inherently wrong with using AI in a professional workflow. It is fast, capable, and appropriate for a wide range of tasks.

What is worth examining is the deliberate performance of *not* using it.

---

## Why the Disconnect Persists

Several factors sustain this pattern, none of them rooted in bad intent:

**1. Perceived devaluation of work.**
When clients or audiences associate AI with reduced effort, practitioners fear their work will be priced accordingly. Concealment feels like self-preservation. It is also, functionally, a form of misrepresentation.

**2. Identity under pressure.**
Many professionals spent years building an identity around craft - as a developer, writer, or designer. AI disrupts the foundation of that identity. Attacking it publicly while using it privately is a textbook response to cognitive dissonance.

**3. Reputational signaling.**
Expressing skepticism about AI reads as principled and thoughtful. It signals that you care about quality and ethics. Saying "I use AI extensively in my workflow" carries a social cost in certain communities, even when the work produced is excellent.

**4. Unresolved internal conflict.**
Some practitioners genuinely hold mixed views. They use AI, feel uncertain about it, and have not yet reconciled the tension. The misalignment between what they say and what they do reflects that unresolved state, not deliberate deception.

---

## Transparency About This Blog

In the interest of consistency: this site was built with AI assistance. Components, structure, and logic were developed in collaboration with AI tools. This post reflects my thinking and perspective; portions of the prose were shaped with AI involvement. The code running this platform had AI in the loop throughout.

That does not make the work less mine. I directed the process, made every significant decision, edited the output, and take full responsibility for what is published.

The tool I used was AI. I see no reason to suggest otherwise.

---

## The Question That Actually Matters

The "AI versus Human" framing is a distraction. The more substantive question is:

**What are you accountable for when you ship something?**

Using AI to write code you do not understand is a problem - not because AI generated it, but because you are responsible for output you cannot explain or maintain.

Using AI to produce content that is inaccurate or misleading is a problem. For the same reason.

Using AI to work faster, explore ideas beyond your immediate reach, and deliver better outcomes - while fully owning the result - is simply effective use of available tooling. That is what professional tools are for.

The standard should not be "did a human write every line?" It should be: **do you own what you put out?**

---

## Open Source and the Loudest Double Standard

This tension is most visible - and most ironic - in the open source community, where transparency is a founding principle.

A recent example illustrates it precisely. A file committed to a real open source project contained a single purpose:

> *"This file enforces the project's prohibition on AI-generated contributions."*

A dedicated file. Merged into a codebase that runs automated dependency bots, AI-assisted CI pipelines, and tooling built on the same underlying models. The prohibition exists at the contribution layer while AI operates freely at the infrastructure layer.

That is the double standard in its most literal, version-controlled form.

Across major open source communities, the pattern holds:

- Pull requests rejected under "no AI-generated code" policies
- README files badged as "100% human written"
- Contribution guidelines that explicitly prohibit AI assistance
- Community moderators removing members for AI-assisted responses

While the same maintainers:

- Use code completion tools for boilerplate and test generation
- Consult large language models when debugging complex issues
- Draft release notes and changelogs with AI assistance
- Operate CI pipelines built on AI-generated configuration

The "no AI" policy frequently functions as performative purity - a mechanism for signaling seriousness that has little to do with actual code quality and everything to do with community identity.

The substantive question - *is this contribution correct, tested, and maintainable?* - gets displaced by *did a human produce sufficient effort to generate it?*

That is not an open source value. It is gatekeeping dressed as principle.

Some of the most widely used open source tools in production today contain AI-generated code. It was reviewed, it passed, it works - because the standard applied was quality, not origin. Nobody flagged it. Nobody needed to.

Open source was built on the premise that **the best contribution wins, regardless of its source.**

Maintaining a private AI workflow while publicly prohibiting it is one of the more direct contradictions of that premise.

---

## The Line That Actually Matters: Supportive vs. Dependent

To be precise about where I stand: this is not an argument for uncritical AI adoption.

**AI should function as a support layer, not a dependency.**

The distinction is meaningful:

**Supportive use** means you understand the problem, you hold the solution, and AI accelerates your path to it. You could arrive there without it. It reduces friction. You own the output completely and can account for every decision within it.

**Dependent use** means the problem exceeds your understanding. You paste an error into a model, ship the response, and cannot explain what changed or why it works. If access to the tool disappears, so does your ability to function.

The first pattern develops sharper practitioners. The second creates fragile ones.

When open source projects move to ban AI, they are typically responding to the second pattern - unreviewed generations flooding issue trackers, hallucinated fixes submitted as PRs, contributors unable to defend their changes in review.

That is a legitimate concern. The solution, however, is not prohibiting the tool. It is raising the standard for what it means to understand and stand behind a contribution.

**Enforce comprehension. Not the method.**

If you can explain every line, defend every decision, and maintain what you shipped - the path you took to get there is your business. That is ownership. That is the appropriate bar.

If you cannot do that - whether the code came from AI or from memory - it is not ready to ship.

The goal was never "every character typed by a human." It has always been **working software produced by people who understand what they built.**

AI gets you there faster. It does not get you there for free.

---

## The Underlying Issue

The reason the double standard game is uncomfortable to observe is not the inconsistency itself. It is what the inconsistency reveals.

It means practitioners are actively concealing their most effective working tool.

Consider what that implies: a generation of professionals built something genuinely powerful, adopted it to produce better work, and then constructed a public posture around not having done so.

That is not a technology problem. It is a confidence problem.

There is no obligation to disclose AI usage in every piece of work. But there is a meaningful difference between discretion and building a professional brand on the active rejection of something you depend on to remain competitive.

---

## A Straightforward Conclusion

AI is part of how serious professionals work in 2026. That includes the authors of anti-AI essays, the maintainers of "human-only" repositories, and the panelists warning against AI's dangers.

Using AI does not make the work fraudulent. It does not signal an absence of skill. It does not diminish professional judgment or creative contribution.

It means you are applying effective leverage to build things that matter.

The double standard game consumes energy that could go toward the work itself.

Own the tools. Understand what you ship. Be accountable for the output.

That is the standard worth holding.
