# oyekolaeunice.com

Everything you will ever need to edit is in the files below. You never need to touch the design code.

| What you want to change | File |
|---|---|
| WhatsApp number, email, Calendly link, social links | `assets/js/settings.js` (one file for every page) |
| Case studies and portfolio pieces | `data/portfolio.json` |
| Client reviews | `data/reviews.json` |
| Package prices and add-ons | `data/packages.json` |
| Blog post list | `blog/posts.json` |
| Your About story (years, what inspired you) | `index.html`: search for "how many years" |

## Add a portfolio piece
1. Upload the image to `assets/img/portfolio/` (on GitHub: Add file > Upload files).
2. In `data/portfolio.json`, add an entry inside `"gallery": [ ]`. Put a comma between entries:
```json
{ "title": "UGC video for a skincare brand", "type": "UGC video", "image": "assets/img/portfolio/skincare.jpg", "link": "" }
```
`type` creates the filter buttons (use the same words each time, e.g. "Meta Ads", "TikTok Shop", "Store design", "UGC video", "Google Shopping"). `link` is optional, for example a TikTok video.

## Add a review
In `data/reviews.json`, replace a placeholder with a real review, word for word, and remove `"placeholder": true`:
```json
{ "name": "Sarah", "from": "Upwork", "country": "United States", "text": "The exact words of the review." }
```
Only use real reviews from real clients.

## Add a blog post
1. Copy `blog/tiktok-shop-product-check.html`, rename it (e.g. `meta-ads-for-restaurants.html`) and replace the title, description, date and text.
2. Add it to `blog/posts.json` (the `slug` is the file name without `.html`).
3. Add its address to `sitemap.xml`.
