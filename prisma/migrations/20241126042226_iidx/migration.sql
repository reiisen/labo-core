-- CreateTable
CREATE TABLE `Lab` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `rate` DOUBLE NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Computer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `labId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `rate` DOUBLE NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Room` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `rate` DOUBLE NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Reserve` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `computerId` INTEGER NULL,
    `labId` INTEGER NULL,
    `roomId` INTEGER NULL,
    `nim` VARCHAR(191) NOT NULL,
    `reason` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `length` INTEGER NOT NULL,
    `status` ENUM('PENDING', 'ACTIVE', 'CONCLUDED', 'CANCELLED') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Computer` ADD CONSTRAINT `Computer_labId_fkey` FOREIGN KEY (`labId`) REFERENCES `Lab`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reserve` ADD CONSTRAINT `Reserve_computerId_fkey` FOREIGN KEY (`computerId`) REFERENCES `Computer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reserve` ADD CONSTRAINT `Reserve_labId_fkey` FOREIGN KEY (`labId`) REFERENCES `Lab`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reserve` ADD CONSTRAINT `Reserve_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Room`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
