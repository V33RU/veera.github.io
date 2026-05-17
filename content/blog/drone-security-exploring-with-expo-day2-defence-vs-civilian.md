---
title: "Drone Expo Day 2: Where Drones Actually Matter (and Where They Are Just YouTube Props)"
date: "2026-04-25"
description: "Day 2 notes from the BIEC drone expo. Defence is the one place drones have genuinely changed the math. Surveillance, missile delivery, kamikaze loitering munitions, drone-on-drone war. For civilians, most of it is still marketing. The gap between the two is the real story."
tags: ["drones", "defence", "surveillance", "kamikaze", "counter-drone", "expo", "day 2"]
---

*Day 2 at BIEC. I went back with different questions. Day 1 was about cataloguing what is on the floor. Day 2 was about asking who actually gets value out of any of it. The honest answer surprised me, and it has nothing to do with the stalls selling $2000 hexacopters to YouTubers.*

*Part 1 of this series: [Drone Expo Day 1: Honest Take](/blog/drone-security-exploring-with-expo-day1-learning).*

---

### <span class="accent-orange">The One Domain Where Drones Actually Changed The Math</span>

Defence. Not "drones for cinematic shots". Not "drones for delivery of $15 sandwiches". Defence.

I said on day 1 that most drones are overhyped. That take stands for the consumer side. It collapses the moment you walk into the defence pavilion. What I saw there is a different technology used by different people for different reasons, and the reasons are load-bearing.

The single sentence version: drones mean you do not have to put a human where the bullet is going to land. That is the entire value proposition. Everything else, the cameras, the autonomy, the payloads, the networking, is infrastructure in service of that one fact.

Consumer drones are a toy version of defence drones whose hardware happened to get cheap enough for civilians to buy. Defence drones are the original application. We are living in the era where the price of that original application fell by three orders of magnitude in fifteen years.

---

### <span class="accent-orange">Surveillance Drones: The Unglamorous Workhorse</span>

Most of what defence actually does with drones is watch. Not strike. Watch.

What I saw on the floor:

- ISR (intelligence, surveillance, reconnaissance) drones that loiter at 15,000 to 30,000 feet for 18 to 30 hours per sortie.
- EO/IR (electro-optical / infrared) gimballed cameras with 30x to 50x zoom, stabilized to arc-second precision.
- SAR (synthetic aperture radar) pods that see through cloud cover and foliage.
- SIGINT payloads that passively map the RF spectrum of an area.
- Multi-drone swarm teams where one drone handles high-altitude wide-area scan and smaller drones drop to specific targets for high-resolution confirmation.

The numbers that matter for surveillance:

- Persistence. A soldier on a watch rotation is productive for maybe 2 hours before attention degrades. A drone is productive for the full sortie. On a 24-hour watch you need 12 human rotations. You need one drone.
- Coverage. A single Heron-class UAV at altitude covers roughly 40,000 square kilometres of ground with one gimbal. That is approximately Kerala's area, watched by one airframe and one operator.
- Exposure. A human recon team at 300 meters from an objective has a 30-minute survival envelope in a contested environment. A drone at 5000 meters has an indefinite one.

The defence exhibitor I spent most time with was showing a 12 kg tactical ISR drone with a claimed 8-hour endurance and a 60 km operational radius. Price point that I cannot quote exactly, but it lands in the range where a reasonably-sized battalion can operate them as disposable assets. That word, disposable, is the key. Humans are not disposable. Drones are.

---

### <span class="accent-orange">Precision Strike: The Part Nobody Wants To Talk About Publicly</span>

Missile-launching drones and weaponised UAVs were on the floor. Not everyone had signs over them saying so. You could tell.

What the hardware actually does:

- Carries 1 to 4 munitions on hard points, typically laser-guided 10 to 25 kg class.
- Loiters within a designated area, fed target coordinates via encrypted datalink.
- On target-of-opportunity, operator confirms, drone launches, laser designator paints, munition tracks.
- Time from "we have eyes on target" to "target is destroyed" is measured in single-digit minutes.

The accuracy number that matters: circular error probable (CEP) of modern laser-guided munitions from a drone platform is 1 to 3 meters in training conditions. A WWII-era artillery strike had a CEP of hundreds of meters. A 1960s-era airstrike, tens of meters. A 1990s cruise missile, single-digit meters but at $1.5M per round. A 2020s drone-launched laser-guided munition, 1 meter at $30K to $100K per round.

This is not a small change. This is the biggest change in the economics of precision violence since the development of the rifled barrel. And it changes who can afford to do it. Nation-state budgets bought 1990s cruise missiles. Battalion-level budgets buy 2020s drone munitions.

The market consequence: every country now has or is developing a domestic drone-strike capability. You do not need a carrier group. You need a truck, a trailer, a control tent, and a team of six.

---

### <span class="accent-orange">Kamikaze Loitering Munitions: The New Category</span>

This is the one that has actually changed warfare since 2022. Loitering munitions, also called kamikaze drones, are a hybrid of a cruise missile and an ISR drone. They are cheap, they fly for an hour, they carry a warhead, and at the end of their mission they fly into the target.

The economics:

- $400 to $50,000 per unit depending on class.
- 3 kg to 50 kg warhead.
- 10 km to 1000 km range.
- Minutes to hours of loiter time.
- Not recoverable. Not meant to be.

The most discussed unit in the West is Shahed/Geran class. The most discussed in Ukraine is the Lancet and the various FPV-racing-drone-plus-RPG-warhead hybrids. At the expo I saw two Indian variants, both in the 5 to 15 kg class, both clearly intended for either reconnaissance-and-strike or pure anti-armor roles.

What makes this category different from a cruise missile: the operator can loiter, observe, reclassify the target, abort, reassign. A cruise missile is launched and committed. A loitering munition is a patient hunter. If the target moves, it follows. If the target disappears, it waits.

What makes it different from a reusable strike drone: cost. A $3000 loitering munition taking out a $3M armored vehicle is an exchange ratio that rewrites the procurement spreadsheets of every military on earth. The side that has more $3000 munitions wins the attrition war against the side that has more $3M vehicles.

This is why Turkey, Israel, China, Iran, Russia, Ukraine, USA, and increasingly India are all building their own. It is not a luxury. It is the new baseline capability.

---

### <span class="accent-orange">Drone-On-Drone War: The Second-Order Effect</span>

When both sides have drones, the battlefield becomes a drone-vs-drone problem. This is what I saw the most interesting products solving. Not attack drones. Counter-drones.

Four main approaches, all on the floor:

**Kinetic counter-drone.** Small interceptor drones launched on demand that physically ram incoming drones. Effective, expensive per shot, scales poorly against swarms.

**Net-based capture.** A drone fires a net at an enemy drone, entangles rotors, brings it down. Useful for recovering intact enemy hardware for intelligence. Slow, range-limited, works on slow targets.

**Directed energy.** Laser and high-power microwave systems. The laser burns the incoming drone's airframe or optics. The microwave fries its electronics at range. Very expensive capital cost, near-zero per-shot cost, limited engagement window.

**RF/GNSS jamming and spoofing.** The cheap approach. Jam the control link, spoof the GPS. Drone either crashes, returns to base, or flies into a false "home". This scales, it is relatively cheap, and it is what most deployed counter-drone systems in 2026 actually do.

What makes RF-based counter-drone interesting from a security perspective: it is software-defined. The same equipment that detects and jams a DJI Mavic can, with a firmware update, handle a new swarm protocol. The arms race between drone hardeners and drone jammers is now a software arms race. Firmware update cadence matters more than hardware capability.

I spent 40 minutes with one vendor whose counter-drone system uses passive RF detection (listen for the drone's own control link), triangulate, then selectively jam. They claim 800-meter detection range for off-the-shelf consumer drones and 4-kilometer range for military-class links with higher transmit power. They were cagey about how they handle frequency-hopping drones. I suspect the answer is "we use a priori knowledge of the hopping patterns", which is brittle against anything new.

---

### <span class="accent-orange">The Accuracy Gap Is The Whole Story</span>

The number that keeps coming up when I compare drone warfare to its predecessors is accuracy, and it deserves its own section because it is the root cause of everything else.

Unguided bomb from WWII, dropped from 20,000 feet: CEP ~1000 meters. You would drop 100 bombs to guarantee a hit on a building.

Guided munition from 1991 Gulf War: CEP ~10 meters. You would drop 2 to 3 bombs per target.

Drone-delivered laser-guided munition in 2024: CEP ~1 meter. You drop 1 munition per target. If the target is a vehicle, you hit the vehicle.

This progression is the reason why modern conflicts use roughly 1/100th the munition volume of Cold War scenarios for equivalent target effect. It is also the reason civilian casualties per engagement are lower on average, though this is dependent on target selection, not weapon accuracy. A perfect weapon aimed at the wrong target is still a civilian casualty.

The economics of accuracy: each increment of precision reduces the number of shots, which reduces the cost per successful engagement, which enables more engagements per budget dollar, which increases operational tempo. The side that has the more accurate weapons fights more engagements per week. Attrition favors them.

Drones compressed this curve dramatically. The "who can afford precision" question was answered by cruise missile economics in the 1990s: superpowers only. It was answered by drone economics in the 2020s: anyone with a $100K budget per engagement instead of $10M.

---

### <span class="accent-orange">The Civilian Side Is Honestly Just YouTubers And Hobbyists</span>

I said this on day 1. After day 2, I am more confident in saying it.

The civilian use cases I keep hearing pitched:

- Delivery drones. Almost no scaled commercial deployment in 2026. Regulatory moat, last-mile economics do not work, insurance is nightmare.
- Agricultural spraying. Real, deployed, useful. But scoped: medium farms in specific crops (mainly rice paddy in Asia, vineyards in Europe). Not a mass market.
- Photography and cinematography. Real, but the users are YouTubers, wedding videographers, real estate agents. Hobby-scale.
- Inspection. Real, niche, done by specialist teams, not the general public.
- Search and rescue. Real, excellent use case, but the total number of SAR drones in India is in the low four digits. Not a market.
- Surveying and mapping. Real, done by professionals with specific drones, also niche.

The combined addressable market of all civilian use cases is smaller than one defence contract for a single ISR fleet. This is a reality that the civilian-drone marketing does not want to admit. The money is in defence. Everything else is either a YouTuber's hobby or a corner case.

If you are a civilian buying a drone to "fly around the neighborhood", you are buying a toy. That is fine. Toys are good. But do not let anyone convince you that civilian drone tech is the next iPhone. It is not. It is closer to the next recreational remote-control airplane market, which was a niche since the 1970s and remains a niche.

The serious drone industry is defence, and everything adjacent to defence (counter-drone, ISR, training systems, C2 software, datalink encryption, precision munitions). That is where the engineering depth is. That is where the multi-billion dollar contracts are. That is where the nation-state actors are actively investing.

---

### <span class="accent-orange">What Saves Soldier Lives Actually Saves Soldier Lives</span>

The framing that keeps coming up in defence conversations at the expo: "before drones, we sent a squad to find out what was behind that ridge. Now we send a drone. Both options tell us what is behind the ridge. Only one option has funerals attached."

This is not a marketing line. The operational reality:

- Reconnaissance missions that used to have human casualty risk are now drone missions with zero risk.
- Close air support missions that used to put pilots at risk are now remote-pilot missions.
- EOD (bomb disposal) that used to kill operators regularly now uses drones for approach and assessment.
- Forward observer roles that historically had extremely high casualty rates are replaced by ISR drones.

The net effect on soldier casualties in modernized militaries is measurable. The Israeli operational data from 2014, 2021, 2024 campaigns shows drone-supported operations with roughly 1/3 the casualty rate of non-drone-supported equivalent missions. The US data on drone-supported SOF operations in the 2010s showed similar ratios.

This is the single strongest argument for every military on earth to invest in drones. The argument is not "drones are cool". The argument is "our soldiers come home". Every political system responds to that argument, regardless of ideology.

A consequence people do not talk about much: this also makes war politically easier to wage. A government whose soldiers do not die faces less domestic pressure to end a conflict. The policy implication is uncomfortable. It is also real. I am not taking a position on it. I am noting it.

---

### <span class="accent-orange">The Technical Depth Under Defence Drones</span>

The civilian stalls mostly showed marketing brochures. The defence stalls showed actual engineering. Some of the depth I saw:

**Datalink.** Military drone datalinks use frequency-hopping spread spectrum with 100+ hops/second, forward error correction that handles 30% packet loss, AES-256 encryption at minimum, and are often fully mesh-networked across multiple airframes. Consumer DJI OcuSync is a toy compared to this.

**Autonomy.** Defence drones can execute "return to base, land, refuel, relaunch" autonomously, handle waypoint-based routes with dynamic re-planning around threats, and coordinate in swarms with leader election and graceful degradation. The state of the art is 40+ drones operating as a coordinated attack swarm without continuous operator input.

**Targeting.** Laser designation, GPS waypoint, imaging-based target-recognition, beacon-based target-acquisition, and in some cases neural network visual target classification running on an onboard accelerator. Latency from "confirm target" to "weapon release" is under 2 seconds on modern systems.

**C2 (command and control).** Defence drone C2 software is a serious enterprise software stack: multi-operator, multi-drone, real-time data fusion, multi-sensor integration, replay and after-action review, integration with higher-level tactical networks. Nobody in the civilian drone world is writing software like this because the civilian use cases do not need it.

**Survivability.** Military drones include IR suppression, radar cross-section reduction, redundant flight control systems, chemical-resistant airframes, and in some cases active defences against incoming missiles. A civilian drone has a $20 brushless motor and a single flight controller.

The engineering gap between a $2000 civilian quadcopter and a $200,000 military ISR drone is not 100x. It is closer to 10,000x in terms of actual capability per kilogram. The hardware is completely different tech.

---

### <span class="accent-orange">What I Took Home From Day 2</span>

Three observations that I did not have walking in:

**1. Drone is not one market.** It is two. Consumer drones and defence drones share some physics (rotors, lift, control loops) and almost nothing else. Conflating them in analysis leads to wrong conclusions about everything.

**2. The defence side is pulling the civilian side forward, not the other way.** Every consumer drone sensor, chipset, and capability was derived from a defence-funded program 10 to 20 years prior. The pipeline is unidirectional. Expect the 2040s civilian drones to benefit from the current defence investment in AI-driven swarm autonomy.

**3. Counter-drone is the growth market.** Every deployed attack drone creates demand for a counter-drone to answer it. The equilibrium is always "both sides have drones AND counter-drones". The companies building the counter-drone stack in 2026 are in a better position than the companies building the attack-drone stack, because counter-drone is defensive-use and has wider regulatory acceptance in non-military deployments (airports, stadiums, prisons, VIP protection).

If I were starting a drone company in India in 2026 and I wanted something defensible, I would build counter-drone detection software. Not the hardware, the software. The hardware is commoditizing. The software that detects, classifies, and recommends a response for an unknown drone in contested airspace is not commoditized and will not be for another decade.

---

### <span class="accent-orange">Closing Thought for Day 2</span>

Drones proved what a human soldier can do, they did it faster, more accurately, for longer, and without anyone dying when something goes wrong. That is a complete sentence and it is the reason defence budgets have drones at the top of their procurement lists globally.

Consumer drones proved that the same hardware is cheap enough for YouTubers to afford. That is also a complete sentence and it is the reason most people will interact with drones only through TikTok videos.

Both things are true. Both matter. They matter for different reasons and at different scales, and conflating them is the single most common mistake I see people make when they talk about "the drone industry".

Day 3 notes coming. Still have the software pavilion to properly cover, the flight school stall, and a longer conversation queued with the swarm-autonomy people about what they are actually doing on the GNC loop. If you have questions you want me to ask specific vendors, send them my way before I go back tomorrow.

That is all from me for now. Day 1 was about what is on the floor. Day 2 was about who uses any of it. Day 3 will be about the software that runs everything and whether that software is as solid as the airframes it is flying.

---

*Series: [Day 1](/blog/drone-security-exploring-with-expo-day1-learning) | Day 2 (you are here) | Day 3 (coming)*
