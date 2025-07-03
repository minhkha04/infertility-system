CREATE
DATABASE db_infertility_system;
USE
db_infertility_system;

CREATE TABLE email_otp
(
    email       VARCHAR(255) PRIMARY KEY,
    otp         VARCHAR(6) NOT NULL,
    expiry_time DATETIME   NOT NULL
);

CREATE TABLE roles
(
    name        VARCHAR(50) PRIMARY KEY,
    description VARCHAR(255),
    is_removed  BOOLEAN DEFAULT FALSE
);

CREATE TABLE users
(
    id            CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    username      VARCHAR(100) NOT NULL UNIQUE,
    password      VARCHAR(255) NOT NULL,
    full_name     VARCHAR(255),
    email         VARCHAR(255) UNIQUE,
    phone_number  VARCHAR(20),
    gender        VARCHAR(10),
    date_of_birth DATE,
    role_name     VARCHAR(50)  NOT NULL,
    is_removed    BOOLEAN              DEFAULT FALSE,
    is_verified   BOOLEAN              DEFAULT FALSE,
    address       VARCHAR(255),
    avatar_url    VARCHAR(255),
    CONSTRAINT fk_users_role_name FOREIGN KEY (role_name) REFERENCES roles (name) ON UPDATE CASCADE
);

CREATE TABLE doctors
(
    id               CHAR(36) PRIMARY KEY,
    qualifications   TEXT,
    graduation_year YEAR,
    experience_years INT,
    specialty        VARCHAR(255),
    is_public        BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE treatment_service
(
    id              INT PRIMARY KEY AUTO_INCREMENT,
    name            VARCHAR(255) NOT NULL UNIQUE,
    description     TEXT,
    price           DECIMAL(15, 2),
    duration        INT,
    created_by      CHAR(36),
    cover_image_url VARCHAR(255),
    is_remove       BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE treatment_stage
(
    id                 INT PRIMARY KEY AUTO_INCREMENT,
    service_id         INT          NOT NULL,
    name               VARCHAR(255) NOT NULL,
    description        TEXT,
    expected_day_range VARCHAR(50),
    order_index        INT          NOT NULL,
    FOREIGN KEY (service_id) REFERENCES treatment_service (id) ON DELETE CASCADE
);

CREATE TABLE treatment_record
(
    id           INT PRIMARY KEY AUTO_INCREMENT,
    customer_id  CHAR(36) NOT NULL,
    doctor_id    CHAR(36),
    service_id   INT      NOT NULL,
    start_date   DATE     NOT NULL,
    end_date     DATE,
    status       VARCHAR(50),
    created_date DATE,
    cd1_date     DATE,
    FOREIGN KEY (customer_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors (id) ON DELETE SET NULL,
    FOREIGN KEY (service_id) REFERENCES treatment_service (id)
);

CREATE TABLE treatment_step
(
    id         INT PRIMARY KEY AUTO_INCREMENT,
    record_id  INT          NOT NULL,
    stage_id   INT          NOT NULL,
    step_type  VARCHAR(255) NOT NULL,
    start_date DATE,
    end_date   DATE,
    status     VARCHAR(50),
    notes      TEXT,
    UNIQUE (record_id, stage_id),
    FOREIGN KEY (record_id) REFERENCES treatment_record (id) ON DELETE CASCADE,
    FOREIGN KEY (stage_id) REFERENCES treatment_stage (id)
);

CREATE TABLE appointment
(
    id                INT PRIMARY KEY AUTO_INCREMENT,
    customer_id       CHAR(36)    NOT NULL,
    doctor_id         CHAR(36)    NOT NULL,
    appointment_date  DATE        NOT NULL,
    shift             VARCHAR(20) NOT NULL,
    requested_date    DATE,
    requested_shift   VARCHAR(20),
    treatment_step_id INT,
    status            VARCHAR(50),
    notes             TEXT,
    created_at        DATE,
    purpose           TEXT,
    rejected_date     DATE,
    FOREIGN KEY (customer_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors (id) ON DELETE CASCADE,
    FOREIGN KEY (treatment_step_id) REFERENCES treatment_step (id) ON DELETE SET NULL
);

CREATE TABLE payment_transaction
(
    id               INT AUTO_INCREMENT PRIMARY KEY,
    record_id        INT            NOT NULL,
    customer_id      CHAR(36)       NOT NULL,
    payment_method   VARCHAR(50),
    amount           DECIMAL(15, 2) NOT NULL,
    status           VARCHAR(50),
    transaction_code VARCHAR(100),
    created_at       DATETIME,
    expired_at       DATETIME,
    service_id       INT,
    FOREIGN KEY (record_id) REFERENCES treatment_record (id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES treatment_service (id) ON DELETE CASCADE
);

CREATE TABLE reminder
(
    id             INT PRIMARY KEY AUTO_INCREMENT,
    customer_id    CHAR(36) NOT NULL,
    appointment_id INT      NOT NULL,
    message        TEXT     NOT NULL,
    reminder_date  DATE     NOT NULL,
    is_sent        BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (customer_id) REFERENCES users (id),
    FOREIGN KEY (appointment_id) REFERENCES appointment (id)
);

CREATE TABLE feedback
(
    id          INT PRIMARY KEY AUTO_INCREMENT,
    customer_id CHAR(36) NOT NULL,
    doctor_id   CHAR(36),
    service_id  INT,
    rating      INT      NOT NULL,
    comment     TEXT,
    created_at  DATE,
    approved_by CHAR(36),
    approved_at DATE,
    status      VARCHAR(50),
    note        TEXT,
    record_id   INT,
    FOREIGN KEY (customer_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors (id),
    FOREIGN KEY (service_id) REFERENCES treatment_service (id),
    FOREIGN KEY (record_id) REFERENCES treatment_record (id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users (id)
);

CREATE TABLE blog
(
    id               INT PRIMARY KEY AUTO_INCREMENT,
    title            VARCHAR(255) NOT NULL,
    content          TEXT         NOT NULL,
    status           VARCHAR(50)  NOT NULL,
    author_type      VARCHAR(50)  NOT NULL,
    author_id        CHAR(36)     NOT NULL,
    approved_by      CHAR(36),
    cover_image_url  VARCHAR(500),
    source_reference VARCHAR(500),
    created_at       DATE         NOT NULL,
    published_at     DATE,
    note             TEXT,
    FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE work_schedule
(
    id         INT AUTO_INCREMENT PRIMARY KEY,
    doctor_id  CHAR(36)    NOT NULL,
    work_date  DATE        NOT NULL,
    shift      VARCHAR(20) NOT NULL,
    created_by CHAR(36),
    created_at DATE,
    UNIQUE (doctor_id, work_date, shift),
    FOREIGN KEY (doctor_id) REFERENCES doctors (id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
);

CREATE
OR REPLACE VIEW doctor_dashboard_overview AS
SELECT d.id                          AS doctor_id,

       (SELECT ROUND(AVG(f.rating), 1)
        FROM feedback f
        WHERE f.doctor_id = d.id
          AND f.status = 'APPROVED') AS avg_rating,

       (SELECT COUNT(DISTINCT tr.customer_id)
        FROM treatment_record tr
        WHERE tr.doctor_id = d.id)   AS patients,

       (SELECT COUNT(*)
        FROM work_schedule ws
        WHERE ws.doctor_id = d.id
                  AND MONTH (ws.work_date) = MONTH(CURRENT_DATE())
			AND YEAR(ws.work_date) = YEAR(CURRENT_DATE())
	) work_shifts_this_month
FROM doctors d;

CREATE
OR REPLACE VIEW manager_work_statistics_today_view AS
SELECT (SELECT COUNT(*)
        FROM work_schedule
        WHERE work_date = CURRENT_DATE())           AS total_doctors_today,

       (SELECT COUNT(*)
        FROM appointment
        WHERE appointment_date = CURRENT_DATE()
          AND status IN ('CONFIRMED', 'COMPLETED')) AS total_patients_today,

       (SELECT COUNT(*)
        FROM appointment
        WHERE appointment_date = CURRENT_DATE()
          AND status = 'COMPLETED')                 AS completed_patients_today
;

CREATE
OR REPLACE VIEW manager_revenue_overview AS
SELECT (SELECT SUM(pt.amount)
        FROM payment_transaction pt
        WHERE pt.status = 'SUCCESS')         AS total_revenue,
       (SELECT SUM(pt.amount)
        FROM payment_transaction pt
        WHERE pt.status = 'SUCCESS'
          AND pt.created_at >= DATE_FORMAT(CURRENT_DATE, '%Y-%m-01')
          AND pt.created_at <= CURRENT_DATE) AS total_revenue_this_month,
       (SELECT COUNT(DISTINCT u.id)
        FROM users u
                 INNER JOIN treatment_record tr ON u.id = tr.customer_id
        WHERE u.role_name = 'CUSTOMER'
          AND tr.status != 'CANCELLED'
    ) AS total_customers_treated;
