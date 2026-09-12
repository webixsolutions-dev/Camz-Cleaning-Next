-- Completes the September 2026 estimator spec for existing installations.
alter table public.cleaning_estimator_settings
  add column if not exists gst_enabled boolean not null default true,
  add column if not exists carpet_large_room_cents integer not null default 6000,
  add column if not exists carpet_setup_minutes_min integer not null default 30,
  add column if not exists carpet_setup_minutes_max integer not null default 45,
  add column if not exists carpet_room_minutes_min integer not null default 20,
  add column if not exists carpet_room_minutes_max integer not null default 30,
  add column if not exists carpet_large_room_minutes_min integer not null default 30,
  add column if not exists carpet_large_room_minutes_max integer not null default 45,
  add column if not exists carpet_hall_minutes_min integer not null default 10,
  add column if not exists carpet_hall_minutes_max integer not null default 15,
  add column if not exists carpet_stairs_minutes_min integer not null default 20,
  add column if not exists carpet_stairs_minutes_max integer not null default 30,
  add column if not exists carpet_stair_step_cap integer not null default 14,
  add column if not exists carpet_closet_minutes_min integer not null default 5,
  add column if not exists carpet_closet_minutes_max integer not null default 10,
  add column if not exists carpet_heavy_minutes_min integer not null default 10,
  add column if not exists carpet_heavy_minutes_max integer not null default 30,
  add column if not exists condition_maintained_factor numeric(6,3) not null default 1,
  add column if not exists condition_attention_factor numeric(6,3) not null default 1.2,
  add column if not exists condition_heavy_factor numeric(6,3) not null default 1.45,
  add column if not exists condition_very_heavy_factor numeric(6,3) not null default 1.75,
  add column if not exists detail_maintained_min integer not null default 10,
  add column if not exists detail_maintained_max integer not null default 10,
  add column if not exists detail_attention_min integer not null default 15,
  add column if not exists detail_attention_max integer not null default 20,
  add column if not exists detail_heavy_min integer not null default 25,
  add column if not exists detail_heavy_max integer not null default 35,
  add column if not exists detail_very_heavy_min integer not null default 40,
  add column if not exists detail_very_heavy_max integer not null default 60,
  add column if not exists window_maintained_min integer not null default 7,
  add column if not exists window_maintained_max integer not null default 10,
  add column if not exists window_attention_min integer not null default 12,
  add column if not exists window_attention_max integer not null default 15,
  add column if not exists window_heavy_min integer not null default 20,
  add column if not exists window_heavy_max integer not null default 25,
  add column if not exists window_very_heavy_min integer not null default 30,
  add column if not exists window_very_heavy_max integer not null default 40,
  add column if not exists wall_manual_quote_quantity integer not null default 3,
  add column if not exists wall_disclaimer text not null default 'Stain and mark removal is not guaranteed. Permanent stains, ink, grease, discoloration, paint transfer, damage, marks absorbed into paint, and delicate or damaged paint finishes may remain or may limit the cleaning method that can safely be used.',
  add column if not exists carpet_disclaimer text not null default 'Professional carpet cleaning improves soil removal and appearance, but stain, odour and discoloration removal is not guaranteed. Specialty stain or pet treatment may require assessment and additional charges.',
  add column if not exists near_included_message text not null default 'Your customized cleaning is estimated to use most of the included 4 man-hours. You can keep adding the areas that matter to you. If additional cleaning time is likely, we’ll include it in your estimate below.',
  add column if not exists exceeded_included_message text not null default 'Your selected cleaning is estimated to need some additional time beyond the included 4 man-hours. We’ve updated the estimated cleaning time below. You can continue customizing or choose your priority areas.',
  add column if not exists fixed_time_disclaimer text not null default 'This is a time-based service. The team will work through your selected priorities during the booked time. Completion of every selected item is not guaranteed within a fixed time allowance.',
  add column if not exists consent_terms jsonb not null default '["Estimated time is based on the information and selections provided during booking.","Actual cleaning time may be less or more depending on condition, buildup, clutter, accessibility, materials and the amount of work required.","For fixed-time bookings, selected priority areas are addressed first and completion of every selected task is not guaranteed within the booked time.","Spot, stain, wall-mark, carpet-stain and odour removal cannot be guaranteed.","Additional services or extra time are charged only according to the booking authorization and Camz policy shown at checkout.","Customer should identify delicate, damaged, specialty or restricted surfaces before work begins."]'::jsonb;

update public.cleaning_estimator_settings set version='camz-estimator-2026-09-v2' where id=true;

alter table public.cleaning_estimator_settings
  alter column carpet_setup_minutes_min set default 30,
  alter column carpet_setup_minutes_max set default 45;

update public.cleaning_estimator_settings
set carpet_setup_minutes_min=30,carpet_setup_minutes_max=45
where carpet_setup_minutes_min=20 and carpet_setup_minutes_max=30;

alter table public.cleaning_estimator_tasks
  add column if not exists description text,
  add column if not exists pricing_type text not null default 'labour_minutes',
  add column if not exists included_in_base_template boolean not null default false,
  add column if not exists price_mode_visible boolean not null default true,
  add column if not exists requires_disclaimer boolean not null default false,
  add column if not exists service_types text[] not null default array['professional_cleaning']::text[],
  add column if not exists condition_profile text;

update public.cleaning_estimator_tasks set included_in_base_template=baseline,requires_disclaimer=wall_disclaimer;
update public.cleaning_estimator_tasks set minutes_min=10,minutes_max=10,condition_profile='detail' where task_id in ('bed_blinds','common_blinds');

insert into public.cleaning_estimator_tasks
  (task_id,category,phase,label,minutes_min,minutes_max,quantity_basis,baseline,included_in_base_template,default_quantity,price_mode_visible,customer_visible,admin_active,sort_order,condition_profile)
values
  ('bed_windows','bedroom','detail','Clean interior window glass',7,10,'item',false,false,1,true,true,true,65,'window'),
  ('common_windows','common','detail','Clean interior window glass',7,10,'item',false,false,4,true,true,true,435,'window')
on conflict (task_id) do update set minutes_min=excluded.minutes_min,minutes_max=excluded.minutes_max,condition_profile=excluded.condition_profile;

create table if not exists public.cleaning_estimator_recommendations (
  rule_id text primary key,
  trigger_type text not null check (trigger_type in ('kitchen','bedroom_carpet','pets','move_out','bathroom','basement')),
  title text not null,description text not null,task_ids text[] not null default '{}',
  enables_carpet boolean not null default false,customer_visible boolean not null default true,
  admin_active boolean not null default true,sort_order integer not null default 0,updated_at timestamptz not null default now()
);

insert into public.cleaning_estimator_recommendations(rule_id,trigger_type,title,description,task_ids,enables_carpet,sort_order) values
('kitchen_detail','kitchen','Add appliance and kitchen detailing','Complete the kitchen with oven, fridge, cabinets, backsplash and wall-mark options.',array['kit_oven','kit_fridge','kit_cabinets','kit_backsplash','kit_wall_spot'],false,10),
('bedroom_carpet','bedroom_carpet','Complete the bedroom detailing','Add a deeper carpet clean plus baseboards, blinds and accessible wall marks.',array['bed_baseboards','bed_blinds','bed_wall_spot'],true,20),
('pets','pets','Add pet-focused detailing','Add pet-hair labour and, where needed, a carpet stain or odour assessment.',array['common_pet_hair'],true,30),
('move_out','move_out','Add move-out essentials','Add cabinet and appliance interiors, walls, carpet steam and interior windows.',array['kit_cabinets','kit_oven','kit_fridge','kit_wall_full','common_windows'],true,40),
('bathroom_detail','bathroom','Complete the bathroom detailing','Add grout, buildup, baseboards and accessible wall-mark attention.',array['bath_grout','bath_soap','bath_baseboards','bath_wall_spot'],false,50),
('basement_detail','basement','Add a deeper basement clean','Add carpet steam where applicable, detailed stairs and common-area finishing.',array['basement_stairs','basement_baseboards','common_baseboards'],true,60)
on conflict (rule_id) do nothing;

alter table public.cleaning_estimator_recommendations enable row level security;
drop policy if exists "Public can read estimator recommendations" on public.cleaning_estimator_recommendations;
drop policy if exists "Admins manage estimator recommendations" on public.cleaning_estimator_recommendations;
create policy "Public can read estimator recommendations" on public.cleaning_estimator_recommendations for select to anon,authenticated using (customer_visible and admin_active);
create policy "Admins manage estimator recommendations" on public.cleaning_estimator_recommendations for all to authenticated using (public.is_admin()) with check (public.is_admin());

create table if not exists public.cleaning_estimator_events (
  id bigint generated by default as identity primary key,session_id uuid,event_name text not null,
  mode text,details jsonb not null default '{}'::jsonb,created_at timestamptz not null default now()
);
alter table public.cleaning_estimator_events enable row level security;
drop policy if exists "Public records estimator events" on public.cleaning_estimator_events;
drop policy if exists "Admins read estimator events" on public.cleaning_estimator_events;
create policy "Public records estimator events" on public.cleaning_estimator_events for insert to anon,authenticated with check (event_name in ('mode_selected','mode_switched','step_view','recommendation_accepted','recommendation_dismissed','budget_selected','submitted'));
create policy "Admins read estimator events" on public.cleaning_estimator_events for select to authenticated using (public.is_admin());

alter table public.custom_cleaning_requests
  add column if not exists actual_general_minutes integer,
  add column if not exists actual_task_minutes jsonb,
  add column if not exists estimator_error_percent numeric(8,2),
  add column if not exists completed_at timestamptz;

drop policy if exists "Admins update custom cleaning estimates" on public.custom_cleaning_requests;
create policy "Admins update custom cleaning estimates"
  on public.custom_cleaning_requests for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
