-- Property managers / managing admins assigned to residences or properties.
-- Run this once on the production PostgreSQL database.

CREATE TABLE IF NOT EXISTS public.property_admin (
    id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL REFERENCES public.property(id) ON DELETE CASCADE,
    admin_user_id INTEGER NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
    assigned_by_user_id INTEGER NULL REFERENCES public."user"(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_property_admin_assignment UNIQUE (property_id, admin_user_id)
);

CREATE INDEX IF NOT EXISTS ix_property_admin_property_id ON public.property_admin(property_id);
CREATE INDEX IF NOT EXISTS ix_property_admin_admin_user_id ON public.property_admin(admin_user_id);

-- Official platform super admin. This mirrors the backend effective-super-admin rule.
UPDATE public."user"
SET is_admin = TRUE,
    is_super_admin = TRUE,
    verified = TRUE
WHERE LOWER(email) = 'info@oneapplyhub.co.za';
