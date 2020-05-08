-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `mydb` DEFAULT CHARACTER SET utf8 ;
USE `mydb` ;

-- -----------------------------------------------------
-- Table `mydb`.`USER`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`USER` (
  `USER_ID` INT NOT NULL,
  `NAME` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`USER_ID`),
  UNIQUE INDEX `NAME_UNIQUE` (`NAME` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`POST`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`POST` (
  `POST_ID` INT NOT NULL,
  `USER_ID` INT NOT NULL,
  `DESCRIPTION` VARCHAR(200) NOT NULL,
  `CREATED_AT` DATETIME NOT NULL,
  `PHOTO_LINK` VARCHAR(45) NULL,
  PRIMARY KEY (`POST_ID`),
  INDEX `FK_POST_USER_idx` (`USER_ID` ASC) VISIBLE,
  CONSTRAINT `FK_POST_USER`
    FOREIGN KEY (`USER_ID`)
    REFERENCES `mydb`.`USER` (`USER_ID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`TAG`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`TAG` (
  `TAG_ID` INT NOT NULL,
  `NAME` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`TAG_ID`),
  UNIQUE INDEX `NAME_UNIQUE` (`NAME` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`POST_was_LIKED`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`POST_was_LIKED` (
  `POST_ID` INT NOT NULL,
  `USER_ID` INT NOT NULL,
  PRIMARY KEY (`POST_ID`, `USER_ID`),
  INDEX `fk_POST_has_USER_USER1_idx` (`USER_ID` ASC) VISIBLE,
  INDEX `fk_POST_has_USER_POST1_idx` (`POST_ID` ASC) VISIBLE,
  CONSTRAINT `fk_POST_has_USER_POST1`
    FOREIGN KEY (`POST_ID`)
    REFERENCES `mydb`.`POST` (`POST_ID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_POST_has_USER_USER1`
    FOREIGN KEY (`USER_ID`)
    REFERENCES `mydb`.`USER` (`USER_ID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`POST_has_TAG`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`POST_has_TAG` (
  `POST_POST_ID` INT NOT NULL,
  `TAG_TAG_ID` INT NOT NULL,
  PRIMARY KEY (`POST_POST_ID`, `TAG_TAG_ID`),
  INDEX `fk_POST_has_TAG_TAG1_idx` (`TAG_TAG_ID` ASC) VISIBLE,
  INDEX `fk_POST_has_TAG_POST1_idx` (`POST_POST_ID` ASC) VISIBLE,
  CONSTRAINT `fk_POST_has_TAG_POST1`
    FOREIGN KEY (`POST_POST_ID`)
    REFERENCES `mydb`.`POST` (`POST_ID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_POST_has_TAG_TAG1`
    FOREIGN KEY (`TAG_TAG_ID`)
    REFERENCES `mydb`.`TAG` (`TAG_ID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

-- -----------------------------------------------------
-- Data for table `mydb`.`USER`
-- -----------------------------------------------------
START TRANSACTION;
USE `mydb`;
INSERT INTO `mydb`.`USER` (`USER_ID`, `NAME`) VALUES (1, 'Ilya');
INSERT INTO `mydb`.`USER` (`USER_ID`, `NAME`) VALUES (2, 'Someone');

COMMIT;


-- -----------------------------------------------------
-- Data for table `mydb`.`POST`
-- -----------------------------------------------------
START TRANSACTION;
USE `mydb`;
INSERT INTO `mydb`.`POST` (`POST_ID`, `USER_ID`, `DESCRIPTION`, `CREATED_AT`, `PHOTO_LINK`) VALUES (1, 1, 'hello1 tag1', '2020-05-08 10:00:00', NULL);
INSERT INTO `mydb`.`POST` (`POST_ID`, `USER_ID`, `DESCRIPTION`, `CREATED_AT`, `PHOTO_LINK`) VALUES (2, 1, 'hello2 tag2', '2020-05-08 11:00:00', NULL);
INSERT INTO `mydb`.`POST` (`POST_ID`, `USER_ID`, `DESCRIPTION`, `CREATED_AT`, `PHOTO_LINK`) VALUES (3, 1, 'hello3 tag3', '2020-05-08 12:00:00', NULL);
INSERT INTO `mydb`.`POST` (`POST_ID`, `USER_ID`, `DESCRIPTION`, `CREATED_AT`, `PHOTO_LINK`) VALUES (4, 1, 'hello4', '2020-05-08 13:00:00', NULL);
INSERT INTO `mydb`.`POST` (`POST_ID`, `USER_ID`, `DESCRIPTION`, `CREATED_AT`, `PHOTO_LINK`) VALUES (5, 1, 'hello5', '2020-05-08 14:00:00', NULL);
INSERT INTO `mydb`.`POST` (`POST_ID`, `USER_ID`, `DESCRIPTION`, `CREATED_AT`, `PHOTO_LINK`) VALUES (6, 1, 'hello6', '2020-05-08 15:00:00', NULL);
INSERT INTO `mydb`.`POST` (`POST_ID`, `USER_ID`, `DESCRIPTION`, `CREATED_AT`, `PHOTO_LINK`) VALUES (7, 1, 'hello7', '2020-05-08 16:00:00', NULL);
INSERT INTO `mydb`.`POST` (`POST_ID`, `USER_ID`, `DESCRIPTION`, `CREATED_AT`, `PHOTO_LINK`) VALUES (8, 1, 'hello8', '2020-05-08 17:00:00', NULL);
INSERT INTO `mydb`.`POST` (`POST_ID`, `USER_ID`, `DESCRIPTION`, `CREATED_AT`, `PHOTO_LINK`) VALUES (9, 1, 'hello9', '2020-05-08 18:00:00', NULL);
INSERT INTO `mydb`.`POST` (`POST_ID`, `USER_ID`, `DESCRIPTION`, `CREATED_AT`, `PHOTO_LINK`) VALUES (10, 1, 'test', '2020-05-08 19:00:00', NULL);

COMMIT;


-- -----------------------------------------------------
-- Data for table `mydb`.`TAG`
-- -----------------------------------------------------
START TRANSACTION;
USE `mydb`;
INSERT INTO `mydb`.`TAG` (`TAG_ID`, `NAME`) VALUES (1, 'tag1');
INSERT INTO `mydb`.`TAG` (`TAG_ID`, `NAME`) VALUES (2, 'tag2');
INSERT INTO `mydb`.`TAG` (`TAG_ID`, `NAME`) VALUES (3, 'tag3');

COMMIT;


-- -----------------------------------------------------
-- Data for table `mydb`.`POST_was_LIKED`
-- -----------------------------------------------------
START TRANSACTION;
USE `mydb`;
INSERT INTO `mydb`.`POST_was_LIKED` (`POST_ID`, `USER_ID`) VALUES (1, 2);
INSERT INTO `mydb`.`POST_was_LIKED` (`POST_ID`, `USER_ID`) VALUES (2, 2);
INSERT INTO `mydb`.`POST_was_LIKED` (`POST_ID`, `USER_ID`) VALUES (3, 2);

COMMIT;


-- -----------------------------------------------------
-- Data for table `mydb`.`POST_has_TAG`
-- -----------------------------------------------------
START TRANSACTION;
USE `mydb`;
INSERT INTO `mydb`.`POST_has_TAG` (`POST_POST_ID`, `TAG_TAG_ID`) VALUES (1, 1);
INSERT INTO `mydb`.`POST_has_TAG` (`POST_POST_ID`, `TAG_TAG_ID`) VALUES (2, 2);
INSERT INTO `mydb`.`POST_has_TAG` (`POST_POST_ID`, `TAG_TAG_ID`) VALUES (3, 3);

COMMIT;

