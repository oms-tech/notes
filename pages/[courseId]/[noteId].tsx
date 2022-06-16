import { parse } from "yaml";
import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Image from "next/image";

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
            components={{
              img({ node, src = "", ...props }) {
                return (
                  <span className="relative block" style={{ height: 450 }}>
                    <Image
                      {...props}
                      alt=""
                      src={src}
                      placeholder="blur"
                      layout="fill"
                      objectPosition="center"
                      objectFit="contain"
                      blurDataURL="data:image/svg+xml;base64,Cjxzdmcgd2lkdGg9IjcwMCIgaGVpZ2h0PSI0NzUiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImciPgogICAgICA8c3RvcCBzdG9wLWNvbG9yPSIjMzMzIiBvZmZzZXQ9IjIwJSIgLz4KICAgICAgPHN0b3Agc3RvcC1jb2xvcj0iIzIyMiIgb2Zmc2V0PSI1MCUiIC8+CiAgICAgIDxzdG9wIHN0b3AtY29sb3I9IiMzMzMiIG9mZnNldD0iNzAlIiAvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjcwMCIgaGVpZ2h0PSI0NzUiIGZpbGw9IiMzMzMiIC8+CiAgPHJlY3QgaWQ9InIiIHdpZHRoPSI3MDAiIGhlaWdodD0iNDc1IiBmaWxsPSJ1cmwoI2cpIiAvPgogIDxhbmltYXRlIHhsaW5rOmhyZWY9IiNyIiBhdHRyaWJ1dGVOYW1lPSJ4IiBmcm9tPSItNzAwIiB0bz0iNzAwIiBkdXI9IjFzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIgIC8+Cjwvc3ZnPg=="
                    />
                  </span>
                );
              },
            }}
          >
            {raw}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  </main>
);

export default Note;
