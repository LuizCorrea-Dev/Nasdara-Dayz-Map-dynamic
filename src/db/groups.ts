import { db } from './index.ts';
import { groups, groupMembers, groupLocations, users } from './schema.ts';
import { eq, and, desc } from 'drizzle-orm';
import crypto from 'crypto';

// Helper to generate tactical invite codes (e.g. "NASD-8X2F")
function generateInviteCode(): string {
  const randomChars = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `NSD-${randomChars}`;
}

export async function createGroup(userId: number, name: string) {
  try {
    const inviteCode = generateInviteCode();
    const [newGroup] = await db
      .insert(groups)
      .values({
        name,
        inviteCode,
        ownerId: userId,
      })
      .returning();

    // Auto-add owner as first group member
    await db.insert(groupMembers).values({
      groupId: newGroup.id,
      userId,
      role: 'owner',
    });

    return newGroup;
  } catch (error) {
    console.error('Falha ao criar grupo no Cloud SQL:', error);
    throw new Error('Falha ao registrar novo grupo no banco de dados.', { cause: error });
  }
}

export async function getUserGroups(userId: number) {
  try {
    // Get all groups where the user is a member
    const memberships = await db
      .select({
        groupId: groupMembers.groupId,
        role: groupMembers.role,
        joinedAt: groupMembers.joinedAt,
        groupName: groups.name,
        inviteCode: groups.inviteCode,
        ownerId: groups.ownerId,
        createdAt: groups.createdAt,
      })
      .from(groupMembers)
      .innerJoin(groups, eq(groupMembers.groupId, groups.id))
      .where(eq(groupMembers.userId, userId))
      .orderBy(desc(groups.createdAt));

    // Enrich with members count & locations count
    const enriched = await Promise.all(
      memberships.map(async (m) => {
        const membersList = await getGroupMembers(m.groupId);
        const locationsList = await getGroupLocations(m.groupId);

        return {
          id: m.groupId,
          name: m.groupName,
          inviteCode: m.inviteCode,
          ownerId: m.ownerId,
          role: m.role,
          createdAt: m.createdAt,
          joinedAt: m.joinedAt,
          members: membersList,
          locations: locationsList,
        };
      })
    );

    return enriched;
  } catch (error) {
    console.error('Falha ao listar grupos do usuário no Cloud SQL:', error);
    throw new Error('Falha ao carregar grupos do usuário.', { cause: error });
  }
}

export async function getGroupByInviteCode(inviteCode: string) {
  try {
    const [group] = await db
      .select()
      .from(groups)
      .where(eq(groups.inviteCode, inviteCode.trim().toUpperCase()))
      .limit(1);

    return group || null;
  } catch (error) {
    console.error('Falha ao buscar grupo por código de convite:', error);
    throw new Error('Falha ao consultar código de convite.', { cause: error });
  }
}

export async function joinGroupByInviteCode(userId: number, inviteCode: string) {
  try {
    const group = await getGroupByInviteCode(inviteCode);
    if (!group) {
      throw new Error('Código de convite inválido ou expirado.');
    }

    // Check if already a member
    const existing = await db
      .select()
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, group.id),
          eq(groupMembers.userId, userId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return group; // Already a member
    }

    await db.insert(groupMembers).values({
      groupId: group.id,
      userId,
      role: 'member',
    });

    return group;
  } catch (error) {
    console.error('Falha ao ingressar no grupo:', error);
    throw new Error(error instanceof Error ? error.message : 'Falha ao ingressar no grupo.', { cause: error });
  }
}

export async function getGroupMembers(groupId: number) {
  try {
    const members = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        avatarUrl: users.avatarUrl,
        role: groupMembers.role,
        joinedAt: groupMembers.joinedAt,
      })
      .from(groupMembers)
      .innerJoin(users, eq(groupMembers.userId, users.id))
      .where(eq(groupMembers.groupId, groupId))
      .orderBy(desc(groupMembers.joinedAt));

    return members;
  } catch (error) {
    console.error('Falha ao listar membros do grupo:', error);
    throw new Error('Falha ao listar membros do grupo.', { cause: error });
  }
}

export async function isUserInGroup(userId: number, groupId: number): Promise<boolean> {
  try {
    const result = await db
      .select()
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, groupId),
          eq(groupMembers.userId, userId)
        )
      )
      .limit(1);

    return result.length > 0;
  } catch (error) {
    console.error('Falha ao verificar membro no grupo:', error);
    return false;
  }
}

export async function getGroupLocations(groupId: number) {
  try {
    const locs = await db
      .select({
        id: groupLocations.id,
        groupId: groupLocations.groupId,
        createdById: groupLocations.createdById,
        createdByName: users.name,
        name: groupLocations.name,
        category: groupLocations.category,
        militaryGrid: groupLocations.militaryGrid,
        inGameX: groupLocations.inGameX,
        inGameZ: groupLocations.inGameZ,
        lat: groupLocations.lat,
        lng: groupLocations.lng,
        codeLock: groupLocations.codeLock,
        lootNotes: groupLocations.lootNotes,
        additionalNotes: groupLocations.additionalNotes,
        createdAt: groupLocations.createdAt,
        updatedAt: groupLocations.updatedAt,
      })
      .from(groupLocations)
      .leftJoin(users, eq(groupLocations.createdById, users.id))
      .where(eq(groupLocations.groupId, groupId))
      .orderBy(desc(groupLocations.createdAt));

    return locs;
  } catch (error) {
    console.error('Falha ao listar locais do grupo:', error);
    throw new Error('Falha ao carregar locais do grupo.', { cause: error });
  }
}

export interface AddGroupLocationInput {
  groupId: number;
  userId: number;
  name: string;
  category?: string;
  militaryGrid: string;
  inGameX: number;
  inGameZ: number;
  lat: number;
  lng: number;
  codeLock?: string | null;
  lootNotes?: string | null;
  additionalNotes?: string | null;
}

export async function addGroupLocation(data: AddGroupLocationInput) {
  try {
    const [loc] = await db
      .insert(groupLocations)
      .values({
        groupId: data.groupId,
        createdById: data.userId,
        name: data.name,
        category: data.category || 'base',
        militaryGrid: data.militaryGrid,
        inGameX: data.inGameX,
        inGameZ: data.inGameZ,
        lat: data.lat,
        lng: data.lng,
        codeLock: data.codeLock || null,
        lootNotes: data.lootNotes || null,
        additionalNotes: data.additionalNotes || null,
      })
      .returning();

    return loc;
  } catch (error) {
    console.error('Falha ao adicionar local no grupo:', error);
    throw new Error('Falha ao salvar local no banco de dados.', { cause: error });
  }
}

export async function deleteGroupLocation(locationId: number, groupId: number) {
  try {
    const [deleted] = await db
      .delete(groupLocations)
      .where(
        and(
          eq(groupLocations.id, locationId),
          eq(groupLocations.groupId, groupId)
        )
      )
      .returning();

    return deleted;
  } catch (error) {
    console.error('Falha ao remover local do grupo:', error);
    throw new Error('Falha ao remover local do banco de dados.', { cause: error });
  }
}
