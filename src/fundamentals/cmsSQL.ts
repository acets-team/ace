import { eq, sql } from 'drizzle-orm'
import { tursoConnect } from './tursoConnect'
import type { LibSQLDatabase } from 'drizzle-orm/libsql'
import { cmsContent, cmsPage, cmsPageContent } from './cmsSchema'
import type { SQLiteSelectPrepare } from 'drizzle-orm/sqlite-core'



function getAllBase(db: LibSQLDatabase = tursoConnect()) {
  return db
    .select({
      id: cmsContent.id,
      label: cmsContent.label,
      content: cmsContent.content,
      isMarkdown: cmsContent.isMarkdown,
      pageId: cmsPage.id,
      pageName: cmsPage.name,
    })
    .from(cmsContent)
    .innerJoin(cmsPageContent, eq(cmsContent.id, cmsPageContent.contentId))
    .innerJoin(cmsPage, eq(cmsPage.id, cmsPageContent.pageId))
}



/**
 * @example
  ```ts
  const all = await getAll.all()
  ```
*/
export function getAll(db?: LibSQLDatabase): SQLiteSelectPrepare<any> {
  return getAllBase(db).prepare()
}



/**
 * @example
  ```ts
  const byId = await getByPageId.all({ id: 1 })
  ```
*/
export function getByPageId(db: LibSQLDatabase = tursoConnect()): SQLiteSelectPrepare<any> {
  return getAllBase(db)
    .where(eq(cmsPage.id, sql.placeholder('id')))
    .prepare()
}



/**
 * @example
  ```ts
  const byName = await getByPageName.all({ name: 'about' })
  ```
*/
export function getByPageName(db: LibSQLDatabase = tursoConnect()): SQLiteSelectPrepare<any> {
  return getAllBase(db)
    .where(eq(cmsPage.name, sql.placeholder('name')))
    .prepare()
}



export const insertPage = {
  console: `INSERT INTO cmsPage (name) VALUES ('')`,
  /**
   * @example
    ```ts
    await insertPage.run({ name: 'about' })
    ```
  */
 async ts(name: string, db: LibSQLDatabase = tursoConnect()): Promise<number> {
    const statement = db.insert(cmsPage)
      .values({ name: sql.placeholder('name') })
      .returning({ id: cmsPage.id })
      .prepare()

    const res = await statement.run({ name })
    const inserted = res.rows?.[0]
    if (!inserted?.id || typeof inserted.id !== 'number') throw new Error('Page insert failed')

    return inserted.id
  }
}



export const insertContent = {
  console: `
    INSERT INTO cmsContent (label, content, isMarkdown)
    VALUES ('', '', 0);
    INSERT INTO cmsPageContent (pageId, contentId)
    VALUES (0, last_insert_rowid())
  `,
  async ts (label: string, content: string, pageId: number, isMarkdown: number = 0, db: LibSQLDatabase = tursoConnect()): Promise<{ contentId: number, pageId: number }> {
    const insertContentRow = db.insert(cmsContent)
      .values({
        label: sql.placeholder('label'),
        content: sql.placeholder('content'),
        isMarkdown: sql.placeholder('isMarkdown'),
      })
      .returning({ id: cmsContent.id })
      .prepare()

    const insertPageContentLink = db.insert(cmsPageContent)
      .values({
        pageId: sql.placeholder('pageId'),
        contentId: sql.placeholder('contentId'),
      })
      .prepare()

    const insertedRows = await insertContentRow.run({ label, content, isMarkdown })
    const inserted = insertedRows.rows?.[0]
    if (!inserted?.id || typeof inserted.id !== 'number') throw new Error('Content insert failed')

    await insertPageContentLink.run({ pageId, contentId: inserted.id })

    return { contentId: inserted.id, pageId }
  }
}


export const updateContent = {
  console: `
    UPDATE cmsContent
    SET content = '', isMarkdown = 0
    WHERE id = 0
  `,

  /**
   * @example
    ```ts
    await updateContent.ts({ id: 1, content: 'New value', isMarkdown: 1 })
    ```
  */
   async ts(values: { id: number; content: string; isMarkdown?: number }, db: LibSQLDatabase = tursoConnect()): Promise<void> {
    const update = db.update(cmsContent)
      .set({
        content: values.content,
        ...(values.isMarkdown === undefined ? {} : { isMarkdown: values.isMarkdown }),
      })
      .where(eq(cmsContent.id, sql.placeholder('id')))
      .prepare()

    await update.run({ id: values.id })
  }
}
