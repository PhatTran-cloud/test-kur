# Markup Schema — Visual Grammar Tag System

## Design Philosophy

Tags are **meaning declarations** — "this is a comparison point", "this is a statistic", "this is a causal chain". Visual decisions are made by the Spec Generator based on meaning + content context.

The system operates as a **visual grammar** — a set of universal patterns that work across any subject, never locked to a single aesthetic.

```
Economics + [META: type=flow]  → CausationChain (domino GDP effect)
Biology + [META: type=flow]    → FlowDiagram (cell division)
Tech + [META: type=flow]       → AsyncPipeline (request pipeline)
```
Same pattern, different visual — because content context differs.

### Visual-First Rule (NON-NEGOTIABLE)

Every beat MUST have a visual element (icon/3D/SVG shape/chart/diagram). Text is always secondary.

```
Ratio: max 20% text (always with icon companion), min 70% SVG/icon/3D/chart, 10% mixed
ZERO text-only beats — if text exists, it MUST have icon/shape beside it
Every keyword/concept → 1 inline SVG icon describing it
```

---

## Basic Tags (7)

### `[EM: text]` — Emphasis / Key Term

**When:** Named concept first appearance, contrastive key term, punch-line word.

**Visual:** ShinyText shine sweep + **inline SVG icon** for the concept. First introduction: size +4px. Abstract/AI concept: GradientText instead of ShinyText.

**Rules:** ≤5 words. No nesting. Don't tag everything.

```
"That is [EM: abstraction]."
"Not tools but [EM: mental models]."
```

---

### `[E: text]` — Error / Problem / Failure

**When:** Mistake, failure, negative outcome, anti-pattern, warning.

**Visual:** GlitchText (intense) or GlitchBurst (mild) + errorRed + **warning icon (triangle-alert SVG)**. Nearby elements flash.

```
"Most approaches [E: fail at scale]."
"This is [E: the classic mistake] in distributed systems."
```

---

### `[STAT: value | unit | context]` — Statistic / Number

**When:** Number + unit, ratio, named quantity.

**Visual:** CountUp if clear number + **icon representing the stat context**. AnimatedText large if named quantity. Color by tone — insightOrange (surprising), errorRed (alarming), solutionGreen (positive).

**Format:** `[STAT: 1.4 billion | people | China population]` — value | unit | context (optional)

```
"In just [STAT: 10 | years], GDP grew [STAT: 400%]."
"[STAT: 7 | layers | of TCP/IP stack]."
```

---

### `[SB]` — Scene Break

**When:** Paragraph break, topic shift, transition words ("But", "However", "Now", "Let's look at").

**Visual:** TransitionSeries fade 15 frames. Old section elements fade out, new section starts fresh.

```
...that's how it works.

[SB]

But here's what few people know.
```

---

### `[LIST]...[/LIST]` — Enumeration

**When:** 3+ items syntactically parallel.

**Visual:** AnimatedText staggered 18 frames each, slideUp, 4px left-border accent + **icon per item**. Error items: errorRed. Positive items: solutionGreen.

```
[LIST]
- Reduced operating costs
- Faster decision-making
- [E: Lost data control]
[/LIST]
```

---

### `[QUOTE: text — Attribution]` — Quote

**When:** Attributed quote from a real person or source.

**Visual:** QuoteCard + **portrait icon or silhouette**. Historical quote: warm palette (bg #140E08, text #FEF3C7, accent gold). Modern quote: dark palette. BlurText word-by-word reveal. Attribution fades in after.

```
[QUOTE: Give me the freedom of a tight brief — David Ogilvy]
[QUOTE: Markets can remain irrational longer than you can remain solvent — John Maynard Keynes]
```

---

### `[CLOSE: text]` — Closing Statement

**When:** Final 1-3 sentences of script. Reframe, takeaway.

**Visual (mandatory, unchanged):**
1. All elements fade → 20f breathing room
2. BlurText lines + **hero SVG icon** representing the core message, insightOrange key reframe
3. Radial glow 400px radius
4. Hold 60+ frames — zero animation

```
[CLOSE: Infrastructure, not magic.]
[CLOSE: The map is not the terrain. The model is not reality.]
```

---

## META Tags — Visual Pattern Declarations (33 types)

`[META]` is the most important and complex tag. It declares a **visual pattern** for an idea — not a specific component but a pattern type. The Spec Generator chooses the fitting component based on pattern + content context.

**Both `type` AND `subtype` are REQUIRED.** Never use just `type` alone.

---

### GROUP A — Structure & Relationships

---

#### `[META: type=flow]` — Process / Causation / Pipeline

**When:** Causal chain, step sequence, pipeline, cycle.

| subtype | when to use |
|---------|-------------|
| `linear` | A→B→C straight sequence, no loops |
| `cycle` | process that repeats / loops back to start |
| `causal` | domino effect, each step causes the next |
| `branching` | if/else decisions, multiple paths |
| `parallel` | multiple tracks happening simultaneously |

**Spec Generator chooses:**
- Linear sequence → FlowDiagram horizontal
- Circular/repeating → CycleDiagram
- Branching → DecisionTree
- Tech pipeline → AsyncPipeline
- Causal chain → CausationChain (domino effect style)

```
[META: type=flow, subtype=causal, steps=Rate hike→Loans drop→Investment falls→GDP slows]
[META: type=flow, subtype=linear, steps=DNA→RNA→Protein]
[META: type=flow, subtype=cycle, steps=Plan→Build→Test→Ship→Plan]
```

---

#### `[META: type=comparison]` — Two or More Things Contrasted

**When:** "X vs Y", "before and after", "pros and cons", "unlike".

| subtype | when to use |
|---------|-------------|
| `split` | two things side by side, equal weight |
| `before-after` | same thing at two points in time |
| `pros-cons` | advantages vs disadvantages of one thing |
| `spectrum` | range from one extreme to another |
| `matrix` | multiple things × multiple attributes |

```
[META: type=comparison, subtype=split, a=SQL, b=NoSQL]
[META: type=comparison, subtype=before-after, a=pre-2020 supply chains, b=post-2020]
[META: type=comparison, subtype=spectrum, a=centralized, b=decentralized]
```

---

#### `[META: type=timeline]` — Events Ordered in Time

**When:** Year numbers, "since year X", "history of", "evolution of".

| subtype | when to use |
|---------|-------------|
| `linear` | continuous progression, many events |
| `milestone` | few key moments, large jumps between |
| `era` | distinct named periods/ages, color-coded |
| `parallel` | two timelines side by side |

```
[META: type=timeline, subtype=era, era=Pre-pandemic stability, span=2016-2019]
[META: type=timeline, subtype=milestone, era=Internet history, span=1991-2024]
```

---

#### `[META: type=hierarchy]` — Levels / Layers / Taxonomy

**When:** "layers", "levels", "underneath", "built on", "from...to".

| subtype | when to use |
|---------|-------------|
| `tree` | branching downward, parent→children |
| `pyramid` | broad base tapering to narrow top |
| `stack` | horizontal layers, bottom = foundation |
| `nested` | boxes inside boxes, containment |

```
[META: type=hierarchy, subtype=stack, root=Application→OS→Kernel→Hardware]
[META: type=hierarchy, subtype=pyramid, root=Strategy, base=Execution]
```

---

#### `[META: type=anatomy]` — Internal Structure / Breakdown

**When:** "consists of", "made of", "components of", "parts of".

| subtype | when to use |
|---------|-------------|
| `exploded` | parts pulled apart from center, floating labels |
| `labeled` | diagram with arrows pointing to parts |
| `layered` | components stacked, each revealed in turn |
| `cross-section` | cut through to show interior |

```
[META: type=anatomy, subtype=exploded, subject=smartphone hardware]
[META: type=anatomy, subtype=layered, subject=TCP/IP stack]
```

---

#### `[META: type=relationship]` — Connections / Dependencies / Networks

**When:** "influences", "depends on", "connected to", "ecosystem".

| subtype | when to use |
|---------|-------------|
| `graph` | many nodes with many connections |
| `hub-spoke` | one central node connected to many outer nodes |
| `venn` | overlapping sets, shared properties |
| `power-map` | who controls/influences whom, directional |
| `dependency` | A requires B requires C, chain |

```
[META: type=relationship, subtype=hub-spoke, entities=[AWS,Lambda,S3,RDS,EC2]]
[META: type=relationship, subtype=venn, entities=[AI,ML,Deep Learning]]
```

---

#### `[META: type=scale]` — Magnitude / Size Comparison

**When:** "how big", "orders of magnitude", "times larger", "enough to fill".

| subtype | when to use |
|---------|-------------|
| `size-comparison` | object A vs object B visually |
| `zoom` | macro → drill into micro (or reverse) |
| `log-scale` | numbers spanning many orders of magnitude |
| `human-scale` | abstract number → human-relatable reference |

```
[META: type=scale, subtype=size-comparison, subject=Earth vs Sun vs VY Canis Majoris]
[META: type=scale, subtype=human-scale, subject=$251 trillion global debt]
```

---

#### `[META: type=equation]` — Formula / Math

**When:** Equations, formulas, mathematical relationships.

| subtype | when to use |
|---------|-------------|
| `reveal` | formula appears term by term |
| `derivation` | shows how formula is built step by step |
| `annotated` | formula shown with each term labeled/explained |

```
[META: type=equation, subtype=annotated, formula=GDP=C+I+G+(X-M)]
[META: type=equation, subtype=reveal, formula=E=mc2]
```

---

#### `[META: type=scenario]` — Analogy / Example / Thought Experiment

**When:** "imagine", "think of it like", "for example", "consider this".

| subtype | when to use |
|---------|-------------|
| `analogy` | abstract concept mapped to familiar physical thing |
| `case-study` | real-world specific example of a principle |
| `thought-experiment` | hypothetical "what if" scenario |
| `example` | concrete instance of abstract rule |

```
[META: type=scenario, subtype=analogy, context=DNS as internet phonebook]
[META: type=scenario, subtype=case-study, context=Netflix migrating to microservices]
```

---

### GROUP B — Data Visualization

---

#### `[META: type=chart]` — Quantitative Data Visualization

**When:** "data shows", "grew from X to Y", "peaked at", "by year", trend, statistics with time series.

| subtype | when to use |
|---------|-------------|
| `line` | continuous change over time, 1-5 series |
| `bar` | comparing discrete categories, vertical |
| `bar-horizontal` | many categories or long labels |
| `bar-stacked` | part-to-whole across categories |
| `bar-grouped` | multiple series per category, side by side |
| `lollipop` | like bar, minimal, shows exact values clearly |
| `pie` | part-to-whole, max 5 segments |
| `donut` | part-to-whole with center label stat |
| `donut-half` | semicircle, good for single percentage |
| `scatter` | correlation between two variables |
| `bubble` | scatter + third variable as circle size |
| `area` | line with filled area, emphasizes volume |
| `area-stacked` | multiple area series, part-to-whole over time |
| `waterfall` | running total with adds/subtracts |
| `funnel` | conversion stages, narrowing |
| `candlestick` | financial OHLC data |
| `heatmap` | matrix of intensity values |
| `radar` | multiple attributes of one entity, polygon |
| `treemap` | hierarchical part-to-whole, nested rectangles |
| `gantt` | tasks over time, project timeline |
| `sankey` | flow with volume (migration, energy, budget) |

```
[META: type=chart, subtype=line, data=inflation rate, span=2019-2025]
[META: type=chart, subtype=sankey, data=global energy sources to end uses]
[META: type=chart, subtype=heatmap, data=GitHub commit activity by day and hour]
```

---

#### `[META: type=distribution]` — Proportion / Breakdown

**When:** "percentage", "share of", "breakdown", "composition", "proportion".

| subtype | when to use |
|---------|-------------|
| `pie` | simple proportions, max 5 slices |
| `donut` | proportions + center highlight stat |
| `treemap` | many categories, hierarchical |
| `waffle` | grid of squares, good for % of population |
| `bar-stacked` | proportions across multiple groups |
| `pictogram` | icons as units (1 icon = 1M people) |

```
[META: type=distribution, subtype=waffle, data=1 in 5 people affected]
[META: type=distribution, subtype=treemap, data=global GDP by country]
```

---

### GROUP C — Geographic

---

#### `[META: type=map]` — Geographic Data with Spatial Context

**When:** Country/city/region names + spatial relationship, "migration", "trade route", "across the world".

| subtype | when to use |
|---------|-------------|
| `highlight` | specific countries/regions colored, rest dimmed |
| `choropleth` | regions colored by data value |
| `flow` | arrows showing movement between locations |
| `dot` | dots placed at geographic locations |
| `bubble` | sized circles at locations (size = value) |
| `heat` | density/intensity gradient across geography |
| `isochrone` | travel time rings from a center point |

```
[META: type=map, subtype=highlight, region=Southeast Asia, subject=ASEAN member states]
[META: type=map, subtype=flow, region=World, subject=Silk Road trade routes]
```

---

### GROUP D — Technical

---

#### `[META: type=code]` — Source Code / Terminal / Syntax

**When:** Actual code in script, function names, commands, backticks.

| subtype | when to use |
|---------|-------------|
| `block` | single code snippet with syntax highlight |
| `terminal` | command line / shell session |
| `diff` | before/after code change |
| `side-by-side` | wrong way vs right way |
| `annotated` | code with callout annotations on key lines |

```
[META: type=code, subtype=terminal, lang=bash, context=docker run command]
[META: type=code, subtype=annotated, lang=python, context=async await pattern]
```

---

#### `[META: type=network]` — System Architecture / Infrastructure Topology

**When:** "server", "microservices", "API gateway", "distributed", "architecture diagram".

| subtype | when to use |
|---------|-------------|
| `architecture` | software system with labeled components |
| `mesh` | many nodes all interconnected (P2P, blockchain) |
| `hub-spoke` | central hub, spokes to edge nodes |
| `ring` | nodes in a ring topology |
| `tree` | hierarchical network |
| `internet` | ISP/CDN/origin internet-scale layers |

```
[META: type=network, subtype=architecture, nodes=[Browser,DNS,CDN,AppServer,DB], context=web request journey]
[META: type=network, subtype=mesh, nodes=[Node1,Node2,Node3,Node4], context=blockchain peers]
```

---

#### `[META: type=ui]` — App / Website Interface Mockup

**When:** "app", "interface", "dashboard", "user clicks", "user sees".

| subtype | when to use |
|---------|-------------|
| `app-screen` | specific app screen/state |
| `dashboard` | data-heavy metrics interface |
| `form` | input form, wizard, multi-step |
| `notification` | push notification, alert, modal |
| `onboarding` | welcome flow, first-run experience |
| `comparison-ui` | two screens side by side |

```
[META: type=ui, subtype=dashboard, device=desktop, subject=AWS Console]
[META: type=ui, subtype=app-screen, device=mobile, subject=Stripe checkout]
```

---

### GROUP E — Visual Assets

---

#### `[META: type=icon]` — Abstract Concepts Needing Symbolic Visual Anchors

**When:** Concept is abstract + would benefit from visual symbol (security, privacy, speed).

| subtype | when to use |
|---------|-------------|
| `single` | one large icon, concept anchor |
| `group` | 2-6 icons shown together |
| `labeled` | icon + text label below each |
| `animated` | icon with motion (spinning gear, pulsing heart) |

```
[META: type=icon, subtype=group, symbols=[shield,lock,key,eye], style=line, context=security properties]
[META: type=icon, subtype=labeled, symbols=[cloud,server,database,cache], style=duotone, context=infra components]
```

---

#### `[META: type=logo]` — Real Company / Product Brand Marks

**When:** Named companies being compared, market landscape, ecosystem of players. Min 2 brands.

| subtype | when to use |
|---------|-------------|
| `grid` | many logos shown as landscape |
| `vs` | 2 logos facing off |
| `timeline` | logos positioned on a timeline |
| `ecosystem` | logos grouped by category/relationship |
| `stack` | logos stacked (layer cake, dependency) |

```
[META: type=logo, subtype=vs, brands=[React,Vue], context=frontend framework comparison]
[META: type=logo, subtype=grid, brands=[OpenAI,Anthropic,Google,Meta,Mistral], context=AI landscape 2025]
```

---

#### `[META: type=person]` — Real Named Person with Role or Quote

**When:** Named historical figure, named executive, named scientist + their role or quote.

| subtype | when to use |
|---------|-------------|
| `portrait` | person image with name + role label |
| `quote-card` | their quote displayed prominently |
| `title-card` | name + role as lower-third overlay |
| `comparison` | two people side by side |

```
[META: type=person, subtype=quote-card, name=Sam Altman, role=OpenAI CEO, context=AGI definition quote]
[META: type=person, subtype=comparison, name=Keynes vs Hayek, role=Economists, context=stimulus debate]
```

---

#### `[META: type=3d]` — Physical Objects with 3D Form

**When:** Molecules, planets, products, buildings, "rotating", "3D model", "structure".

| subtype | when to use |
|---------|-------------|
| `rotate` | object slowly rotating to show all sides |
| `explode` | parts separate to show internal structure |
| `zoom` | camera pushes in toward object |
| `cutaway` | slice removed to show interior |
| `abstract` | geometric/conceptual 3D shape |

```
[META: type=3d, subtype=rotate, object=DNA double helix, context=molecular structure]
[META: type=3d, subtype=explode, object=iPhone 16 Pro, context=hardware layers]
```

---

### GROUP F — Information Display

---

#### `[META: type=data-table]` — Structured Rows x Columns

**When:** "comparison table", "specifications", "features", multiple entities × multiple attributes.

| subtype | when to use |
|---------|-------------|
| `comparison` | entities vs attributes, mix of values |
| `feature-matrix` | checkmarks/x-marks per feature |
| `pricing` | tiers × features, highlight recommended |
| `ranking` | sorted by score/rank, numbered |
| `scorecard` | grades/ratings per dimension |

```
[META: type=data-table, subtype=feature-matrix, rows=[Free,Pro,Enterprise], columns=[Storage,Users,API], context=SaaS pricing]
[META: type=data-table, subtype=ranking, rows=[USA,China,Germany,Japan], columns=[GDP rank,GDP value], context=world economies]
```

---

#### `[META: type=progress]` — Sequential Steps with Completion States

**When:** "step 1/2/3", "step by step", "phase", "first... then... finally".

| subtype | when to use |
|---------|-------------|
| `steps` | numbered steps, horizontal or vertical |
| `phases` | named phases with longer durations |
| `checklist` | items being checked off one by one |
| `funnel` | stages with dropout (sales, conversion) |
| `roadmap` | future milestones on a time axis |

```
[META: type=progress, subtype=steps, steps=[Install,Configure,Test,Deploy], context=server setup]
[META: type=progress, subtype=funnel, steps=[Awareness,Interest,Decision,Purchase], context=marketing funnel]
```

---

### GROUP G — Analytical

---

#### `[META: type=matrix]` — 2D Grid / Quadrant / Strategic Framework

**When:** "quadrant", "2x2", "SWOT", "risk vs impact", "priority matrix", two-axis categorization.

| subtype | when to use |
|---------|-------------|
| `quadrant` | 2×2 grid with labeled axes (BCG, Eisenhower) |
| `swot` | Strengths/Weaknesses/Opportunities/Threats |
| `bcg` | BCG growth-share matrix (stars, cash cows, dogs, question marks) |
| `risk-impact` | risk on one axis, impact on other, items placed |
| `priority-grid` | urgency × importance, items sorted into cells |

```
[META: type=matrix, subtype=quadrant, axes=[Growth rate,Market share], context=BCG portfolio analysis]
[META: type=matrix, subtype=swot, subject=Tesla 2025, context=strategic position]
[META: type=matrix, subtype=risk-impact, items=[Supply chain,Cyber attack,Regulation,Currency], context=enterprise risk assessment]
```

---

#### `[META: type=funnel-analysis]` — Narrowing / Filtering / Elimination

**When:** "narrows down", "out of X only Y survive", "filtering process", "elimination", "conversion rate".

| subtype | when to use |
|---------|-------------|
| `conversion` | user journey with dropout at each stage |
| `elimination` | items eliminated step by step until winner remains |
| `filtering` | criteria applied one by one, count shrinks |
| `narrowing` | wide → narrow visual, increasingly specific |

```
[META: type=funnel-analysis, subtype=conversion, steps=[Visitors→Signups→Active→Paid], data=SaaS conversion]
[META: type=funnel-analysis, subtype=elimination, steps=[1000 startups→100 funded→10 profitable→1 unicorn], context=startup survival]
```

---

#### `[META: type=accumulation]` — Growth / Compounding / Stacking

**When:** "compounds over time", "snowball effect", "accumulates", "stacks up", "adds up".

| subtype | when to use |
|---------|-------------|
| `compound-growth` | exponential curve with annotation |
| `snowball` | ball growing larger rolling downhill visual |
| `stacking` | blocks/layers adding on top of each other |
| `waterfall-gain` | successive additions building total |

```
[META: type=accumulation, subtype=compound-growth, data=compound interest over 30 years, context=retirement savings]
[META: type=accumulation, subtype=snowball, subject=technical debt, context=each shortcut adds weight]
```

---

#### `[META: type=ranking]` — Ordered Comparison / Leaderboard

**When:** "ranked", "top 10", "first place", "number one", "best/worst", "sorted by".

| subtype | when to use |
|---------|-------------|
| `leaderboard` | vertical sorted list with bars or values |
| `podium` | top 3 on podium, others below |
| `sorted-bar` | horizontal bars sorted by value, animated race |
| `medal-tier` | gold/silver/bronze tier grouping |

```
[META: type=ranking, subtype=leaderboard, items=[USA,China,Japan,Germany,India], metric=GDP, context=world economies]
[META: type=ranking, subtype=podium, items=[Python,JavaScript,TypeScript], metric=popularity, context=programming languages 2025]
```

---

#### `[META: type=dashboard-view]` — Multi-Metric Overview / KPI Display

**When:** "dashboard", "at a glance", "key metrics", "KPIs", "status overview", multiple stats together.

| subtype | when to use |
|---------|-------------|
| `kpi-grid` | 4-6 stat cards arranged in grid |
| `metric-wall` | many metrics displayed as a wall |
| `status-board` | items with status indicators (green/yellow/red) |
| `control-panel` | interactive-looking panel with gauges/indicators |

```
[META: type=dashboard-view, subtype=kpi-grid, metrics=[Revenue,Users,Churn,NPS], context=SaaS monthly report]
[META: type=dashboard-view, subtype=status-board, items=[API,Database,CDN,Auth], context=infrastructure health]
```

---

### GROUP H — Narrative & Cinematic

---

#### `[META: type=tension]` — Opposing Forces / Trade-offs / Balance

**When:** "tension between", "trade-off", "balance", "push and pull", "tug of war", "equilibrium".

| subtype | when to use |
|---------|-------------|
| `tug-of-war` | two forces pulling opposite directions |
| `balance-scale` | two sides on a balance, one tips |
| `push-pull` | arrows showing opposing pressures |
| `trade-off` | slider between two desirable things (speed vs quality) |
| `equilibrium` | forces converging to a balance point |

```
[META: type=tension, subtype=tug-of-war, a=Innovation, b=Regulation, context=tech industry balance]
[META: type=tension, subtype=trade-off, a=Security, b=Convenience, context=authentication UX]
[META: type=tension, subtype=balance-scale, a=Supply, b=Demand, context=market equilibrium]
```

---

#### `[META: type=reveal]` — Progressive Disclosure / Unveiling / Discovery

**When:** "reveals", "hidden beneath", "look closer", "behind the scenes", "what you don't see", dramatic unveil.

| subtype | when to use |
|---------|-------------|
| `curtain` | curtain pulls aside to reveal what's behind |
| `mask-unmask` | overlay removed to show truth beneath |
| `puzzle-assemble` | pieces come together to form complete picture |
| `decrypt` | encoded/blurred text becomes clear |
| `spotlight-scan` | spotlight moves across dark scene, revealing elements |

```
[META: type=reveal, subtype=curtain, subject=real cost of free services, context=data monetization]
[META: type=reveal, subtype=puzzle-assemble, pieces=[Data,Algorithm,Compute,Distribution], context=AI product stack]
```

---

#### `[META: type=transformation]` — Morphing / Evolution / State Change

**When:** "transforms into", "evolves from", "becomes", "morphs", "state change", "before→after process".

| subtype | when to use |
|---------|-------------|
| `morph-shape` | one shape smoothly morphs into another (using @remotion/paths interpolatePath) |
| `evolution-stages` | organism/concept shown at multiple stages |
| `state-machine` | states with labeled transitions between them |
| `metamorphosis` | dramatic visual transformation (caterpillar→butterfly) |

```
[META: type=transformation, subtype=evolution-stages, stages=[Mainframe,PC,Mobile,Cloud,AI], context=computing evolution]
[META: type=transformation, subtype=morph-shape, from=Monolith, to=Microservices, context=architecture migration]
```

---

#### `[META: type=metaphor]` — Visual Analogy / Conceptual Symbol

**When:** "think of it as", "like a bridge", "the tip of the iceberg", visual analogy that maps abstract to physical.

| subtype | when to use |
|---------|-------------|
| `bridge-gap` | bridge connecting two sides across a gap |
| `iceberg` | visible top, hidden massive bottom |
| `magnifying-glass` | zoomed inspection of detail |
| `puzzle-piece` | how parts fit together to form whole |
| `tree-of-knowledge` | branching tree with concepts as nodes/leaves |

```
[META: type=metaphor, subtype=iceberg, visible=Symptoms, hidden=Root causes, context=debugging strategy]
[META: type=metaphor, subtype=bridge-gap, from=Current state, to=Desired state, bridge=Strategy, context=digital transformation]
```

---

#### `[META: type=infographic]` — Dense Visual Summary / Poster Layout

**When:** Section summarizes many facts/stats at once, overview recap, "everything you need to know".

| subtype | when to use |
|---------|-------------|
| `full-page` | single dense visual filling the screen |
| `sectioned` | divided into labeled zones with icons/stats |
| `poster` | hero visual + supporting data around it |
| `strip` | horizontal strip with sequential info-bites |

```
[META: type=infographic, subtype=sectioned, sections=[Problem,Solution,Impact,Next Steps], context=project summary]
[META: type=infographic, subtype=poster, hero=Global water crisis, context=awareness overview]
```

---

### GROUP I — Process & Feedback

---

#### `[META: type=cycle-feedback]` — Feedback Loops / Spirals / Reinforcing Systems

**When:** "feedback loop", "vicious cycle", "virtuous cycle", "reinforcing", "self-perpetuating", "spiral".

| subtype | when to use |
|---------|-------------|
| `reinforcing-loop` | A→B→C→A, each cycle amplifies |
| `balancing-loop` | negative feedback that stabilizes |
| `spiral` | upward or downward spiral with stages |
| `doom-loop` | destructive cycle that worsens over time |

```
[META: type=cycle-feedback, subtype=reinforcing-loop, steps=[More users→More data→Better AI→More users], context=network effects]
[META: type=cycle-feedback, subtype=doom-loop, steps=[Debt→Austerity→Recession→More debt], context=sovereign debt crisis]
```

---

#### `[META: type=process-steps]` — Instructional / How-To / Recipe

**When:** "how to", "step-by-step guide", "recipe", "instructions", numbered procedure.

| subtype | when to use |
|---------|-------------|
| `numbered-steps` | 1-2-3 clear sequential instructions |
| `assembly-line` | items moving along a conveyor/pipeline |
| `recipe` | ingredients + steps format |
| `kanban` | columns (To Do, In Progress, Done) with cards |

```
[META: type=process-steps, subtype=numbered-steps, steps=[Fork repo,Create branch,Write tests,Open PR], context=contribution guide]
[META: type=process-steps, subtype=kanban, columns=[Backlog,Sprint,Review,Done], context=agile workflow]
```

---

## Scene Layout System (8 Layouts)

Every section MUST declare a layout strategy. Spec Generator selects based on META type + content density.

| Layout | Description | Best for |
|--------|-------------|----------|
| `centered` | Single focal point center screen | icon, stat, equation, reveal |
| `split-h` | Horizontal split (left/right panels) | comparison, before-after, code side-by-side |
| `split-v` | Vertical split (top/bottom) | chart + annotation, person + quote |
| `grid` | 2×2 or 3×2 grid of cards/items | dashboard, icon group, feature matrix, logo grid |
| `radial` | Elements arranged in circle from center | relationship, hub-spoke, cycle |
| `stacked` | Vertical stack of layers/blocks | hierarchy, list, timeline, progress steps |
| `floating` | Elements at various positions with motion | 3d, abstract, metaphor, particle scenes |
| `cinematic` | Full-bleed with text overlay at bottom | map, infographic, poster, immersive opening |

### Layout Variety Rule
**Never use the same layout 3 sections in a row.** Vary layouts to keep visual interest.

### META Type → Recommended Layouts

| META type | Primary | Secondary |
|-----------|---------|-----------|
| flow | stacked, split-h | cinematic |
| comparison | split-h | grid |
| timeline | stacked, cinematic | split-h |
| hierarchy | stacked | radial, centered |
| anatomy | centered, floating | grid |
| relationship | radial | floating, grid |
| scale | centered | cinematic |
| equation | centered | split-v |
| scenario | split-h | cinematic |
| chart | centered, split-v | cinematic |
| distribution | centered | grid |
| map | cinematic | centered |
| code | split-h | centered |
| network | radial, floating | cinematic |
| ui | centered | split-h |
| icon | centered, grid | radial |
| logo | grid | split-h |
| person | centered, split-v | split-h |
| 3d | centered, floating | cinematic |
| data-table | centered | grid |
| progress | stacked | split-h |
| matrix | grid | centered |
| funnel-analysis | centered, stacked | cinematic |
| accumulation | centered | stacked |
| ranking | stacked | centered |
| dashboard-view | grid | stacked |
| tension | split-h | centered |
| reveal | centered, cinematic | floating |
| transformation | centered | split-h |
| metaphor | centered, floating | cinematic |
| infographic | cinematic, grid | centered |
| cycle-feedback | radial | centered |
| process-steps | stacked | grid |

---

## Visual Grammar — Style Decisions

Beyond pattern type, Spec Generator considers 3 factors for visual style:

### 1. Emotional Register (from content)
| Register | Visual Style |
|----------|-------------|
| Analytical / Objective | Clean lines, monochrome base, data-forward |
| Dramatic / Warning | High contrast, errorRed accents, GlitchText |
| Inspiring / Positive | solutionGreen, warm tones, smooth springs |
| Historical / Nostalgic | Sepia palette, serif fonts, document textures |
| Futuristic / Tech | Dark bg, aiPurple/techBlue, particle effects |
| Geographic / Physical | Map-toned greens/blues, terrain-like gradients |

### 2. Information Density (from content complexity)
| Density | Approach |
|---------|----------|
| One simple fact | Full screen, large icon + text, single focal point |
| 2-3 related points | Two-column or stacked with spacing + icons |
| System / Many parts | Build piece-by-piece with icons, don't show all at once |
| Data-heavy | Chart first, labels second, context third |

### 3. Audience Familiarity (from script tone)
| Tone | Visual Complexity |
|------|------------------|
| Beginner-friendly | Simpler diagrams, more icon support, slower pacing |
| Technical | Can go straight to diagram, less hand-holding |
| Mixed | Start simple, add complexity progressively |

---

## Tag Interaction Rules

- Flat tags only — never nest
- `[E]` inside `[LIST]` item: write plain text, errorRed styling automatic
- One `[CLOSE]` only, at end of script
- `[SB]` never inside `[LIST]`
- `[META]` should appear at start of sentence/paragraph, not in the middle
- Multiple `[META]` in one section is normal — each gets its own visual moment
- `[META]` never inside `[LIST]` items

---

## How Tags Become BEAT Frames

```
[META: type=flow, subtype=causal, steps=Demand rises→Price rises→Supply rises]
       | Aligner finds first word after tag in Whisper timestamps
       "Demand" → start: 12.4s
       | frame = Math.floor(12.4 x 30) = 372
       | BEAT: META_FLOW_DEMAND_RISES: 372
```

Tag does not contain timing. Timing comes from Whisper. This is an immutable principle.

---

## Pattern Count Verification

```
33 META types x ~5 subtypes average = 165 base patterns
x 8 scene layouts = 1,320 layout configurations
x 5 animation variants (spring presets) = 6,600 combinations
x 8 domain palettes = 52,800 unique visual possibilities
```

This system produces **1,000+ distinct visual patterns** from the grammar alone, before counting component prop variations.
