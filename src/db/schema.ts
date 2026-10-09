import { relations } from 'drizzle-orm';
import {
  doublePrecision,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

// 1. Tabela de Usuários (Users)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  name: text('name').notNull(),
  email: text('email').notNull(),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 2. Tabela de Grupos / Tenants (Listas isoladas por tenant)
export const groups = pgTable('groups', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  inviteCode: text('invite_code').notNull().unique(),
  ownerId: integer('owner_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 3. Membros do Grupo / Tenant (Lista interna com ID e Nome do usuário)
export const groupMembers = pgTable('group_members', {
  id: serial('id').primaryKey(),
  groupId: integer('group_id')
    .references(() => groups.id, { onDelete: 'cascade' })
    .notNull(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  role: text('role').default('member').notNull(), // 'owner' | 'member'
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
});

// 4. Locais do Mapa por Grupo / Tenant (com Grade Militar, X, Z, Senha do Code Lock e Loot)
export const groupLocations = pgTable('group_locations', {
  id: serial('id').primaryKey(),
  groupId: integer('group_id')
    .references(() => groups.id, { onDelete: 'cascade' })
    .notNull(),
  createdById: integer('created_by_id')
    .references(() => users.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  category: text('category').default('base').notNull(), // 'base' | 'stash' | 'loot' | 'vehicle' | 'camp' | 'custom'
  militaryGrid: text('military_grid').notNull(), // Grade Militar (ex: K-06, 084 112)
  inGameX: doublePrecision('in_game_x').notNull(), // Coordenada X in-Game
  inGameZ: doublePrecision('in_game_z').notNull(), // Coordenada Z in-Game
  lat: doublePrecision('lat').notNull(), // Coordenada Latitude Leaflet
  lng: doublePrecision('lng').notNull(), // Coordenada Longitude Leaflet
  codeLock: text('code_lock'), // Senha do Code Lock (ex: 4921)
  lootNotes: text('loot_notes'), // Anotações Adicionais de Loot (ex: M4-A1, NVG, Tendas)
  additionalNotes: text('additional_notes'), // Anotações complementares
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relacionamentos Drizzle
export const usersRelations = relations(users, ({ many }) => ({
  ownedGroups: many(groups),
  memberships: many(groupMembers),
  createdLocations: many(groupLocations),
}));

export const groupsRelations = relations(groups, ({ one, many }) => ({
  owner: one(users, {
    fields: [groups.ownerId],
    references: [users.id],
  }),
  members: many(groupMembers),
  locations: many(groupLocations),
}));

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
  group: one(groups, {
    fields: [groupMembers.groupId],
    references: [groups.id],
  }),
  user: one(users, {
    fields: [groupMembers.userId],
    references: [users.id],
  }),
}));

export const groupLocationsRelations = relations(groupLocations, ({ one }) => ({
  group: one(groups, {
    fields: [groupLocations.groupId],
    references: [groups.id],
  }),
  createdBy: one(users, {
    fields: [groupLocations.createdById],
    references: [users.id],
  }),
}));
