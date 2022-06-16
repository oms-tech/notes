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

const Note: NextPage<NoteProps> = ({ raw, course, title, readingTime }) => (
  <main>
    <div className="relative py-16 bg-white overflow-hidden">
      <div className="relative px-4 sm:px-6 lg:px-8">
        <div className="text-lg max-w-prose mx-auto">
          <h1>
            <span className="block text-base text-center text-indigo-600 font-semibold tracking-wide uppercase">
              {course}
            </span>
            <span className="mt-2 block text-3xl text-center leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              {title}
            </span>
            <span className="mt-2 block text-base text-center leading-8 font-extrabold tracking-tight text-gray-300 sm:text-4xl">
              {readingTime.text}
            </span>
          </h1>
        </div>
        <div className="mt-6 prose prose-indigo prose-lg text-gray-500 mx-auto">
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
        </div>
      </div>
    </div>
  </main>
);

export default Note;
