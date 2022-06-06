import { FileSystemFetcher } from "../../lib/ssg";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkFrontmatter from "remark-frontmatter";
import remarkStringify from "remark-stringify";
import fs from "fs";
import path from "path";

const fetcher = new FileSystemFetcher();

const titleMap: { [key: string]: string } = {};

function addFrontmatter({ key }: { key: string }) {
  return function transformer(tree: any) {
    titleMap[key] = tree.children[0].children[0].value;
  };
}

export default async function handler(req: any, res: any) {
  const params = await fetcher.getParams();

  for (const { course, id } of params) {
    const courseMap = {
      "computer-networks": "Computer Networks",
      "information-security": "Introduction to Information Security",
      "machine-learning-trading": "Machine Learning for Trading",
      "operating-systems": "Introduction to Operating Systems",
      "secure-computer-systems": "Secure Computer Systems",
      simulation: "Simulation",
    };

    const note = await fetcher.getNote({ course, id });
    // @ts-ignore
    const courseName = courseMap[course];
    const key = `${course}-${id}`;

    await unified()
      .use(remarkFrontmatter)
      .use(remarkParse)
      .use(remarkStringify)
      .use(addFrontmatter, { key })
      .process(note);

    const frontMatter = `---
course: ${courseName}
title: ${titleMap[key]}
---

`;

    fs.writeFile(
      path.join("notes", course, id + ".md"),
      frontMatter + note,
      {},
      (err) => {
        if (!err) console.log("success");
      }
    );
  }

  res.status(200).json({ name: "John Doe" });
}
