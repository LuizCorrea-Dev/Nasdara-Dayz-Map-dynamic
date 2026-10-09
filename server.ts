import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import { getOrCreateUser } from './src/db/users.ts';
import {
  createGroup,
  getUserGroups,
  joinGroupByInviteCode,
  getGroupMembers,
  getGroupLocations,
  addGroupLocation,
  deleteGroupLocation,
  isUserInGroup,
  getGroupByInviteCode,
} from './src/db/groups.ts';
import { initSchema } from './src/db/index.ts';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // Auto-verify and bootstrap database tables
  await initSchema();

  // API Routes
  // 1. Get or create current user profile
  app.get('/api/me', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const email = req.user!.email || 'anon@dayz.local';
      const name = req.user!.name || req.user!.email?.split('@')[0] || 'Sobrevivente';
      const avatarUrl = req.user!.picture || undefined;

      const user = await getOrCreateUser(uid, email, name, avatarUrl);
      res.json(user);
    } catch (error: any) {
      console.error('Erro em GET /api/me:', error);
      res.status(500).json({ error: error.message || 'Falha ao sincronizar perfil do usuário' });
    }
  });

  // 2. List all groups for the authenticated user
  app.get('/api/groups', requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = await getOrCreateUser(
        req.user!.uid,
        req.user!.email || '',
        req.user!.name,
        req.user!.picture
      );
      const groups = await getUserGroups(user.id);
      res.json(groups);
    } catch (error: any) {
      console.error('Erro em GET /api/groups:', error);
      res.status(500).json({ error: error.message || 'Falha ao carregar grupos' });
    }
  });

  // 3. Create a new group/tenant
  app.post('/api/groups', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { name } = req.body;
      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ error: 'Nome do grupo é obrigatório' });
      }

      const user = await getOrCreateUser(
        req.user!.uid,
        req.user!.email || '',
        req.user!.name,
        req.user!.picture
      );
      const newGroup = await createGroup(user.id, name.trim());
      res.status(201).json(newGroup);
    } catch (error: any) {
      console.error('Erro em POST /api/groups:', error);
      res.status(500).json({ error: error.message || 'Falha ao criar grupo' });
    }
  });

  // 4. Join group via invite code
  app.post('/api/groups/join', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { inviteCode } = req.body;
      if (!inviteCode || typeof inviteCode !== 'string' || !inviteCode.trim()) {
        return res.status(400).json({ error: 'Código de convite é obrigatório' });
      }

      const user = await getOrCreateUser(
        req.user!.uid,
        req.user!.email || '',
        req.user!.name,
        req.user!.picture
      );
      const joinedGroup = await joinGroupByInviteCode(user.id, inviteCode.trim());
      res.json(joinedGroup);
    } catch (error: any) {
      console.error('Erro em POST /api/groups/join:', error);
      res.status(400).json({ error: error.message || 'Falha ao ingressar no grupo com este código' });
    }
  });

  // 5. Get invite info without joining (preview)
  app.get('/api/invite/:code', async (req, res) => {
    try {
      const group = await getGroupByInviteCode(req.params.code);
      if (!group) {
        return res.status(404).json({ error: 'Código de convite não encontrado' });
      }
      res.json({ id: group.id, name: group.name, inviteCode: group.inviteCode });
    } catch (error: any) {
      res.status(500).json({ error: 'Erro ao validar convite' });
    }
  });

  // 6. Get members of a group
  app.get('/api/groups/:id/members', requireAuth, async (req: AuthRequest, res) => {
    try {
      const groupId = Number(req.params.id);
      const user = await getOrCreateUser(
        req.user!.uid,
        req.user!.email || '',
        req.user!.name,
        req.user!.picture
      );
      const hasAccess = await isUserInGroup(user.id, groupId);
      if (!hasAccess) {
        return res.status(403).json({ error: 'Acesso negado: Você não é membro deste grupo' });
      }

      const members = await getGroupMembers(groupId);
      res.json(members);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Falha ao carregar membros' });
    }
  });

  // 7. Get locations of a group
  app.get('/api/groups/:id/locations', requireAuth, async (req: AuthRequest, res) => {
    try {
      const groupId = Number(req.params.id);
      const user = await getOrCreateUser(
        req.user!.uid,
        req.user!.email || '',
        req.user!.name,
        req.user!.picture
      );
      const hasAccess = await isUserInGroup(user.id, groupId);
      if (!hasAccess) {
        return res.status(403).json({ error: 'Acesso negado: Você não é membro deste grupo' });
      }

      const locations = await getGroupLocations(groupId);
      res.json(locations);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Falha ao carregar locais' });
    }
  });

  // 8. Add location to a group
  app.post('/api/groups/:id/locations', requireAuth, async (req: AuthRequest, res) => {
    try {
      const groupId = Number(req.params.id);
      const user = await getOrCreateUser(
        req.user!.uid,
        req.user!.email || '',
        req.user!.name,
        req.user!.picture
      );
      const hasAccess = await isUserInGroup(user.id, groupId);
      if (!hasAccess) {
        return res.status(403).json({ error: 'Acesso negado: Você não é membro deste grupo' });
      }

      const {
        name,
        category,
        militaryGrid,
        inGameX,
        inGameZ,
        lat,
        lng,
        codeLock,
        lootNotes,
        additionalNotes,
      } = req.body;

      if (!name || inGameX === undefined || inGameZ === undefined || lat === undefined || lng === undefined) {
        return res.status(400).json({ error: 'Nome, coordenadas in-game e coordenadas de mapa são obrigatórias' });
      }

      const newLoc = await addGroupLocation({
        groupId,
        userId: user.id,
        name: String(name).trim(),
        category: category ? String(category) : 'base',
        militaryGrid: militaryGrid ? String(militaryGrid) : '---',
        inGameX: Number(inGameX),
        inGameZ: Number(inGameZ),
        lat: Number(lat),
        lng: Number(lng),
        codeLock: codeLock ? String(codeLock) : null,
        lootNotes: lootNotes ? String(lootNotes) : null,
        additionalNotes: additionalNotes ? String(additionalNotes) : null,
      });

      res.status(201).json(newLoc);
    } catch (error: any) {
      console.error('Erro em POST /api/groups/:id/locations:', error);
      res.status(500).json({ error: error.message || 'Falha ao salvar local no grupo' });
    }
  });

  // 9. Delete location from group
  app.delete('/api/groups/:id/locations/:locId', requireAuth, async (req: AuthRequest, res) => {
    try {
      const groupId = Number(req.params.id);
      const locId = Number(req.params.locId);
      const user = await getOrCreateUser(
        req.user!.uid,
        req.user!.email || '',
        req.user!.name,
        req.user!.picture
      );
      const hasAccess = await isUserInGroup(user.id, groupId);
      if (!hasAccess) {
        return res.status(403).json({ error: 'Acesso negado: Você não é membro deste grupo' });
      }

      await deleteGroupLocation(locId, groupId);
      res.json({ success: true, id: locId });
    } catch (error: any) {
      console.error('Erro em DELETE location:', error);
      res.status(500).json({ error: error.message || 'Falha ao remover local' });
    }
  });

  // Vite Integration
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Servidor Nasdara DayZ] Operando na porta ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Falha crítica ao iniciar servidor:', err);
  process.exit(1);
});
