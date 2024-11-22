-- CreateTable
CREATE TABLE `Lab` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `floor` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Reserve` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `labId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `reason` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `length` INTEGER NOT NULL,
    `status` ENUM('PENDING', 'ACTIVE', 'CONCLUDED', 'CANCELLED') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Reserve` ADD CONSTRAINT `Reserve_labId_fkey` FOREIGN KEY (`labId`) REFERENCES `Lab`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;