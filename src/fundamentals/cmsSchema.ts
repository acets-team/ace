import { sqliteTable, integer, text, primaryKey } from 'drizzle-orm/sqlite-core'


export const cmsPage = sqliteTable('cmsPage', {
  id: integer('id').primaryKey(),
  name: text('name').notNull().unique(),
})


export const cmsContent = sqliteTable('cmsContent', {
  id: integer('id').primaryKey(),
  label: text('label').notNull(),
  content: text('content').notNull(),
  isMarkdown: integer('isMarkdown').notNull().default(0),
})


export const cmsPageContent = sqliteTable('cmsPageContent', {
  pageId: integer('pageId').notNull().references(() => cmsPage.id, { onDelete: 'cascade' }),
  contentId: integer('contentId').notNull().references(() => cmsContent.id, { onDelete: 'cascade' }),
}, (table) => [primaryKey({ columns: [table.pageId, table.contentId] })])
