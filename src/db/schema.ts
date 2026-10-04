import { relations } from 'drizzle-orm';
import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
  decimal
} from 'drizzle-orm/pg-core';

// 1. Users Table (Core Auth & User Identity)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  fullName: text('full_name'),
  phone: text('phone'),
  role: text('role').notNull().default('player'), // 'player' | 'court_owner' | 'admin'
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 2. Player Profiles Table
export const playerProfiles = pgTable('player_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  skillLevel: text('skill_level').default('3.0'), // '1.0' - '5.5+' (DUPR / Self-rated)
  duprRating: text('dupr_rating'),
  preferredHand: text('preferred_hand').default('right'), // 'right' | 'left' | 'both'
  preferredPlayType: text('preferred_play_type').default('doubles'), // 'singles' | 'doubles' | 'both'
  paddleModel: text('paddle_model'),
  bio: text('bio'),
  totalMatches: integer('total_matches').default(0).notNull(),
  wins: integer('wins').default(0).notNull(),
  losses: integer('losses').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 3. Court Owners / Venues Admin Table
export const courtOwners = pgTable('court_owners', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  businessName: text('business_name').notNull(),
  taxId: text('tax_id'),
  phone: text('phone'),
  payoutAccount: text('payout_account'),
  verifiedStatus: text('verified_status').default('verified').notNull(), // 'pending' | 'verified' | 'rejected'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 4. Venues / Facilities Table
export const venues = pgTable('venues', {
  id: serial('id').primaryKey(),
  ownerId: integer('owner_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  description: text('description'),
  address: text('address').notNull(),
  city: text('city').notNull(),
  state: text('state').notNull(),
  zipCode: text('zip_code').notNull(),
  latitude: text('latitude'),
  longitude: text('longitude'),
  amenities: text('amenities'), // Comma-separated list or JSON e.g. "Lighting, Pro Shop, Restrooms, Equipment Rental"
  parkingInfo: text('parking_info'),
  operatingHours: text('operating_hours'),
  imageUrl: text('image_url'),
  status: text('status').default('active').notNull(), // 'active' | 'maintenance' | 'closed'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 5. Courts Table
export const courts = pgTable('courts', {
  id: serial('id').primaryKey(),
  venueId: integer('venue_id')
    .references(() => venues.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(), // e.g. "Court 1 - Championship Indoor"
  surfaceType: text('surface_type').default('acrylic').notNull(), // 'acrylic' | 'asphalt' | 'cushioned' | 'wood'
  courtType: text('court_type').default('outdoor').notNull(), // 'indoor' | 'outdoor'
  hasLighting: boolean('has_lighting').default(true).notNull(),
  hourlyRateCents: integer('hourly_rate_cents').default(2000).notNull(), // Hourly price in cents (e.g., 2000 = $20.00)
  status: text('status').default('active').notNull(), // 'active' | 'maintenance' | 'closed'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 6. Court Schedules / Operating Windows
export const courtSchedules = pgTable('court_schedules', {
  id: serial('id').primaryKey(),
  courtId: integer('court_id')
    .references(() => courts.id, { onDelete: 'cascade' })
    .notNull(),
  dayOfWeek: integer('day_of_week').notNull(), // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  openTime: text('open_time').notNull(), // "08:00"
  closeTime: text('close_time').notNull(), // "22:00"
  hourlyRateOverrideCents: integer('hourly_rate_override_cents'),
  isBlocked: boolean('is_blocked').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 7. Court Bookings Table
export const bookings = pgTable('bookings', {
  id: serial('id').primaryKey(),
  courtId: integer('court_id')
    .references(() => courts.id, { onDelete: 'cascade' })
    .notNull(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  bookingDate: text('booking_date').notNull(), // "YYYY-MM-DD"
  startTime: text('start_time').notNull(), // "10:00"
  endTime: text('end_time').notNull(), // "11:30"
  totalPriceCents: integer('total_price_cents').notNull(),
  status: text('status').default('confirmed').notNull(), // 'pending' | 'confirmed' | 'cancelled' | 'completed'
  paymentStatus: text('payment_status').default('paid').notNull(), // 'unpaid' | 'paid' | 'refunded'
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 8. Matchmaking / Play Events Table (Open Play, Tournaments)
export const playEvents = pgTable('play_events', {
  id: serial('id').primaryKey(),
  venueId: integer('venue_id')
    .references(() => venues.id, { onDelete: 'cascade' })
    .notNull(),
  courtId: integer('court_id')
    .references(() => courts.id, { onDelete: 'set null' }),
  organizerId: integer('organizer_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  title: text('title').notNull(),
  eventType: text('event_type').default('open_play').notNull(), // 'open_play' | 'competitive' | 'round_robin' | 'tournament'
  description: text('description'),
  eventDate: text('event_date').notNull(), // "YYYY-MM-DD"
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
  skillLevelTarget: text('skill_level_target').default('All Levels').notNull(),
  maxPlayers: integer('max_players').default(4).notNull(),
  costPerPlayerCents: integer('cost_per_player_cents').default(0).notNull(),
  status: text('status').default('open').notNull(), // 'open' | 'full' | 'completed' | 'cancelled'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 9. Play Event Participants Table
export const eventParticipants = pgTable('event_participants', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id')
    .references(() => playEvents.id, { onDelete: 'cascade' })
    .notNull(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  status: text('status').default('joined').notNull(), // 'joined' | 'waitlisted' | 'cancelled'
  paymentStatus: text('payment_status').default('paid').notNull(),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
});

// 10. Court & Venue Reviews Table
export const courtReviews = pgTable('court_reviews', {
  id: serial('id').primaryKey(),
  venueId: integer('venue_id')
    .references(() => venues.id, { onDelete: 'cascade' })
    .notNull(),
  courtId: integer('court_id')
    .references(() => courts.id, { onDelete: 'set null' }),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  ratingCourtQuality: integer('rating_court_quality').notNull(), // 1 - 5
  ratingLighting: integer('rating_lighting').notNull(), // 1 - 5
  ratingParking: integer('rating_parking').notNull(), // 1 - 5
  ratingCrowding: integer('rating_crowding').notNull(), // 1 - 5
  overallRating: decimal('overall_rating', { precision: 3, scale: 2 }).notNull(),
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 11. Payments & Transactions Table
export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  bookingId: integer('booking_id')
    .references(() => bookings.id, { onDelete: 'set null' }),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  amountCents: integer('amount_cents').notNull(),
  currency: text('currency').default('USD').notNull(),
  paymentMethod: text('payment_method').default('credit_card').notNull(),
  transactionRef: text('transaction_ref'),
  status: text('status').default('completed').notNull(), // 'pending' | 'completed' | 'failed' | 'refunded'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// --- DRIZZLE RELATIONS DEFINITIONS ---

export const usersRelations = relations(users, ({ one, many }) => ({
  playerProfile: one(playerProfiles, {
    fields: [users.id],
    references: [playerProfiles.userId],
  }),
  courtOwner: one(courtOwners, {
    fields: [users.id],
    references: [courtOwners.userId],
  }),
  venues: many(venues),
  bookings: many(bookings),
  organizedEvents: many(playEvents),
  eventParticipations: many(eventParticipants),
  reviews: many(courtReviews),
  payments: many(payments),
}));

export const playerProfilesRelations = relations(playerProfiles, ({ one }) => ({
  user: one(users, {
    fields: [playerProfiles.userId],
    references: [users.id],
  }),
}));

export const courtOwnersRelations = relations(courtOwners, ({ one }) => ({
  user: one(users, {
    fields: [courtOwners.userId],
    references: [users.id],
  }),
}));

export const venuesRelations = relations(venues, ({ one, many }) => ({
  owner: one(users, {
    fields: [venues.ownerId],
    references: [users.id],
  }),
  courts: many(courts),
  playEvents: many(playEvents),
  reviews: many(courtReviews),
}));

export const courtsRelations = relations(courts, ({ one, many }) => ({
  venue: one(venues, {
    fields: [courts.venueId],
    references: [venues.id],
  }),
  schedules: many(courtSchedules),
  bookings: many(bookings),
  playEvents: many(playEvents),
  reviews: many(courtReviews),
}));

export const courtSchedulesRelations = relations(courtSchedules, ({ one }) => ({
  court: one(courts, {
    fields: [courtSchedules.courtId],
    references: [courts.id],
  }),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  court: one(courts, {
    fields: [bookings.courtId],
    references: [courts.id],
  }),
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  payments: many(payments),
}));

export const playEventsRelations = relations(playEvents, ({ one, many }) => ({
  venue: one(venues, {
    fields: [playEvents.venueId],
    references: [venues.id],
  }),
  court: one(courts, {
    fields: [playEvents.courtId],
    references: [courts.id],
  }),
  organizer: one(users, {
    fields: [playEvents.organizerId],
    references: [users.id],
  }),
  participants: many(eventParticipants),
}));

export const eventParticipantsRelations = relations(eventParticipants, ({ one }) => ({
  event: one(playEvents, {
    fields: [eventParticipants.eventId],
    references: [playEvents.id],
  }),
  user: one(users, {
    fields: [eventParticipants.userId],
    references: [users.id],
  }),
}));

export const courtReviewsRelations = relations(courtReviews, ({ one }) => ({
  venue: one(venues, {
    fields: [courtReviews.venueId],
    references: [venues.id],
  }),
  court: one(courts, {
    fields: [courtReviews.courtId],
    references: [courts.id],
  }),
  user: one(users, {
    fields: [courtReviews.userId],
    references: [users.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  booking: one(bookings, {
    fields: [payments.bookingId],
    references: [bookings.id],
  }),
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
}));
