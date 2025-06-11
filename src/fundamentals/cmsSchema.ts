/**
 * 🧚‍♀️ How to access:
 *     - import { cmsPage, cmsContent, cmsPageContent, cmsPageColumns, cmsContentColumns, cmsPageContentColumns } from '@ace/cmsSchema'
 */


import { sqliteTable, integer, text, primaryKey } from 'drizzle-orm/sqlite-core'


export const cmsPageColumns = {
  id: integer('id').primaryKey(),
  name: text('name').notNull().unique(),
}

export const cmsContentColumns = {
  id: integer('id').primaryKey(),
  label: text('label').notNull(),
  content: text('content').notNull(),
  isMarkdown: integer('isMarkdown').notNull().default(0),
}

export const cmsPageContentColumns = {
  pageId: integer('pageId').notNull(),
  contentId: integer('contentId').notNull(),
}


export const cmsPage = sqliteTable('cmsPage', cmsPageColumns)
export const cmsContent = sqliteTable('cmsContent', cmsContentColumns)
export const cmsPageContent = sqliteTable('cmsPageContent', { ...cmsPageContentColumns }, (table) => [primaryKey({ columns: [table.pageId, table.contentId] })])
