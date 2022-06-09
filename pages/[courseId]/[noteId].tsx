import { parse } from "yaml";
import { GetStaticPaths, GetStaticProps, NextPage } from "next";

import { remark } from "remark";
import ReactMarkdown from "react-markdown";
import remarkFrontmatter from "remark-frontmatter";
import remarkExtractFrontmatter from "remark-extract-frontmatter";
import remarkReadingTime from "remark-reading-time";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

import { Note as NoteComponent } from "../../components/Note";
import { FileSystemFetcher } from "../../lib/ssg";
import { isNoteMetadata, NoteParams, Note as NoteProps } from "../../types";

const fetcher = new FileSystemFetcher();

export const getStaticPaths: GetStaticPaths<NoteParams> = async () => {
  const params = await fetcher.getParams();
  const paths = params.map((params) => ({ params }));

  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps<NoteProps, NoteParams> = async ({
  params,
}) => {
  if (!params) throw new Error("'params' not found.");

  const { raw } = await fetcher.getNote(params);
  const { data } = await remark()
    .use(remarkFrontmatter)
    .use(remarkExtractFrontmatter, { yaml: parse })
    .use(remarkReadingTime, {})
    .process(raw);

  if (!isNoteMetadata(data)) {
    throw new Error(`'data' missing fields, exiting: ${data}`);
  }

  return { props: { ...data, raw } };
};

const Note: NextPage<NoteProps> = ({ raw, ...metadata }) => {
  return (
    <main>
      <NoteComponent {...metadata}>
        <ReactMarkdown
          remarkPlugins={[remarkFrontmatter, remarkMath]}
          rehypePlugins={[
            rehypeKatex,
            rehypeSlug,
            [rehypeAutolinkHeadings, { behavior: "wrap" }],
          ]}
          disallowedElements={["h1"]}
        >
          {raw}
        </ReactMarkdown>
      </NoteComponent>
    </main>
  );
};

export default Note;
