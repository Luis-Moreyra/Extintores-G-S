-------------------------
-- Schema Sistema_RRHH_ExtintoresGS
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `Sistema_RRHH_ExtintoresGS` DEFAULT CHARACTER SET utf8 ;
USE `Sistema_RRHH_ExtintoresGS` ;

-- -----------------------------------------------------
-- Table `Area` (Capa General)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Area` (
  `id_area` INT NOT NULL AUTO_INCREMENT,
  `nombre_area` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id_area`))
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Horario` (Necesario para RF02 y RF07)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Horario` (
  `id_horario` INT NOT NULL AUTO_INCREMENT,
  `nombre_turno` VARCHAR(50) NOT NULL,
  `hora_entrada_oficial` TIME NOT NULL,
  `hora_salida_oficial` TIME NOT NULL,
  `tolerancia_minutos` INT DEFAULT 0,
  PRIMARY KEY (`id_horario`))
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Empleado` (Entidad Central)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Empleado` (
  `id_empleado` INT NOT NULL AUTO_INCREMENT,
  `dni` VARCHAR(8) NOT NULL, -- Usado para login de asistencia
  `nombres` VARCHAR(100) NOT NULL, -- División solicitada
  `apellidos` VARCHAR(100) NOT NULL, -- División solicitada
  `correo` VARCHAR(100) NULL,
  `id_area` INT NOT NULL,
  `id_horario` INT NOT NULL,
  PRIMARY KEY (`id_empleado`),
  UNIQUE INDEX `dni_UNIQUE` (`dni` ASC),
  CONSTRAINT `fk_Empleado_Area`
    FOREIGN KEY (`id_area`)
    REFERENCES `Area` (`id_area`),
  CONSTRAINT `fk_Empleado_Horario`
    FOREIGN KEY (`id_horario`)
    REFERENCES `Horario` (`id_horario`))
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Asistencia` (Control diario)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Asistencia` (
  `id_asistencia` INT NOT NULL AUTO_INCREMENT,
  `fecha` DATE NOT NULL,
  `hora_entrada` TIME NULL,
  `hora_salida` TIME NULL,
  `estado_asistencia` VARCHAR(20) NOT NULL, -- Puntual, Tardanza, Inasistencia
  `observacion_justificacion` TEXT NULL, -- Justificación integrada
  `id_empleado` INT NOT NULL,
  PRIMARY KEY (`id_asistencia`),
  CONSTRAINT `fk_Asistencia_Empleado`
    FOREIGN KEY (`id_empleado`)
    REFERENCES `Empleado` (`id_empleado`))
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Convocatoria` (Reclutamiento)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Convocatoria` (
  `id_convocatoria` INT NOT NULL AUTO_INCREMENT,
  `cargo` VARCHAR(100) NOT NULL,
  `requisitos` TEXT NULL,
  `fecha_publicacion` DATE NOT NULL,
  PRIMARY KEY (`id_convocatoria`))
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Postulante` (Selección)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Postulante` (
  `id_postulante` INT NOT NULL AUTO_INCREMENT,
  `nombres` VARCHAR(100) NOT NULL,
  `apellidos` VARCHAR(100) NOT NULL,
  `perfil` TEXT NULL,
  `puntuacion_final` DECIMAL(5,2) NULL,
  `id_convocatoria` INT NOT NULL,
  PRIMARY KEY (`id_postulante`),
  CONSTRAINT `fk_Postulante_Convocatoria`
    FOREIGN KEY (`id_convocatoria`)
    REFERENCES `Convocatoria` (`id_convocatoria`))
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Evaluacion` (Unifica Entrevista y Desempeño)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Evaluacion` (
  `id_evaluacion` INT NOT NULL AUTO_INCREMENT,
  `tipo_evaluacion` ENUM('Entrevista', 'Desempeño') NOT NULL,
  `fecha` DATETIME NOT NULL,
  `puntaje` DECIMAL(5,2) NULL,
  `observaciones` TEXT NULL,
  `id_postulante` INT NULL,
  `id_empleado` INT NULL,
  PRIMARY KEY (`id_evaluacion`),
  CONSTRAINT `fk_Evaluacion_Postulante`
    FOREIGN KEY (`id_postulante`)
    REFERENCES `Postulante` (`id_postulante`),
  CONSTRAINT `fk_Evaluacion_Empleado`
    FOREIGN KEY (`id_empleado`)
    REFERENCES `Empleado` (`id_empleado`))
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Contrato` (Expediente digital)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Contrato` (
  `id_contrato` INT NOT NULL AUTO_INCREMENT,
  `fecha_inicio` DATE NOT NULL,
  `documento_pdf` VARCHAR(255) NULL, -- Ruta al archivo del contrato
  `id_empleado` INT NOT NULL,
  PRIMARY KEY (`id_contrato`),
  UNIQUE INDEX `id_empleado_UNIQUE` (`id_empleado` ASC), -- Un contrato por empleado activo
  CONSTRAINT `fk_Contrato_Empleado`
    FOREIGN KEY (`id_empleado`)
    REFERENCES `Empleado` (`id_empleado`))
ENGINE = InnoDB;