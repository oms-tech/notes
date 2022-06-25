export const repoRootUrl = "https://github.com/omscs-notes/notes";

export const viewFileUrl = (courseId: string, noteId: string): string =>
  `${repoRootUrl}/blob/main/notes/${courseId}/${noteId}.md`;

export const editFileUrl = (courseId: string, noteId: string): string =>
  `${repoRootUrl}/edit/main/notes/${courseId}/${noteId}.md`;

export const createIssueUrl = (course: string, title: string): string => {
  const params = new URLSearchParams({
    template: "typo-report.md",
    title: `[TYPO] ${course} - ${title}`,
  });

  return `${repoRootUrl}/issues/new?${params}`;
};
