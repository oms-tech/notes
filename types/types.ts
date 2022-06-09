import { ReadTimeResults } from "reading-time";

export type NoteParams = { courseId: string; noteId: string };

export interface NoteMetadata {
  course: string;
  title: string;
  readingTime: ReadTimeResults;
}

export interface NoteContent {
  raw: string;
}

export interface Note extends NoteMetadata, NoteContent {}
