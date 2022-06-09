import { NoteMetadata } from ".";
import { ReadTimeResults } from "reading-time";

export const isNoteMetadata = (arg: any): arg is NoteMetadata => {
  return (
    arg &&
    typeof arg === "object" &&
    typeof arg.title === "string" &&
    typeof arg.course === "string" &&
    isReadTimeResults(arg.readingTime)
  );
};

export const isReadTimeResults = (arg: any): arg is ReadTimeResults => {
  return arg && typeof arg === "object" && typeof arg.text === "string";
};
