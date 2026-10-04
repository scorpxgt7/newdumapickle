import { db } from './index.ts';
import { users, playerProfiles, courtOwners } from './schema.ts';
import { eq } from 'drizzle-orm';

export async function getOrCreateUser(
  uid: string,
  email: string,
  fullName?: string,
  role: string = 'player'
) {
  try {
    const result = await db
      .insert(users)
      .values({
        uid,
        email,
        fullName: fullName || email.split('@')[0],
        role,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          ...(fullName ? { fullName } : {}),
          updatedAt: new Date(),
        },
      })
      .returning();

    const user = result[0];

    // Auto-create player profile or court owner record if missing
    if (role === 'player') {
      const existingProfile = await db.query.playerProfiles.findFirst({
        where: eq(playerProfiles.userId, user.id),
      });
      if (!existingProfile) {
        await db.insert(playerProfiles).values({
          userId: user.id,
          skillLevel: '3.0',
        }).onConflictDoNothing();
      }
    } else if (role === 'court_owner') {
      const existingOwner = await db.query.courtOwners.findFirst({
        where: eq(courtOwners.userId, user.id),
      });
      if (!existingOwner) {
        await db.insert(courtOwners).values({
          userId: user.id,
          businessName: fullName ? `${fullName}'s Pickleball Club` : 'Pickleball Venue',
        }).onConflictDoNothing();
      }
    }

    return user;
  } catch (error) {
    console.error('Failed to getOrCreateUser:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}
