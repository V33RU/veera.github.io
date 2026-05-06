---
title: "Drone Security: Exploring With Expo, Day 1 Learning"
date: "2026-04-17"
description: "Day 1 at the BIEC drone expo. Honest notes on what the Indian drone market actually looks like in 2026, what is genuinely advanced, and what is just plastic wrapped around the same four components everyone else is using."
tags: ["drone", "UAV", "drone security", "hardware", "expo", "BIEC", "agriculture drone", "jamming", "defence"]
---

*Before I start, a bias disclosure. I walked into this expo thinking drones are another overhyped category. I walked out mostly still thinking that, with a few exceptions that genuinely surprised me. This is Day 1. I will post the rest of what I saw in follow-up parts.*

### <span style="color: orange;">Why I Went in the First Place</span>

I keep hearing the same three things in every drone conversation for the last two years.

"Drones are the future."

"India is the next drone manufacturing hub."

"There is so much innovation happening right now."

So I went to BIEC to see it. Expos are the fastest way to compress a year of market research into one afternoon. You walk the floor, you talk to the guy at the table, you ask the same question at ten stalls, and by the end you have a map of what is real and what is a pitch deck.

Here is the map after Day 1.

### <span style="color: orange;">The Honest Take on Most of the Drones</span>

I looked at a lot of airframes today. Quad, hexa, octa, fixed wing, tethered, VTOL. Big ones, small ones, ones with payload arms, ones with spray tanks, ones with thermal cameras bolted on.

And after the fourth or fifth stall, a pattern becomes obvious.

Most drones on display are not really technology products. They are mechanical assemblies with a flight controller inside. The flight controller is usually Pixhawk, Cube Orange, or a rebadged variant of the same thing. The ESCs are off-the-shelf. The motors are T-Motor, SunnySky, or a Chinese clone of one of those. The props are from two or three manufacturers globally. The radio is either a generic 2.4 GHz module or an SDR-based link someone licensed.

What changes between vendors is the frame design, the paint, the marketing story, and which use case they are targeting.

That is not a criticism. That is just what the market looks like in 2026. Most of the "drone companies" in India are integrators, not hardware designers. They buy the parts, assemble the frame, write some mission software on top of ArduPilot or PX4, and sell a solution. Which is a valid business. It is just not the deep-tech story the press releases suggest.

### <span style="color: orange;">Where the Real Competition Is Missing</span>

Two categories had almost no real competition on the floor.

**Payload and weight lifting.** Heavy-lift drones, the ones that can carry 15 to 50 kg, are a tiny segment. Most Indian vendors stop at 5 to 10 kg payload because beyond that you need better motors, better batteries, better structural design, and a DGCA category you actually have to earn. The few vendors who do heavy lift are the ones worth talking to. Everyone else is in the same sub-10 kg bracket competing on price.

**Flight time and coverage.** Battery chemistry has not moved much. Most drones on the floor were doing 25 to 45 minutes of endurance on LiPo. A couple of vendors had hybrid petrol-electric setups claiming 2 to 6 hours, but those are still early. Nobody had a solid story on hydrogen. Nobody had a credible story on long-range operation beyond line of sight with anything close to consumer pricing.

That said, I did see a handful of platforms quoting 50 to 80 km operational range. Mostly fixed-wing and VTOL hybrids, mostly defence-oriented, mostly requiring a ground station with a proper directional antenna. Those are interesting numbers on paper. I want to see the actual link budget and the handover behaviour at range before I take the claim at face value, but the fact that a few Indian vendors are now quoting those numbers is new. Two years ago this segment was almost entirely foreign imports.

If you wanted to enter this market with a real product, those are the two gaps. Lift and endurance. Everything else is crowded.

### <span style="color: orange;">The Drones That Actually Impressed Me</span>

There were a few products on the floor that were genuinely advanced. I am not going to name them, and I am not going to describe them in detail, because the people showing them were candid about what they do and I am not going to turn that candor into a public writeup.

What I will say is this. In every crowded market, there is a thin layer of vendors doing work that is three to five years ahead of everyone else. You only find them by walking the floor and asking the right questions. You do not find them in search results, because the ones doing the real work are not running ad campaigns.

This is the actual reason to attend expos. Not the headline vendors. The quiet ones.

### <span style="color: orange;">What I Actually Catalogued on Day 1</span>

Here is a breakdown of the categories I saw on the floor today, in rough order of how common they were.

**1. Agriculture drones.** By far the largest segment. Spray drones, mapping drones, NDVI imaging drones, seed-sowing drones. Most were 10 to 16 litre spray tank variants running on a standard quad or hexa frame with a pump and nozzle assembly. The flight software was mostly ArduPilot with a mission planner tweak. The differentiation between vendors was mostly in the tank design, nozzle quality, and service network. The underlying flight platform was interchangeable.

**2. Defence and anti-drone / jamming systems.** Counter-drone is a growing category in India, and the expo reflected that. Several vendors were showing RF jammers, GNSS spoofing systems, and directional RF guns for drone neutralisation. A few had integrated radar plus RF detection plus optical tracking in one stack. These are serious products, and the procurement path is mostly government. Pricing was not public at any of those stalls. You get a quote if you are the right buyer.

On the offensive side of the same category, I also saw kamikaze loitering munitions and drone-mounted grenade launchers on display. The loitering munition was a fixed-wing style platform with a warhead section and a terminal-dive mission profile. The grenade launcher setup was a release mechanism bolted onto a multirotor, with a ground-side arming sequence and a drop trigger through the mission software. Both are a reminder that the line between "commercial drone" and "weapon system" is a firmware build and a payload bracket, which is exactly why the supply chain and software integrity questions I kept asking at other stalls actually matter.

**3. Wireless transmission and data link vendors.** A separate category of stalls was not showing drones at all, just the communication stack. Long-range video links, mesh radio systems, encrypted command-and-control channels, and SDR-based links in the 900 MHz, 1.3 GHz, 2.4 GHz, and 5.8 GHz bands. This is the layer that actually matters for anything beyond line of sight, and it is where a lot of the real engineering differentiation sits. Most drone vendors do not make their own data link. They integrate one of these.

**4. Component vendors.** Motors, ESCs, props, batteries, flight controllers, gimbals, payload mounts. A large share of the floor. This is where you see who the actual ecosystem is. Many of these are distributors for Chinese component brands, a few are starting to manufacture locally, and one or two are doing real R&D on motor winding and driver electronics.

**5. Software and ground station vendors.** Mission planning software, fleet management dashboards, live video analytics, AI-based object detection layered on top of the drone feed. Most of this is a web UI or a mobile app that talks MAVLink. The hard part, and where most of the vendors looked weak, was the cybersecurity posture of the ground station itself. I did not see a single stall promoting hardened comms, signed firmware, or a threat model for the ground software. Which is consistent with where IoT security was ten years ago, and which is exactly why this space is about to have the same kind of incidents that cameras went through.

**6. Kid-level R&D and student projects.** One of my favourite moments today. A very young person, looked like school or early college, was showing a motor and ESC experiment he had built himself. It was not a polished product. It was a clearly hand-wound motor, a driver board he had put together, and a writeup of the tests he had run. It was also the most intellectually honest stall I visited. He knew exactly what worked, what did not, and what he wanted to try next. If I had to bet on who in the hall would be doing something genuinely novel in five years, it would be him, not the vendors with the biggest banners.

### <span style="color: orange;">The China Chip Line, and Why I Am Not Sure It Means Much</span>

One phrase I heard at multiple stalls, almost word for word, was "we do not use any China chips, ours are from Taiwan." It was said the way a hotel says "complimentary breakfast." As if that single sentence closed the entire supply chain conversation.

It does not.

I am not going to argue the geopolitics here. Taiwan is broadly considered a more trusted semiconductor origin than mainland China for obvious reasons, and in the public record there have been far fewer documented backdoor or implant allegations against Taiwan-origin silicon than against some mainland vendors. That part is fair.

But "Taiwan chips" is not a security posture. It is a sourcing statement. A few things the line does not actually answer.

Which specific part from which specific fab. Taiwan fabs also produce silicon for mainland-headquartered fabless companies, and the origin of the die and the origin of the brand on the package are not always the same thing.

What is the firmware running on that chip. A trusted-origin SoC with an untrusted bootloader and an unsigned update channel is not more secure than a mainland SoC with a well-hardened software stack. The chip is the substrate. The firmware is the attack surface.

Does the vendor have a hardware bill of materials they are willing to share. None of the stalls I asked were willing to produce one. "Taiwan" was the answer, and the answer stopped there.

What is the update model. If the chip is from Taiwan but the firmware image is pulled from a GitHub mirror nobody verifies, the origin of the silicon is the least of your problems.

I walked into today honestly confused, and I walked out still confused. Not about whether Taiwan is the better sourcing choice. It usually is. But about whether a sentence at an expo stall tells you anything real about the security of a product. It does not. It tells you what the vendor has decided is the answer that closes the conversation.

The actual answer is a signed firmware chain, a documented SBOM, a disclosed update cadence, and a third party willing to verify any of it. None of the stalls I visited today had any of those. Most had the Taiwan line.

### <span style="color: orange;">The Security Angle Nobody Is Talking About</span>

I came at this from the security side, because that is my bias, and the security picture on the floor was about what I expected.

Almost none of the drones on display had a real answer to any of these questions.

What is your firmware update mechanism and is it signed.

What does the C2 link look like when the operator loses radio.

What happens if someone spoofs GNSS at your drone in flight.

What telemetry is logged and where is it stored and who has access.

If the data link is captured on the wire, how much of the mission is recoverable.

What is your model for supply-chain trust on the components you did not design yourself.

I asked versions of these questions at several stalls. The answers ranged from "we use AES" (said with confidence, followed by silence when asked where the keys come from) to "that is a good question, we do not think about it yet."

This is not a drone industry problem. This is an IoT industry problem that has now shown up with rotors on it. The exact same pattern that created a decade of unpatched cameras is being replayed, in real time, in the drone market. Consumer-priced hardware, integrator-assembled, flight software pulled from open source, data link chosen on price, security deferred because it is not a differentiator at the point of sale.

It will be a differentiator the first time a hostile actor does something visible with a compromised fleet. Which is a when, not an if.

### <span style="color: orange;">What I Am Looking At On Day 2</span>

A few specific things I want to cover tomorrow.

The heavy-lift vendors. I want to understand what airframe choices they made, what motor specs they ran, and how they handled structural stiffness at higher mass.

The counter-drone stacks. I want to ask about detection ranges, false positive rates, and how they distinguish a hobby drone from a weaponised one.

The communication-only vendors. I want to understand the crypto, the frequency plans, and what their threat model actually is.

The student and hobbyist stalls. The motor kid was the best signal on the floor today, and I want to find more people in that category.

I will write Day 2 up the same way I wrote Day 1. No vendor names on the things that are actually interesting. No hype on the things that are not. Just an honest map of what the drone market in India looks like when you walk the floor in 2026.

### <span style="color: orange;">If You Actually Want to Build a Business in This Space</span>

A few honest notes for anyone walking a floor like this thinking about entering the market.

**Do not try to build a full drone as your first move.** The airframe plus flight controller plus payload plus ground software stack is a four-headed problem, and there are already a hundred vendors in India doing exactly that, most of them converging on the same component list. You will be the hundred-and-first in a crowded pricing race. The margins are thin, the differentiation is cosmetic, and the sales cycle is long.

**Build a supporting product you can actually patent.** A better motor winding. A safer battery management board. A specific payload release mechanism. A jam-resistant data link module. A gimbal with a genuinely original damping design. Something narrow, something defensible, something a buyer cannot casually source from AliExpress. If you can get a patent on it, and the patent is real and enforceable, you have a moat. Most of the full-drone vendors on the floor do not have a moat. They have a frame and a BOM.

**Component sales are easier than full systems.** If you have a working ESC, a working flight controller, a working long-range radio, a working spray nozzle, you can sell to every integrator in the market instead of competing with them. The volume is higher, the support burden is lower per unit, and you are not locked into one vertical. This is the quiet way to be profitable in a hardware market. Sell the shovels, not the mining claim.

**Service the service companies.** A lot of drone-using businesses in India, agriculture co-ops, survey firms, infrastructure inspection outfits, do not want to own the aircraft. They want the output. Someone has to fly, maintain, repair, train, and respond for them. Not everyone can do that well, which is exactly why it is a business. Recurring revenue, lower capex, and a customer relationship that does not end at the sale. If you have the operational discipline, this is one of the less crowded lanes on the floor.

**Revolution is not easy, but it is not impossible here either.** Bringing a real shift in any hardware domain is not a weekend project. It takes patient capital, deep engineering, and usually a few failed products before the one that works. India makes this harder because the ecosystem for deep-tech hardware is still thin. It also makes it possible, because the ecosystem is thin. If you build something genuinely unique, you are not fighting ten equivalents, you are alone in that lane for a while. And if you already have something unique, the work is to keep it unique. That means keep iterating, keep filing, keep guarding, and do not show the interesting parts at the expo booth. The people who are actually ahead know this. It is why the most advanced products I saw today were also the least publicly described.

### <span style="color: orange;">Closing Thought for Day 1</span>

Most of what is called the "drone revolution" is a re-skinning exercise on a mature parts catalogue. That is fine. That is how most hardware markets grow.

The real opportunity, and the real risk, is in the layers most of the floor is not paying attention to. Lift. Endurance. Secure data links. Firmware integrity. Supply-chain trust. Counter-drone. The thin layer of vendors actually doing work in those areas is where the next five years of this industry will be written.

Everything else is paint on the same frame.

That is all from me for now. I have only just started exploring this space, and the more I pull on the threads, the more interesting the knots are getting. Expect more posts soon, and the next few will be a lot more interesting than this one.

More tomorrow.

---

*This is Day 1 of the drone expo writeup series from BIEC.*
*Day 2 coming next. Later parts will cover specific technical deep-dives on data link security, firmware posture, and the counter-drone stack landscape.*
