# Reddit Listening Examples

## Example 1: Brand Sentiment Analysis

**User Request:**
> "What are people saying about Notion on Reddit?"

**Agent Action:**
```bash
npx karis chat "Analyze Reddit sentiment for Notion. Include overall sentiment, top topics, pain points, and key subreddits."
```

**Sample Output:**
```markdown
## Reddit Listening: Notion

### Overview
- Analysis period: Last 30 days
- Subreddits analyzed: r/Notion, r/productivity, r/PKM, r/software
- Total mentions: 1,247

### Sentiment Breakdown
- Positive: 68%
- Neutral: 22%
- Negative: 10%

### Top Topics
1. Database features - 342 mentions
2. Mobile app performance - 198 mentions
3. Offline mode - 156 mentions
4. Pricing - 134 mentions

### Key Pain Points
- Slow mobile app performance
- Limited offline functionality
- Learning curve for databases
- Pricing for teams

### Actionable Insights
- Strong community advocacy for database features
- Mobile experience is a competitive weakness
- Users actively recommend Notion despite pain points
```

---

## Example 2: Competitor Comparison

**User Request:**
> "Compare Notion vs Obsidian on Reddit"

**Agent Action:**
```bash
npx karis chat "Compare Notion vs Obsidian on Reddit. Show mention volume, sentiment, and key differentiators."
```

**Sample Output:**
```markdown
## Competitor Comparison: Notion vs Obsidian

### Mention Volume (Last 30 days)
- Notion: 1,247 mentions
- Obsidian: 892 mentions

### Sentiment Comparison
| Brand | Positive | Neutral | Negative |
|-------|----------|---------|----------|
| Notion | 68% | 22% | 10% |
| Obsidian | 74% | 18% | 8% |

### Key Differentiators

**Notion Strengths (per Reddit users):**
- Collaboration features
- Database functionality
- Templates and sharing
- All-in-one workspace

**Obsidian Strengths (per Reddit users):**
- Local-first approach
- Markdown support
- Plugin ecosystem
- Performance and speed

### Gap Topics
Topics where Obsidian is discussed but Notion isn't:
- Local file storage
- Privacy and data ownership
- Vim keybindings
```

---

## Example 3: Subreddit Discovery

**User Request:**
> "Find Reddit communities discussing project management tools"

**Agent Action:**
```bash
npx karis chat "Find Reddit communities discussing project management tools. Include member counts and activity levels."
```

**Sample Output:**
```markdown
## Subreddit Discovery: Project Management Tools

### Relevant Communities

1. **r/projectmanagement** (156K members)
   - Activity: High (50+ posts/day)
   - Focus: Professional PM discussions
   - Engagement: Very active comments

2. **r/productivity** (1.2M members)
   - Activity: Very High (200+ posts/day)
   - Focus: Tools and workflows
   - Engagement: High engagement on tool recommendations

3. **r/agile** (45K members)
   - Activity: Medium (10-20 posts/day)
   - Focus: Agile methodologies
   - Engagement: Professional discussions

4. **r/scrum** (38K members)
   - Activity: Medium (15+ posts/day)
   - Focus: Scrum framework
   - Engagement: Active Q&A
```
