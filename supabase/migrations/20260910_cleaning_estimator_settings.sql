create table if not exists public.cleaning_estimator_settings (
  id boolean primary key default true check (id),
  version text not null default 'camz-estimator-2026-09-v1',
  base_price_cents integer not null check (base_price_cents >= 0),
  included_minutes integer not null check (included_minutes > 0),
  extra_hour_cents integer not null check (extra_hour_cents >= 0),
  billing_increment_minutes integer not null check (billing_increment_minutes > 0),
  gst_rate numeric(6,5) not null check (gst_rate >= 0 and gst_rate <= 1),
  carpet_minimum_cents integer not null check (carpet_minimum_cents >= 0),
  carpet_room_cents integer not null check (carpet_room_cents >= 0),
  carpet_hall_cents integer not null check (carpet_hall_cents >= 0),
  carpet_stairs_cents integer not null check (carpet_stairs_cents >= 0),
  carpet_closet_cents integer not null check (carpet_closet_cents >= 0),
  carpet_heavy_from_cents integer not null check (carpet_heavy_from_cents >= 0),
  manual_quote_minutes integer not null check (manual_quote_minutes > 0),
  popup_trigger_minutes integer not null check (popup_trigger_minutes > 0),
  time_mode_enabled boolean not null default true,
  price_mode_enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

insert into public.cleaning_estimator_settings (
  id, version, base_price_cents, included_minutes, extra_hour_cents,
  billing_increment_minutes, gst_rate, carpet_minimum_cents, carpet_room_cents,
  carpet_hall_cents, carpet_stairs_cents, carpet_closet_cents,
  carpet_heavy_from_cents, manual_quote_minutes, popup_trigger_minutes,
  time_mode_enabled, price_mode_enabled
) values (true, 'camz-estimator-2026-09-v1', 17900, 240, 4000, 15, 0.05, 10000, 4000, 2500, 5000, 1500, 2500, 600, 210, true, true)
on conflict (id) do nothing;

create table if not exists public.cleaning_estimator_tasks (
  task_id text primary key,
  category text not null check (category in ('bedroom','bathroom','kitchen','common','basement')),
  phase text not null check (phase in ('base','detail')),
  label text not null,
  minutes_min integer not null check (minutes_min >= 0),
  minutes_max integer not null check (minutes_max >= minutes_min),
  quantity_basis text not null check (quantity_basis in ('bedrooms','bathrooms','property','basement','item')),
  baseline boolean not null default false,
  helper text,
  wall_disclaimer boolean not null default false,
  default_quantity integer,
  customer_visible boolean not null default true,
  admin_active boolean not null default true,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

insert into public.cleaning_estimator_tasks
  (task_id,category,phase,label,minutes_min,minutes_max,quantity_basis,baseline,helper,wall_disclaimer,default_quantity,sort_order)
values
('bed_dust','bedroom','base','General dusting and accessible surfaces',8,12,'bedrooms',true,null,false,null,10),
('bed_vacuum','bedroom','base','Vacuum flooring',5,10,'bedrooms',true,null,false,null,20),
('bed_mop','bedroom','base','Mop hard flooring',5,8,'bedrooms',false,null,false,null,30),
('bed_furniture','bedroom','base','Wipe accessible furniture surfaces',5,10,'bedrooms',true,null,false,null,40),
('bed_baseboards','bedroom','detail','Detail baseboards',8,12,'bedrooms',false,null,false,null,50),
('bed_sills','bedroom','detail','Clean window sills and ledges',3,5,'item',false,null,false,1,60),
('bed_blinds','bedroom','detail','Detail blinds',5,10,'item',false,null,false,1,70),
('bed_doors','bedroom','detail','Wipe doors and frames',3,6,'bedrooms',false,null,false,null,80),
('bed_closet','bedroom','detail','Clean accessible empty closet interior',10,20,'item',false,'Closet must be empty and accessible.',false,1,90),
('bed_wall_spot','bedroom','detail','Spot-clean accessible wall marks',15,30,'item',false,null,true,1,100),
('bed_wall_full','bedroom','detail','Full wall washing',30,60,'item',false,'Large or heavily soiled walls may require assessment.',true,1,110),
('bath_toilet','bathroom','base','Clean and disinfect toilet',7,10,'bathrooms',true,null,false,null,120),
('bath_sink','bathroom','base','Clean sink, vanity and counter',7,10,'bathrooms',true,null,false,null,130),
('bath_mirror','bathroom','base','Clean mirror',3,5,'bathrooms',true,null,false,null,140),
('bath_tub','bathroom','base','Routine tub or shower cleaning',10,15,'bathrooms',true,null,false,null,150),
('bath_floor','bathroom','base','Vacuum and mop bathroom floor',5,8,'bathrooms',true,null,false,null,160),
('bath_cabinets','bathroom','detail','Wipe exterior cabinets',5,8,'bathrooms',false,null,false,null,170),
('bath_baseboards','bathroom','detail','Detail baseboards',5,8,'bathrooms',false,null,false,null,180),
('bath_doors','bathroom','detail','Wipe doors and frames',3,5,'bathrooms',false,null,false,null,190),
('bath_soap','bathroom','detail','Heavy soap scum or mineral buildup',15,30,'item',false,'Apply only to affected bathrooms.',false,1,200),
('bath_grout','bathroom','detail','Detailed grout attention',15,30,'item',false,null,false,1,210),
('bath_wall_spot','bathroom','detail','Spot-clean accessible wall marks',10,20,'item',false,null,true,1,220),
('bath_wall_full','bathroom','detail','Full bathroom wall washing',25,45,'item',false,null,true,1,230),
('kit_surfaces','kitchen','base','Counters and accessible surfaces',8,12,'property',true,null,false,null,240),
('kit_sink','kitchen','base','Clean sink and faucet',5,8,'property',true,null,false,null,250),
('kit_cooktop','kitchen','base','Clean cooktop exterior',8,12,'property',true,null,false,null,260),
('kit_appliances','kitchen','base','Wipe appliance exteriors',8,12,'property',true,null,false,null,270),
('kit_floor','kitchen','base','Vacuum and mop kitchen floor',10,15,'property',true,null,false,null,280),
('kit_backsplash','kitchen','detail','Detail backsplash',5,10,'property',false,null,false,null,290),
('kit_cabinet_fronts','kitchen','detail','Detail cabinet fronts',10,20,'property',false,null,false,null,300),
('kit_baseboards','kitchen','detail','Detail baseboards',8,12,'property',false,null,false,null,310),
('kit_oven','kitchen','detail','Clean inside oven',30,60,'item',false,'Severe carbon buildup may require assessment.',false,1,320),
('kit_fridge','kitchen','detail','Clean inside emptied refrigerator',25,45,'item',false,'Customer removes food before arrival.',false,1,330),
('kit_cabinets','kitchen','detail','Clean inside emptied cabinets',45,90,'property',false,'Cabinets must be empty and accessible.',false,null,340),
('kit_grease','kitchen','detail','Heavy grease or buildup',30,120,'property',false,'Results depend on material and severity.',false,null,350),
('kit_wall_spot','kitchen','detail','Spot-clean accessible wall marks',15,30,'property',false,null,true,null,360),
('kit_wall_full','kitchen','detail','Full kitchen wall washing',30,60,'property',false,null,true,null,370),
('common_living','common','base','Living room general cleaning',25,40,'property',true,null,false,null,380),
('common_dining','common','base','Dining area cleaning',15,25,'property',true,null,false,null,390),
('common_hall','common','base','Hall and entrance cleaning',10,20,'property',true,null,false,null,400),
('common_stairs','common','base','Vacuum and wipe standard staircase',10,20,'item',false,null,false,1,410),
('common_baseboards','common','detail','Detail common-area baseboards',15,30,'property',false,null,false,null,420),
('common_sills','common','detail','Clean window sills',3,5,'item',false,null,false,4,430),
('common_blinds','common','detail','Detail blinds',5,10,'item',false,null,false,4,440),
('common_doors','common','detail','Detail interior doors and frames',3,6,'item',false,null,false,3,450),
('common_wall_spot','common','detail','Spot-clean wall marks in selected area',15,30,'item',false,null,true,1,460),
('common_wall_full','common','detail','Full wall washing in selected area',30,60,'item',false,null,true,1,470),
('common_pet_hair','common','detail','Heavy pet-hair detailing',30,90,'property',false,null,false,null,480),
('basement_general','basement','base','Basement common-area cleaning',30,60,'basement',true,null,false,null,490),
('basement_stairs','basement','detail','Detail basement stairs',10,20,'basement',false,null,false,null,500),
('basement_baseboards','basement','detail','Detail basement baseboards',15,30,'basement',false,null,false,null,510)
on conflict (task_id) do nothing;

alter table public.cleaning_estimator_settings enable row level security;
alter table public.cleaning_estimator_tasks enable row level security;

create policy "Public can read estimator settings" on public.cleaning_estimator_settings
  for select to anon, authenticated using (true);
create policy "Public can read visible estimator tasks" on public.cleaning_estimator_tasks
  for select to anon, authenticated using (customer_visible and admin_active);
create policy "Admins manage estimator settings" on public.cleaning_estimator_settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage estimator tasks" on public.cleaning_estimator_tasks
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

comment on table public.cleaning_estimator_settings is 'Admin-editable pricing and time rules used by the CAMZ checklist estimator.';
comment on table public.cleaning_estimator_tasks is 'Admin-editable customer checklist tasks and labour minute ranges.';
