-- ====================================================================
-- INDEPENDENT TABLES
-- ====================================================================

CREATE TABLE nationality (
    code VARCHAR(2) PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE hobby (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(100) NOT NULL
);

-- ====================================================================
--  USER TABLE
-- ====================================================================

CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    avatar TEXT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    age INTEGER,
    nationality VARCHAR(2),
    FOREIGN KEY (nationality) REFERENCES nationality(code)
);

-- ====================================================================
-- JUNCTION TABLE (Many-to-Many)
-- ====================================================================

CREATE TABLE user_hobby (
    user_id INTEGER,
    hobby_id INTEGER,

    PRIMARY KEY (user_id, hobby_id),

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (hobby_id) REFERENCES hobby(id) ON DELETE CASCADE
);