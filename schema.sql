CREATE TABLE alembic_version (
	version_num VARCHAR(32) NOT NULL, 
	CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num)
);

CREATE TABLE property (
	id SERIAL NOT NULL, 
	name VARCHAR(200) NOT NULL, 
	address TEXT NOT NULL, 
	property_type VARCHAR(50) NOT NULL, 
	price_min INTEGER, 
	price_max INTEGER, 
	description TEXT, 
	amenities TEXT, 
	contact_info TEXT, 
	university VARCHAR(50), 
	approved BOOLEAN NOT NULL, 
	nsfas_accredited BOOLEAN NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	CONSTRAINT property_pkey PRIMARY KEY (id)
);

CREATE TABLE "user" (
	id SERIAL NOT NULL, 
	email VARCHAR(120) NOT NULL, 
	password_hash VARCHAR(256), 
	name VARCHAR(100) NOT NULL, 
	university VARCHAR(50) NOT NULL, 
	year_of_study VARCHAR(20), 
	faculty VARCHAR(100), 
	verified BOOLEAN NOT NULL, 
	is_admin BOOLEAN NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	reset_token VARCHAR(100), 
	reset_token_expires TIMESTAMP WITH TIME ZONE, 
	verification_code VARCHAR(6), 
	verification_code_expires TIMESTAMP WITH TIME ZONE, 
	google_id VARCHAR(100), 
	oauth_provider VARCHAR(20), 
	mfa_enabled BOOLEAN DEFAULT false NOT NULL, 
	mfa_secret VARCHAR(64), 
	mfa_backup_codes TEXT, 
	mfa_pending_token VARCHAR(100), 
	mfa_pending_expires TIMESTAMP WITH TIME ZONE, 
	is_super_admin BOOLEAN DEFAULT false NOT NULL, 
	CONSTRAINT user_pkey PRIMARY KEY (id), 
	CONSTRAINT user_google_id_key UNIQUE NULLS DISTINCT (google_id)
);

CREATE TABLE application (
	id SERIAL NOT NULL, 
	user_id INTEGER NOT NULL, 
	reference VARCHAR(20) NOT NULL, 
	first_name VARCHAR(100) NOT NULL, 
	last_name VARCHAR(100) NOT NULL, 
	university VARCHAR(50), 
	student_number VARCHAR(50), 
	form_data TEXT NOT NULL, 
	status VARCHAR(20) NOT NULL, 
	admin_notes TEXT, 
	submitted_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE, 
	CONSTRAINT application_pkey PRIMARY KEY (id), 
	CONSTRAINT application_user_id_fkey FOREIGN KEY(user_id) REFERENCES "user" (id), 
	CONSTRAINT application_reference_key UNIQUE NULLS DISTINCT (reference), 
	CONSTRAINT application_user_id_key UNIQUE NULLS DISTINCT (user_id)
);

CREATE TABLE property_image (
	id SERIAL NOT NULL, 
	property_id INTEGER NOT NULL, 
	image_url VARCHAR(500) NOT NULL, 
	caption VARCHAR(200), 
	is_primary BOOLEAN NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	CONSTRAINT property_image_pkey PRIMARY KEY (id), 
	CONSTRAINT property_image_property_id_fkey FOREIGN KEY(property_id) REFERENCES property (id)
);

CREATE TABLE review (
	id SERIAL NOT NULL, 
	user_id INTEGER NOT NULL, 
	property_id INTEGER NOT NULL, 
	overall_rating INTEGER NOT NULL, 
	value_rating INTEGER, 
	location_rating INTEGER, 
	safety_rating INTEGER, 
	cleanliness_rating INTEGER, 
	management_rating INTEGER, 
	facilities_rating INTEGER, 
	review_text TEXT NOT NULL, 
	pros TEXT, 
	cons TEXT, 
	recommend BOOLEAN NOT NULL, 
	anonymous BOOLEAN NOT NULL, 
	helpful_count INTEGER NOT NULL, 
	approved BOOLEAN NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	CONSTRAINT review_pkey PRIMARY KEY (id), 
	CONSTRAINT review_property_id_fkey FOREIGN KEY(property_id) REFERENCES property (id), 
	CONSTRAINT review_user_id_fkey FOREIGN KEY(user_id) REFERENCES "user" (id), 
	CONSTRAINT uq_review_user_property UNIQUE NULLS DISTINCT (user_id, property_id)
);

CREATE TABLE helpful_vote (
	id SERIAL NOT NULL, 
	review_id INTEGER NOT NULL, 
	user_id INTEGER NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	CONSTRAINT helpful_vote_pkey PRIMARY KEY (id), 
	CONSTRAINT helpful_vote_review_id_fkey FOREIGN KEY(review_id) REFERENCES review (id) ON DELETE CASCADE, 
	CONSTRAINT helpful_vote_user_id_fkey FOREIGN KEY(user_id) REFERENCES "user" (id) ON DELETE CASCADE, 
	CONSTRAINT uq_helpful_vote_review_user UNIQUE NULLS DISTINCT (review_id, user_id)
);

