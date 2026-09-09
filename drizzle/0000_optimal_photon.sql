CREATE TABLE "bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text,
	"user_email" varchar(255) NOT NULL,
	"user_name" varchar(255) NOT NULL,
	"type" varchar(50) NOT NULL,
	"offer_data" jsonb NOT NULL,
	"passenger_data" jsonb NOT NULL,
	"stripe_payment_intent_id" varchar(255),
	"stripe_payment_status" varchar(50),
	"total_amount" integer NOT NULL,
	"currency" varchar(10) DEFAULT 'EUR' NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"provider" varchar(100),
	"provider_offer_id" text,
	"provider_booking_ref" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
