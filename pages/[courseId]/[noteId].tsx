import { parse } from "yaml";
import { Fragment, useState } from "react";
import { Dialog, Menu, Transition } from "@headlessui/react";
import { MarkGithubIcon } from "@primer/octicons-react";
import {
  BellIcon,
  CalendarIcon,
  ChartBarIcon,
  FolderIcon,
  HomeIcon,
  InboxIcon,
  MenuAlt2Icon,
  UsersIcon,
  XIcon,
} from "@heroicons/react/outline";
import { SearchIcon } from "@heroicons/react/solid";
import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Image from "next/image";
import { s } from "hastscript";

import { remark } from "remark";
import ReactMarkdown from "react-markdown";
import remarkFrontmatter from "remark-frontmatter";
import remarkExtractFrontmatter from "remark-extract-frontmatter";
import remarkReadingTime from "remark-reading-time";
import remarkSlug from "remark-slug";
import remarkToc from "@stefanprobst/remark-extract-toc";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { nord } from "react-syntax-highlighter/dist/cjs/styles/prism";

import { FileSystemFetcher } from "../../lib/ssg";
import {
  repoRootUrl,
  viewFileUrl,
  editFileUrl,
  createIssueUrl,
} from "../../lib/util/github";
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
    .use(remarkSlug)
    .use(remarkToc)
    .process(raw);

  if (!isNoteMetadata(data)) {
    throw new Error(`'data' missing fields, exiting: ${data}`);
  }

  return { props: { ...data, ...params, raw } };
};

const navigation = [
  { name: "Dashboard", href: "#", icon: HomeIcon, current: true },
  { name: "Team", href: "#", icon: UsersIcon, current: false },
  { name: "Projects", href: "#", icon: FolderIcon, current: false },
  { name: "Calendar", href: "#", icon: CalendarIcon, current: false },
  { name: "Documents", href: "#", icon: InboxIcon, current: false },
  { name: "Reports", href: "#", icon: ChartBarIcon, current: false },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const Note: NextPage<NoteProps> = ({
  raw,
  course,
  title,
  readingTime,
  courseId,
  noteId,
  toc,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const userNavigation = [
    { name: "Submit typo report", href: createIssueUrl(course, title) },
    { name: "View this page", href: viewFileUrl(courseId, noteId) },
    { name: "Edit this page", href: editFileUrl(courseId, noteId) },
    { name: "View repository", href: repoRootUrl },
  ];

  return (
    <div>
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-40 md:hidden"
          onClose={setSidebarOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </Transition.Child>

          <div className="fixed inset-0 flex z-40">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-indigo-700">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute top-0 right-0 -mr-12 pt-2">
                    <button
                      type="button"
                      className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XIcon
                        className="h-6 w-6 text-white"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </Transition.Child>
                <div className="flex-shrink-0 flex items-center px-4">
                  <div className="relative h-8 w-full">
                    <Image
                      src="https://tailwindui.com/img/logos/workflow-logo-indigo-300-mark-white-text.svg"
                      alt="Workflow"
                      layout="fill"
                      objectPosition="left"
                      objectFit="contain"
                    />
                  </div>
                </div>
                <div className="mt-5 flex-1 h-0 overflow-y-auto">
                  <nav className="px-2 space-y-1">
                    {navigation.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        className={classNames(
                          item.current
                            ? "bg-indigo-800 text-white"
                            : "text-indigo-100 hover:bg-indigo-600",
                          "group flex items-center px-2 py-2 text-base font-medium rounded-md"
                        )}
                      >
                        <item.icon
                          className="mr-4 flex-shrink-0 h-6 w-6 text-indigo-300"
                          aria-hidden="true"
                        />
                        {item.name}
                      </a>
                    ))}
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
            <div className="flex-shrink-0 w-14" aria-hidden="true">
              {/* Dummy element to force sidebar to shrink to fit close icon */}
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        {/* Sidebar component, swap this element with another sidebar if you like */}
        <div className="flex flex-col flex-grow pt-5 bg-indigo-700 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <div className="relative h-8 w-full">
              <Image
                src="https://tailwindui.com/img/logos/workflow-logo-indigo-300-mark-white-text.svg"
                alt="Workflow"
                layout="fill"
                objectPosition="left"
                objectFit="contain"
              />
            </div>
          </div>
          <div className="mt-5 flex-1 flex flex-col">
            <nav className="flex-1 px-2 pb-4 space-y-1">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={classNames(
                    item.current
                      ? "bg-indigo-800 text-white"
                      : "text-indigo-100 hover:bg-indigo-600",
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                  )}
                >
                  <item.icon
                    className="mr-3 flex-shrink-0 h-6 w-6 text-indigo-300"
                    aria-hidden="true"
                  />
                  {item.name}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </div>
      <div className="md:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            type="button"
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <MenuAlt2Icon className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex">
              <form className="w-full flex md:ml-0" action="#" method="GET">
                <label htmlFor="search-field" className="sr-only">
                  Search
                </label>
                <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <input
                    id="search-field"
                    className="block w-full h-full pl-8 pr-3 py-2 border-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-0 focus:border-transparent sm:text-sm"
                    placeholder="Search"
                    type="search"
                    name="search"
                  />
                </div>
              </form>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <button
                type="button"
                className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <span className="sr-only">View notifications</span>
                <BellIcon className="h-6 w-6" aria-hidden="true" />
              </button>

              {/* Profile dropdown */}
              <Menu as="div" className="ml-3 relative">
                <div>
                  <Menu.Button className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    <span className="sr-only">Open user menu</span>
                    <MarkGithubIcon
                      verticalAlign="middle"
                      size={24}
                      aria-hidden="true"
                    />
                  </Menu.Button>
                </div>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    {userNavigation.map((item) => (
                      <Menu.Item key={item.name}>
                        {({ active }) => (
                          <a
                            target="_blank"
                            rel="noreferrer"
                            href={item.href}
                            className={classNames(
                              active ? "bg-gray-100" : "",
                              "block px-4 py-2 text-sm text-gray-700"
                            )}
                          >
                            {item.name}
                          </a>
                        )}
                      </Menu.Item>
                    ))}
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>
        </div>

        <main>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
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
                      remarkPlugins={[
                        remarkFrontmatter,
                        remarkMath,
                        remarkSlug,
                      ]}
                      rehypePlugins={[
                        [
                          rehypeKatex,
                          {
                            throwOnError: true,
                            strict: true,
                            minRuleThickness: 0.06,
                          },
                        ],
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
                            <code
                              className="bg-gray-100 rounded-sm p-1"
                              {...props}
                            >
                              {children}
                            </code>
                          );
                        },
                        img({ node, src = "", ...props }) {
                          return (
                            <span
                              className="relative block"
                              style={{ height: 450 }}
                            >
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
          </div>
        </main>
      </div>
    </div>
  );
};

export default Note;
