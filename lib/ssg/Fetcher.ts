export type Params = { id: string; course: string };

export interface Fetcher {
  getParams(): Promise<Params[]>;
  getNote(params: Params): Promise<string>;
}
