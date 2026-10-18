import { Response } from "express";
import { AppDataSource } from "../../config/db";
import { CharacterClass } from "../../entities/CharacterClass";
import { classPreview, findStudent } from "../../config/gameTemplates";
import { AuthRequest } from "@shared/types";

// GET /api/classes
export async function listClasses(_req: AuthRequest, res: Response) {
  try {
    const classes = await AppDataSource.getRepository(CharacterClass).find();
    return res.json(
      classes.map((characterClass) => {
        const student = findStudent(characterClass.id);
        return {
          id: characterClass.id,
          name: characterClass.name,
          description: characterClass.description,
          template: student ? classPreview(student) : null,
        };
      })
    );
  } catch (err) {
    console.error("LIST CLASSES ERROR:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
