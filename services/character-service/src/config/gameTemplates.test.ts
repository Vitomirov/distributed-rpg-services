import { attackDamage, castDamage } from "@shared/combatMath";
import { ENCOUNTERS, resolveStudentTemplate, STUDENT_CLASSES } from "./gameTemplates";

describe("student list templates", () => {
  it("applies pure-heart stats only when combat stats are omitted", () => {
    const govornica = STUDENT_CLASSES[2];
    const resolved = resolveStudentTemplate(govornica.id, {});
    expect(resolved?.health).toBe(100);
    expect(resolved?.baseFaith).toBe(12);

    expect(resolveStudentTemplate(govornica.id, { baseStrength: 99 })).toBeNull();
    expect(resolveStudentTemplate("69c56550-b39a-440a-a84f-830ca734cfb6", {})).toBeNull();
  });

  it("keeps students ahead of the activist they meet", () => {
    for (const student of STUDENT_CLASSES) {
      expect(student.stats.health).toBe(100);
      expect(student.stats.baseFaith).toBeGreaterThanOrEqual(12);
    }
    for (const encounter of Object.values(ENCOUNTERS)) {
      expect(encounter.stats.health).toBe(100);
    }

    const vredalo = ENCOUNTERS.vredalo.stats;
    const batinas = ENCOUNTERS.batinas.stats;
    expect(attackDamage(vredalo.baseStrength, vredalo.baseAgility)).toBe(8);
    expect(attackDamage(8, 16)).toBeGreaterThan(attackDamage(batinas.baseStrength, batinas.baseAgility));

    const speaker = STUDENT_CLASSES.find((student) => student.name === "Govornica");
    expect(speaker).toBeDefined();
    expect(castDamage(speaker!.stats.baseIntelligence)).toBe(32);
    expect(castDamage(speaker!.stats.baseIntelligence)).toBeGreaterThan(
      castDamage(ENCOUNTERS.funkcioner.stats.baseIntelligence)
    );
  });
});
