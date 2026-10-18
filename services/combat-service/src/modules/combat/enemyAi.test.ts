import { enemyActionLabel, pickEnemyAction } from "./enemyAi";

describe("activist turn", () => {
  it("weights the early activist toward insults", () => {
    expect(pickEnemyAction(2, 4, 0)).toBe("attack");
    expect(pickEnemyAction(2, 4, 6)).toBe("attack");
    expect(pickEnemyAction(2, 4, 7)).toBe("cast");
    expect(pickEnemyAction(2, 4, 9)).toBe("heal");
    expect(enemyActionLabel("attack", 2, 4)).toBe("Uvreda");
  });

  it("weights the night raider toward a shove", () => {
    expect(pickEnemyAction(3, 10, 0)).toBe("attack");
    expect(pickEnemyAction(3, 10, 7)).toBe("attack");
    expect(pickEnemyAction(3, 10, 8)).toBe("cast");
    expect(pickEnemyAction(3, 10, 9)).toBe("heal");
    expect(enemyActionLabel("attack", 3, 10)).toBe("Guranje");
  });

  it("weights the official toward a threat", () => {
    expect(pickEnemyAction(4, 6, 0)).toBe("cast");
    expect(pickEnemyAction(4, 6, 4)).toBe("cast");
    expect(pickEnemyAction(4, 6, 5)).toBe("attack");
    expect(pickEnemyAction(4, 6, 9)).toBe("heal");
    expect(enemyActionLabel("attack", 4, 6)).toBe("Uvreda");
  });
});
