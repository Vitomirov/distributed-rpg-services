import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEnemyActionTimestamp1776500000000 implements MigrationInterface {
  name = "AddEnemyActionTimestamp1776500000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "duels" ADD COLUMN IF NOT EXISTS "lastEnemyActionAt" TIMESTAMP`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "duels" DROP COLUMN IF EXISTS "lastEnemyActionAt"`);
  }
}
