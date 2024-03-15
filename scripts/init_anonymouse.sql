USE `doc_solver`;
INSERT IGNORE INTO users (`id`, `name`, `email`, `emailVerified`, `image`) 
VALUES ('0000000000000000000000000', 'anonymous', 'anonymous@spotty.com.cn', NULL, 'https://avatars.githubusercontent.com/u/145852804?v=4');



INSERT IGNORE INTO tasks (`id`, `user_id`, `task_type`, `task_name`, `task_status`, `created_at`, `updated_at`,
                          `deleted_at`,
                          `bq_id`)
VALUES ('00000000-0000-0000-0000-000000000000', '0000000000000000000000000', 'ingest', 'ingest-1707134398875', 
        'successed', '2024-02-05 11:59:59', '2024-02-05 11:59:59', NULL, 0);

INSERT IGNORE INTO documents (`id`, `user_id`, `object_key`, `index_name`, `task_id`, `created_at`, `updated_at`, `deleted_at`, `show_name`)
VALUES ('00000000-0000-0000-0000-000000000000', '0000000000000000000000000', 'pdf/17e362e7e5ba6ffb6248c4a2e923e63e',
        'Index_17e362e7e5ba6ffb6248c4a2e923e63e', '00000000-0000-0000-0000-000000000000', '2024-02-05 11:56:20',
        '2024-02-05 11:56:20', NULL, 'Vaswani 等 - 2017 - Attention Is All You Need.pdf');