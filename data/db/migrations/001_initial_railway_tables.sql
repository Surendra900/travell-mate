-- Migration 001: Additive Real Railway Data Tables
-- Strictly additive schema migration per Standing Decision S4.
-- Target: PostgreSQL / Neon / Local Docker Postgres

CREATE TABLE IF NOT EXISTS "Station" (
  "code" VARCHAR(16) PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "state" VARCHAR(128),
  "zone" VARCHAR(32),
  "latitude" DOUBLE PRECISION,
  "longitude" DOUBLE PRECISION,
  "address" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_station_name" ON "Station" ("name");
CREATE INDEX IF NOT EXISTS "idx_station_state" ON "Station" ("state");
CREATE INDEX IF NOT EXISTS "idx_station_zone" ON "Station" ("zone");

CREATE TABLE IF NOT EXISTS "StationAlias" (
  "id" VARCHAR(64) PRIMARY KEY,
  "oldCodeOrName" VARCHAR(128) NOT NULL,
  "currentCode" VARCHAR(16) NOT NULL REFERENCES "Station"("code") ON DELETE CASCADE,
  "source" VARCHAR(64) NOT NULL DEFAULT 'IR_HISTORICAL',
  "note" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_station_alias_old" ON "StationAlias" ("oldCodeOrName");
CREATE INDEX IF NOT EXISTS "idx_station_alias_current" ON "StationAlias" ("currentCode");

CREATE TABLE IF NOT EXISTS "Train" (
  "number" VARCHAR(32) PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "type" VARCHAR(64),
  "fromCode" VARCHAR(16) NOT NULL REFERENCES "Station"("code") ON DELETE RESTRICT,
  "toCode" VARCHAR(16) NOT NULL REFERENCES "Station"("code") ON DELETE RESTRICT,
  "distanceKm" INTEGER,
  "zone" VARCHAR(32),
  "classFlags" JSONB,
  "returnTrain" VARCHAR(32),
  "sourceDataset" VARCHAR(64) NOT NULL DEFAULT 'datameet',
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_train_from" ON "Train" ("fromCode");
CREATE INDEX IF NOT EXISTS "idx_train_to" ON "Train" ("toCode");
CREATE INDEX IF NOT EXISTS "idx_train_type" ON "Train" ("type");
CREATE INDEX IF NOT EXISTS "idx_train_source" ON "Train" ("sourceDataset");

CREATE TABLE IF NOT EXISTS "TrainStop" (
  "id" VARCHAR(128) PRIMARY KEY,
  "trainNumber" VARCHAR(32) NOT NULL REFERENCES "Train"("number") ON DELETE CASCADE,
  "sequence" INTEGER NOT NULL,
  "stationCode" VARCHAR(16) NOT NULL REFERENCES "Station"("code") ON DELETE CASCADE,
  "arrivalMinutes" INTEGER,
  "departureMinutes" INTEGER,
  "haltMinutes" INTEGER,
  "distanceKm" INTEGER,
  "dayOffset" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT "uq_train_stop_seq" UNIQUE ("trainNumber", "sequence")
);

CREATE INDEX IF NOT EXISTS "idx_train_stop_station" ON "TrainStop" ("stationCode");
CREATE INDEX IF NOT EXISTS "idx_train_stop_train" ON "TrainStop" ("trainNumber");
CREATE INDEX IF NOT EXISTS "idx_train_stop_station_dep" ON "TrainStop" ("stationCode", "departureMinutes");

CREATE TABLE IF NOT EXISTS "TrainRunDay" (
  "id" VARCHAR(64) PRIMARY KEY,
  "trainNumber" VARCHAR(32) NOT NULL REFERENCES "Train"("number") ON DELETE CASCADE,
  "mon" BOOLEAN NOT NULL DEFAULT TRUE,
  "tue" BOOLEAN NOT NULL DEFAULT TRUE,
  "wed" BOOLEAN NOT NULL DEFAULT TRUE,
  "thu" BOOLEAN NOT NULL DEFAULT TRUE,
  "fri" BOOLEAN NOT NULL DEFAULT TRUE,
  "sat" BOOLEAN NOT NULL DEFAULT TRUE,
  "sun" BOOLEAN NOT NULL DEFAULT TRUE,
  "validFrom" TIMESTAMP WITH TIME ZONE,
  "validTo" TIMESTAMP WITH TIME ZONE,
  "source" VARCHAR(64) NOT NULL DEFAULT 'unknown',
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_train_runday_train" ON "TrainRunDay" ("trainNumber");
CREATE INDEX IF NOT EXISTS "idx_train_runday_source" ON "TrainRunDay" ("source");

CREATE TABLE IF NOT EXISTS "DelaySnapshot" (
  "id" VARCHAR(64) PRIMARY KEY,
  "trainNumber" VARCHAR(32) NOT NULL REFERENCES "Train"("number") ON DELETE CASCADE,
  "delayMinutes" INTEGER NOT NULL DEFAULT 0,
  "cancelled" BOOLEAN NOT NULL DEFAULT FALSE,
  "observedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "source" VARCHAR(64) NOT NULL DEFAULT 'railpull_snapshot'
);

CREATE INDEX IF NOT EXISTS "idx_delay_snapshot_train" ON "DelaySnapshot" ("trainNumber");
CREATE INDEX IF NOT EXISTS "idx_delay_snapshot_observed" ON "DelaySnapshot" ("observedAt");

CREATE TABLE IF NOT EXISTS "DatasetVersion" (
  "id" VARCHAR(64) PRIMARY KEY,
  "source" VARCHAR(64) NOT NULL,
  "license" VARCHAR(128) NOT NULL,
  "sourceReference" VARCHAR(255) NOT NULL,
  "checksum" VARCHAR(128) NOT NULL,
  "rowCounts" JSONB NOT NULL,
  "importedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_dataset_version_source" ON "DatasetVersion" ("source");
CREATE INDEX IF NOT EXISTS "idx_dataset_version_imported" ON "DatasetVersion" ("importedAt");
