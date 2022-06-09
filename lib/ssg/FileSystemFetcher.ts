import glob from "glob";
import path from "path";
import fs from "fs";

import { NoteParams, NoteContent } from "../../types";
import { Fetcher } from "./Fetcher";

export class FileSystemFetcher implements Fetcher {
  private notesRoot = "notes";

  getParams = async () => {
    return new Promise<NoteParams[]>((resolve, reject) => {
      glob("**/*.md", { cwd: this.notesRoot }, (err, filenames) => {
        if (err) return reject(err);

        const paths = filenames
          .map(path.parse)
          .map(({ dir: courseId, name: noteId }) => ({
            courseId,
            noteId,
          }));

        return resolve(paths);
      });
    });
  };

  getNote = async (params: NoteParams) => {
    const { courseId, noteId } = params;

    const notePath = path.format({
      dir: path.join(this.notesRoot, courseId),
      name: noteId,
      ext: ".md",
    });

    return new Promise<NoteContent>((resolve, reject) => {
      fs.readFile(notePath, (err, buffer) => {
        if (err) return reject(err);

        const raw = buffer.toString();

        return resolve({ raw });
      });
    });
  };
}
