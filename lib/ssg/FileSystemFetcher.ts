import glob from "glob";
import path from "path";
import fs from "fs";

import { Fetcher, Params } from "./Fetcher";

export class FileSystemFetcher implements Fetcher {
  public notesRoot = "notes";

  getParams = async () => {
    return new Promise<Params[]>((resolve, reject) => {
      glob("**/*.md", { cwd: this.notesRoot }, (err, filenames) => {
        if (err) return reject(err);

        const paths = filenames
          .map(path.parse)
          .map(({ dir: course, name: id }) => ({
            course,
            id,
          }));

        return resolve(paths);
      });
    });
  };

  getNote = async (params: Params) => {
    const { course, id } = params;

    const notePath = path.format({
      dir: path.join(this.notesRoot, course),
      name: id,
      ext: ".md",
    });

    return new Promise<string>((resolve, reject) => {
      fs.readFile(notePath, (err, buffer) => {
        if (err) return reject(err);

        return resolve(buffer.toString());
      });
    });
  };
}
