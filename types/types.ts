import { ReadTimeResults } from "reading-time";
import { TocEntry } from "@stefanprobst/remark-extract-toc";

export type NoteParams = { courseId: string; noteId: string };

export interface NoteMetadata {
  course: string;
  title: string;
  readingTime: ReadTimeResults;
  toc: TocEntry[];
}

export interface NoteContent {
  raw: string;
}

export interface Note extends NoteMetadata, NoteContent {}
