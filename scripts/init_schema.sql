SET CHARACTER_SET_RESULTS = utf8mb4;
SET CHARACTER_SET_CLIENT = utf8mb4;
SET COLLATION_CONNECTION = utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS `doc_solver` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `doc_solver`;

CREATE TABLE IF NOT EXISTS `accounts`
(
    `id`                VARCHAR(191) NOT NULL PRIMARY KEY,
    `userId`            VARCHAR(191) NOT NULL,
    `type`              VARCHAR(191) NOT NULL,
    `provider`          VARCHAR(191) NOT NULL,
    `providerAccountId` VARCHAR(191) NOT NULL,
    `refresh_token`     TEXT         NULL,
    `access_token`      TEXT         NULL,
    `expires_at`        INT          NULL,
    `token_type`        VARCHAR(191) NULL,
    `scope`             VARCHAR(191) NULL,
    `id_token`          TEXT         NULL,
    `session_state`     VARCHAR(191) NULL,
    CONSTRAINT accounts_provider_providerAccountId_key UNIQUE (provider, providerAccountId),
    CONSTRAINT accounts_userId_fkey FOREIGN KEY (userId) REFERENCES users (id) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `users`
(
    `id`            VARCHAR(191) NOT NULL PRIMARY KEY,
    `name`          VARCHAR(191) NULL,
    `email`         VARCHAR(191) NULL,
    `emailVerified` DATETIME(3)  NULL,
    `image`         VARCHAR(191) NULL,
    CONSTRAINT users_email_key UNIQUE (email)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sessions`
(
    `id`           VARCHAR(191) NOT NULL PRIMARY KEY,
    `sessionToken` VARCHAR(191) NOT NULL,
    `userId`       VARCHAR(191) NOT NULL,
    `expires`      DATETIME(3)  NOT NULL,
    CONSTRAINT sessions_sessionToken_key UNIQUE (sessionToken),
    CONSTRAINT sessions_userId_fkey FOREIGN KEY (userId) REFERENCES users (id) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `verification_tokens`
(
    `identifier` VARCHAR(191) NOT NULL,
    `token`      VARCHAR(191) NOT NULL,
    `expires`    DATETIME(3)  NOT NULL,
    CONSTRAINT verification_tokens_identifier_token_key UNIQUE (identifier, token),
    CONSTRAINT verification_tokens_token_key UNIQUE (token)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;



CREATE TABLE IF NOT EXISTS `chunks`
(
    `id`         varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
    `content`    text COLLATE utf8mb4_unicode_ci        NOT NULL,
    `attribute`  json                                   NOT NULL,
    `created_at` timestamp                              NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp                              NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `deleted_at` timestamp                              NULL     DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `chunk_lines`
(
    `id`          VARCHAR(36) NOT NULL,
    `content`     TEXT        NOT NULL,
    `chunk_id`    VARCHAR(36) NOT NULL,
    `rect_info`   JSON        NOT NULL,
    `origin_info` JSON        NOT NULL,
    `attribute`   JSON        NOT NULL,
    `created_at`  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `deleted_at`  TIMESTAMP   NULL     DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `highlights`
(
    `id`         VARCHAR(36) NOT NULL,
    `hs_data`    LONGTEXT    NOT NULL,
    `created_at` TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP   NULL     DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `documents`
(
    `id`         VARCHAR(36)                         NOT NULL PRIMARY KEY,
    `user_id`    VARCHAR(191)                        NOT NULL,
    `object_key` VARCHAR(191)                        NOT NULL,
    `index_name` VARCHAR(191)                        NOT NULL,
    `task_id`    VARCHAR(191)                        NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `deleted_at` TIMESTAMP                           NULL,
    `show_name`  VARCHAR(191)                        NOT NULL,
    CONSTRAINT documents_task_id_key UNIQUE (task_id),
    CONSTRAINT documents_task_id_fkey FOREIGN KEY (task_id) REFERENCES tasks (id) ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `tasks`
(
    `id`          VARCHAR(36)                         NOT NULL PRIMARY KEY,
    `user_id`     VARCHAR(191)                        NOT NULL,
    `task_type`   VARCHAR(191)                        NOT NULL,
    `task_name`   VARCHAR(191)                        NOT NULL,
    `task_status` VARCHAR(191)                        NOT NULL,
    `created_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `updated_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `deleted_at`  TIMESTAMP                           NULL,
    `bq_id`       VARCHAR(191)                        NOT NULL,
    CONSTRAINT tasks_bq_id_key UNIQUE (bq_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
