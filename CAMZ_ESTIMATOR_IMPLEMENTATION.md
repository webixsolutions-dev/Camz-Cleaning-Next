# CAMZ Cleaning Estimator — Final Integration Notes

The custom cleaning estimator is integrated at `/custom-cleaning-request` as a six-step, mobile-first time-only and live-price flow. Both modes use the same shared calculator and show the same underlying labour-time range.

## Required deployment steps

Apply these Supabase migrations in this exact order before publishing:

1. `supabase/migrations/20260910_cleaning_estimator_settings.sql`
2. `supabase/migrations/20260912_complete_cleaning_estimator_spec.sql`

The second migration is safe to rerun. It completes the admin-editable settings, recommendation rules, analytics events, actual-time reporting fields and their row-level security policies.

After merging this folder into the complete repository, run:

```bash
npm install
npm run build
```

## Completed customer estimator

- Build My Plan (time-only) and See Time & Price modes with identical labour calculations.
- Six-step property, basic tasks, detail tasks, carpet, summary and booking flow.
- Shared task-minute engine used by both the browser and server.
- Mode-independent four-man-hour display floor, with the $179 minimum handled separately by pricing.
- $179 base package, four included man-hours, $40 additional hourly labour and 15-minute billing increments.
- Cleaner-count on-site duration ranges and fixed-time versus additional-time choices.
- Maintained, extra-attention, heavy and very-heavy condition levels.
- Per-window ranges of 7–10, 12–15, 20–25 and 30–40 minutes.
- Detail/blind ranges of 10, 15–20, 25–35 and 40–60 minutes.
- Quantity minus/plus controls on every selected task, including bedroom tasks.
- Separate carpet-steam calculator with the $100 minimum, rooms, large rooms, halls, stairs, closets, heavy-soil and pet-treatment options.
- Contextual kitchen, bedroom-carpet, pet, move-out, bathroom and basement recommendation cards.
- Recommendation cards can be accepted or dismissed.
- Separate near-four-hours and exceeded-four-hours notices.
- Manual assessment only for configured large/heavy/delicate wall scopes, very-heavy work, pet treatment, unusually large scopes or excessive clutter.
- Priority ordering, up to six photos, required-photo prompts for assessment cases, service-area validation and configurable consent terms.
- Desktop and mobile sticky summaries; manual-review totals are consistently labelled rather than exposed as firm quotes.

## Completed administration and security

- Server-authoritative recalculation before a request is saved.
- Admin pricing, GST toggle/rate, condition factors, timing tables and carpet rules.
- Admin-editable wall/carpet/fixed-time wording, notices and customer consent statements.
- Admin-editable task descriptions, minute ranges, visibility, price-mode visibility, active state, order, condition profile and service-type availability.
- Admin-editable recommendation content, related tasks, visibility, active state and order.
- Admin request details include task scope, labour/on-site ranges, carpet, tax, total, manual-review state, priorities and photos.
- Completed-job actual labour and task-time entry.
- Estimate-versus-actual accuracy, under/over-estimation counts and task-bias reporting.
- Analytics for mode selection/switching, step views, recommendation actions, budget choice and successful submission.
- Row-level security for public configuration reads, event writes and administrator-only management.

## Environment

The existing Supabase variables are used:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

No new third-party package is required by this estimator implementation.

## Verification completed

- Strict TypeScript validation of all changed TypeScript/TSX files.
- Formula checks for $179 at 240 minutes; $189 at 255; $199 at 270; $219 at 300; $259 at 360; $339 at 480; and $419 at 600 minutes, before GST.
- Confirmed identical 240-minute displayed floor in both modes for the same selections.
- Confirmed detail/window condition tables and single-wall versus assessment-threshold behaviour.
- Confirmed carpet example: three standard rooms = $180 and 70–105 minutes.

The supplied archive did not include `package.json`, a lockfile or the project Next.js configuration. Therefore a repository-level `npm run build` cannot be executed from this archive alone; run it after merging these files into the actual complete application repository.
