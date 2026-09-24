-- Phase 1: database-driven cleaning pricing configuration
-- Apply this migration before opening /admin-dashboard/pricing-settings.

create table if not exists public.cleaning_pricing_config (
  id text primary key,
  config jsonb not null,
  version integer not null default 1 check (version >= 1),
  updated_at timestamptz not null default now(),
  updated_by uuid null references auth.users(id) on delete set null,
  constraint cleaning_pricing_config_singleton check (id = 'default')
);

alter table public.cleaning_pricing_config enable row level security;

drop policy if exists "Public can read cleaning pricing" on public.cleaning_pricing_config;
create policy "Public can read cleaning pricing"
on public.cleaning_pricing_config
for select
to anon, authenticated
using (true);

drop policy if exists "Admins can insert cleaning pricing" on public.cleaning_pricing_config;
create policy "Admins can insert cleaning pricing"
on public.cleaning_pricing_config
for insert
to authenticated
with check (
  exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.role::text = 'admin'
      and coalesce(u.is_blocked, false) = false
  )
);

drop policy if exists "Admins can update cleaning pricing" on public.cleaning_pricing_config;
create policy "Admins can update cleaning pricing"
on public.cleaning_pricing_config
for update
to authenticated
using (
  exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.role::text = 'admin'
      and coalesce(u.is_blocked, false) = false
  )
)
with check (
  exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.role::text = 'admin'
      and coalesce(u.is_blocked, false) = false
  )
);

grant select on public.cleaning_pricing_config to anon, authenticated;
grant insert, update on public.cleaning_pricing_config to authenticated;

insert into public.cleaning_pricing_config (id, config, version, updated_at)
values (
  'default',
  $pricing${
  "schemaVersion": 1,
  "currency": "CAD",
  "tax": {
    "enabled": true,
    "label": "GST",
    "rate": 0.05
  },
  "services": {
    "standard": {
      "id": "standard",
      "name": "Standard Cleaning",
      "enabled": true,
      "startingPriceCents": 9900,
      "customScope": { "enabled": true, "minimumChargeCents": 9900 },
      "packages": [
        {
          "id": "essential_standard",
          "name": "Essential Standard Clean",
          "description": "1 bedroom, 1 full bathroom, 1 kitchen and 1 living area.",
          "basePriceCents": 9900,
          "allowances": {
            "bedrooms": 1,
            "fullBathrooms": 1,
            "halfBathrooms": 0,
            "kitchens": 1,
            "livingRooms": 1,
            "finishedBasement": 0,
            "stairFlights": 0
          },
          "customerSelectable": true,
          "customQuote": false
        },
        {
          "id": "standard_2bed_1bath",
          "name": "Standard 2 Bed / 1 Bath",
          "description": "Internal pricing tier used for the documented 2 bedroom + 1 bathroom price step.",
          "basePriceCents": 12900,
          "allowances": {
            "bedrooms": 2,
            "fullBathrooms": 1,
            "halfBathrooms": 0,
            "kitchens": 1,
            "livingRooms": 1,
            "finishedBasement": 0,
            "stairFlights": 0
          },
          "customerSelectable": false,
          "customQuote": false
        },
        {
          "id": "complete_standard",
          "name": "Complete Standard Clean",
          "description": "Up to 2 bedrooms, 2 full bathrooms, 1 kitchen and 1 living area.",
          "basePriceCents": 14900,
          "allowances": {
            "bedrooms": 2,
            "fullBathrooms": 2,
            "halfBathrooms": 0,
            "kitchens": 1,
            "livingRooms": 1,
            "finishedBasement": 0,
            "stairFlights": 0
          },
          "customerSelectable": true,
          "customQuote": false
        }
      ],
      "additionalCharges": {
        "bedrooms": 2000,
        "fullBathrooms": 3000,
        "halfBathrooms": 2000,
        "kitchens": 4000,
        "livingRooms": 2000,
        "finishedBasement": 3000,
        "stairFlights": 1500
      },
      "includedItems": [
        "accessible_dusting",
        "doors_and_handles",
        "switches",
        "window_sills",
        "kitchen_counters",
        "kitchen_backsplash",
        "kitchen_sink",
        "stovetop",
        "appliance_exteriors",
        "general_bathroom_cleaning",
        "garbage_removal",
        "vacuuming_or_sweeping",
        "mopping"
      ]
    },
    "deep": {
      "id": "deep",
      "name": "Deep Cleaning",
      "enabled": true,
      "startingPriceCents": 15900,
      "customScope": { "enabled": true, "minimumChargeCents": 15900 },
      "packages": [
        {
          "id": "deep_1bed_1bath",
          "name": "Deep Clean — 1 Bed / 1 Bath",
          "description": "1 bedroom, 1 bathroom, 1 kitchen and 1 living area.",
          "basePriceCents": 15900,
          "allowances": {
            "bedrooms": 1,
            "fullBathrooms": 1,
            "halfBathrooms": 0,
            "kitchens": 1,
            "livingRooms": 1,
            "finishedBasement": 0,
            "stairFlights": 0
          },
          "customerSelectable": false,
          "customQuote": false
        },
        {
          "id": "deep_2bed_1bath",
          "name": "Deep Clean — 2 Bed / 1 Bath",
          "description": "2 bedrooms, 1 bathroom, 1 kitchen and 1 living area.",
          "basePriceCents": 19900,
          "allowances": {
            "bedrooms": 2,
            "fullBathrooms": 1,
            "halfBathrooms": 0,
            "kitchens": 1,
            "livingRooms": 1,
            "finishedBasement": 0,
            "stairFlights": 0
          },
          "customerSelectable": false,
          "customQuote": false
        },
        {
          "id": "deep_2bed_2bath",
          "name": "Deep Clean — 2 Bed / 2 Bath",
          "description": "2 bedrooms, 2 bathrooms, 1 kitchen and 1 living area.",
          "basePriceCents": 22900,
          "allowances": {
            "bedrooms": 2,
            "fullBathrooms": 2,
            "halfBathrooms": 0,
            "kitchens": 1,
            "livingRooms": 1,
            "finishedBasement": 0,
            "stairFlights": 0
          },
          "customerSelectable": false,
          "customQuote": false
        }
      ],
      "additionalCharges": {
        "bedrooms": 3000,
        "fullBathrooms": 4000,
        "halfBathrooms": 2500,
        "kitchens": 7000,
        "livingRooms": 3000,
        "finishedBasement": 4000,
        "stairFlights": 2000
      },
      "includedItems": [
        "inside_microwave",
        "baseboards",
        "door_frames",
        "detailed_doors_and_switches",
        "edges_and_corners",
        "detailed_tub_shower",
        "bathroom_glass_and_fixtures"
      ]
    },
    "move_in_out": {
      "id": "move_in_out",
      "name": "Move-In / Move-Out Cleaning",
      "enabled": true,
      "startingPriceCents": 19900,
      "customScope": { "enabled": true, "minimumChargeCents": 19900 },
      "packages": [
        {
          "id": "move_studio_1bed_1bath",
          "name": "Studio / 1 Bed + 1 Bath",
          "description": "Empty-home turnover cleaning for a studio or 1 bedroom / 1 bathroom property.",
          "basePriceCents": 19900,
          "allowances": {
            "bedrooms": 1,
            "fullBathrooms": 1,
            "halfBathrooms": 0,
            "kitchens": 1,
            "livingRooms": 1,
            "finishedBasement": 0,
            "stairFlights": 0
          },
          "customerSelectable": false,
          "customQuote": false
        },
        {
          "id": "move_2bed_2bath",
          "name": "2 Beds + Up to 2 Baths",
          "description": "Move-In / Move-Out base tier for 2 bedrooms and up to 2 full bathrooms.",
          "basePriceCents": 24900,
          "allowances": {
            "bedrooms": 2,
            "fullBathrooms": 2,
            "halfBathrooms": 0,
            "kitchens": 1,
            "livingRooms": 1,
            "finishedBasement": 0,
            "stairFlights": 0
          },
          "customerSelectable": false,
          "customQuote": false
        },
        {
          "id": "move_3bed_2bath",
          "name": "3 Beds + Up to 2 Baths",
          "description": "Move-In / Move-Out base tier for 3 bedrooms and up to 2 full bathrooms.",
          "basePriceCents": 29900,
          "allowances": {
            "bedrooms": 3,
            "fullBathrooms": 2,
            "halfBathrooms": 0,
            "kitchens": 1,
            "livingRooms": 1,
            "finishedBasement": 0,
            "stairFlights": 0
          },
          "customerSelectable": false,
          "customQuote": false
        },
        {
          "id": "move_3bed_3bath",
          "name": "3 Beds + 3 Baths",
          "description": "Move-In / Move-Out base tier for 3 bedrooms and 3 full bathrooms.",
          "basePriceCents": 32900,
          "allowances": {
            "bedrooms": 3,
            "fullBathrooms": 3,
            "halfBathrooms": 0,
            "kitchens": 1,
            "livingRooms": 1,
            "finishedBasement": 0,
            "stairFlights": 0
          },
          "customerSelectable": false,
          "customQuote": false
        },
        {
          "id": "move_4bed_3bath",
          "name": "4 Beds + Up to 3 Baths",
          "description": "Move-In / Move-Out base tier for 4 bedrooms and up to 3 full bathrooms.",
          "basePriceCents": 36900,
          "allowances": {
            "bedrooms": 4,
            "fullBathrooms": 3,
            "halfBathrooms": 0,
            "kitchens": 1,
            "livingRooms": 1,
            "finishedBasement": 0,
            "stairFlights": 0
          },
          "customerSelectable": false,
          "customQuote": false
        },
        {
          "id": "move_4bed_4bath",
          "name": "4 Beds + 4 Baths",
          "description": "Move-In / Move-Out base tier for 4 bedrooms and 4 full bathrooms.",
          "basePriceCents": 39900,
          "allowances": {
            "bedrooms": 4,
            "fullBathrooms": 4,
            "halfBathrooms": 0,
            "kitchens": 1,
            "livingRooms": 1,
            "finishedBasement": 0,
            "stairFlights": 0
          },
          "customerSelectable": false,
          "customQuote": false
        }
      ],
      "additionalCharges": {
        "bedrooms": 3000,
        "fullBathrooms": 3000,
        "halfBathrooms": 2000,
        "kitchens": 6000,
        "livingRooms": 2500,
        "finishedBasement": 3500,
        "stairFlights": 1500
      },
      "includedItems": [
        "standard_turnover_cleaning",
        "baseboards",
        "doors_and_door_frames",
        "switches",
        "empty_closets_and_shelves",
        "inside_fridge",
        "inside_oven",
        "inside_microwave",
        "inside_empty_cabinets",
        "cabinet_fronts",
        "accessible_floors"
      ]
    }
  },
  "addOns": [
    {
      "id": "inside_microwave",
      "name": "Inside microwave",
      "priceType": "fixed",
      "priceCents": 1500,
      "unit": null,
      "availableFor": [
        "standard"
      ],
      "includedFor": [
        "deep",
        "move_in_out"
      ],
      "active": true,
      "adminReview": false,
      "note": "Standard only; hidden for Deep and Move-In/Out."
    },
    {
      "id": "inside_fridge",
      "name": "Inside fridge",
      "priceType": "fixed",
      "priceCents": 3500,
      "unit": null,
      "availableFor": [
        "standard",
        "deep"
      ],
      "includedFor": [
        "move_in_out"
      ],
      "active": true,
      "adminReview": false,
      "note": "Hidden for Move-In/Out because it is already included."
    },
    {
      "id": "inside_oven",
      "name": "Inside oven",
      "priceType": "fixed",
      "priceCents": 3500,
      "unit": null,
      "availableFor": [
        "standard",
        "deep"
      ],
      "includedFor": [
        "move_in_out"
      ],
      "active": true,
      "adminReview": false,
      "note": "Hidden for Move-In/Out because it is already included."
    },
    {
      "id": "inside_empty_cabinets",
      "name": "Inside empty cabinets",
      "priceType": "fixed",
      "priceCents": 4000,
      "unit": null,
      "availableFor": [
        "standard",
        "deep"
      ],
      "includedFor": [
        "move_in_out"
      ],
      "active": true,
      "adminReview": false,
      "note": "Hidden for Move-In/Out because it is already included."
    },
    {
      "id": "baseboards",
      "name": "Baseboards",
      "priceType": "from",
      "priceCents": 3500,
      "unit": null,
      "availableFor": [
        "standard"
      ],
      "includedFor": [
        "deep",
        "move_in_out"
      ],
      "active": true,
      "adminReview": false,
      "note": "Standard only; hidden for Deep and Move-In/Out."
    },
    {
      "id": "wet_wipe_blinds",
      "name": "Wet-wipe blinds",
      "priceType": "per_unit",
      "priceCents": 1000,
      "unit": "blind",
      "availableFor": [
        "standard",
        "deep",
        "move_in_out",
        "carpet"
      ],
      "includedFor": [],
      "active": true,
      "adminReview": false,
      "note": "Available for all services."
    },
    {
      "id": "interior_window_glass_tracks",
      "name": "Interior window glass + tracks",
      "priceType": "per_unit",
      "priceCents": 1200,
      "unit": "window",
      "availableFor": [
        "standard",
        "deep",
        "move_in_out",
        "carpet"
      ],
      "includedFor": [],
      "active": true,
      "adminReview": false,
      "note": "Available for all services."
    },
    {
      "id": "bed_linen_change",
      "name": "Bed linen change",
      "priceType": "per_unit",
      "priceCents": 1500,
      "unit": "bed",
      "availableFor": [
        "standard",
        "deep"
      ],
      "includedFor": [],
      "active": true,
      "adminReview": false,
      "note": "Occupied-home services only."
    },
    {
      "id": "dishes",
      "name": "Dishes",
      "priceType": "per_unit",
      "priceCents": 2500,
      "unit": "load",
      "availableFor": [
        "standard",
        "deep"
      ],
      "includedFor": [],
      "active": true,
      "adminReview": false,
      "note": "Standard and Deep only."
    },
    {
      "id": "laundry",
      "name": "Laundry",
      "priceType": "per_unit",
      "priceCents": 3000,
      "unit": "load",
      "availableFor": [
        "standard",
        "deep"
      ],
      "includedFor": [],
      "active": true,
      "adminReview": false,
      "note": "Standard and Deep only."
    },
    {
      "id": "excessive_pet_hair",
      "name": "Excessive pet hair",
      "priceType": "from",
      "priceCents": 4000,
      "unit": null,
      "availableFor": [
        "standard",
        "deep",
        "move_in_out"
      ],
      "includedFor": [],
      "active": true,
      "adminReview": true,
      "note": "Condition dependent."
    },
    {
      "id": "heavy_duty_condition",
      "name": "Heavy-duty condition",
      "priceType": "from",
      "priceCents": 6000,
      "unit": null,
      "availableFor": [
        "standard",
        "deep",
        "move_in_out"
      ],
      "includedFor": [],
      "active": true,
      "adminReview": true,
      "note": "Photo/admin review."
    },
    {
      "id": "hard_water_grout_restoration",
      "name": "Hard-water / grout restoration",
      "priceType": "per_unit",
      "priceCents": 5000,
      "unit": "bathroom",
      "availableFor": [
        "standard",
        "deep",
        "move_in_out"
      ],
      "includedFor": [],
      "active": true,
      "adminReview": true,
      "note": "Restoration-level work."
    },
    {
      "id": "wall_washing",
      "name": "Wall washing",
      "priceType": "per_unit",
      "priceCents": 4000,
      "unit": "room",
      "availableFor": [
        "standard",
        "deep",
        "move_in_out"
      ],
      "includedFor": [],
      "active": true,
      "adminReview": false,
      "note": "Accessible painted walls."
    },
    {
      "id": "balcony_patio_basic",
      "name": "Balcony / patio basic clean",
      "priceType": "from",
      "priceCents": 2500,
      "unit": null,
      "availableFor": [
        "standard",
        "deep",
        "move_in_out"
      ],
      "includedFor": [],
      "active": true,
      "adminReview": true,
      "note": "Size and condition dependent."
    }
  ],
  "carpet": {
    "enabled": true,
    "standaloneMinimumCents": 10000,
    "firstStandardRoomCents": 4500,
    "additionalStandardRoomCents": 3500,
    "largeRoomCents": 5000,
    "hallwayCents": 2500,
    "stairFlightCents": 4000,
    "smallAreaRugCents": 3000,
    "heavyStainAreaCents": 2000,
    "petUrineOdorCustomQuote": true
  },
  "heavyCondition": {
    "enabled": true,
    "showReviewNotice": true,
    "allowPhotoUpload": true,
    "notifyAdmin": true,
    "requiresAdminApproval": true,
    "allowInstantBooking": false
  },
  "customQuote": {
    "enabled": true,
    "bedroomThreshold": 5,
    "unusualLayoutRequiresReview": true,
    "unsafeOrComplexRequiresReview": true,
    "petUrineOdorRequiresQuote": true
  }
}$pricing$::jsonb,
  1,
  now()
)
on conflict (id) do nothing;
