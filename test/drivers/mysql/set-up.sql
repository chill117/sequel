CREATE TABLE IF NOT EXISTS `test_table_1` (
  `id` int(11) unsigned NOT NULL auto_increment,
  `name` varchar(128) NOT NULL,
  `value1` int(11) unsigned NOT NULL,
  `value2` int(11) unsigned NOT NULL,
  `modata` int(11) unsigned,
  `moproblems` varchar(128),
  `a_decimal` decimal(10,2) unsigned,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `test_table_2` (
  `id` int(11) unsigned NOT NULL auto_increment,
  `ref_id` int(11) unsigned NOT NULL,
  `value3` varchar(128),
  `value4` varchar(128),
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `test_table_3` (
  `a_string` varchar(128),
  `a_long_string` text,
  `a_decimal` decimal(20,8) unsigned,
  `an_integer` int(11) unsigned,
  `a_date` datetime,
  `a_currency` decimal(20,8) unsigned,
  `an_array_of_integers` text,
  `an_array_of_strings` text,
  `an_array_of_floats` text,
  `an_array_of_dates` text,
  `an_array_of_currencies` text,
  `an_empty_text_array` text,
  `an_empty_number_array` text,
  `a_read_only_array` text
);

CREATE TABLE IF NOT EXISTS `widgets` (
  `id` int(11) unsigned NOT NULL auto_increment,
  `name` varchar(100),
  `description` text,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
)