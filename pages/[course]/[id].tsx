import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { FileSystemFetcher, Params } from "../../lib/ssg";

interface NoteProps {
  content: string;
}

const fetcher = new FileSystemFetcher();

export const getStaticPaths: GetStaticPaths<Params> = async () => {
  const params = await fetcher.getParams();
  const paths = params.map((params) => ({ params }));

  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps<NoteProps, Params> = async ({
  params,
}) => {
  if (!params) throw new Error("`params` not found.");

  const content = await fetcher.getNote(params);

  return { props: { content } };
};

const Note: NextPage<NoteProps> = ({ content }) => {
  return (
    <main>
      <p>{content}</p>
    </main>
  );
};

export default Note;
