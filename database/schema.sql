-- ============================================================
--  AlphaIT - Base de données
--  Script de création (schema.sql)
--  Moteur : MySQL 8+
-- ============================================================

CREATE DATABASE IF NOT EXISTS alphait_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE alphait_db;

-- ------------------------------------------------------------
-- Table : Utilisateur
-- Tout compte (client ou administrateur) part de cette table.
-- ------------------------------------------------------------
CREATE TABLE Utilisateur (
  id_utilisateur   INT AUTO_INCREMENT PRIMARY KEY,
  nom              VARCHAR(100)  NOT NULL,
  prenom           VARCHAR(100)  NOT NULL,
  email            VARCHAR(150)  NOT NULL UNIQUE,
  mot_de_passe     VARCHAR(255)  NOT NULL,     -- mot de passe haché (bcrypt)
  telephone        VARCHAR(20),
  adresse          VARCHAR(255),
  role             ENUM('admin', 'client') NOT NULL DEFAULT 'client',
  date_creation    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  statut           ENUM('actif', 'inactif') NOT NULL DEFAULT 'actif'
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Table : Client
-- Informations complémentaires propres à un client.
-- ------------------------------------------------------------
CREATE TABLE Client (
  id_client        INT AUTO_INCREMENT PRIMARY KEY,
  id_utilisateur   INT NOT NULL UNIQUE,
  entreprise       VARCHAR(150),
  ville            VARCHAR(100),
  pays             VARCHAR(100),
  CONSTRAINT fk_client_utilisateur
    FOREIGN KEY (id_utilisateur) REFERENCES Utilisateur(id_utilisateur)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Table : Administrateur
-- Informations complémentaires propres à un administrateur.
-- ------------------------------------------------------------
CREATE TABLE Administrateur (
  id_admin         INT AUTO_INCREMENT PRIMARY KEY,
  id_utilisateur   INT NOT NULL UNIQUE,
  fonction         VARCHAR(100),
  CONSTRAINT fk_admin_utilisateur
    FOREIGN KEY (id_utilisateur) REFERENCES Utilisateur(id_utilisateur)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Table : Service
-- Les services proposés par AlphaIT (visibles sur pricing.html).
-- ------------------------------------------------------------
CREATE TABLE Service (
  id_service       INT AUTO_INCREMENT PRIMARY KEY,
  nom_service      VARCHAR(150)  NOT NULL,
  description      TEXT,
  prix             DECIMAL(10,2) NOT NULL,
  categorie        VARCHAR(100),
  image            VARCHAR(255),
  statut           ENUM('actif', 'inactif') NOT NULL DEFAULT 'actif'
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Table : Commande
-- Une commande appartient à un client et regroupe 1+ services.
-- ------------------------------------------------------------
CREATE TABLE Commande (
  id_commande      INT AUTO_INCREMENT PRIMARY KEY,
  id_client        INT NOT NULL,
  date_commande    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  montant_total    DECIMAL(10,2) NOT NULL DEFAULT 0,
  statut           ENUM('en_attente', 'payee', 'annulee') NOT NULL DEFAULT 'en_attente',
  CONSTRAINT fk_commande_client
    FOREIGN KEY (id_client) REFERENCES Client(id_client)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Table : Détail_Commande
-- Table de liaison Commande <-> Service (plusieurs-à-plusieurs).
-- ------------------------------------------------------------
CREATE TABLE Detail_Commande (
  id_detail        INT AUTO_INCREMENT PRIMARY KEY,
  id_commande      INT NOT NULL,
  id_service       INT NOT NULL,
  quantite         INT NOT NULL DEFAULT 1,
  prix             DECIMAL(10,2) NOT NULL,   -- prix au moment de l'achat (historique)
  CONSTRAINT fk_detail_commande
    FOREIGN KEY (id_commande) REFERENCES Commande(id_commande)
    ON DELETE CASCADE,
  CONSTRAINT fk_detail_service
    FOREIGN KEY (id_service) REFERENCES Service(id_service)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Table : Paiement
-- Un paiement est lié à une commande (Stripe ou PayPal).
-- ------------------------------------------------------------
CREATE TABLE Paiement (
  id_paiement      INT AUTO_INCREMENT PRIMARY KEY,
  id_commande      INT NOT NULL,
  montant          DECIMAL(10,2) NOT NULL,
  mode_paiement    ENUM('stripe', 'paypal') NOT NULL,
  transaction_id   VARCHAR(150) NOT NULL UNIQUE,
  date_paiement    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  statut           ENUM('reussi', 'echoue', 'rembourse') NOT NULL DEFAULT 'reussi',
  CONSTRAINT fk_paiement_commande
    FOREIGN KEY (id_commande) REFERENCES Commande(id_commande)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Table : Contact
-- Messages envoyés depuis le formulaire contact.html.
-- ------------------------------------------------------------
CREATE TABLE Contact (
  id_contact       INT AUTO_INCREMENT PRIMARY KEY,
  nom              VARCHAR(100) NOT NULL,
  prenom           VARCHAR(100) NOT NULL,
  email            VARCHAR(150) NOT NULL,
  telephone        VARCHAR(20),
  sujet            VARCHAR(200) NOT NULL,
  message          TEXT NOT NULL,
  date_message     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Table : Témoignage (optionnel, bonus)
-- ------------------------------------------------------------
CREATE TABLE Temoignage (
  id_temoignage    INT AUTO_INCREMENT PRIMARY KEY,
  id_client        INT NOT NULL,
  commentaire      TEXT NOT NULL,
  note             TINYINT NOT NULL CHECK (note BETWEEN 1 AND 5),
  date             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_temoignage_client
    FOREIGN KEY (id_client) REFERENCES Client(id_client)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
--  Données de test (seed) — services de base du cahier des charges
-- ============================================================

INSERT INTO Service (nom_service, description, prix, categorie, statut) VALUES
('Développement Web', 'Création de site web', 800.00, 'Développement', 'actif'),
('Base de données', 'Conception SQL', 500.00, 'Données', 'actif'),
('Sécurité informatique', 'Audit de sécurité', 700.00, 'Sécurité', 'actif');