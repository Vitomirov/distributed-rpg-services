import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialCreate1770000000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Kreiramo ENUM tip pre tabele
        await queryRunner.query(`CREATE TYPE "user_role_enum" AS ENUM('User', 'GameMaster')`);

        // 2. Kreiramo tabelu sa kolonom koja odmah koristi taj ENUM
        await queryRunner.query(`
            CREATE TABLE "user" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "username" character varying NOT NULL,
                "password" character varying NOT NULL,
                "role" "user_role_enum" NOT NULL DEFAULT 'User',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_user_id" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_user_username" UNIQUE ("username")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "user_role_enum"`);
    }
}