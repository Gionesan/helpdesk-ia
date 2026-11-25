CREATE DATABASE IF NOT EXISTS helpdesk_db
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE helpdesk_db;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS chamados;
DROP TABLE IF EXISTS tecnicos;
DROP TABLE IF EXISTS categorias;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE tecnicos (
  id INT NOT NULL AUTO_INCREMENT,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  telefone VARCHAR(20) NOT NULL,
  especialidade VARCHAR(100) NOT NULL,
  status ENUM('Ativo', 'Inativo') NOT NULL DEFAULT 'Ativo',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_tecnicos_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE categorias (
  id INT NOT NULL AUTO_INCREMENT,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_categorias_nome (nome)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE chamados (
  id INT NOT NULL AUTO_INCREMENT,
  titulo VARCHAR(150) NOT NULL,
  descricao TEXT NOT NULL,
  solicitante VARCHAR(100) NOT NULL,
  email_solicitante VARCHAR(100) NULL,
  telefone_solicitante VARCHAR(20) NULL,
  id_categoria INT NOT NULL,
  id_tecnico INT NULL,
  prioridade ENUM('Baixa', 'Média', 'Alta') NOT NULL DEFAULT 'Média',
  status ENUM('Aberto', 'Em andamento', 'Concluído') NOT NULL DEFAULT 'Aberto',
  data_abertura DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_chamados_status (status),
  KEY idx_chamados_prioridade (prioridade),
  KEY idx_chamados_categoria (id_categoria),
  KEY idx_chamados_tecnico (id_tecnico),
  CONSTRAINT fk_chamados_categoria
    FOREIGN KEY (id_categoria) REFERENCES categorias (id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_chamados_tecnico
    FOREIGN KEY (id_tecnico) REFERENCES tecnicos (id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO tecnicos (nome, email, telefone, especialidade, status, created_at) VALUES
  ('Ana Paula Souza', 'ana.souza@helpdesk.test', '(11) 98888-1001', 'Hardware', 'Ativo', NOW()),
  ('Bruno Oliveira', 'bruno.oliveira@helpdesk.test', '(11) 98888-1002', 'Redes', 'Ativo', NOW()),
  ('Carla Mendes', 'carla.mendes@helpdesk.test', '(11) 98888-1003', 'Sistemas', 'Inativo', NOW());

INSERT INTO categorias (nome, descricao, created_at) VALUES
  ('Hardware', 'Problemas com equipamentos físicos', NOW()),
  ('Software', 'Problemas com programas e aplicativos', NOW()),
  ('Rede e Internet', 'Falhas de conexão e acesso à internet', NOW()),
  ('Impressoras', 'Falhas de impressão e configuração', NOW()),
  ('Sistemas', 'Erros em sistemas internos', NOW()),
  ('Outros', 'Demandas que não se enquadram nas demais categorias', NOW());

INSERT INTO chamados (
  titulo, descricao, solicitante, email_solicitante, telefone_solicitante,
  id_categoria, id_tecnico, prioridade, status, data_abertura, data_atualizacao
) VALUES
  ('Notebook não liga', 'O notebook não inicializa nem acende a tela após pressionar o botão de energia.', 'João Silva', 'joao.silva@empresa.test', '(11) 97777-1001', 1, 1, 'Alta', 'Em andamento', NOW(), NOW()),
  ('Internet muito lenta', 'A conexão com a internet está lenta desde esta manhã em todo o setor.', 'Maria Costa', 'maria.costa@empresa.test', '(11) 97777-1002', 3, 2, 'Média', 'Aberto', NOW(), NOW()),
  ('Impressora com erro de papel', 'A impressora do 2º andar apresenta mensagem de papel atolado.', 'Pedro Alves', 'pedro.alves@empresa.test', '(11) 97777-1003', 4, NULL, 'Baixa', 'Aberto', NOW(), NOW()),
  ('Sistema financeiro indisponível', 'Usuários não conseguem acessar o sistema financeiro após a atualização.', 'Lucia Rocha', 'lucia.rocha@empresa.test', '(11) 97777-1004', 5, 3, 'Alta', 'Concluído', NOW(), NOW()),
  ('Email não envia anexos', 'Não é possível enviar anexos maiores que 5 MB pelo cliente de email.', 'Rafael Lima', 'rafael.lima@empresa.test', '(11) 97777-1005', 2, NULL, 'Média', 'Aberto', NOW(), NOW());
