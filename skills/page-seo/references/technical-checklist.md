# Technical SEO Checklist

Quick-reference checklist for technical SEO factors that affect page ranking.

## Crawlability & Indexation

- [ ] Page returns HTTP 200 status
- [ ] Page is not blocked by `robots.txt`
- [ ] Page has no `noindex` meta tag or X-Robots-Tag header
- [ ] Page is included in `sitemap.xml`
- [ ] Page loads without JavaScript requirement for main content
- [ ] Canonical URL is set and points to preferred version
- [ ] No redirect chains (max 1 redirect hop)
- [ ] Hreflang tags set for multi-language pages
- [ ] URL is clean (no excessive parameters, lowercase, hyphens)
- [ ] URL contains target keyword

## Core Web Vitals

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| **LCP** (Largest Contentful Paint) | < 2.5s | 2.5s - 4.0s | > 4.0s |
| **INP** (Interaction to Next Paint) | < 200ms | 200ms - 500ms | > 500ms |
| **CLS** (Cumulative Layout Shift) | < 0.1 | 0.1 - 0.25 | > 0.25 |

**Common fixes:**
- LCP: Optimize hero image, preload critical resources, use CDN
- INP: Reduce JavaScript execution time, break up long tasks
- CLS: Set explicit width/height on images and embeds, avoid dynamic content injection above the fold

## Mobile-Friendly Requirements

- [ ] Viewport meta tag set: `<meta name="viewport" content="width=device-width, initial-scale=1">`
- [ ] Text readable without zooming (16px+ base font)
- [ ] Tap targets at least 48x48px with adequate spacing
- [ ] No horizontal scrolling required
- [ ] Content fits viewport width
- [ ] Mobile-first responsive design
- [ ] Touch-friendly navigation (no hover-dependent menus)

## HTTPS & Security

- [ ] HTTPS enabled with valid SSL certificate
- [ ] HTTP redirects to HTTPS (301 redirect)
- [ ] No mixed content (HTTP resources on HTTPS page)
- [ ] HSTS header set
- [ ] Certificate not expired or self-signed

## Page Speed

- [ ] Total page size under 3MB
- [ ] Images optimized (WebP/AVIF, compressed, lazy-loaded)
- [ ] CSS and JavaScript minified
- [ ] Render-blocking resources eliminated or deferred
- [ ] Browser caching configured (Cache-Control headers)
- [ ] Gzip/Brotli compression enabled
- [ ] Critical CSS inlined
- [ ] Fonts preloaded or using `font-display: swap`

## E-E-A-T Framework

### Experience
- First-hand experience demonstrated in content
- Original screenshots, photos, or data
- Personal anecdotes or case studies
- Product/service actually used or tested

### Expertise
- Author byline with credentials
- Author bio page with relevant qualifications
- Content depth demonstrates subject mastery
- Technical accuracy (no factual errors)

### Authoritativeness
- Domain has topical authority (consistent publishing in niche)
- Cited by other authoritative sources
- Brand mentioned in reputable publications
- Industry awards, certifications, or partnerships

### Trustworthiness
- Contact information accessible
- Privacy policy and terms of service present
- Sources cited for factual claims
- Publication and update dates visible
- Secure site (HTTPS)
- Accurate, honest content (no misleading claims)

## Quick Audit Commands

Check robots.txt:
```
curl -s https://example.com/robots.txt
```

Check sitemap:
```
curl -s https://example.com/sitemap.xml | head -50
```

Check HTTP headers:
```
curl -sI https://example.com/page-url
```

Check canonical:
```
curl -s https://example.com/page-url | grep -i canonical
```

## Tools

- **Google Search Console**: Index coverage, performance, Core Web Vitals
- **Google PageSpeed Insights**: Core Web Vitals and performance audit
- **Google Mobile-Friendly Test**: Mobile rendering check
- **Screaming Frog**: Crawl site for technical issues (free up to 500 URLs)
- **ahrefs/Semrush**: Backlink analysis, keyword tracking, site audit
