# GTM Gold Standard Specification
## Business: Luminary Home — Premium Lighting & Home Decor E-Commerce
**Version:** 1.0 | **Industry:** E-Commerce | **Complexity:** Advanced  
**QA Agent Reference:** Use `gtm-spec.json` for machine-readable scoring

---

## 1. Business Context

**What the business does:**  
Luminary Home sells premium lighting fixtures and home decor (ceiling lights, floor lamps, wall sconces, table lamps, smart lighting). Mid-market to luxury price point ($80–$2,500). Sells direct-to-consumer online with occasional B2B to interior designers.

**Primary KPIs:**
- Ecommerce conversion rate (transactions / sessions)
- Revenue and average order value
- Product detail page engagement → add-to-cart rate
- Checkout funnel drop-off by step
- Return on ad spend (ROAS) for Google Ads and Meta campaigns

**Key conversion points:**
1. Product purchase (primary)
2. Newsletter signup (micro-conversion)
3. Design consultation request (B2B lead)
4. Wishlist creation (intent signal)

**Customer journey:**
Homepage → Category/PLP → Product Detail (PDP) → Cart → Checkout (3 steps) → Confirmation

**Tracking problems this spec solves:**
- Purchase event firing more than once on page refresh → transaction ID dedup
- Checkout steps missing when user navigates back → fire on each step entry
- Consent violations → no tracking fires before consent granted
- Inflated sessions from internal/staging traffic → IP/hostname exclusion
- Attribution loss from URL redirect stripping UTMs → session storage preservation
- Enhanced conversion match rate → hashed email/phone at purchase
- GA4 not receiving accurate revenue → currency and price normalization
- Missing scroll/engagement data → scroll depth + time-on-page triggers

---

## 2. Data Layer Specification

### 2.1 Standard Page Load (all pages)
```json
{
  "event": "page_meta",
  "page_type": "home | plp | pdp | cart | checkout | confirmation | blog | other",
  "page_category": "string (primary category or null)",
  "user": {
    "logged_in": true,
    "id_hashed": "sha256_of_user_id_or_null",
    "email_hashed": "sha256_or_null",
    "customer_type": "new | returning | vip"
  },
  "consent": {
    "analytics": "granted | denied | pending",
    "advertising": "granted | denied | pending"
  }
}
```

### 2.2 Ecommerce Events (GA4 standard schema)

#### view_item_list — PLP, Homepage featured products
```json
{
  "event": "view_item_list",
  "ecommerce": {
    "item_list_id": "featured_products | category_ceiling | category_floor | search_results",
    "item_list_name": "Human readable list name",
    "items": [{
      "item_id": "SKU-001",
      "item_name": "Artisan Pendant Light",
      "item_brand": "Luminary Home",
      "item_category": "Ceiling Lights",
      "item_category2": "Pendant Lights",
      "item_variant": "Brass",
      "price": 299.00,
      "currency": "USD",
      "index": 1,
      "quantity": 1
    }]
  }
}
```

#### select_item — Click on product card
```json
{
  "event": "select_item",
  "ecommerce": {
    "item_list_id": "string",
    "item_list_name": "string",
    "items": [{ /* single item */ }]
  }
}
```

#### view_item — PDP page load
```json
{
  "event": "view_item",
  "ecommerce": {
    "currency": "USD",
    "value": 299.00,
    "items": [{ /* full item object with all category levels */ }]
  }
}
```

#### add_to_cart
```json
{
  "event": "add_to_cart",
  "ecommerce": {
    "currency": "USD",
    "value": 299.00,
    "items": [{ /* item with selected variant */ }]
  }
}
```

#### remove_from_cart
```json
{
  "event": "remove_from_cart",
  "ecommerce": {
    "currency": "USD",
    "value": 299.00,
    "items": [{ /* removed item */ }]
  }
}
```

#### view_cart — Cart page load
```json
{
  "event": "view_cart",
  "ecommerce": {
    "currency": "USD",
    "value": 598.00,
    "items": [{ /* all cart items */ }]
  }
}
```

#### begin_checkout — Click "Proceed to Checkout"
```json
{
  "event": "begin_checkout",
  "ecommerce": {
    "currency": "USD",
    "value": 598.00,
    "coupon": "SUMMER20",
    "items": [{ /* all cart items */ }]
  }
}
```

#### add_shipping_info — Checkout step 1 complete
```json
{
  "event": "add_shipping_info",
  "ecommerce": {
    "currency": "USD",
    "value": 598.00,
    "shipping_tier": "standard | express | overnight",
    "coupon": "string or null",
    "items": [{ /* all cart items */ }]
  }
}
```

#### add_payment_info — Checkout step 2 complete
```json
{
  "event": "add_payment_info",
  "ecommerce": {
    "currency": "USD",
    "value": 598.00,
    "payment_type": "credit_card | paypal | apple_pay | affirm",
    "coupon": "string or null",
    "items": [{ /* all cart items */ }]
  }
}
```

#### purchase — Confirmation page ONLY
```json
{
  "event": "purchase",
  "ecommerce": {
    "transaction_id": "ORD-20240815-001",
    "value": 538.20,
    "tax": 43.16,
    "shipping": 0.00,
    "currency": "USD",
    "coupon": "SUMMER20",
    "items": [{ /* all purchased items with quantity */ }]
  },
  "user": {
    "email_hashed": "sha256_hash",
    "phone_hashed": "sha256_hash_or_null",
    "new_customer": true
  }
}
```

### 2.3 Custom Events

#### view_promotion — Promo banner impressions
```json
{
  "event": "view_promotion",
  "ecommerce": {
    "promotions": [{
      "promotion_id": "SUMMER_SALE_2024",
      "promotion_name": "Summer Sale — Up to 30% Off",
      "creative_name": "hero_banner",
      "creative_slot": "home_hero | pdp_sidebar | cart_banner"
    }]
  }
}
```

#### select_promotion — Promo banner click
```json
{
  "event": "select_promotion",
  "ecommerce": { /* same promotion object */ }
}
```

#### search
```json
{
  "event": "search",
  "search_term": "string",
  "search_results_count": 24
}
```

#### filter_applied (custom — not GA4 standard)
```json
{
  "event": "filter_applied",
  "filter_type": "category | price | brand | style | color | rating",
  "filter_value": "string",
  "results_count": 18
}
```

#### sort_applied (custom)
```json
{
  "event": "sort_applied",
  "sort_by": "featured | price_asc | price_desc | newest | best_seller | top_rated",
  "results_count": 18
}
```

#### scroll_depth (custom — fired by GTM scroll trigger)
```json
{
  "event": "scroll_depth",
  "percent_scrolled": 25
}
```
*Note: Fired at 25, 50, 75, 90 percent. Use GTM scroll depth trigger — DO NOT push manually.*

#### video_start / video_progress / video_complete
```json
{
  "event": "video_start",
  "video_title": "Artisan Pendant — Product Showcase",
  "video_duration": 45,
  "video_percent": 0,
  "video_provider": "youtube | native"
}
```

#### generate_lead — Newsletter signup, design consultation
```json
{
  "event": "generate_lead",
  "lead_type": "newsletter | consultation | waitlist",
  "form_id": "string"
}
```

#### wishlist_add (custom)
```json
{
  "event": "wishlist_add",
  "ecommerce": {
    "items": [{ /* single item */ }]
  }
}
```

#### checkout_error (custom)
```json
{
  "event": "checkout_error",
  "error_type": "payment_declined | address_invalid | out_of_stock | generic",
  "checkout_step": "shipping | payment | review",
  "error_message": "string"
}
```

#### exception — JavaScript errors
```json
{
  "event": "exception",
  "description": "TypeError: Cannot read properties of undefined",
  "fatal": false
}
```

---

## 3. GTM Container Specification

### 3.1 Tags

#### GA4 — Configuration
| Field | Value |
|---|---|
| Tag type | Google Analytics: GA4 Configuration |
| Measurement ID | {{Const - GA4 Measurement ID}} |
| Send page view | FALSE (fired by separate event tag) |
| User ID | {{JS - User ID Hashed}} |
| Server container URL | (optional — SSGTM URL if configured) |
| Firing trigger | All Pages |

#### GA4 — Page View
| Field | Value |
|---|---|
| Tag type | GA4 Event |
| Event name | page_view |
| page_type | {{DLV - page_type}} |
| page_category | {{DLV - page_category}} |
| Firing trigger | All Pages |

#### GA4 — Ecommerce Events (one tag, multiple triggers)
| Field | Value |
|---|---|
| Tag type | GA4 Event |
| Event name | {{Event}} |
| Send ecommerce data | TRUE, from data layer |
| Firing triggers | view_item_list, select_item, view_item, add_to_cart, remove_from_cart, view_cart, begin_checkout, add_shipping_info, add_payment_info, purchase |

#### GA4 — Custom Events
Separate tags for: search, filter_applied, sort_applied, generate_lead, wishlist_add, video_start, video_progress, video_complete, checkout_error, exception, view_promotion, select_promotion

#### GA4 — Scroll Depth
| Field | Value |
|---|---|
| Event name | scroll |
| percent_scrolled | {{Scroll Depth Threshold}} |
| Firing trigger | Scroll Depth — 25/50/75/90% |

#### Google Ads — Conversion: Purchase
| Field | Value |
|---|---|
| Tag type | Google Ads Conversion Tracking |
| Conversion ID | {{Const - Google Ads Conversion ID}} |
| Conversion label | {{Const - Google Ads Purchase Label}} |
| Conversion value | {{DLV - ecommerce.value}} |
| Order ID | {{DLV - ecommerce.transaction_id}} |
| Currency | {{DLV - ecommerce.currency}} |
| Firing trigger | purchase |

#### Google Ads — Remarketing
| Field | Value |
|---|---|
| Tag type | Google Ads Remarketing |
| Conversion ID | {{Const - Google Ads Conversion ID}} |
| Dynamic remarketing data | ecommerce items array |
| Firing trigger | All Pages (post-consent) |

#### Google Ads — Enhanced Conversions
| Field | Value |
|---|---|
| Enhancement method | Data layer (email, phone) |
| Email variable | {{DLV - user.email_hashed}} |
| Phone variable | {{DLV - user.phone_hashed}} |
| Firing trigger | purchase |

#### Meta Pixel — Base Code
| Field | Value |
|---|---|
| Tag type | Custom HTML |
| Pixel ID | {{Const - Meta Pixel ID}} |
| Firing trigger | All Pages (post-consent) |

#### Meta Pixel — Events
Separate Custom HTML tags for: ViewContent (view_item), AddToCart (add_to_cart), InitiateCheckout (begin_checkout), Purchase (purchase), Lead (generate_lead)

#### Consent Mode — Default (fires before GTM loads)
```javascript
// CMP Integration — fires on gtm.js trigger, BEFORE all other tags
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
  'ad_storage': 'denied',
  'analytics_storage': 'denied',
  'ad_user_data': 'denied',
  'ad_personalization': 'denied',
  'wait_for_update': 500
});
```

#### Consent Mode — Update (fires when user grants/denies)
```javascript
// Fires on cmp_consent_granted custom event
gtag('consent', 'update', {
  'ad_storage': {{DLV - consent.advertising}} === 'granted' ? 'granted' : 'denied',
  'analytics_storage': {{DLV - consent.analytics}} === 'granted' ? 'granted' : 'denied',
  'ad_user_data': {{DLV - consent.advertising}} === 'granted' ? 'granted' : 'denied',
  'ad_personalization': {{DLV - consent.advertising}} === 'granted' ? 'granted' : 'denied'
});
```

---

### 3.2 Triggers

| Trigger Name | Type | Condition |
|---|---|---|
| All Pages | Page View | (always fires) |
| PDP - view_item | Custom Event | event = view_item |
| PLP - view_item_list | Custom Event | event = view_item_list |
| select_item | Custom Event | event = select_item |
| add_to_cart | Custom Event | event = add_to_cart |
| remove_from_cart | Custom Event | event = remove_from_cart |
| view_cart | Custom Event | event = view_cart |
| begin_checkout | Custom Event | event = begin_checkout |
| add_shipping_info | Custom Event | event = add_shipping_info |
| add_payment_info | Custom Event | event = add_payment_info |
| purchase - dedup | Custom Event | event = purchase AND {{DLV - transaction_id}} not in Cookie |
| view_promotion | Custom Event | event = view_promotion |
| select_promotion | Custom Event | event = select_promotion |
| search | Custom Event | event = search |
| filter_applied | Custom Event | event = filter_applied |
| sort_applied | Custom Event | event = sort_applied |
| generate_lead | Custom Event | event = generate_lead |
| wishlist_add | Custom Event | event = wishlist_add |
| video_start | Custom Event | event = video_start |
| video_progress | Custom Event | event = video_progress |
| video_complete | Custom Event | event = video_complete |
| checkout_error | Custom Event | event = checkout_error |
| exception | Custom Event | event = exception |
| Scroll Depth - 25% | Scroll Depth | Depth ≥ 25% |
| Scroll Depth - 50% | Scroll Depth | Depth ≥ 50% |
| Scroll Depth - 75% | Scroll Depth | Depth ≥ 75% |
| Scroll Depth - 90% | Scroll Depth | Depth ≥ 90% |
| Click - Add to Cart Button | Click - All Elements | CSS selector: .btn-add-to-cart |
| Click - Checkout CTA | Click - All Elements | CSS selector: .btn-checkout |
| Click - Nav Links | Click - Just Links | Page Hostname matches domain |
| Click - Outbound Links | Click - Just Links | Page Hostname does NOT match domain |
| Form Submit - Newsletter | Form Submission | Form ID = newsletter-form |
| Form Submit - Consultation | Form Submission | Form ID = consultation-form |
| Element Visible - Promo Banner | Element Visibility | CSS selector: .promo-banner |
| Timer - Engagement 30s | Timer | Interval = 30000ms, Once per page |
| CMP Consent Granted | Custom Event | event = cmp_consent_granted |
| BLOCKING - Internal Traffic | Page View | IP matches office ranges |
| BLOCKING - Staging Domain | Page View | Hostname contains staging/dev/localhost |

---

### 3.3 Variables

#### Constants
| Name | Type | Value |
|---|---|---|
| Const - GA4 Measurement ID | Constant | G-XXXXXXXXXX |
| Const - Google Ads Conversion ID | Constant | AW-XXXXXXXXX |
| Const - Google Ads Purchase Label | Constant | XXXXXXXXXXX |
| Const - Meta Pixel ID | Constant | XXXXXXXXXXXXXXX |
| Const - Domain | Constant | luminaryhome.com |
| Const - Cookie Duration | Constant | 365 |

#### Data Layer Variables
| Name | DL Key | Default |
|---|---|---|
| DLV - event | event | (none) |
| DLV - page_type | page_type | other |
| DLV - page_category | page_category | (undefined) |
| DLV - ecommerce | ecommerce | (none) |
| DLV - ecommerce.value | ecommerce.value | 0 |
| DLV - ecommerce.currency | ecommerce.currency | USD |
| DLV - ecommerce.transaction_id | ecommerce.transaction_id | (none) |
| DLV - ecommerce.coupon | ecommerce.coupon | (undefined) |
| DLV - ecommerce.items | ecommerce.items | [] |
| DLV - ecommerce.shipping_tier | ecommerce.shipping_tier | (undefined) |
| DLV - ecommerce.payment_type | ecommerce.payment_type | (undefined) |
| DLV - user.logged_in | user.logged_in | false |
| DLV - user.id_hashed | user.id_hashed | (undefined) |
| DLV - user.email_hashed | user.email_hashed | (undefined) |
| DLV - user.new_customer | user.new_customer | (undefined) |
| DLV - consent.analytics | consent.analytics | denied |
| DLV - consent.advertising | consent.advertising | denied |
| DLV - search_term | search_term | (undefined) |
| DLV - lead_type | lead_type | (undefined) |
| DLV - error_type | error_type | (undefined) |
| DLV - video_title | video_title | (undefined) |
| DLV - video_percent | video_percent | 0 |

#### JavaScript Variables
| Name | Code |
|---|---|
| JS - User ID Hashed | `return {{DLV - user.id_hashed}} \|\| undefined;` |
| JS - Cart Item Count | `try { return JSON.parse(localStorage.getItem('cart_count')) \|\| 0; } catch(e){ return 0; }` |
| JS - Is New Customer | `return {{DLV - user.new_customer}} === true;` |
| JS - Transaction ID Cookie | `return document.cookie.match(/txn_fired=([^;]+)/)?.[1] \|\| null;` |
| JS - SHA256 Email Hash | *(Custom HTML tag sets this via Web Crypto API — see advanced section)* |
| JS - Page Type from URL | `var p = window.location.pathname; if(p==='/') return 'home'; if(p.includes('/products/')) return (p.split('/').length > 3) ? 'pdp' : 'plp'; if(p.includes('/cart')) return 'cart'; if(p.includes('/checkout')) return 'checkout'; if(p.includes('/confirmation')) return 'confirmation'; return 'other';` |
| JS - Hostname | `return window.location.hostname;` |

#### Lookup Table Variables
| Name | Input Variable | Lookup |
|---|---|---|
| LT - Content Group | {{DLV - page_type}} | home→Homepage, plp→Product Listing, pdp→Product Detail, cart→Shopping Cart, checkout→Checkout, confirmation→Purchase Confirmation |
| LT - GA4 Event Name | {{DLV - event}} | Maps custom event names to GA4-standard names where needed |

#### Built-in Variables (enable these)
- Page URL, Page Hostname, Page Path, Referrer
- Click Element, Click Classes, Click ID, Click Text, Click URL
- Form Element, Form Classes, Form ID, Form Target, Form Text, Form URL
- Scroll Depth Threshold, Scroll Depth Units
- Video Provider, Video Title, Video Duration, Video Percent, Video Visible

#### Auto-event Variables
| Name | Variable Type | Attribute |
|---|---|---|
| AE - Click ID | Auto-event — Element ID | id |
| AE - Click Text (clean) | Custom JS | `return {{Click Element}}.innerText.trim().substring(0,100);` |
| AE - Data Product ID | Auto-event — Data attribute | data-product-id |
| AE - Data Category | Auto-event — Data attribute | data-category |

---

### 3.4 Folder Structure

```
GTM Container
├── 📁 GA4 — Core
│   ├── GA4 Configuration
│   ├── GA4 — Page View
│   └── GA4 — Ecommerce Events
├── 📁 GA4 — Custom Events
│   ├── GA4 — Search
│   ├── GA4 — Scroll Depth
│   ├── GA4 — Video
│   ├── GA4 — Lead Generation
│   ├── GA4 — Wishlist
│   └── GA4 — Errors & Exceptions
├── 📁 Advertising — Google Ads
│   ├── Google Ads — Purchase Conversion
│   ├── Google Ads — Enhanced Conversions
│   └── Google Ads — Remarketing
├── 📁 Advertising — Meta
│   ├── Meta Pixel — Base
│   ├── Meta Pixel — ViewContent
│   ├── Meta Pixel — AddToCart
│   ├── Meta Pixel — Purchase
│   └── Meta Pixel — Lead
├── 📁 Consent & Privacy
│   ├── Consent Mode — Default
│   └── Consent Mode — Update
└── 📁 Utilities
    ├── Error Tracking — JS Exceptions
    └── Transaction ID — Dedup Cookie
```

---

## 4. Advanced Tracking Solutions

### 4.1 Purchase Event Deduplication
**Problem:** User refreshes confirmation page → purchase event fires twice → inflated revenue.  
**Solution:** On purchase trigger, check cookie `txn_fired`. If `{{JS - Transaction ID Cookie}}` equals `{{DLV - ecommerce.transaction_id}}`, block the tag via a trigger exception. If not, fire tag AND set cookie `txn_fired={{DLV - ecommerce.transaction_id}}` with 30-minute expiry.

### 4.2 Consent Mode v2 Implementation
**Default:** All consent denied with `wait_for_update: 500ms`.  
**Update:** Fires when CMP sends `cmp_consent_granted` event.  
**Modeling:** Enable behavioral modeling in Google Ads for unconsented users.  
**GA4 signal:** Enable Google Signals for demographic reporting (requires user consent).

### 4.3 Enhanced Conversions (Google Ads)
**Problem:** Cross-device, iOS14+ attribution loss.  
**Solution:** At purchase, pass hashed email via enhanced conversions.  
**Implementation:** Use Web Crypto API (`crypto.subtle.digest('SHA-256', ...)`) to hash client-side. Never send raw PII.

### 4.4 Checkout Funnel Completeness
**Problem:** SPA navigation doesn't fire GTM page view — checkout steps missing.  
**Solution:** Push explicit `add_shipping_info` and `add_payment_info` events on step completion rather than relying on URL change. GA4 funnel exploration report requires these discrete events.

### 4.5 Internal Traffic Exclusion
**GTM:** Blocking trigger on IP regex for office ranges.  
**GA4:** Define internal traffic filter in Admin → Data Streams → Internal Traffic.  
**Staging exclusion:** Blocking trigger when `{{JS - Hostname}}` contains staging/localhost.

### 4.6 UTM Preservation Across Redirects
**Problem:** Server redirects strip UTM parameters → first click attribution lost.  
**Solution:** Custom JS variable reads UTM params on landing, stores in sessionStorage. Subsequent pages read from sessionStorage if URL params missing. GA4 session-scoped custom dimensions capture source/medium.

### 4.7 GA4 Custom Dimensions & Metrics
| Name | Scope | DL Key |
|---|---|---|
| page_type | Event | page_type |
| customer_type | User | user.customer_type |
| product_category | Item | item_category |
| checkout_step | Event | checkout_step |
| filter_type | Event | filter_type |
| search_results_count | Event | search_results_count |
| is_new_customer | Event | user.new_customer |

### 4.8 GA4 Audiences to Create
- High-intent browsers (viewed 3+ PDPs, no purchase, last 7 days)
- Cart abandoners (view_cart, no purchase, last 24 hours)
- Recent purchasers (purchase in last 30 days — for exclusion from acquisition campaigns)
- VIP customers (purchase value > $500 cumulative)

---

## 5. Scoring Rubric for QA Comparison

When the QA agent compares tool output against this spec, score as follows:

### Tier 1 — Must Have (weight: 3x)
Core ecommerce events: view_item, add_to_cart, begin_checkout, purchase  
GA4 configuration tag  
Trigger for purchase event  

### Tier 2 — Should Have (weight: 2x)
Full ecommerce funnel (all 8 GA4 ecommerce events)  
Consent mode setup  
Google Ads conversion tracking  
Scroll depth triggers  
Form submission tracking  

### Tier 3 — Advanced (weight: 1x)
Enhanced conversions  
Meta Pixel integration  
Custom dimensions definition  
Purchase deduplication  
Internal traffic exclusion  
Video tracking  
Custom events (filter, sort, wishlist, errors)  
Folder structure  
Lookup table variables  

### Scoring Formula
```
Coverage Score = (matched_items / total_gold_items) × 100
Quality Score = (correct_configurations / matched_items) × 100
Sophistication Score = (tier3_matched / tier3_total) × 100
Overall = (Coverage × 0.4) + (Quality × 0.4) + (Sophistication × 0.2)
```

---

## 6. What a 10/10 Tool Output Looks Like

A gold-level tool output for Luminary Home would include:
- All 8 GA4 ecommerce events with correct schemas
- Consent mode v2 with CMP integration
- Google Ads purchase conversion + enhanced conversions
- Meta Pixel base + 5 event tags
- Scroll depth at 4 thresholds
- Form tracking for newsletter + consultation
- Video tracking (start/progress/complete)
- Custom events: search, filter, sort, wishlist, errors
- 20+ correctly defined variables (constants, DLVs, JS vars, lookup tables)
- Folder structure reflecting tag organization
- Purchase dedup logic
- Internal traffic exclusion
- 3-5 GA4 audience definitions
- Custom dimensions mapped to DL keys
- Explanation of WHY each tag exists (business justification)

---

*Last updated: 2026-08-06 | Business: Luminary Home E-Commerce | Spec version: 1.0*
