import { Router } from 'express';
import {
  getAllMessagesByConversationController,
  getMessageByIdController,
  createMessageController,
  updateMessageController,
  deleteMessageController
} from '../controllers/message.controller';

import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Todas as rotas exigem autenticação
router.use(authMiddleware);

// Buscar uma mensagem específica
router.get('/:id/messages/:msgId', getMessageByIdController);

// Listar as mensagens de uma conversa
router.get('/:id/messages', getAllMessagesByConversationController);

// Criar nova mensagem (sender = usuário logado)
router.post('/:id/messages', createMessageController);

// Atualizar mensagem
router.put('/:id/messages/:msgId', updateMessageController);

// Deletar mensagem
router.delete('/:id/messages/:msgId', deleteMessageController);

export default router;
