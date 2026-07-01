ALTER TABLE public."user"
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;
