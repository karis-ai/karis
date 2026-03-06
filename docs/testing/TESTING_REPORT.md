# Karis CLI Testing Report

**Date:** 2026-03-05  
**Environment:** Staging (`https://api-staging.sophiapro.ai`)  
**Status:** Completed with follow-up fixes identified

## Summary

This report captures a staging validation run for the Karis CLI, covering command execution, streaming behavior, config handling, and GEO audit output quality.

## GEO Audit Snapshot

Successful output included:

```text
Running professional GEO audit...

[tool] plan... done
[tool] use_skill... done
[tool] get_geo_data... done
[tool] read_webpage... done
[tool] search_web... done
[tool] think... done
[tool] sandbox... done

# GEO Audit Report: karis.im

Overall Score: 49 / 100

## Five Dimensions
| Dimension | Weight | Score | Contribution |
|---|---|---|---|
| AI Crawler Accessibility | 15% | 20/100 | 3.0 |
| Content Structure | 20% | 65/100 | 13.0 |
| Semantic Relevance | 25% | 60/100 | 15.0 |
| Structured Data | 20% | 30/100 | 6.0 |
| User Intent Alignment | 20% | 60/100 | 12.0 |
| Total | | | 49.0 / 100 |

## High-Priority Issues
1. `robots.txt` blocks major AI crawlers (`GPTBot`, `ClaudeBot`, `Google-Extended`)
2. `llms.txt` is missing (`404`)
3. `Content-Signal` does not explicitly allow `ai-input`
```

## Validation Notes

- API connectivity succeeded.
- Agent orchestration succeeded end-to-end.
- Streaming tool events rendered correctly.
- The generated report had enough structure for smoke testing.

## Follow-up Work

1. Improve GEO scoring output consistency.
2. Keep all generated examples and reports in English only.
3. Continue expanding structured-output and staging smoke tests.
