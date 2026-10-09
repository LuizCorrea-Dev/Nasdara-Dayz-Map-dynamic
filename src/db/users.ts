import { db } from './index.ts';
import { users } from './schema.ts';
import { eq } from 'drizzle-orm';

export async function getOrCreateUser(
  uid: string,
  email: string,
  name?: string,
  avatarUrl?: string
) {
  try {
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.uid, uid))
      .limit(1);

    if (existing.length > 0) {
      const user = existing[0];
      // Update name/avatar if provided and changed
      if (
        (name && user.name !== name) ||
        (avatarUrl && user.avatarUrl !== avatarUrl)
      ) {
        const updated = await db
          .update(users)
          .set({
            name: name || user.name,
            avatarUrl: avatarUrl ?? user.avatarUrl,
          })
          .where(eq(users.id, user.id))
          .returning();
        return updated[0];
      }
      return user;
    }

    const inserted = await db
      .insert(users)
      .values({
        uid,
        email,
        name: name || email.split('@')[0],
        avatarUrl: avatarUrl || null,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          name: name || email.split('@')[0],
          avatarUrl: avatarUrl || null,
        },
      })
      .returning();

    return inserted[0];
  } catch (error) {
    console.error('Falha ao obter ou criar usuário no Cloud SQL:', error);
    throw new Error('Falha ao processar dados de usuário no banco de dados.', { cause: error });
  }
}

export async function getUserByUid(uid: string) {
  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.uid, uid))
      .limit(1);
    return result[0] || null;
  } catch (error) {
    console.error('Falha ao buscar usuário no Cloud SQL:', error);
    throw new Error('Falha ao buscar usuário no banco de dados.', { cause: error });
  }
}
