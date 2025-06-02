import { Router } from 'express';
import {
  getAllMessagesController,
  getConversationController,
  getMessageByIdController,
  createMessageController,
  updateMessageController,
  deleteMessageController
} from '../controllers/message.controller';

import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Todas as rotas exigem autenticação
router.use(authMiddleware);

// Listar todas mensagens relacionadas ao usuário logado
router.get('/', getAllMessagesController);

// Listar conversa entre o usuário logado e outro usuário
router.get('/conversation/:userId', getConversationController);

// Buscar uma mensagem específica
router.get('/:id', getMessageByIdController);

// Criar nova mensagem (sender = usuário logado)
router.post('/', createMessageController);

// Atualizar mensagem
router.put('/:id', updateMessageController);

// Deletar mensagem
router.delete('/:id', deleteMessageController);

export default router;
