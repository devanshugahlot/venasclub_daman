-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 24, 2024 at 12:06 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `aaclub`
--

-- --------------------------------------------------------

--
-- Table structure for table `5d`
--

CREATE TABLE `5d` (
  `id` int(11) NOT NULL,
  `period` bigint(20) DEFAULT 0,
  `result` varchar(5) NOT NULL DEFAULT '0',
  `game` int(11) NOT NULL DEFAULT 1,
  `status` int(11) DEFAULT 0,
  `time` varchar(50) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `5d`
--

INSERT INTO `5d` (`id`, `period`, `result`, `game`, `status`, `time`) VALUES
(1, 202407240001, '23521', 10, 1, '1721815594668'),
(2, 202407240001, '0', 10, 0, '1721815594668'),
(3, 202407240001, '23521', 5, 1, '1721815594668'),
(4, 202407240001, '0', 5, 0, '1721815594668'),
(5, 202407240001, '23521', 3, 1, '1721815594668'),
(6, 202407240001, '0', 3, 0, '1721815594668'),
(7, 202407240001, '23521', 1, 1, '1721815594668'),
(8, 202407240001, '0', 1, 0, '1721815594668');

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `id` int(11) NOT NULL,
  `wingo1` varchar(200) NOT NULL DEFAULT '''-1''',
  `wingo3` varchar(200) NOT NULL DEFAULT '''-1''',
  `wingo5` varchar(200) NOT NULL DEFAULT '''-1''',
  `wingo10` varchar(200) NOT NULL DEFAULT '''-1''',
  `k5d` varchar(200) NOT NULL DEFAULT '''\\''-1\\''''',
  `k5d3` varchar(200) NOT NULL DEFAULT '''\\''-1\\''''',
  `k5d5` varchar(200) DEFAULT '''\\''-1\\''''',
  `k5d10` varchar(200) NOT NULL DEFAULT '''\\''-1\\''''',
  `k3d` varchar(200) NOT NULL DEFAULT '''\\''-1\\''''',
  `k3d3` varchar(200) NOT NULL DEFAULT '''\\''-1\\''''',
  `k3d5` varchar(200) NOT NULL DEFAULT '''\\''-1\\''''',
  `k3d10` varchar(200) NOT NULL DEFAULT '''\\''-1\\''''',
  `win_rate` int(11) NOT NULL DEFAULT 0,
  `telegram` varchar(100) NOT NULL DEFAULT '0',
  `cskh` varchar(100) NOT NULL DEFAULT '0',
  `app` varchar(200) DEFAULT '''0''',
  `winning_algorithm` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`id`, `wingo1`, `wingo3`, `wingo5`, `wingo10`, `k5d`, `k5d3`, `k5d5`, `k5d10`, `k3d`, `k3d3`, `k3d5`, `k3d10`, `win_rate`, `telegram`, `cskh`, `app`, `winning_algorithm`) VALUES
(1, '-1', '-1', '-1', '-1', '-1', '-1', '-1', '-1', '-1', '-1', '-1', '-1', 80, 'https://t.me/wewinsanu', 'https://t.me/wewinsanu', '#', 1);

-- --------------------------------------------------------

--
-- Table structure for table `bank_recharge`
--

CREATE TABLE `bank_recharge` (
  `id` int(11) NOT NULL,
  `name_bank` varchar(50) NOT NULL DEFAULT '0',
  `name_user` varchar(100) NOT NULL DEFAULT '0',
  `stk` varchar(100) NOT NULL DEFAULT '0',
  `type` varchar(20) NOT NULL DEFAULT 'bank',
  `time` varchar(30) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `financial_details`
--

CREATE TABLE `financial_details` (
  `id` int(11) NOT NULL,
  `phone` varchar(50) NOT NULL DEFAULT '0',
  `phone_used` varchar(50) NOT NULL DEFAULT '0',
  `money` int(11) NOT NULL DEFAULT 0,
  `type` varchar(50) NOT NULL DEFAULT '0',
  `time` varchar(50) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `k3`
--

CREATE TABLE `k3` (
  `id` int(11) NOT NULL,
  `period` bigint(20) NOT NULL DEFAULT 0,
  `result` int(11) NOT NULL,
  `game` int(11) NOT NULL DEFAULT 1,
  `status` int(11) NOT NULL DEFAULT 0,
  `time` varchar(100) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `k3`
--

INSERT INTO `k3` (`id`, `period`, `result`, `game`, `status`, `time`) VALUES
(1, 202407240001, 235, 10, 1, '1721815594668'),
(2, 202407240001, 0, 10, 0, '1721815594668'),
(3, 202407240001, 235, 5, 1, '1721815594668'),
(4, 202407240001, 0, 5, 0, '1721815594668'),
(5, 202407240001, 235, 3, 1, '1721815594668'),
(6, 202407240001, 0, 3, 0, '1721815594668'),
(7, 202407240001, 235, 1, 1, '1721815594668'),
(8, 202407240001, 0, 1, 0, '1721815594668');

-- --------------------------------------------------------

--
-- Table structure for table `level`
--

CREATE TABLE `level` (
  `id` int(11) NOT NULL,
  `level` int(11) NOT NULL DEFAULT 0,
  `f1` varchar(50) NOT NULL,
  `f2` varchar(50) NOT NULL,
  `f3` varchar(50) NOT NULL,
  `f4` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `level`
--

INSERT INTO `level` (`id`, `level`, `f1`, `f2`, `f3`, `f4`) VALUES
(1, 0, '1.2', '0.9', '0.6', '0.3'),
(2, 1, '1.3', '0.975', '0.65', '0.325'),
(3, 2, '1.4', '1.05', '0.7', '0.35'),
(4, 3, '1.5', '1.125', '0.75', '0.375'),
(5, 4, '1.6', '1.2', '0.8', '0.4'),
(6, 5, '1.7', '1.275', '0.85', '0.425'),
(7, 6, '1.8', '1.35', '0.9', '0.45');

-- --------------------------------------------------------

--
-- Table structure for table `minutes_1`
--

CREATE TABLE `minutes_1` (
  `id` int(11) NOT NULL,
  `id_product` varchar(100) NOT NULL DEFAULT '0',
  `phone` varchar(20) NOT NULL DEFAULT '0',
  `code` varchar(30) NOT NULL DEFAULT '0',
  `invite` varchar(30) NOT NULL DEFAULT '0',
  `stage` varchar(255) NOT NULL DEFAULT '0',
  `result` int(11) NOT NULL DEFAULT 0,
  `more` int(11) NOT NULL DEFAULT 0,
  `level` int(11) NOT NULL DEFAULT 0,
  `money` decimal(10,3) NOT NULL DEFAULT 0.000,
  `amount` int(11) NOT NULL DEFAULT 0,
  `fee` decimal(10,3) NOT NULL DEFAULT 0.000,
  `get` decimal(10,3) NOT NULL DEFAULT 0.000,
  `game` varchar(50) NOT NULL DEFAULT '0',
  `bet` varchar(10) NOT NULL DEFAULT '0',
  `status` int(11) NOT NULL DEFAULT 0,
  `today` varchar(50) NOT NULL DEFAULT '0',
  `time` varchar(30) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `point_list`
--

CREATE TABLE `point_list` (
  `id` int(11) NOT NULL,
  `phone` varchar(50) NOT NULL DEFAULT '0',
  `telegram` varchar(100) NOT NULL DEFAULT '0',
  `money` int(11) NOT NULL DEFAULT 0,
  `money_us` int(11) NOT NULL DEFAULT 0,
  `level` int(11) NOT NULL DEFAULT 0,
  `total1` int(11) NOT NULL DEFAULT 1,
  `total2` int(11) NOT NULL DEFAULT 4,
  `total3` int(11) NOT NULL DEFAULT 5,
  `total4` int(11) NOT NULL DEFAULT 10,
  `total5` int(11) NOT NULL DEFAULT 20,
  `total6` int(11) NOT NULL DEFAULT 25,
  `total7` int(11) NOT NULL DEFAULT 35,
  `today` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `point_list`
--

INSERT INTO `point_list` (`id`, `phone`, `telegram`, `money`, `money_us`, `level`, `total1`, `total2`, `total3`, `total4`, `total5`, `total6`, `total7`, `today`) VALUES
(1, '911', '0', 0, 0, 0, 0, 4, 5, 10, 20, 25, 35, '2024-07-22');

-- --------------------------------------------------------

--
-- Table structure for table `recharge`
--

CREATE TABLE `recharge` (
  `id` int(11) NOT NULL,
  `id_order` varchar(100) NOT NULL DEFAULT '0',
  `transaction_id` varchar(100) NOT NULL DEFAULT '0',
  `phone` varchar(50) NOT NULL DEFAULT '0',
  `money` int(11) NOT NULL DEFAULT 0,
  `type` varchar(10) NOT NULL DEFAULT '0',
  `status` int(11) NOT NULL DEFAULT 0,
  `today` varchar(50) NOT NULL DEFAULT '0',
  `url` text DEFAULT NULL,
  `time` varchar(30) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `redenvelopes`
--

CREATE TABLE `redenvelopes` (
  `id` int(11) NOT NULL,
  `id_redenvelope` varchar(100) NOT NULL DEFAULT '0',
  `phone` varchar(50) NOT NULL DEFAULT '0',
  `money` int(11) NOT NULL DEFAULT 0,
  `used` int(11) NOT NULL DEFAULT 0,
  `amount` int(11) NOT NULL DEFAULT 0,
  `status` int(11) NOT NULL DEFAULT 0,
  `time` varchar(50) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `redenvelopes_used`
--

CREATE TABLE `redenvelopes_used` (
  `id` int(11) NOT NULL,
  `phone` varchar(50) NOT NULL DEFAULT '0',
  `phone_used` varchar(50) NOT NULL DEFAULT '0',
  `id_redenvelops` varchar(50) NOT NULL DEFAULT '0',
  `money` int(11) NOT NULL DEFAULT 0,
  `time` varchar(50) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `result_5d`
--

CREATE TABLE `result_5d` (
  `id` int(11) NOT NULL,
  `id_product` varchar(100) NOT NULL DEFAULT '0',
  `phone` varchar(20) DEFAULT '0',
  `code` varchar(30) NOT NULL DEFAULT '0',
  `invite` varchar(30) NOT NULL DEFAULT '0',
  `stage` bigint(20) DEFAULT 0,
  `result` varchar(5) NOT NULL DEFAULT '0',
  `level` int(11) NOT NULL DEFAULT 0,
  `money` int(11) NOT NULL DEFAULT 0,
  `price` decimal(10,3) NOT NULL DEFAULT 0.000,
  `amount` int(11) NOT NULL DEFAULT 0,
  `fee` decimal(10,3) NOT NULL DEFAULT 0.000,
  `get` decimal(10,3) NOT NULL DEFAULT 0.000,
  `game` int(11) NOT NULL,
  `join_bet` varchar(10) NOT NULL DEFAULT '0',
  `bet` varchar(20) NOT NULL DEFAULT '0',
  `status` int(11) NOT NULL DEFAULT 0,
  `time` varchar(50) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `result_k3`
--

CREATE TABLE `result_k3` (
  `id` int(11) NOT NULL,
  `id_product` varchar(100) NOT NULL DEFAULT '0',
  `phone` varchar(50) NOT NULL DEFAULT '0',
  `code` varchar(50) NOT NULL DEFAULT '0',
  `invite` varchar(50) NOT NULL DEFAULT '0',
  `stage` varchar(50) NOT NULL DEFAULT '0',
  `result` varchar(5) NOT NULL DEFAULT '0',
  `level` int(11) NOT NULL DEFAULT 0,
  `money` int(11) NOT NULL DEFAULT 0,
  `price` int(11) NOT NULL DEFAULT 0,
  `amount` int(11) NOT NULL DEFAULT 0,
  `fee` int(11) NOT NULL DEFAULT 0,
  `get` int(11) NOT NULL DEFAULT 0,
  `game` varchar(5) NOT NULL DEFAULT '0',
  `join_bet` varchar(100) NOT NULL DEFAULT '0',
  `typeGame` varchar(100) NOT NULL DEFAULT '0',
  `bet` varchar(100) NOT NULL DEFAULT '0',
  `status` int(11) NOT NULL DEFAULT 0,
  `time` varchar(50) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roses`
--

CREATE TABLE `roses` (
  `id` int(11) NOT NULL,
  `phone` varchar(50) DEFAULT '0',
  `code` varchar(50) NOT NULL DEFAULT '0',
  `invite` varchar(50) NOT NULL DEFAULT '0',
  `f1` decimal(10,3) NOT NULL DEFAULT 0.000,
  `f2` decimal(10,3) NOT NULL DEFAULT 0.000,
  `f3` decimal(10,3) NOT NULL DEFAULT 0.000,
  `f4` decimal(10,3) NOT NULL DEFAULT 0.000,
  `time` varchar(50) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `id_user` varchar(50) NOT NULL DEFAULT '0',
  `phone` varchar(20) NOT NULL DEFAULT '0',
  `jili_account` text DEFAULT NULL,
  `kingmaker_account` varchar(50) DEFAULT NULL,
  `token` varchar(100) NOT NULL DEFAULT '0',
  `name_user` varchar(50) NOT NULL DEFAULT '0',
  `password` varchar(50) NOT NULL DEFAULT '0',
  `money` decimal(10,3) NOT NULL DEFAULT 0.000,
  `total_money` decimal(10,3) NOT NULL DEFAULT 0.000,
  `vip_level` int(11) NOT NULL DEFAULT 0,
  `roses_f1` decimal(10,3) NOT NULL DEFAULT 0.000,
  `roses_f` decimal(10,3) NOT NULL DEFAULT 0.000,
  `roses_today` double(10,3) NOT NULL DEFAULT 0.000,
  `level` int(11) NOT NULL DEFAULT 0,
  `rank` int(11) NOT NULL DEFAULT 0,
  `code` varchar(30) NOT NULL DEFAULT '0',
  `invite` varchar(30) NOT NULL DEFAULT '0',
  `ctv` varchar(50) NOT NULL DEFAULT '0',
  `veri` int(11) NOT NULL DEFAULT 0,
  `otp` varchar(10) NOT NULL DEFAULT '0',
  `ip_address` varchar(50) NOT NULL DEFAULT '0',
  `status` int(11) NOT NULL DEFAULT 0,
  `time` varchar(50) NOT NULL DEFAULT '0',
  `time_otp` varchar(50) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `id_user`, `phone`, `jili_account`, `kingmaker_account`, `token`, `name_user`, `password`, `money`, `total_money`, `vip_level`, `roses_f1`, `roses_f`, `roses_today`, `level`, `rank`, `code`, `invite`, `ctv`, `veri`, `otp`, `ip_address`, `status`, `time`, `time_otp`) VALUES
(1, '12128', '911', 'jili_indusclub_911', 'kingmaker_indusclub_911', 'c7e3557400aaea384c1018c98af15fc5', 'goku', '11d1450f02857a3f0d4b6bfa417c1754', 4683.000, 0.000, 2, 0.910, 4.061, 0.000, 1, 0, 'aUxSW67553', 'nIvjm76082', 'AO02014YD', 1, '833147', '2409:4055:2e97:e9bc:85b8:3de4:ce01:587e', 1, '1693802960128', '1693803037356');

-- --------------------------------------------------------

--
-- Table structure for table `user_bank`
--

CREATE TABLE `user_bank` (
  `id` int(11) NOT NULL,
  `phone` varchar(50) NOT NULL DEFAULT '0',
  `name_bank` varchar(100) NOT NULL DEFAULT '0',
  `name_user` varchar(100) DEFAULT '0',
  `stk` varchar(100) NOT NULL DEFAULT '0',
  `tp` varchar(100) NOT NULL DEFAULT '0',
  `email` varchar(100) NOT NULL DEFAULT '0',
  `sdt` varchar(20) DEFAULT '0',
  `tinh` varchar(100) NOT NULL DEFAULT '0',
  `chi_nhanh` varchar(100) NOT NULL DEFAULT '0',
  `time` varchar(30) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_usdt_address`
--

CREATE TABLE `user_usdt_address` (
  `id` int(11) NOT NULL,
  `phone` varchar(50) NOT NULL,
  `usdt_address` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `wingo`
--

CREATE TABLE `wingo` (
  `id` int(11) NOT NULL,
  `period` varchar(100) NOT NULL,
  `amount` int(11) NOT NULL DEFAULT 0,
  `game` varchar(10) NOT NULL DEFAULT '0',
  `status` int(11) NOT NULL DEFAULT 0,
  `time` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `wingo`
--

INSERT INTO `wingo` (`id`, `period`, `amount`, `game`, `status`, `time`) VALUES
(1, '202407240001', 6, 'wingo10', 1, '1721815594668'),
(2, '202407240001', 0, 'wingo10', 0, '1721815594668'),
(3, '202407240001', 6, 'wingo5', 1, '1721815594668'),
(4, '202407240001', 0, 'wingo5', 0, '1721815594668'),
(5, '202407240001', 6, 'wingo3', 1, '1721815594668'),
(6, '202407240001', 0, 'wingo3', 0, '1721815594668'),
(7, '202407240001', 6, 'wingo', 1, '1721815594668'),
(8, '202407240001', 0, 'wingo', 0, '1721815594668');

-- --------------------------------------------------------

--
-- Table structure for table `withdraw`
--

CREATE TABLE `withdraw` (
  `id` int(11) NOT NULL,
  `id_order` varchar(100) NOT NULL DEFAULT '0',
  `phone` varchar(50) NOT NULL DEFAULT '0',
  `money` int(11) NOT NULL DEFAULT 0,
  `stk` varchar(100) NOT NULL DEFAULT '0',
  `name_bank` varchar(100) NOT NULL DEFAULT '0',
  `user_email` text NOT NULL,
  `ifsc` text NOT NULL,
  `name_user` varchar(100) NOT NULL DEFAULT '0',
  `user_bank_phone` varchar(50) NOT NULL,
  `status` int(11) NOT NULL DEFAULT 0,
  `today` varchar(50) NOT NULL DEFAULT '0',
  `time` varchar(30) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `withdraw_usdt`
--

CREATE TABLE `withdraw_usdt` (
  `id` int(11) NOT NULL,
  `id_order` varchar(100) NOT NULL,
  `phone` varchar(50) NOT NULL,
  `usdt_address` varchar(50) NOT NULL,
  `money` int(11) NOT NULL,
  `status` int(11) NOT NULL,
  `today` varchar(50) NOT NULL,
  `time` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `5d`
--
ALTER TABLE `5d`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `bank_recharge`
--
ALTER TABLE `bank_recharge`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `financial_details`
--
ALTER TABLE `financial_details`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `k3`
--
ALTER TABLE `k3`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `level`
--
ALTER TABLE `level`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `minutes_1`
--
ALTER TABLE `minutes_1`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `point_list`
--
ALTER TABLE `point_list`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `recharge`
--
ALTER TABLE `recharge`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `redenvelopes`
--
ALTER TABLE `redenvelopes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `redenvelopes_used`
--
ALTER TABLE `redenvelopes_used`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `result_5d`
--
ALTER TABLE `result_5d`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `result_k3`
--
ALTER TABLE `result_k3`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `roses`
--
ALTER TABLE `roses`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user_bank`
--
ALTER TABLE `user_bank`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user_usdt_address`
--
ALTER TABLE `user_usdt_address`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `wingo`
--
ALTER TABLE `wingo`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `withdraw`
--
ALTER TABLE `withdraw`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `withdraw_usdt`
--
ALTER TABLE `withdraw_usdt`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `5d`
--
ALTER TABLE `5d`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `bank_recharge`
--
ALTER TABLE `bank_recharge`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `financial_details`
--
ALTER TABLE `financial_details`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `k3`
--
ALTER TABLE `k3`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `level`
--
ALTER TABLE `level`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `minutes_1`
--
ALTER TABLE `minutes_1`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `point_list`
--
ALTER TABLE `point_list`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `recharge`
--
ALTER TABLE `recharge`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `redenvelopes`
--
ALTER TABLE `redenvelopes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `redenvelopes_used`
--
ALTER TABLE `redenvelopes_used`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `result_5d`
--
ALTER TABLE `result_5d`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `result_k3`
--
ALTER TABLE `result_k3`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roses`
--
ALTER TABLE `roses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `user_bank`
--
ALTER TABLE `user_bank`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_usdt_address`
--
ALTER TABLE `user_usdt_address`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `wingo`
--
ALTER TABLE `wingo`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `withdraw`
--
ALTER TABLE `withdraw`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `withdraw_usdt`
--
ALTER TABLE `withdraw_usdt`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
