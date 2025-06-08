import multer from 'multer';

const storage = multer.memoryStorage(); // armazena o arquivo em memória

export const upload = multer({ storage });
