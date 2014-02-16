CREATE TABLE IF NOT EXISTS `test_table_1` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(128) COLLATE utf8_bin NOT NULL,
  `value1` int(11) unsigned NOT NULL,
  `value2` int(11) unsigned NOT NULL,
  `modata` int(11) unsigned,
  `moproblems` varchar(128) COLLATE utf8_bin,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

CREATE TABLE IF NOT EXISTS `test_table_2` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `ref_id` int(11) unsigned NOT NULL,
  `value3` varchar(128) COLLATE utf8_bin,
  `value4` varchar(128) COLLATE utf8_bin,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

CREATE TABLE IF NOT EXISTS `test_table_3` (
  `a_string` varchar(128) COLLATE utf8_bin,
  `a_long_string` text COLLATE utf8_bin,
  `a_decimal` decimal(20,8) unsigned,
  `an_integer` int(11) unsigned,
  `a_date` datetime,
  `an_array_of_integers` text COLLATE utf8_bin,
  `an_array_of_strings` text COLLATE utf8_bin,
  `an_array_of_floats` text COLLATE utf8_bin,
  `an_empty_text_array` text COLLATE utf8_bin,
  `an_empty_number_array` text COLLATE utf8_bin
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

CREATE TABLE IF NOT EXISTS `widgets` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8_bin,
  `description` text COLLATE utf8_bin,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_bin