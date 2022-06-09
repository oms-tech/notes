import { NoteContent, NoteParams } from "../../types";

export interface Fetcher {
  getParams(): Promise<NoteParams[]>;
  getNote(params: NoteParams): Promise<NoteContent>;
}
