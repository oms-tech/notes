import type { NextPage, GetStaticProps } from "next";
import Head from "next/head";

import { FileSystemFetcher } from "../lib/ssg";
import { NoteParams } from "../types";

const fetcher = new FileSystemFetcher();

export const getStaticProps: GetStaticProps<{
  params: NoteParams[];
}> = async () => {
  const params = await fetcher.getParams();
  return { props: { params } };
};

const Home: NextPage<{ params: NoteParams[] }> = ({ params }) => {
  return (
    <div>
      <Head>
        <title>Home | OMSCS Notes</title>
        <meta name="description" content="OMSCS Notes" />
      </Head>

      <main>
        {params.map(({ courseId, noteId }) => {
          return (
            <a key={courseId + noteId} href={`/${courseId}/${noteId}`}>
              {courseId}/{noteId}
              <br />
            </a>
          );
        })}
      </main>
    </div>
  );
};

export default Home;
