drop table if exists dossier_restricted_area;
create table dossier_restricted_area
(
    dossier_id      bigint not null,
    camera_group_id bigint not null,
    primary key (dossier_id, camera_group_id),
    constraint dossier_restricted_area_ibfk_1
        foreign key (dossier_id) references face_dossier (id),
    constraint dossier_restricted_area_ibfk_2
        foreign key (camera_group_id) references camera_group (id)
);

create index camera_group_id
    on dossier_restricted_area (camera_group_id);


drop table if exists restricted_events;
create table restricted_events
(
    id              int auto_increment
        primary key,
    created_time    datetime                  null,
    dossier_id      int                       null,
    camera_group_id bigint                    null,
    gender          tinyint(1)                null,
    age_range_id    int                    null,
    media_source    varchar(100) charset utf8 null,
    thumb_img       varchar(255) charset utf8 null,
    constraint restricted_events_ibfk_1
        foreign key (age_range_id) references age_range (id)
);

INSERT INTO customer_analysis.restricted_events (id, created_time, dossier_id, camera_group_id, gender, age_range_id, media_source, thumb_img) VALUES (1, '2022-02-26 03:37:05', 1, 46, 0, 2, null, null);
INSERT INTO customer_analysis.restricted_events (id, created_time, dossier_id, camera_group_id, gender, age_range_id, media_source, thumb_img) VALUES (2, '2022-02-18 13:50:07', 2, 43, 0, 3, null, null);
INSERT INTO customer_analysis.restricted_events (id, created_time, dossier_id, camera_group_id, gender, age_range_id, media_source, thumb_img) VALUES (3, '2022-02-26 02:54:23', 5, 43, 1, 3, null, null);
INSERT INTO customer_analysis.restricted_events (id, created_time, dossier_id, camera_group_id, gender, age_range_id, media_source, thumb_img) VALUES (4, '2022-02-16 13:36:38', 5, 41, 0, 2, null, null);
INSERT INTO customer_analysis.restricted_events (id, created_time, dossier_id, camera_group_id, gender, age_range_id, media_source, thumb_img) VALUES (5, '2022-03-02 03:55:02', 6, 29, 0, 2, null, null);
INSERT INTO customer_analysis.restricted_events (id, created_time, dossier_id, camera_group_id, gender, age_range_id, media_source, thumb_img) VALUES (6, '2022-02-28 19:20:22', 7, 27, 1, 3, null, null);
INSERT INTO customer_analysis.restricted_events (id, created_time, dossier_id, camera_group_id, gender, age_range_id, media_source, thumb_img) VALUES (7, '2022-02-23 05:31:45', 7, 27, 1, 3, null, null);
INSERT INTO customer_analysis.restricted_events (id, created_time, dossier_id, camera_group_id, gender, age_range_id, media_source, thumb_img) VALUES (8, '2022-02-27 10:12:42', 10, 40, 1, 5, null, null);
INSERT INTO customer_analysis.restricted_events (id, created_time, dossier_id, camera_group_id, gender, age_range_id, media_source, thumb_img) VALUES (9, '2022-02-23 03:03:18', 10, 28, 1, 5, null, null);
INSERT INTO customer_analysis.restricted_events (id, created_time, dossier_id, camera_group_id, gender, age_range_id, media_source, thumb_img) VALUES (10, '2022-02-17 01:13:27', 12, 30, 0, 3, null, null);
INSERT INTO customer_analysis.restricted_events (id, created_time, dossier_id, camera_group_id, gender, age_range_id, media_source, thumb_img) VALUES (11, '2022-02-27 13:32:28', 10, 36, 0, 3, null, null);
INSERT INTO customer_analysis.restricted_events (id, created_time, dossier_id, camera_group_id, gender, age_range_id, media_source, thumb_img) VALUES (12, '2022-02-28 08:36:59', 16, 32, 0, 5, null, null);
INSERT INTO customer_analysis.restricted_events (id, created_time, dossier_id, camera_group_id, gender, age_range_id, media_source, thumb_img) VALUES (13, '2022-02-28 19:02:35', 17, 32, 1, 3, null, null);
INSERT INTO customer_analysis.restricted_events (id, created_time, dossier_id, camera_group_id, gender, age_range_id, media_source, thumb_img) VALUES (14, '2022-02-28 13:57:03', 18, 38, 1, 3, null, null);
INSERT INTO customer_analysis.restricted_events (id, created_time, dossier_id, camera_group_id, gender, age_range_id, media_source, thumb_img) VALUES (15, '2022-02-26 05:12:34', 19, 28, 0, 3, null, null);
INSERT INTO customer_analysis.restricted_events (id, created_time, dossier_id, camera_group_id, gender, age_range_id, media_source, thumb_img) VALUES (16, '2022-03-01 00:46:41', 20, 28, 1, 2, null, null);
INSERT INTO customer_analysis.restricted_events (id, created_time, dossier_id, camera_group_id, gender, age_range_id, media_source, thumb_img) VALUES (17, '2022-02-22 04:50:50', 21, 31, 1, 2, null, null);
INSERT INTO customer_analysis.restricted_events (id, created_time, dossier_id, camera_group_id, gender, age_range_id, media_source, thumb_img) VALUES (18, '2022-02-21 14:29:10', 22, 35, 0, 3, null, null);
INSERT INTO customer_analysis.restricted_events (id, created_time, dossier_id, camera_group_id, gender, age_range_id, media_source, thumb_img) VALUES (19, '2022-02-25 02:28:23', 23, 34, 0, 3, null, null);
INSERT INTO customer_analysis.restricted_events (id, created_time, dossier_id, camera_group_id, gender, age_range_id, media_source, thumb_img) VALUES (20, '2022-02-16 09:29:28', 25, 27, 1, 3, null, null);

create index age_range_id
    on restricted_events (age_range_id);
