import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import userPhotoRoutes from './routes/userPhoto.routes';
import messageRoutes from './routes/message.routes';
import inviteRoutes from './routes/invite.routes';
import connectionRoutes from './routes/connection.routes';

const app = express();
app.use(express.json());
app.use(cors());
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/users', userPhotoRoutes);
app.use('/messages', messageRoutes);
app.use('/invites', inviteRoutes);
app.use('/connections', connectionRoutes);

export default app;
