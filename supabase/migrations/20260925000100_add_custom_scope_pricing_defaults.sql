-- Add Build Your Own Scope defaults to the existing singleton pricing JSON.
-- Safe for existing production rows: package pricing and all existing values are preserved.

update public.cleaning_pricing_config
set
  config = jsonb_set(
    jsonb_set(
      jsonb_set(
        config,
        '{services,standard,customScope}',
        coalesce(
          config #> '{services,standard,customScope}',
          jsonb_build_object(
            'enabled', true,
            'minimumChargeCents', coalesce((config #>> '{services,standard,startingPriceCents}')::integer, 9900)
          )
        ),
        true
      ),
      '{services,deep,customScope}',
      coalesce(
        config #> '{services,deep,customScope}',
        jsonb_build_object(
          'enabled', true,
          'minimumChargeCents', coalesce((config #>> '{services,deep,startingPriceCents}')::integer, 15900)
        )
      ),
      true
    ),
    '{services,move_in_out,customScope}',
    coalesce(
      config #> '{services,move_in_out,customScope}',
      jsonb_build_object(
        'enabled', true,
        'minimumChargeCents', coalesce((config #>> '{services,move_in_out,startingPriceCents}')::integer, 19900)
      )
    ),
    true
  ),
  version = version + 1,
  updated_at = now()
where id = 'default';
