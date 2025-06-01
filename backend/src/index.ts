import express from 'express';
import authRoutes from './routes/auth.routes';

const app = express();

app.use(express.json());
app.use('/auth', authRoutes); // Prefixo /auth

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
