CREATE TABLE IF NOT EXISTS `test_table_1` (
  `id` INTEGER PRIMARY KEY,
  `name` TEXT NOT NULL,
  `value1` INTEGER NOT NULL,
  `value2` INTEGER NOT NULL,
  `modata` INTEGER,
  `moproblems` TEXT,
  `created_at` TEXT NOT NULL,
  `updated_at` TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS `test_table_2` (
  `id` INTEGER PRIMARY KEY,
  `ref_id` INTEGER NOT NULL,
  `value3` TEXT,
  `value4` TEXT,
  `created_at` TEXT NOT NULL,
  `updated_at` TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS `test_table_3` (
  `id` INTEGER PRIMARY KEY,
  `a_string` TEXT,
  `a_long_string` TEXT,
  `an_integer` INTEGER,
  `a_number` TEXT,
  `a_float` TEXT,
  `a_decimal` TEXT,
  `a_date` TEXT,
  `an_array_of_strings` TEXT,
  `an_array_of_integers` TEXT,
  `an_array_of_numbers` TEXT,
  `an_array_of_floats` TEXT,
  `an_array_of_decimals` TEXT,
  `an_array_of_dates` TEXT,
  `an_empty_text_array` TEXT,
  `an_empty_number_array` TEXT,
  `a_read_only_array` TEXT
);

CREATE TABLE IF NOT EXISTS `widgets` (
  `id` INTEGER PRIMARY KEY,
  `name` TEXT,
  `description` TEXT,
  `created_at` TEXT NOT NULL,
  `updated_at` TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS `parent_table_1` (
  `id` INTEGER PRIMARY KEY,
  `name` TEXT NOT NULL,
  `description` TEXT,
  `created_at` TEXT NOT NULL,
  `updated_at` TEXT NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `child_table_1` (
  `id` INTEGER PRIMARY KEY,
  `parent_id` INTEGER,
  `somevalue1` TEXT,
  `created_at` TEXT NOT NULL,
  `updated_at` TEXT NOT NULL,
  PRIMARY KEY (`id`)
)