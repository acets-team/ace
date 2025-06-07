export const createTables = `CREATE TABLE IF NOT EXISTS cmsPage (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);
CREATE TABLE IF NOT EXISTS cmsContent (
  id INTEGER PRIMARY KEY,
  label TEXT NOT NULL,
  content TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS cmsPageContent (
  pageId INTEGER NOT NULL,
  contentId INTEGER NOT NULL,
  FOREIGN KEY(pageId) REFERENCES cmsPage(id) ON DELETE CASCADE,
  FOREIGN KEY(contentId) REFERENCES cmsContent(id) ON DELETE CASCADE,
  PRIMARY KEY(pageId, contentId)
);`


export const getAll = `SELECT * FROM cmsContent`


const selectProps = 'cmsContent.*, cmsPage.id AS pageId, cmsPage.name AS pageName'


export const getByPageId = {
  ts: `
    SELECT ${selectProps} FROM cmsContent
    JOIN cmsPageContent ON cmsContent.id = cmsPageContent.contentId
    JOIN cmsPage ON cmsPage.id = cmsPageContent.pageId
    WHERE cmsPage.id = (:id)`,
  console: `
    SELECT ${selectProps} FROM cmsContent
    JOIN cmsPageContent ON cmsContent.id = cmsPageContent.contentId
    JOIN cmsPage ON cmsPage.id = cmsPageContent.pageId
    WHERE cmsPage.id = 0`
}


export const getByPageName = {
  ts: `
    SELECT ${selectProps} FROM cmsContent
    JOIN cmsPageContent ON cmsContent.id = cmsPageContent.contentId
    JOIN cmsPage ON cmsPage.id = cmsPageContent.pageId
    WHERE cmsPage.name = (:page)`,
  console: `
    SELECT ${selectProps} FROM cmsContent
    JOIN cmsPageContent ON cmsContent.id = cmsPageContent.contentId
    JOIN cmsPage ON cmsPage.id = cmsPageContent.pageId
    WHERE cmsPage.name = ''`
}


export const insertPage = {
  ts: `INSERT INTO cmsPage (name) VALUES (:name)`,
  console: `INSERT INTO cmsPage (name) VALUES ('')`
}


export const insertContent = {
  ts: `
    INSERT INTO cmsContent (label, content)
    VALUES (:label, :content);
    INSERT INTO cmsPageContent (pageId, contentId)
    VALUES (:pageId, last_insert_rowid())
  `,
  console: `
    INSERT INTO cmsContent (label, content)
    VALUES ('', '');
    INSERT INTO cmsPageContent (pageId, contentId)
    VALUES (0, last_insert_rowid())
  `
}
