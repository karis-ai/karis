# Schema Markup Templates

JSON-LD templates for common schema types. Copy, customize, and add to your page's `<head>`.

## Organization

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Your Company",
  "url": "https://example.com",
  "logo": "https://example.com/logo.png",
  "description": "Brief description of your organization",
  "sameAs": [
    "https://twitter.com/yourcompany",
    "https://linkedin.com/company/yourcompany",
    "https://github.com/yourcompany"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "hello@example.com",
    "contactType": "customer support"
  }
}
```

## WebSite (with Search Action)

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Your Site Name",
  "url": "https://example.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://example.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
```

## Article / BlogPosting

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Article Title (max 110 chars)",
  "description": "Brief summary of the article",
  "image": "https://example.com/article-image.jpg",
  "author": {
    "@type": "Person",
    "name": "Author Name",
    "url": "https://example.com/about/author-name"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Publisher Name",
    "logo": {
      "@type": "ImageObject",
      "url": "https://example.com/logo.png"
    }
  },
  "datePublished": "2025-01-15",
  "dateModified": "2025-03-01",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://example.com/article-url"
  }
}
```

Use `"@type": "BlogPosting"` for blog posts. Same structure.

## Product

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Product Name",
  "description": "Product description",
  "image": "https://example.com/product.jpg",
  "brand": {
    "@type": "Brand",
    "name": "Brand Name"
  },
  "offers": {
    "@type": "Offer",
    "price": "29.99",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "url": "https://example.com/product"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.5",
    "reviewCount": "127"
  }
}
```

## SoftwareApplication

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "App Name",
  "description": "What the app does",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web, iOS, Android",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.7",
    "reviewCount": "2340"
  }
}
```

## FAQPage

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is [topic]?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Clear, concise answer to the question."
      }
    },
    {
      "@type": "Question",
      "name": "How does [topic] work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Step-by-step explanation."
      }
    }
  ]
}
```

## HowTo

```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to [accomplish task]",
  "description": "Brief overview of the process",
  "totalTime": "PT30M",
  "estimatedCost": {
    "@type": "MonetaryAmount",
    "currency": "USD",
    "value": "0"
  },
  "step": [
    {
      "@type": "HowToStep",
      "name": "Step 1 title",
      "text": "Detailed instructions for step 1",
      "image": "https://example.com/step1.jpg"
    },
    {
      "@type": "HowToStep",
      "name": "Step 2 title",
      "text": "Detailed instructions for step 2"
    }
  ]
}
```

## BreadcrumbList

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://example.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Category",
      "item": "https://example.com/category"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Current Page"
    }
  ]
}
```

## LocalBusiness

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Business Name",
  "description": "What the business does",
  "image": "https://example.com/storefront.jpg",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Main St",
    "addressLocality": "City",
    "addressRegion": "State",
    "postalCode": "12345",
    "addressCountry": "US"
  },
  "telephone": "+1-555-555-5555",
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "09:00",
      "closes": "17:00"
    }
  ],
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "40.7128",
    "longitude": "-74.0060"
  }
}
```

## Event

```json
{
  "@context": "https://schema.org",
  "@type": "Event",
  "name": "Event Name",
  "description": "Event description",
  "startDate": "2025-06-15T09:00:00-07:00",
  "endDate": "2025-06-15T17:00:00-07:00",
  "eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode",
  "eventStatus": "https://schema.org/EventScheduled",
  "location": {
    "@type": "VirtualLocation",
    "url": "https://example.com/event-link"
  },
  "organizer": {
    "@type": "Organization",
    "name": "Organizer Name",
    "url": "https://example.com"
  },
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "url": "https://example.com/register"
  }
}
```

## Multiple Schemas on One Page (@graph)

Use `@graph` to combine multiple schemas on a single page:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "name": "Your Company",
      "url": "https://example.com",
      "logo": "https://example.com/logo.png"
    },
    {
      "@type": "WebSite",
      "name": "Your Site",
      "url": "https://example.com"
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://example.com"
        }
      ]
    },
    {
      "@type": "Article",
      "headline": "Article Title",
      "author": { "@type": "Person", "name": "Author" },
      "datePublished": "2025-01-15"
    }
  ]
}
```

## Choosing the Right Schema

| Page Type | Recommended Schema |
|-----------|-------------------|
| Homepage | Organization + WebSite |
| Blog post | Article or BlogPosting + BreadcrumbList |
| Product page | Product + BreadcrumbList |
| SaaS landing page | SoftwareApplication + FAQPage |
| How-to guide | HowTo + BreadcrumbList |
| FAQ page | FAQPage |
| Local business | LocalBusiness |
| Event page | Event |
| Category page | BreadcrumbList |

## Validation

Test your schema markup:

- **Google Rich Results Test**: https://search.google.com/test/rich-results
- **Schema.org Validator**: https://validator.schema.org
- **Google Search Console**: Check "Enhancements" for schema errors

## Common Errors

| Error | Fix |
|-------|-----|
| Missing required field | Check schema.org docs for required properties |
| Invalid date format | Use ISO 8601: `2025-01-15` or `2025-01-15T09:00:00-07:00` |
| Image URL not absolute | Use full URL: `https://example.com/image.jpg` |
| Price without currency | Always include `priceCurrency` with `price` |
| Multiple H1 tags | Schema headline should match the single H1 |
| Mismatched page type | Schema `@type` should match actual page content |
