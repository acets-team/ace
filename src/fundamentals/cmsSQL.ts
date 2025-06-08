export const createTables = `CREATE TABLE IF NOT EXISTS cmsPage (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);
CREATE TABLE IF NOT EXISTS cmsContent (
  id INTEGER PRIMARY KEY,
  label TEXT NOT NULL,
  content TEXT NOT NULL,
  isMarkdown INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS cmsPageContent (
  pageId INTEGER NOT NULL,
  contentId INTEGER NOT NULL,
  FOREIGN KEY(pageId) REFERENCES cmsPage(id) ON DELETE CASCADE,
  FOREIGN KEY(contentId) REFERENCES cmsContent(id) ON DELETE CASCADE,
  PRIMARY KEY(pageId, contentId)
);`


export const getAll = `
  SELECT cmsContent.*, cmsPage.id AS pageId, cmsPage.name AS pageName
  FROM cmsContent
  JOIN cmsPageContent ON cmsContent.id = cmsPageContent.contentId
  JOIN cmsPage ON cmsPage.id = cmsPageContent.pageId
`


export const getByPageId = {
  ts: getAll + 'WHERE cmsPage.id = (:id)',
  console: getAll + 'WHERE cmsPage.id = 0',
}


export const getByPageName = {
  ts: getAll + 'WHERE cmsPage.name = (:page)',
  console: getAll +  `WHERE cmsPage.name = ''`
}


export const insertPage = {
  ts: `INSERT INTO cmsPage (name) VALUES (:name)`,
  console: `INSERT INTO cmsPage (name) VALUES ('')`
}


export const insertContent = {
  ts: `
    INSERT INTO cmsContent (label, content, isMarkdown)
    VALUES (:label, :content, COALESCE(:isMarkdown, 0));
    INSERT INTO cmsPageContent (pageId, contentId)
    VALUES (:pageId, last_insert_rowid())
  `,
  console: `
    INSERT INTO cmsContent (label, content, isMarkdown)
    VALUES ('', '', 0);
    INSERT INTO cmsPageContent (pageId, contentId)
    VALUES (0, last_insert_rowid())
  `
}
