import { MigrationInterface, QueryRunner } from "typeorm";

export class InitCharacterSchema1766343715066 implements MigrationInterface {
    name = 'InitCharacterSchema1766343715066'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        await queryRunner.query(`CREATE TABLE "character_class" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying NOT NULL, CONSTRAINT "UQ_556b9e92738c98002dd48aa3ca0" UNIQUE ("name"), CONSTRAINT "PK_276ec655759722c21e834368f6c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "item" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying NOT NULL, "bonusStrength" integer NOT NULL DEFAULT '0', "bonusAgility" integer NOT NULL DEFAULT '0', "bonusIntelligence" integer NOT NULL DEFAULT '0', "bonusFaith" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_d3c0c71f23e7adcf952a1d13423" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "character_item" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "acquiredAt" TIMESTAMP NOT NULL DEFAULT now(), "characterId" uuid, "itemId" uuid, CONSTRAINT "PK_e4a897636d3db088f47702415a5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "character" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "health" integer NOT NULL, "mana" integer NOT NULL, "baseStrength" integer NOT NULL, "baseAgility" integer NOT NULL, "baseIntelligence" integer NOT NULL, "baseFaith" integer NOT NULL, "createdBy" character varying NOT NULL, "characterClassId" uuid, CONSTRAINT "UQ_d80158dde1461b74ed8499e7d89" UNIQUE ("name"), CONSTRAINT "PK_6c4aec48c564968be15078b8ae5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "character_item" ADD CONSTRAINT "FK_a533a7339e040463d5d2bfa7da6" FOREIGN KEY ("characterId") REFERENCES "character"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "character_item" ADD CONSTRAINT "FK_a9ccbb5fe58c0fcc9be39bda7ea" FOREIGN KEY ("itemId") REFERENCES "item"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "character" ADD CONSTRAINT "FK_93aa19395151af9dba61b4d8708" FOREIGN KEY ("characterClassId") REFERENCES "character_class"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "character" DROP CONSTRAINT "FK_93aa19395151af9dba61b4d8708"`);
        await queryRunner.query(`ALTER TABLE "character_item" DROP CONSTRAINT "FK_a9ccbb5fe58c0fcc9be39bda7ea"`);
        await queryRunner.query(`ALTER TABLE "character_item" DROP CONSTRAINT "FK_a533a7339e040463d5d2bfa7da6"`);
        await queryRunner.query(`DROP TABLE "character"`);
        await queryRunner.query(`DROP TABLE "character_item"`);
        await queryRunner.query(`DROP TABLE "item"`);
        await queryRunner.query(`DROP TABLE "character_class"`);
    }

}
