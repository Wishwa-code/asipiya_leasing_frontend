-- MySQL converted database dump
SET FOREIGN_KEY_CHECKS = 0;
SET NAMES utf8mb4;

-- -----------------------------------------------------
-- Table structures
-- -----------------------------------------------------

CREATE TABLE `auction_companies` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `created_at` datetime,
    `updated_at` datetime,
    `deleted_at` datetime,
    `name` text,
    `contact_no_1` text,
    `contact_no_2` text,
    `contact_person` text,
    `address` text,
    `note` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `banks` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `created_at` datetime,
    `updated_at` datetime,
    `deleted_at` datetime,
    `name` text,
    `code` text,
    `short_name` text,
    `status` varchar(255) DEFAULT 'Active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `customer_documents` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `created_at` datetime,
    `updated_at` datetime,
    `deleted_at` datetime,
    `Customer_idCustomer` bigint,
    `Description` text,
    `Path` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `customer_has_bank` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `created_at` datetime,
    `updated_at` datetime,
    `deleted_at` datetime,
    `cus_id` bigint,
    `bank_name` text,
    `account_name` text,
    `account_number` text,
    `branch` text,
    `bank_code` text,
    `branch_code` text,
    `account_type` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `customer_loans` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `created_at` datetime,
    `updated_at` datetime,
    `deleted_at` datetime,
    `customer_id` bigint,
    `loan_no` text,
    `loan_status` text,
    `total_loan_amount` decimal(19,4),
    `total_loan_balance` decimal(19,4),
    `branch_id` bigint,
    `route_id` bigint,
    `product_id` bigint,
    `created_by` bigint,
    `updated_by` bigint
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `customer_occupations` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `created_at` datetime,
    `updated_at` datetime,
    `deleted_at` datetime,
    `customer_id` bigint,
    `type` text,
    `designation` text,
    `br_no` text,
    `business_name` text,
    `nature_of_business` text,
    `business_address_01` text,
    `business_address_02` text,
    `business_address_03` text,
    `contact_no` text,
    `email` text,
    `employer_name` text,
    `monthly_salary_income` decimal(19,4),
    `from_date` text,
    `to_date` text,
    `longitude` decimal(19,4),
    `latitude` decimal(19,4)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `customer_saving_accounts` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `created_at` datetime,
    `updated_at` datetime,
    `deleted_at` datetime,
    `customer_id` bigint,
    `account_no` text,
    `open_date` text,
    `balance` decimal(19,4),
    `interest_rate` decimal(19,4),
    `interest_type` text,
    `account_status` text,
    `branch_id` bigint,
    `created_by` bigint
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `customers` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `created_at` datetime,
    `updated_at` datetime,
    `deleted_at` datetime,
    `customer_code` text,
    `title` text,
    `full_name` text,
    `name_with_initials` text,
    `first_name` text,
    `last_name` text,
    `email` text,
    `contact_no` text,
    `contact_no_02` text,
    `landline` text,
    `new_nic` text,
    `old_nic` text,
    `status` text,
    `latitude` decimal(19,4),
    `longitude` decimal(19,4),
    `route_id` bigint,
    `center_id` bigint,
    `group_id` bigint,
    `branch_id` bigint,
    `acc_center_cus_id` bigint,
    `created_by` bigint,
    `updated_by` bigint,
    `deleted_by` bigint,
    `dob` text,
    `gender` text,
    `remarks` text,
    `province` text,
    `city` text,
    `postal_province` text,
    `postal_city` text,
    `per_address_line_1` text,
    `per_address_line_2` text,
    `per_address_line_3` text,
    `postal_address_line_1` text,
    `postal_address_line_2` text,
    `postal_address_line_3` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `insurance_companies` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `created_at` datetime,
    `updated_at` datetime,
    `deleted_at` datetime,
    `company_code` text,
    `company_name` text,
    `head_office_address` text,
    `contact_person` text,
    `contact_mobile` text,
    `contact_email` text,
    `contact_person2` text,
    `contact_person2_mobile` text,
    `contact_person2_email` text,
    `commision_rate` decimal(19,4),
    `bank_account_no` text,
    `bank_account_name` text,
    `bank_name` text,
    `status` varchar(255) DEFAULT 'Active',
    `created_by` bigint
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `introducers` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `created_at` datetime,
    `updated_at` datetime,
    `deleted_at` datetime,
    `introducer_type` text,
    `name` text,
    `registration_no` text,
    `contact_person` text,
    `primary_contact` text,
    `secondary_contact` text,
    `email` text,
    `address` text,
    `commission_rate` decimal(19,4),
    `bank_details` json,
    `remarks` text,
    `status` varchar(255) DEFAULT 'Active',
    `created_by` bigint
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `leasing_applications` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `created_at` datetime,
    `updated_at` datetime,
    `deleted_at` datetime,
    `leasing_application_loan_no` varchar(255),
    `customer_id` bigint NOT NULL,
    `introducer_id` bigint,
    `leasing_loan_code` varchar(255),
    `status` varchar(50) DEFAULT 'draft',
    `branch_id` bigint,
    `current_progress_data` json
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `leasing_cheque_define_items` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `created_at` datetime,
    `updated_at` datetime,
    `deleted_at` datetime,
    `leasing_cheque_define_id` bigint,
    `payee_name` varchar(255),
    `nic_br_no` varchar(100),
    `instructions` text,
    `payment_amount` decimal(19,4),
    `bank_name` varchar(100),
    `branch_name` varchar(100),
    `account_number` varchar(100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `leasing_cheque_defines` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `created_at` datetime,
    `updated_at` datetime,
    `deleted_at` datetime,
    `leasing_application_id` bigint
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `leasing_guarantors` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `created_at` datetime,
    `updated_at` datetime,
    `deleted_at` datetime,
    `leasing_application_id` bigint,
    `customer_id` bigint,
    `guarantor_index` bigint,
    `type` varchar(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `leasing_loans` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `created_at` datetime,
    `updated_at` datetime,
    `deleted_at` datetime,
    `leasing_vehicle_id` bigint,
    `leasing_application_id` bigint,
    `loan_no` varchar(100),
    `loan_type` varchar(50),
    `created_date_time` datetime,
    `approval_end_date_time` datetime,
    `disbursed_date_time` datetime,
    `created_by` bigint,
    `updated_by` bigint,
    `disbursed_user` bigint,
    `customer_id` bigint,
    `route_id` bigint,
    `center_id` bigint,
    `groups_id` bigint,
    `product_id` bigint,
    `product_code` varchar(50),
    `interest_method` varchar(50),
    `loan_period_type` varchar(50),
    `loan_period` bigint,
    `interest_period_type` varchar(50),
    `interest_period` bigint,
    `interest_rate` decimal(19,4),
    `collection_period_type` varchar(50),
    `collection_duration` bigint,
    `collection_date_type` varchar(50),
    `first_collection_date` varchar(50),
    `collection_day` bigint,
    `product_item_id` bigint,
    `panelty_active_status` varchar(20),
    `panelty_method` varchar(50),
    `panelty_rate` decimal(19,4),
    `panelty_apply_type` varchar(50),
    `panelty_start_after_days` bigint,
    `total_additional_charge` decimal(19,4),
    `recovery_account_status` varchar(20),
    `saving_acount_status` varchar(20),
    `saving_amount_type` varchar(50),
    `saving_collection_type` varchar(50),
    `saving_amount` decimal(19,4),
    `saving_account_monthly_interest` decimal(19,4),
    `saving_amount_on_every_installments` decimal(19,4),
    `loan_amount` decimal(19,4),
    `interest_amount` decimal(19,4),
    `total_loan_amount` decimal(19,4),
    `other_charges_total` decimal(19,4),
    `other_charges_on_disburse` decimal(19,4),
    `other_charges_on_first_installment` decimal(19,4),
    `other_charges_on_every_installments` decimal(19,4),
    `other_charges_additional_added` decimal(19,4),
    `disburse_amount` decimal(19,4),
    `installment_amount` decimal(19,4),
    `total_panalty_amount` decimal(19,4),
    `total_paid_amount` decimal(19,4),
    `capital_balance` decimal(19,4),
    `interest_balance` decimal(19,4),
    `total_loan_balance` decimal(19,4),
    `panalty_balance` decimal(19,4),
    `other_charges_balance` decimal(19,4),
    `additional_charges_balance` decimal(19,4),
    `collectable_savings_balance` decimal(19,4),
    `total_balance` decimal(19,4),
    `loan_status` varchar(50),
    `lending_officer_id` bigint,
    `recovery_officer_id` bigint,
    `branch_id` bigint,
    `bank_account_id` bigint,
    `deleted_by` bigint,
    `deleted_reson` text,
    `arrears_amount` decimal(19,4),
    `today_due_amount` decimal(19,4),
    `last_calculated_at` datetime,
    `maturity_date` varchar(50),
    `inspection_date` varchar(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `leasing_vehicle_document_images` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `created_at` datetime,
    `updated_at` datetime,
    `deleted_at` datetime,
    `leasing_vehicle_id` bigint,
    `leasing_application_id` bigint,
    `image_type` varchar(100),
    `image_url` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `leasing_vehicles` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `created_at` datetime,
    `updated_at` datetime,
    `deleted_at` datetime,
    `leasing_application_id` bigint,
    `vehicle_type_id` bigint,
    `vehicle_make_id` bigint,
    `vehicle_model_id` bigint,
    `vehicle_status` varchar(50),
    `engine_cc` varchar(50),
    `chasis_no` varchar(100),
    `manufacturing_year` varchar(10),
    `color_id` bigint,
    `usage` varchar(255),
    `country_of_origin` varchar(100),
    `type_of_body` varchar(100),
    `equipment` text,
    `registered_year` varchar(10),
    `registered_no` varchar(100),
    `valuation_company_id` bigint,
    `insurance_company_id` bigint,
    `insurance_amount` decimal(19,4),
    `insurance_premium` decimal(19,4),
    `insurance_start_date` varchar(50),
    `insurance_expiry_date` varchar(50),
    `supplier_id` bigint,
    `supplier_rno` varchar(100),
    `market_value` decimal(19,4),
    `forced_sale_value` decimal(19,4),
    `invoice_value` decimal(19,4)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `pdc_cheque_details` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `created_at` datetime,
    `updated_at` datetime,
    `deleted_at` datetime,
    `pdc_security_id` bigint,
    `cheque_status` varchar(50),
    `bank_id` bigint,
    `cheque_date` varchar(50),
    `cheque_no` varchar(100),
    `ownership` varchar(100),
    `reference_details` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `pdc_cr_book_details` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `created_at` datetime,
    `updated_at` datetime,
    `deleted_at` datetime,
    `pdc_security_id` bigint,
    `book_date` varchar(50),
    `reference_details` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `pdc_deed_details` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `created_at` datetime,
    `updated_at` datetime,
    `deleted_at` datetime,
    `pdc_security_id` bigint,
    `reference_details` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `pdc_securities` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `created_at` datetime,
    `updated_at` datetime,
    `deleted_at` datetime,
    `leasing_application_id` bigint,
    `pdc_security_type` varchar(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `product_additional_charges` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `created_at` datetime,
    `updated_at` datetime,
    `deleted_at` datetime,
    `product_id` bigint,
    `description` text,
    `value_type` text,
    `value` decimal(19,4),
    `deduction_type` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `product_has_items` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `created_at` datetime,
    `updated_at` datetime,
    `deleted_at` datetime,
    `product_id` bigint,
    `product_item_name` text,
    `minimum_loan_period` bigint,
    `maximum_loan_period` bigint,
    `minimum_loan_amount` decimal(19,4),
    `maximum_loan_amount` decimal(19,4),
    `interest_apply_type` text,
    `minimum_interest` decimal(19,4),
    `maximum_interest` decimal(19,4),
    `minimum_collection_period` bigint,
    `maximum_collection_period` bigint,
    `penalty_method` text,
    `penalty_apply_type` text,
    `penalty_percentage` decimal(19,4),
    `penalty_start_after_days` bigint,
    `saving_amount` decimal(19,4),
    `saving_amount_type` text,
    `saving_payment` text,
    `saving_account_monthly_interest` decimal(19,4),
    `saving_interest_cal_type` text,
    `required_guarantee_count` bigint,
    `saving_interest_rate` decimal(19,4),
    `is_different_collection_period` tinyint(1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `product_required_documents` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `created_at` datetime,
    `updated_at` datetime,
    `deleted_at` datetime,
    `product_id` bigint,
    `name` text,
    `required_status` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `products` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `created_at` datetime,
    `updated_at` datetime,
    `deleted_at` datetime,
    `product_name` text,
    `product_code` text,
    `interest_method` text,
    `loan_period_type` text,
    `interest_period_type` text,
    `collection_period_type` text,
    `collection_date_type` text,
    `guarantee_count` bigint,
    `saving_amount_type` text,
    `saving_collection_type` text,
    `saving_interest_cal_type` text,
    `saving_account_status` text,
    `recovery_account_status` text,
    `status` text,
    `created_by` bigint,
    `updated_by` bigint,
    `deleted_by` bigint
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `seizers` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `created_at` datetime,
    `updated_at` datetime,
    `deleted_at` datetime,
    `seizer_type` text,
    `company_name` text,
    `company_registration` text,
    `company_contact_no` text,
    `nic` text,
    `seizer_contact_no` text,
    `mobile_no` text,
    `address` text,
    `remarks` text,
    `status` varchar(255) DEFAULT 'Active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `suppliers` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `created_at` datetime,
    `updated_at` datetime,
    `deleted_at` datetime,
    `name` text,
    `nic` text,
    `latitude` decimal(19,4),
    `longitude` decimal(19,4),
    `address` text,
    `contact_no` text,
    `occupation` text,
    `income` decimal(19,4),
    `name_in_cheque` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `users` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `created_at` datetime,
    `updated_at` datetime,
    `deleted_at` datetime,
    `name` text NOT NULL,
    `email` varchar(191) NOT NULL,
    `password` text NOT NULL,
    `nic` varchar(191),
    `mobile_no` text,
    `address` text,
    `profile_image` text,
    `role_id` bigint,
    `branch_id` bigint
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `valuation_companies` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `created_at` datetime,
    `updated_at` datetime,
    `deleted_at` datetime,
    `company_name` text,
    `contact_person_1_name` text,
    `contact_person_2_name` text,
    `contact_person_1_mobile` text,
    `contact_person_2_mobile` text,
    `address` text,
    `note` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `vehicle_makes` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `created_at` datetime,
    `updated_at` datetime,
    `deleted_at` datetime,
    `vehicle_make` varchar(255) NOT NULL,
    `vehicle_type_id` bigint NOT NULL,
    `status` varchar(255) DEFAULT 'Active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `vehicle_models` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `created_at` datetime,
    `updated_at` datetime,
    `deleted_at` datetime,
    `vehicle_model_name` varchar(255) NOT NULL,
    `vehicle_type_id` bigint NOT NULL,
    `status` varchar(255) DEFAULT 'Active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `vehicle_types` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `created_at` datetime,
    `updated_at` datetime,
    `deleted_at` datetime,
    `vehicle_type_name` varchar(255) NOT NULL,
    `description` text,
    `status` varchar(255) DEFAULT 'Active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `vehicle_yards` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `created_at` datetime,
    `updated_at` datetime,
    `deleted_at` datetime,
    `yard_name` text,
    `address` text,
    `province` text,
    `district` text,
    `dsd` text,
    `yard_contact_no` text,
    `contact_person` text,
    `mobile_no` text,
    `status` varchar(255) DEFAULT 'Active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table data
-- -----------------------------------------------------

INSERT INTO `customer_has_bank` (`id`, `created_at`, `updated_at`, `deleted_at`, `cus_id`, `bank_name`, `account_name`, `account_number`, `branch`, `bank_code`, `branch_code`, `account_type`) VALUES
(1, '2026-05-28 04:07:38.695436+00', '2026-05-28 04:07:38.695436+00', NULL, 4, 'Bank of Ceylon', 'Fathima Nazeer', '003456789012', 'Kandy City', '', '', 'Current'),
(2, '2026-05-28 04:09:18.382443+00', '2026-05-28 04:09:18.382443+00', NULL, 5, 'Bank of Ceylon', 'N. S. Ekanayake', '78901234', 'Karapitiya', '', '', 'Savings');

INSERT INTO `customer_occupations` (`id`, `created_at`, `updated_at`, `deleted_at`, `customer_id`, `type`, `designation`, `br_no`, `business_name`, `nature_of_business`, `business_address_01`, `business_address_02`, `business_address_03`, `contact_no`, `email`, `employer_name`, `monthly_salary_income`, `from_date`, `to_date`, `longitude`, `latitude`) VALUES
(2, '2026-05-28 04:05:45.605162+00', '2026-05-28 04:05:45.605162+00', NULL, 3, 'Job / Employment', 'Senior Software Engineer', '', '', '', '', '', '', '', '', '', 0, '', '', 0, 0),
(3, '2026-05-28 04:07:38.657838+00', '2026-05-28 04:07:38.657838+00', NULL, 4, 'Job / Employment', 'Managing Director', '', '', '', '', '', '', '', '', '', 0, '', '', 0, 0),
(4, '2026-05-28 04:09:18.345267+00', '2026-05-28 04:09:18.345267+00', NULL, 5, 'Job / Employment', 'Medical Officer', '', '', '', '', '', '', '', '', '', 0, '', '', 0, 0);

INSERT INTO `customers` (`id`, `created_at`, `updated_at`, `deleted_at`, `customer_code`, `title`, `full_name`, `name_with_initials`, `first_name`, `last_name`, `email`, `contact_no`, `contact_no_02`, `landline`, `new_nic`, `old_nic`, `status`, `latitude`, `longitude`, `route_id`, `center_id`, `group_id`, `branch_id`, `acc_center_cus_id`, `created_by`, `updated_by`, `deleted_by`, `dob`, `gender`, `remarks`, `province`, `city`, `postal_province`, `postal_city`, `per_address_line_1`, `per_address_line_2`, `per_address_line_3`, `postal_address_line_1`, `postal_address_line_2`, `postal_address_line_3`) VALUES
(3, '2026-05-28 04:05:45.517891+00', '2026-05-28 04:05:45.517891+00', NULL, 'CUS-944517', 'Mr.', 'KASUN DANANJAYA SILVA', 'K. D. SILVA', 'Kasun', 'Silva', 'kasun.silva@example.com', '077 123 4567', '071 987 6543', '011 234 5678', '199214502345', '921452345V', 'Active', 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '1992-05-23', 'Male', 'Clean credit history, highly responsive.', 'Western', 'Colombo', '', '', '45/2,', ' Galle Road, ', 'Colombo 03', '45/2,', ' Galle Road, ', 'Colombo 03'),
(5, '2026-05-28 04:09:18.308001+00', '2026-05-28 04:09:18.308001+00', NULL, 'CUS-944517', 'Dr.', 'NUWAN SAMPATH EKANAYAKE', 'N. S. EKANAYAK', 'NUWAN ', 'EKANAYAKE', 'nuwan.dr@example.com', '071 334 4556', '091 224 4556', '', '198211500456', '821150456V', 'Active', 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '1982-04-24', 'Male', 'Government sector employee. Eligible for special state-backed guarantor schemes if required.', 'Southern', 'Galle', '', '', '88, ', 'Temple Road, ', 'Karapitiya, Galle', '88, ', 'Temple Road, ', 'Karapitiya, Galle'),
(4, '2026-05-28 04:07:38.620327+00', '2026-05-28 04:10:35.235095+00', NULL, 'CUS-944517', 'Mr.', 'FATHIMA AYESHA NAZEER', 'FATHIMA AYESHA NAZEER', 'Fathima', 'Nazeer', 'fathima.tex@example.com', '076 445 5667', '081 223 3445', '', '198563401299', '856341299V', 'inactive', 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '1985-05-13', 'Female', 'Runs a successful textile distribution business. Requires flexible collection dates.', 'Central', 'Kandy', '', '', '12,', ' Queens Road, ', 'Kandy', '12,', ' Queens Road, ', 'Kandy');

INSERT INTO `insurance_companies` (`id`, `created_at`, `updated_at`, `deleted_at`, `company_code`, `company_name`, `head_office_address`, `contact_person`, `contact_mobile`, `contact_email`, `contact_person2`, `contact_person2_mobile`, `contact_person2_email`, `commision_rate`, `bank_account_no`, `bank_account_name`, `bank_name`, `status`, `created_by`) VALUES
(3, '2026-05-28 04:13:06.720833+00', '2026-05-28 04:13:06.720833+00', NULL, 'DLR-AV-001', 'AutoVision Holdings (Pvt) Ltd', '120, Kandy Road, Kadawatha', 'Chaminda Perera', '077 554 4332', 'chaminda@autovision.lk', 'Ruwanthi De Silva', '071 889 9001', 'ruwanthi@autovision.lk', 0, '1100234567', 'AutoVision Holdings', 'Commercial Bank', 'Active', 0),
(4, '2026-05-28 04:14:36.789791+00', '2026-05-28 04:14:36.789791+00', NULL, 'REC-SRS-089', 'Swift Recovery Solutions', '45/A, Nawala Road, Rajagiriya', 'Major (Retd) Sumith Rathnayake', '076 223 3445', 'sumith.r@swiftrecovery.lk', 'Dinesh Kumara', '070 334 4556', 'ops@swiftrecovery.lk', 10, '002934568122', 'Swift Recovery Solutions', 'Sampath Bank', 'Active', 0),
(5, '2026-05-28 04:15:30.38956+00', '2026-05-28 04:15:30.38956+00', NULL, 'BRK-APX-204', 'Apex Financial Brokers', 'Level 3, Access Tower, Union Place, Colombo 02', 'Tharuka Fernando', '077 998 8776', 'tharuka.f@apexbrokers.lk', 'Mohamed Rizwan', '075 112 2334', 'rizwan.m@apexbrokers.lk', 1.5, '003010203040', 'Apex Financial Brokers', 'Hatton National Bank', 'Active', 0);

INSERT INTO `introducers` (`id`, `created_at`, `updated_at`, `deleted_at`, `introducer_type`, `name`, `registration_no`, `contact_person`, `primary_contact`, `secondary_contact`, `email`, `address`, `commission_rate`, `bank_details`, `remarks`, `status`, `created_by`) VALUES
(3, '2026-05-28 04:17:11.523423+00', '2026-05-28 04:17:11.523423+00', NULL, 'Individual', 'Sunil Perera', '198012345678', 'N/A (Self)', '077 112 2334', '071 998 8776', 'sunil.broker80@gmail.com', '15/B, High Level Road, Nugegoda', 1, '{}', 'Independent vehicle broker specializing in three-wheelers and light commuter vehicles. Very active in the Colombo suburbs.', 'Active', 0),
(4, '2026-05-28 04:17:53.195596+00', '2026-05-28 04:17:53.195596+00', NULL, 'Agency', 'DriveLine Auto Mart', 'PV00123456', 'Gayantha Senaratne', '011 288 7766', '076 554 4332', 'info@drivelineautomart.lk', '304, Kaduwela Road, Malabe', 2, '{}', 'Local vehicle yard with high monthly referral volume. Priority processing requested for their clients.', 'Active', 0);

INSERT INTO `leasing_applications` (`id`, `created_at`, `updated_at`, `deleted_at`, `leasing_application_loan_no`, `customer_id`, `introducer_id`, `leasing_loan_code`, `status`, `branch_id`, `current_progress_data`) VALUES
(9, '2026-05-28 04:11:22.803644+00', '2026-05-28 04:11:34.600764+00', NULL, '', 4, NULL, '', 'draft', NULL, '{"ltv": "0.00", "nic": "198563401299", "color": "", "mobile": "076 445 5667", "period": "12", "reg_no": "", "address": "12,, Kandy", "bank_id": "", "cheques": [], "cr_copy": "", "reg_year": "", "body_type": "SEDAN", "branch_id": "", "documents": [], "engine_cc": "", "equipment": "", "manu_year": "", "chassis_no": "", "guarantors": [], "product_id": "", "usage_type": "PRIVATE", "introducers": [{"nic": "", "name": "", "mobile": "", "address": "", "introducer_id": ""}], "loan_amount": "0.00", "supplier_id": "", "upper_photo": "", "forced_value": "0.00", "inside_photo": "", "manu_country": "JAPAN", "market_value": "0.00", "product_item": "", "supplier_rno": "", "valuation_no": "", "vehicle_make": "", "vehicle_type": "", "_fullCustomer": {"ID": 4, "dob": "1985-05-13", "city": "Kandy", "email": "fathima.tex@example.com", "title": "Mr.", "gender": "Female", "status": "inactive", "new_nic": "198563401299", "old_nic": "856341299V", "remarks": "Runs a successful textile distribution business. Requires flexible collection dates.", "group_id": null, "landline": "", "latitude": 0, "province": "Central", "route_id": null, "CreatedAt": "2026-05-28T09:37:38.620327+05:30", "DeletedAt": null, "UpdatedAt": "2026-05-28T09:40:35.235095+05:30", "branch_id": null, "center_id": null, "documents": [], "full_name": "FATHIMA AYESHA NAZEER", "last_name": "Nazeer", "longitude": 0, "contact_no": "076 445 5667", "created_by": null, "deleted_by": null, "first_name": "Fathima", "updated_by": null, "occupations": [{"ID": 3, "email": "", "endDate": "", "latitude": 0, "position": "Managing Director", "CreatedAt": "2026-05-28T09:37:38.657838+05:30", "DeletedAt": null, "UpdatedAt": "2026-05-28T09:37:38.657838+05:30", "contactNo": "", "longitude": 0, "startDate": "", "customer_id": 4, "businessName": "", "employerName": "", "engagementType": "Job / Employment", "businessAddress1": "", "businessAddress2": "", "businessAddress3": "", "natureOfBusiness": "", "netMonthlyIncome": 0, "registrationNumber": ""}], "postal_city": "", "bank_accounts": [{"ID": 1, "bank": "Bank of Ceylon", "type": "Current", "branch": "Kandy City", "bankCode": "", "CreatedAt": "2026-05-28T09:37:38.695436+05:30", "DeletedAt": null, "UpdatedAt": "2026-05-28T09:37:38.695436+05:30", "branchCode": "", "beneficiary": "Fathima Nazeer", "customer_id": 4, "accountNumber": "003456789012"}], "contact_no_02": "081 223 3445", "customer_code": "CUS-944517", "postal_province": "", "saving_accounts": null, "acc_center_cus_id": null, "name_with_initials": "FATHIMA AYESHA NAZEER", "postal_address_line1": "12,", "postal_address_line2": " Queens Road, ", "postal_address_line3": "Kandy", "permanent_address_line1": "12,", "permanent_address_line2": " Queens Road, ", "permanent_address_line3": "Kandy"}, "customer_code": "CUS-944517", "customer_name": "FATHIMA AYESHA NAZEER", "deletion_copy": "", "duplicate_key": false, "interest_rate": "0.00", "invoice_value": "0.00", "supplier_name": "", "total_payable": "0.00", "vehicle_model": "", "account_number": "", "chasis_no_file": "", "customer_db_id": 4, "original_cr_no": "", "pdc_securities": [], "total_interest": "0.00", "vehicle_photos": [], "vehicle_status": "REGISTERED", "back_side_photo": "", "bank_account_id": 1, "disburse_amount": "0.00", "inspection_date": "2026-05-28", "left_side_photo": "", "product_item_id": "", "revenue_license": "", "supplier_mobile": "", "vehicle_make_id": "", "vehicle_type_id": "", "front_side_photo": "", "insurance_amount": "0.00", "right_side_photo": "", "supplier_address": "", "supplier_invoice": "", "valuation_report": "", "vehicle_model_id": "", "insurance_company": "", "insurance_premium": "0.00", "installment_amount": "0.00", "installments_total": "0.00", "meter_reading_file": "", "other_charges_total": "0.00", "tcc_collection_date": "", "insurance_start_date": "", "insurance_expiry_date": "", "marketing_executive_id": "", "required_guarantor_count": 0, "other_charges_on_disburse": "0.00", "other_charges_on_first_installment": "0.00", "other_charges_on_every_installments": "0.00"}');

INSERT INTO `product_additional_charges` (`id`, `created_at`, `updated_at`, `deleted_at`, `product_id`, `description`, `value_type`, `value`, `deduction_type`) VALUES
(1, '2026-05-28 04:01:41.189215+00', '2026-05-28 04:01:41.189215+00', NULL, 2, 'Documentation & Legal Fee', 'percentage', 1.5, 'on_loan_disbursement'),
(2, '2026-05-28 04:01:41.286205+00', '2026-05-28 04:01:41.286205+00', NULL, 2, 'Vehicle Valuation Fee', 'fixed', 5000, 'on_loan_disbursement'),
(3, '2026-05-28 04:01:41.330691+00', '2026-05-28 04:01:41.330691+00', NULL, 2, 'RMV Registration/Transfer', 'fixed', 15000, 'on_loan_disbursement'),
(4, '2026-05-28 04:01:41.374704+00', '2026-05-28 04:01:41.374704+00', NULL, 2, 'Initial Yard/Inspection Fee', 'fixed', 2500, 'as_first_installment');

INSERT INTO `product_has_items` (`id`, `created_at`, `updated_at`, `deleted_at`, `product_id`, `product_item_name`, `minimum_loan_period`, `maximum_loan_period`, `minimum_loan_amount`, `maximum_loan_amount`, `interest_apply_type`, `minimum_interest`, `maximum_interest`, `minimum_collection_period`, `maximum_collection_period`, `penalty_method`, `penalty_apply_type`, `penalty_percentage`, `penalty_start_after_days`, `saving_amount`, `saving_amount_type`, `saving_payment`, `saving_account_monthly_interest`, `saving_interest_cal_type`, `required_guarantee_count`, `saving_interest_rate`, `is_different_collection_period`) VALUES
(2, '2026-05-28 04:01:41.046067+00', '2026-05-28 04:01:41.046067+00', NULL, 2, 'Commuter & Light Transit', 12, 36, 300000, 1500000, '', 1.5, 2.5, 0, 0, '', 'every_installment', 3, 0, 0, '', '', 0, '', 1, 0, 0),
(3, '2026-05-28 04:01:41.144709+00', '2026-05-28 04:01:41.144709+00', NULL, 2, 'Light Passenger Vehicles', 24, 60, 2000000, 15000000, '', 1, 1.8, 0, 0, '', 'every_installment', 1, 0, 0, '', '', 0, '', 2, 0, 0);

INSERT INTO `products` (`id`, `created_at`, `updated_at`, `deleted_at`, `product_name`, `product_code`, `interest_method`, `loan_period_type`, `interest_period_type`, `collection_period_type`, `collection_date_type`, `guarantee_count`, `saving_amount_type`, `saving_collection_type`, `saving_interest_cal_type`, `saving_account_status`, `recovery_account_status`, `status`, `created_by`, `updated_by`, `deleted_by`) VALUES
(2, '2026-05-28 04:01:40.947328+00', '2026-05-28 04:01:40.947328+00', NULL, 'Auto Lease - Registered Vehicles', 'AL-REG-001', 'flat_rate', 'months', 'per_month', 'first_of_month', 'same_as_installment', 4, '', '', '', '', '', 'Active', NULL, NULL, NULL);

INSERT INTO `suppliers` (`id`, `created_at`, `updated_at`, `deleted_at`, `name`, `nic`, `latitude`, `longitude`, `address`, `contact_no`, `occupation`, `income`, `name_in_cheque`) VALUES
(3, '2026-05-28 04:19:09.932376+00', '2026-05-28 04:19:09.932376+00', NULL, 'Asanka Roshan Kumara', '198531204567', 7.53676432, 80.36499023, '112, Dutugemunu Street, Kohuwala (Note: Kohuwala is a major vehicle sales hub)', '077 445 5667', 'Direct Vehicle Importer', 800000, 'A. R. Kumara'),
(4, '2026-05-28 04:19:42.393943+00', '2026-05-28 04:19:42.393943+00', NULL, 'Nishantha Priyadarshana', '197815602311', 6.42252183, 80.72110176, '45, Peradeniya Road, Kandy', '071 889 9002', 'Hardware Store Owner', 450000, 'N. Priyadarshana');

INSERT INTO `users` (`id`, `created_at`, `updated_at`, `deleted_at`, `name`, `email`, `password`, `nic`, `mobile_no`, `address`, `profile_image`, `role_id`, `branch_id`) VALUES
(2, NULL, NULL, NULL, 'wishwa', 'wishwa@gmail.com', '$2a$12$WN54fA96kL1CUrXulZTniepOFTFfO9RKH8Dy.qV2oK1iPnIudmfdO', NULL, NULL, NULL, NULL, NULL, NULL);

-- -----------------------------------------------------
-- Indexes
-- -----------------------------------------------------

CREATE INDEX `idx_auction_companies_deleted_at` ON `auction_companies` (deleted_at);
CREATE INDEX `idx_banks_deleted_at` ON `banks` (deleted_at);
CREATE INDEX `idx_customer_documents_deleted_at` ON `customer_documents` (deleted_at);
CREATE INDEX `idx_customer_has_bank_deleted_at` ON `customer_has_bank` (deleted_at);
CREATE INDEX `idx_customer_loans_deleted_at` ON `customer_loans` (deleted_at);
CREATE INDEX `idx_customer_occupations_deleted_at` ON `customer_occupations` (deleted_at);
CREATE INDEX `idx_customer_saving_accounts_deleted_at` ON `customer_saving_accounts` (deleted_at);
CREATE INDEX `idx_customers_deleted_at` ON `customers` (deleted_at);
CREATE INDEX `idx_insurance_companies_deleted_at` ON `insurance_companies` (deleted_at);
CREATE INDEX `idx_introducers_deleted_at` ON `introducers` (deleted_at);
CREATE INDEX `idx_leasing_applications_deleted_at` ON `leasing_applications` (deleted_at);
CREATE INDEX `idx_leasing_cheque_define_items_deleted_at` ON `leasing_cheque_define_items` (deleted_at);
CREATE INDEX `idx_leasing_cheque_defines_deleted_at` ON `leasing_cheque_defines` (deleted_at);
CREATE INDEX `idx_leasing_guarantors_deleted_at` ON `leasing_guarantors` (deleted_at);
CREATE INDEX `idx_leasing_loans_deleted_at` ON `leasing_loans` (deleted_at);
CREATE INDEX `idx_leasing_vehicle_document_images_deleted_at` ON `leasing_vehicle_document_images` (deleted_at);
CREATE INDEX `idx_leasing_vehicles_deleted_at` ON `leasing_vehicles` (deleted_at);
CREATE INDEX `idx_pdc_cheque_details_deleted_at` ON `pdc_cheque_details` (deleted_at);
CREATE INDEX `idx_pdc_cr_book_details_deleted_at` ON `pdc_cr_book_details` (deleted_at);
CREATE INDEX `idx_pdc_deed_details_deleted_at` ON `pdc_deed_details` (deleted_at);
CREATE INDEX `idx_pdc_securities_deleted_at` ON `pdc_securities` (deleted_at);
CREATE INDEX `idx_product_additional_charges_deleted_at` ON `product_additional_charges` (deleted_at);
CREATE INDEX `idx_product_has_items_deleted_at` ON `product_has_items` (deleted_at);
CREATE INDEX `idx_product_required_documents_deleted_at` ON `product_required_documents` (deleted_at);
CREATE INDEX `idx_products_deleted_at` ON `products` (deleted_at);
CREATE INDEX `idx_seizers_deleted_at` ON `seizers` (deleted_at);
CREATE INDEX `idx_suppliers_deleted_at` ON `suppliers` (deleted_at);
CREATE INDEX `idx_users_deleted_at` ON `users` (deleted_at);
CREATE UNIQUE INDEX `idx_users_email` ON `users` (email);
CREATE UNIQUE INDEX `idx_users_nic` ON `users` (nic);
CREATE INDEX `idx_valuation_companies_deleted_at` ON `valuation_companies` (deleted_at);
CREATE INDEX `idx_vehicle_makes_deleted_at` ON `vehicle_makes` (deleted_at);
CREATE INDEX `idx_vehicle_models_deleted_at` ON `vehicle_models` (deleted_at);
CREATE INDEX `idx_vehicle_types_deleted_at` ON `vehicle_types` (deleted_at);
CREATE INDEX `idx_vehicle_yards_deleted_at` ON `vehicle_yards` (deleted_at);

-- -----------------------------------------------------
-- Foreign Keys
-- -----------------------------------------------------

ALTER TABLE `customer_has_bank` ADD CONSTRAINT `fk_customers_bank_accounts` FOREIGN KEY (cus_id) REFERENCES `customers`(id);
ALTER TABLE `customer_documents` ADD CONSTRAINT `fk_customers_documents` FOREIGN KEY (`Customer_idCustomer`) REFERENCES `customers`(id);
ALTER TABLE `customer_occupations` ADD CONSTRAINT `fk_customers_occupations` FOREIGN KEY (customer_id) REFERENCES `customers`(id);
ALTER TABLE `customer_saving_accounts` ADD CONSTRAINT `fk_customers_saving_accounts` FOREIGN KEY (customer_id) REFERENCES `customers`(id);
ALTER TABLE `leasing_cheque_defines` ADD CONSTRAINT `fk_leasing_applications_cheque_define` FOREIGN KEY (leasing_application_id) REFERENCES `leasing_applications`(id);
ALTER TABLE `leasing_applications` ADD CONSTRAINT `fk_leasing_applications_customer` FOREIGN KEY (customer_id) REFERENCES `customers`(id);
ALTER TABLE `leasing_vehicle_document_images` ADD CONSTRAINT `fk_leasing_applications_document_images` FOREIGN KEY (leasing_application_id) REFERENCES `leasing_applications`(id);
ALTER TABLE `leasing_guarantors` ADD CONSTRAINT `fk_leasing_applications_guarantors` FOREIGN KEY (leasing_application_id) REFERENCES `leasing_applications`(id);
ALTER TABLE `leasing_applications` ADD CONSTRAINT `fk_leasing_applications_introducer` FOREIGN KEY (introducer_id) REFERENCES `introducers`(id);
ALTER TABLE `leasing_loans` ADD CONSTRAINT `fk_leasing_applications_loan` FOREIGN KEY (leasing_application_id) REFERENCES `leasing_applications`(id);
ALTER TABLE `pdc_securities` ADD CONSTRAINT `fk_leasing_applications_pdc_security` FOREIGN KEY (leasing_application_id) REFERENCES `leasing_applications`(id);
ALTER TABLE `leasing_vehicles` ADD CONSTRAINT `fk_leasing_applications_vehicle` FOREIGN KEY (leasing_application_id) REFERENCES `leasing_applications`(id);
ALTER TABLE `leasing_cheque_define_items` ADD CONSTRAINT `fk_leasing_cheque_defines_items` FOREIGN KEY (leasing_cheque_define_id) REFERENCES `leasing_cheque_defines`(id);
ALTER TABLE `leasing_guarantors` ADD CONSTRAINT `fk_leasing_guarantors_customer` FOREIGN KEY (customer_id) REFERENCES `customers`(id);
ALTER TABLE `leasing_loans` ADD CONSTRAINT `fk_leasing_loans_customer` FOREIGN KEY (customer_id) REFERENCES `customers`(id);
ALTER TABLE `leasing_loans` ADD CONSTRAINT `fk_leasing_loans_leasing_vehicle` FOREIGN KEY (leasing_vehicle_id) REFERENCES `leasing_vehicles`(id);
ALTER TABLE `leasing_loans` ADD CONSTRAINT `fk_leasing_loans_product` FOREIGN KEY (product_id) REFERENCES `products`(id);
ALTER TABLE `leasing_vehicle_document_images` ADD CONSTRAINT `fk_leasing_vehicles_images` FOREIGN KEY (leasing_vehicle_id) REFERENCES `leasing_vehicles`(id);
ALTER TABLE `leasing_vehicles` ADD CONSTRAINT `fk_leasing_vehicles_insurance_company` FOREIGN KEY (insurance_company_id) REFERENCES `insurance_companies`(id);
ALTER TABLE `leasing_vehicles` ADD CONSTRAINT `fk_leasing_vehicles_supplier` FOREIGN KEY (supplier_id) REFERENCES `suppliers`(id);
ALTER TABLE `leasing_vehicles` ADD CONSTRAINT `fk_leasing_vehicles_valuation_company` FOREIGN KEY (valuation_company_id) REFERENCES `valuation_companies`(id);
ALTER TABLE `leasing_vehicles` ADD CONSTRAINT `fk_leasing_vehicles_vehicle_make` FOREIGN KEY (vehicle_make_id) REFERENCES `vehicle_makes`(id);
ALTER TABLE `leasing_vehicles` ADD CONSTRAINT `fk_leasing_vehicles_vehicle_model` FOREIGN KEY (vehicle_model_id) REFERENCES `vehicle_models`(id);
ALTER TABLE `leasing_vehicles` ADD CONSTRAINT `fk_leasing_vehicles_vehicle_type` FOREIGN KEY (vehicle_type_id) REFERENCES `vehicle_types`(id);
ALTER TABLE `pdc_cheque_details` ADD CONSTRAINT `fk_pdc_cheque_details_bank` FOREIGN KEY (bank_id) REFERENCES `banks`(id);
ALTER TABLE `pdc_cheque_details` ADD CONSTRAINT `fk_pdc_securities_cheque_details` FOREIGN KEY (pdc_security_id) REFERENCES `pdc_securities`(id);
ALTER TABLE `pdc_cr_book_details` ADD CONSTRAINT `fk_pdc_securities_cr_book_details` FOREIGN KEY (pdc_security_id) REFERENCES `pdc_securities`(id);
ALTER TABLE `pdc_deed_details` ADD CONSTRAINT `fk_pdc_securities_deed_details` FOREIGN KEY (pdc_security_id) REFERENCES `pdc_securities`(id);
ALTER TABLE `product_additional_charges` ADD CONSTRAINT `fk_products_additional_charges` FOREIGN KEY (product_id) REFERENCES `products`(id);
ALTER TABLE `product_has_items` ADD CONSTRAINT `fk_products_product_has_items` FOREIGN KEY (product_id) REFERENCES `products`(id);
ALTER TABLE `product_required_documents` ADD CONSTRAINT `fk_products_required_documents` FOREIGN KEY (product_id) REFERENCES `products`(id);
ALTER TABLE `vehicle_makes` ADD CONSTRAINT `fk_vehicle_makes_vehicle_type` FOREIGN KEY (vehicle_type_id) REFERENCES `vehicle_types`(id);
ALTER TABLE `vehicle_models` ADD CONSTRAINT `fk_vehicle_models_vehicle_type` FOREIGN KEY (vehicle_type_id) REFERENCES `vehicle_types`(id);

SET FOREIGN_KEY_CHECKS = 1;
