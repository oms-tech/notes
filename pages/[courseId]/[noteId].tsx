import { parse } from "yaml";
import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Image from "next/image";
import { s } from "hastscript";

import { remark } from "remark";
import ReactMarkdown from "react-markdown";
import remarkFrontmatter from "remark-frontmatter";
import remarkExtractFrontmatter from "remark-extract-frontmatter";
import remarkReadingTime from "remark-reading-time";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { nord } from "react-syntax-highlighter/dist/cjs/styles/prism";

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
        <div className="mt-6 prose prose-pre:p-0 prose-indigo prose-md text-gray-500 mx-auto">
          <ReactMarkdown
            remarkPlugins={[remarkFrontmatter, remarkMath]}
            rehypePlugins={[
              rehypeKatex,
              rehypeSlug,
              [
                rehypeAutolinkHeadings,
                {
                  content() {
                    return [
                      s(
                        "svg",
                        {
                          xmlns: "http://www.w3.org/2000/svg",
                          viewBox: "0 0 16 16",
                          width: "16",
                          height: "16",
                        },
                        [
                          s("path", {
                            fillRule: "evenodd",
                            d: "M7.775 3.275a.75.75 0 001.06 1.06l1.25-1.25a2 2 0 112.83 2.83l-2.5 2.5a2 2 0 01-2.83 0 .75.75 0 00-1.06 1.06 3.5 3.5 0 004.95 0l2.5-2.5a3.5 3.5 0 00-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 010-2.83l2.5-2.5a2 2 0 012.83 0 .75.75 0 001.06-1.06 3.5 3.5 0 00-4.95 0l-2.5 2.5a3.5 3.5 0 004.95 4.95l1.25-1.25a.75.75 0 00-1.06-1.06l-1.25 1.25a2 2 0 01-2.83 0z",
                          }),
                        ]
                      ),
                    ];
                  },
                },
              ],
            ]}
            disallowedElements={["h1"]}
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                return match && !inline ? (
                  <SyntaxHighlighter
                    customStyle={{ margin: 0 }}
                    language={match[1]}
                    {...props}
                    style={nord}
                    showLineNumbers
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                ) : (
                  <code className="bg-gray-100 rounded-sm p-1" {...props}>
                    {children}
                  </code>
                );
              },
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
