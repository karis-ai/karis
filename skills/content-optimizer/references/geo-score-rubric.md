# GEO Score Rubric

Detailed scoring criteria for evaluating content across 5 dimensions.

---

## 1. Structure Clarity (0-25 points)

**What it measures:** How well-organized and scannable the content is for AI parsing.

### Heading Hierarchy (0-8 points)

| Score | Criteria |
|-------|----------|
| 8 | Perfect H1 → H2 → H3 hierarchy, no skipped levels, logical nesting |
| 6 | Good hierarchy with 1-2 minor issues (e.g., one skipped level) |
| 4 | Inconsistent hierarchy, multiple skipped levels, or flat structure |
| 2 | Headings present but poorly organized |
| 0 | No headings or only H1 |

**Red flags:**
- Skipping from H1 to H3
- Multiple H1s on the same page
- Headings used for styling instead of structure

### Paragraph Length (0-6 points)

| Score | Criteria |
|-------|----------|
| 6 | Most paragraphs 150-300 words, well-chunked |
| 4 | Some long paragraphs (300-500 words), mostly readable |
| 2 | Many paragraphs >500 words, walls of text |
| 0 | Single massive paragraph or no paragraph breaks |

**Ideal:** 2-4 sentences per paragraph, one idea per paragraph.

### Lists and Tables (0-6 points)

| Score | Criteria |
|-------|----------|
| 6 | Lists/tables used appropriately for structured data |
| 4 | Some lists/tables, could use more |
| 2 | Rare use of lists/tables where they'd help |
| 0 | No lists/tables, even for enumerated items |

**When to use:**
- Lists: Steps, features, benefits, criteria
- Tables: Comparisons, specifications, data

### Logical Flow (0-5 points)

| Score | Criteria |
|-------|----------|
| 5 | Clear progression, sections build on each other |
| 3 | Mostly logical, some jumps or tangents |
| 1 | Disorganized, hard to follow |
| 0 | No discernible structure |

---

## 2. Entity Clarity (0-25 points)

**What it measures:** How clearly brands, products, and concepts are defined.

### Brand/Product Definitions (0-10 points)

| Score | Criteria |
|-------|----------|
| 10 | All brands/products defined on first mention with category and value prop |
| 7 | Most entities defined, some assumed knowledge |
| 4 | Many entities undefined or vague |
| 0 | Entities unclear or missing |

**Good example:** "Acme, a project management platform used by 5,000+ teams..."

**Bad example:** "Our tool helps teams..." (What tool? What does it do?)

### Concept Explanations (0-8 points)

| Score | Criteria |
|-------|----------|
| 8 | Technical terms and concepts explained clearly |
| 5 | Some explanations, assumes moderate expertise |
| 2 | Heavy jargon, assumes expert knowledge |
| 0 | No explanations, inaccessible to non-experts |

**Test:** Would someone unfamiliar with the domain understand this?

### Pronoun Clarity (0-4 points)

| Score | Criteria |
|-------|----------|
| 4 | No ambiguous pronouns, clear referents |
| 2 | Some ambiguous "it", "they", "this" |
| 0 | Frequent ambiguous pronouns |

**Red flags:**
- "It helps teams collaborate" (what is "it"?)
- "They offer multiple plans" (who is "they"?)

### Entity Linking (0-3 points)

| Score | Criteria |
|-------|----------|
| 3 | Entities linked to authoritative sources (Wikipedia, official sites) |
| 2 | Some links, incomplete |
| 0 | No entity links |

---

## 3. Citation Credibility (0-20 points)

**What it measures:** How trustworthy and authoritative the content appears.

### Data and Statistics (0-8 points)

| Score | Criteria |
|-------|----------|
| 8 | All data cited with sources, recent (within 2 years) |
| 5 | Some data cited, some unsourced |
| 2 | Data present but no sources |
| 0 | No data or unsubstantiated claims |

**Good example:** "According to [Gartner 2025], 67% of teams struggle with sprint planning."

**Bad example:** "Studies show teams struggle with planning." (What studies?)

### Authoritative References (0-6 points)

| Score | Criteria |
|-------|----------|
| 6 | Multiple links to authoritative sources (research, industry reports, official docs) |
| 4 | Some authoritative links, some weak sources |
| 2 | Few links, mostly weak sources |
| 0 | No external links or only self-referential |

**Authoritative sources:** Research papers, industry reports (Gartner, Forrester), government data, academic institutions, established media.

**Weak sources:** Personal blogs, forums, outdated content (>5 years old).

### Original Research (0-4 points)

| Score | Criteria |
|-------|----------|
| 4 | Original data, case studies, or unique insights |
| 2 | Some original content, mostly aggregated |
| 0 | Entirely derivative, no unique value |

### Expert Quotes (0-2 points)

| Score | Criteria |
|-------|----------|
| 2 | Expert quotes or case studies included |
| 1 | Generic testimonials |
| 0 | No quotes or testimonials |

---

## 4. Q&A Fitness (0-20 points)

**What it measures:** How directly the content answers common questions.

### Direct Question Answering (0-8 points)

| Score | Criteria |
|-------|----------|
| 8 | Answers 3+ specific questions clearly and directly |
| 5 | Answers 1-2 questions, somewhat indirect |
| 2 | Tangentially related to questions |
| 0 | Doesn't answer questions |

**Test:** Can you extract a clear answer to "How do I X?" or "What is Y?"

### Question-Answer Format (0-5 points)

| Score | Criteria |
|-------|----------|
| 5 | Explicit Q&A format (headings as questions) |
| 3 | Implicit Q&A (headings imply questions) |
| 1 | No Q&A structure |

**Good example:** "How do I set up AI sprint planning?" (heading)

**Implicit example:** "Setting up AI sprint planning" (implies "how")

### User Intent Alignment (0-4 points)

| Score | Criteria |
|-------|----------|
| 4 | Addresses user intent (informational, comparative, transactional) |
| 2 | Partially addresses intent |
| 0 | Misaligned with user intent |

**Intent types:**
- Informational: "What is X?" → Explain concept
- Comparative: "X vs Y" → Compare options
- Transactional: "How to buy X" → Guide to action

### Actionability (0-3 points)

| Score | Criteria |
|-------|----------|
| 3 | Provides actionable steps, not vague advice |
| 1 | Some actionable content, mostly general |
| 0 | Vague, no actionable guidance |

**Good example:** "Click Settings → Integrations → Connect GitHub"

**Bad example:** "Configure your integrations appropriately"

---

## 5. Technical Markup (0-10 points)

**What it measures:** Presence of structured data and metadata.

### Schema.org Markup (0-5 points)

| Score | Criteria |
|-------|----------|
| 5 | Complete Schema.org markup (Article, FAQPage, HowTo, or relevant type) |
| 3 | Basic Schema.org markup (Article only) |
| 1 | Incomplete or incorrect Schema |
| 0 | No Schema.org markup |

**Priority schemas:**
- Article: For blog posts and articles
- FAQPage: For Q&A content
- HowTo: For tutorials and guides

### Meta Description (0-2 points)

| Score | Criteria |
|-------|----------|
| 2 | Meta description present, 150-160 characters, compelling |
| 1 | Meta description present but too short/long or generic |
| 0 | No meta description |

### OpenGraph Tags (0-2 points)

| Score | Criteria |
|-------|----------|
| 2 | og:title, og:description, og:image present |
| 1 | Some OpenGraph tags, incomplete |
| 0 | No OpenGraph tags |

### Heading Tag Usage (0-1 point)

| Score | Criteria |
|-------|----------|
| 1 | Headings use proper HTML tags (h1, h2, h3), not styled divs |
| 0 | Headings styled with CSS instead of semantic tags |

---

## Scoring Summary

| Dimension | Max Points | Weight |
|-----------|------------|--------|
| Structure Clarity | 25 | 25% |
| Entity Clarity | 25 | 25% |
| Citation Credibility | 20 | 20% |
| Q&A Fitness | 20 | 20% |
| Technical Markup | 10 | 10% |
| **Total** | **100** | **100%** |

### Score Interpretation

| Range | Rating | Action |
|-------|--------|--------|
| 80-100 | Excellent | Minor tweaks, maintain quality |
| 60-79 | Good | Targeted improvements in weak dimensions |
| 40-59 | Moderate | Major optimization needed |
| 0-39 | Poor | Complete rewrite recommended |

---

## Evaluation Process

1. **Read content** (strip HTML, preserve structure)
2. **Score each dimension** using rubric above
3. **Calculate total** (sum of all dimension scores)
4. **Identify top 3 fixes** (lowest-scoring dimensions or highest-impact improvements)
5. **Provide before/after examples** for key issues
