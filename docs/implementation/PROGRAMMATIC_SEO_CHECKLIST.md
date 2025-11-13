# Programmatic SEO Implementation Checklist

## ✅ What's Already Done

- [x] SEO templates library with 15 templates (`lib/seo-templates.ts`)
- [x] Product-level dynamic routes (`app/select-product/[productSlug]/page.tsx`)
- [x] Deep template dynamic routes (`app/select-product/[productSlug]/[templateType]/[venue]/[inscription]/page.tsx`)
- [x] Template loader utility (`lib/template-loader.ts`)
- [x] Metadata generation for all routes
- [x] Proper H1-H6 heading hierarchy
- [x] Structured data (JSON-LD) with Product and Breadcrumb schemas
- [x] Breadcrumb navigation
- [x] Related templates sections
- [x] SEO content sections
- [x] Implementation documentation

## 🔲 Phase 1: Testing & Integration (This Week)

### Day 1: Testing
- [ ] Start dev server: `pnpm dev`
- [ ] Test product page: `/select-product/bronze-plaque`
- [ ] Test template page: `/select-product/bronze-plaque/dedication/the-science-hall/knowledge-is-the-seed-of-progress`
- [ ] View page source and verify metadata
- [ ] Check that 3D scene still loads properly
- [ ] Test navigation between pages
- [ ] Verify mobile responsiveness

### Day 2: Store Integration
- [ ] Review `lib/template-loader.ts`
- [ ] Identify which store functions to call (check `lib/headstone-store.ts`)
- [ ] Create client component for template loading
- [ ] Test template pre-population in 3D scene
- [ ] Verify inscriptions appear correctly
- [ ] Test size and material pre-selection

### Day 3: CTA Connection
- [ ] Update template page CTA links
- [ ] Add template ID to URL params when navigating to design tool
- [ ] Parse template params in inscriptions page
- [ ] Test full flow: Template page → Click CTA → Design tool with pre-populated data
- [ ] Verify user can modify pre-populated values

### Day 4: QA & Fixes
- [ ] Test on different browsers (Chrome, Firefox, Safari)
- [ ] Test on mobile devices
- [ ] Check console for errors
- [ ] Verify all links work
- [ ] Test breadcrumb navigation
- [ ] Fix any bugs found

### Day 5: Documentation & Handoff
- [ ] Document any custom changes made
- [ ] Create internal guide for adding templates
- [ ] Test adding a new template end-to-end
- [ ] Review with team

## 🔲 Phase 2: Template Expansion (Week 2)

### Bronze Plaque Dedications (Target: 100 templates)

#### Education Category (20)
- [ ] Science buildings, libraries, student centers
- [ ] Music halls, art galleries, lecture halls
- [ ] Research centers, laboratories, athletic centers
- [ ] Common education inscriptions

#### Civic Category (20)
- [ ] Town halls, community centers, parks
- [ ] Courthouses, fire stations, police stations
- [ ] Public libraries, recreation centers
- [ ] Common civic inscriptions

#### Military Category (15)
- [ ] Veterans memorials, war memorials
- [ ] Military bases, armories
- [ ] Honor walls, memorial gardens
- [ ] Common military inscriptions

#### Religious Category (15)
- [ ] Churches, chapels, synagogues
- [ ] Monasteries, cathedrals, temples
- [ ] Religious schools, retreat centers
- [ ] Common religious inscriptions

#### Healthcare Category (15)
- [ ] Hospitals, medical centers, clinics
- [ ] Research facilities, care centers
- [ ] Hospices, rehabilitation centers
- [ ] Common healthcare inscriptions

#### Corporate Category (15)
- [ ] Headquarters, office buildings
- [ ] Manufacturing facilities, research centers
- [ ] Retail locations, distribution centers
- [ ] Common corporate inscriptions

### Memorial Headstone Templates (Target: 50)

#### Common Epitaphs (25)
- [ ] "Forever in our hearts"
- [ ] "In loving memory"
- [ ] "Gone but never forgotten"
- [ ] "Rest in peace"
- [ ] "Always in our thoughts"
- [ ] "Beloved father/mother/spouse"
- [ ] "A life well lived"
- [ ] Add 18 more common epitaphs

#### Shape × Material Combinations (25)
- [ ] Serpentine × Imperial Red
- [ ] Serpentine × Blue Pearl
- [ ] Serpentine × Emerald Pearl
- [ ] Peak × African Black
- [ ] Peak × Balmoral Red
- [ ] Gothic × Imperial Red
- [ ] Square × Blue Pearl
- [ ] Add 18 more combinations

### Template Generation Script (Optional)
- [ ] Create script to generate templates programmatically
- [ ] Define venue lists by category
- [ ] Define inscription lists by category
- [ ] Generate all combinations
- [ ] Export to `lib/seo-templates.ts`

## 🔲 Phase 3: Additional Routes (Week 3)

### Material Routes
- [ ] Create `app/select-material/[materialSlug]/page.tsx`
- [ ] Add metadata generation
- [ ] Add SEO content about material
- [ ] Link to shape combinations
- [ ] Add example designs with this material

### Material + Shape Routes
- [ ] Create `app/select-material/[materialSlug]/[shapeSlug]/page.tsx`
- [ ] Pre-select material and shape in store
- [ ] Show combination examples
- [ ] Add CTA to jump to size selection
- [ ] Include specifications table

### Shape Routes
- [ ] Create `app/select-shape/[shapeSlug]/page.tsx`
- [ ] Add shape information and dimensions
- [ ] Link to material options
- [ ] Show example designs with this shape

### Shape + Material Routes
- [ ] Create `app/select-shape/[shapeSlug]/[materialSlug]/page.tsx`
- [ ] Mirror material/shape page (reverse order)
- [ ] Cross-linking between both URLs
- [ ] Pre-select shape and material

### Hub Pages
- [ ] Create `/app/bronze-plaques/page.tsx` (category hub)
- [ ] Create `/app/granite-headstones/page.tsx` (category hub)
- [ ] Create `/app/dedication-plaques/page.tsx` (use case hub)
- [ ] Create `/app/memorial-designs/page.tsx` (use case hub)

## 🔲 Phase 4: SEO Infrastructure (Week 4)

### Sitemap
- [ ] Create `app/sitemap.ts`
- [ ] Include all product pages
- [ ] Include all template pages (top 1000)
- [ ] Include material and shape pages
- [ ] Set proper priorities and change frequencies
- [ ] Test: Visit `/sitemap.xml`

### Robots.txt
- [ ] Create `app/robots.ts`
- [ ] Allow crawling of all public pages
- [ ] Disallow API routes
- [ ] Add sitemap reference
- [ ] Test: Visit `/robots.txt`

### Open Graph Images
- [ ] Design OG image template
- [ ] Create dynamic OG image generator (optional)
- [ ] Or use static OG images per category
- [ ] Test OG tags with sharing debuggers

### Structured Data Expansion
- [ ] Add FAQ schema for common questions
- [ ] Add Review schema (when you have reviews)
- [ ] Add Organization schema in root layout
- [ ] Add LocalBusiness schema if applicable
- [ ] Validate with Google's Rich Results Test

### Internal Linking
- [ ] Add related products sections
- [ ] Add "Popular templates" sections
- [ ] Add contextual links in SEO content
- [ ] Create footer links to hub pages
- [ ] Add sidebar navigation (optional)

## 🔲 Phase 5: Launch & Optimization (Week 5+)

### Pre-Launch
- [ ] Run production build: `pnpm build`
- [ ] Check build output for errors
- [ ] Verify all routes compile
- [ ] Test production build locally: `pnpm start`
- [ ] Performance audit with Lighthouse
- [ ] Fix any performance issues

### Launch
- [ ] Deploy to production
- [ ] Submit sitemap to Google Search Console
- [ ] Submit to Bing Webmaster Tools
- [ ] Monitor for crawl errors
- [ ] Check initial indexing

### Week 1 Post-Launch
- [ ] Monitor Google Search Console coverage
- [ ] Check for 404 errors
- [ ] Verify pages are indexing
- [ ] Track initial rankings
- [ ] Set up rank tracking for key terms

### Week 2-4 Post-Launch
- [ ] Analyze which templates get traffic
- [ ] Identify high-performing keywords
- [ ] Create more templates in successful categories
- [ ] Optimize underperforming pages
- [ ] Add user reviews/testimonials

### Month 2+
- [ ] Track conversion rates by template
- [ ] A/B test CTA wording
- [ ] Optimize metadata based on CTR
- [ ] Expand to new template categories
- [ ] Build backlinks to top pages

## 🔲 Optional Enhancements

### Content
- [ ] Add FAQ sections per template
- [ ] Create video guides for popular templates
- [ ] Add customer testimonials
- [ ] Create design galleries by category
- [ ] Write blog posts about popular templates

### Features
- [ ] Save favorite templates (user accounts)
- [ ] Email template suggestions
- [ ] Template of the month
- [ ] User-submitted templates
- [ ] Social sharing for templates

### Technical
- [ ] Implement ISR for template pages
- [ ] Add caching strategy
- [ ] Optimize images with next/image
- [ ] Lazy load 3D scenes
- [ ] Progressive enhancement

### Analytics
- [ ] Set up GA4 events for template views
- [ ] Track "Customize Template" clicks
- [ ] Monitor conversion funnel
- [ ] Set up goal tracking
- [ ] Create dashboard for template performance

## 📊 Success Metrics to Track

### SEO Metrics
- [ ] Pages indexed in Google Search Console
- [ ] Impressions for target keywords
- [ ] Click-through rates by page type
- [ ] Average ranking position
- [ ] Organic traffic growth

### User Engagement
- [ ] Template page views
- [ ] Time on page
- [ ] Bounce rate by template category
- [ ] "Customize Template" click rate
- [ ] Template-to-design conversion rate

### Business Metrics
- [ ] Leads from SEO traffic
- [ ] Quote requests from template pages
- [ ] Orders from template pages
- [ ] Revenue from SEO channel
- [ ] ROI of SEO implementation

## 🎯 Key Milestones

- [ ] **Week 1**: Testing complete, store integration working
- [ ] **Week 2**: 100+ templates added
- [ ] **Week 3**: Material/shape routes live
- [ ] **Week 4**: Sitemap submitted, infrastructure complete
- [ ] **Month 1**: 500+ pages indexed
- [ ] **Month 2**: First rankings in top 100
- [ ] **Month 3**: Traffic increase of 200%
- [ ] **Month 6**: Dominant rankings for long-tail terms
- [ ] **Month 12**: SEO primary traffic source

## 🚀 Quick Start (Minimum Viable Launch)

If you want to launch quickly with minimum effort:

1. **Day 1**: Test existing routes (2 hours)
2. **Day 2**: Connect template to store (3 hours)
3. **Day 3**: Add 20 more templates (2 hours)
4. **Day 4**: Create sitemap (1 hour)
5. **Day 5**: Deploy and submit (1 hour)

**Total**: 9 hours to launch with ~30 templates

Then iterate and expand based on results!

## 📝 Notes

- Update this checklist as you complete items
- Add your own items specific to your business
- Track time spent on each phase
- Document learnings and optimizations
- Share progress with team

---

**Remember**: Programmatic SEO is a long-term strategy. Initial setup takes time, but compounds over months. Focus on quality templates that serve real user needs, and the rankings will follow!
