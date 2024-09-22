import multer from 'multer';
import path, { dirname } from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { AuthenticatedRequest } from './auth.js';

// Obter o diretório atual do arquivo
const __dirname = dirname(fileURLToPath(import.meta.url));

// Caminho absoluto da raiz do projeto (ajustar caso necessário)
const projectRoot = path.resolve(__dirname, '../../');

// Função para criar a pasta se ela não existir
const createFolder = (folderPath: string) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};

// Caminho base absoluto para a pasta de imagens dos usuários
const baseImageFolder = path.join(projectRoot, 'public', 'images');

// Configuração do storage do multer
const storage = multer.diskStorage({
  destination: (req: AuthenticatedRequest, file, cb) => {
    const userId = req.user?.id; // ID do usuário autenticado

    // Caminho completo da pasta específica do usuário
    const userFolderPath = path.join(baseImageFolder, `user-id-${userId}`);
    
    // Cria a pasta do usuário se não existir
    createFolder(userFolderPath);

    // Define o caminho de destino para o multer
    cb(null, userFolderPath);
  },
  filename: (req, file, cb) => {
    // Nome do arquivo no formato `profilePicture-timestamp.ext`
    const filename = `profilePicture-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite de tamanho do arquivo (5 MB)
  fileFilter: (req, file, cb) => {
    // Validar tipo de arquivo
    const fileTypes = /jpeg|jpg|png/;
    const mimetype = fileTypes.test(file.mimetype);
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Erro: Apenas arquivos de imagem são permitidos!"));
  }
}).single('profilePicture');

export default upload;
