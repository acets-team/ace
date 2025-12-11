# Full Text Search



## FTS5
- `Full-Text Search` version `5`
- `SQLite` virtual table module specifically designed for `efficient` full-text indexing and searching
- FTS creates a special `index` optimized for `searching` text
- How it works?
    1. Create a `virtual table`
    1. Create `triggers` on main table to `populate` virtual table
    1. SQLite `maintains` a virtual table index
    1. On query `join` main table



## Virtual Table
- Doesn’t store ordinary rows the way a normal table does
- Maintains an optimized full-text index



## Create Virtual Table
```sql
CREATE VIRTUAL TABLE posts_fts USING fts5(
  title,
  content,
  content='posts',
  content_rowid='id',
  tokenize='unicode61'
);
```
- `posts_fts`: The name of this FTS table
- `USING fts5`: Tells SQLite to use the FTS5 module
- `title, content`
    - Columns to index for the full-text search
    - Only text columns can be indexed
    - FTS5 will tokenize these columns (break them into words) and build a searchable index
- `content = 'posts'`: Tells FTS5, the data lives in the `posts` table
- `content_rowid = 'id'`: Tells FTS5, use the `id` column of the `posts` table as the `rowid`
- `,tokenize='unicode61'`
    - `unicode61` knows when to split tokens
    - Works with all languages (English, Spanish, Japanese, emojis, etc.)
    - best matching behavior



## Custom Migrations
- After each migration:
    1. Fill in the custom sql in the newly generated file
    1. Run `npm run db:migrate` OR `npx drizzle-kit migrate`
- [Create custom migration](https://orm.drizzle.team/docs/kit-custom-migrations), one at a time:
    - `npx drizzle-kit generate --custom --name=create_posts_fts`
    - `npx drizzle-kit generate --custom --name=create_posts_ai`
    - `npx drizzle-kit generate --custom --name=create_posts_au`
    - `npx drizzle-kit generate --custom --name=create_posts_ad`
    - `npx drizzle-kit generate --custom --name=populate_posts_fts`



## Triggers
- Helpful b/c the FTS table does not update itself
- FTS Table does not automatically track or monitor changes to the posts table
- Without triggers, your search index becomes stale
- `ai`: After Insert
    ```sql
    CREATE TRIGGER posts_ai AFTER INSERT ON posts BEGIN
      INSERT INTO posts_fts(rowid, title, content)
      VALUES (new.id, new.title, new.content);
    END;
    ```
- `au`: After Update
    ```sql
    CREATE TRIGGER posts_au AFTER UPDATE ON posts BEGIN
      UPDATE posts_fts
      SET title = new.title,
          content = new.content
      WHERE rowid = new.id;
    END;
    ```
- `ad`: After Delete
    ```sql
    CREATE TRIGGER posts_ad AFTER DELETE ON posts BEGIN
      DELETE FROM posts_fts WHERE rowid = old.id;
    END;
    ```



## Populate FTS
- If you have data in the main table already, create a `migration` to populate the `fts` table
  ```sql
  INSERT INTO posts_fts(rowid, title, content)
  SELECT id, title, content
  FROM posts;
  ```




## How does FTS matching work?
```sql
SELECT rowid, rank
FROM posts_fts
WHERE posts_fts MATCH 'Config'
```
- Case insensitive search on index column
- `WHERE posts_fts MATCH 'foo bar'`
    - Default
    - `foo AND bar`
    - Both words must be present
- `WHERE posts_fts MATCH 'foo OR bar'`
    - Either word may be present
- `WHERE posts_fts MATCH '"foo bar"'`
    - Matches exact phrase in that order
- `MATCH 'config*'`
    - Prefix search
- Weights 
    - name weight: 10 (strong)
    - content weight: 5 (weaker)
        ```sql
        SELECT rowid, bm25(posts_fts, 50, 1) as bm25
        FROM posts_fts
        WHERE posts_fts MATCH 'config'
        ORDER BY bm25;
        ```
    - BM25 returns lower numbers for better matches
    - Most FTS5 setups use around 50–200 for weight
    - BM25 loves:
        - long documents
        - multiple occurrences
        - repeated term frequency



## Search + Join
```sql
SELECT 
  p.id,
  p.title,
  snippet(posts_fts, -1, '<mark>', '</mark>', ' … ', 10) AS preview,
  bm25(posts_fts, 10, 5) as bm25
FROM posts p
JOIN posts_fts ON posts_fts.rowid = p.id
WHERE posts_fts MATCH 'app'
ORDER BY bm25
LIMIT 9;
```



## Show previews
`snippet(posts_fts, -1, '<mark>', '</mark>', ' … ', 10)`
| Arg         | Meaning |
| ----------- | --- |
| `posts_fts` | The FTS table being queried |
| `-1`        | “Search across all indexed columns” instead of specifying one column index, could also place a 0 or 1 for specific column |
| `<mark>`    | Left highlight marker |
| `</mark>`   | Right highlight marker |
| `' … '`     | Show ellipsis when skipping large blocks of text |
| `10`        | Max number of tokens in the snippet |



## Drizzle Query
- This is safe because Drizzle escapes the MATCH expression
- Only allow characters w/in your whitelist
- For autocomplete like results add `*` after each word
- `decodeURIComponent` if this query comes from a URL
```ts
const query = decodeURIComponent(scope.pathParams.query).replace(/[^a-zA-Z0-9]/g, " ")

const results = await db.run(sql`
  SELECT 
    p.id,
    p.title,
    snippet(posts_fts, -1, '<mark>', '</mark>', ' … ', 10) AS preview,
    bm25(posts_fts, 10, 5) as bm25
  FROM posts p
  JOIN posts_fts ON posts_fts.rowid = p.id
  WHERE posts_fts MATCH ${query}
  ORDER BY bm25
  LIMIT 9;
`)

return scope.success(results.rows)
```



## Visualize response
```js
function md2Preview(markdown: string) {
  return (new markdownit({ html: true })).render(markdown)
    .replace(/<!--[\s\S]*?-->/g, '') // remove HTML comments
    .replace(/&lt;(\/?mark)&gt;/gi, '<$1>') // &lt;mark&gt; inside <code> is converted back to <mark>
    .replace(/\n+/g, ' ') // replace line breaks with space
    .replace(/<(?!\/?mark\b)[^>]+>/gi, '') // remove all HTML tags except <mark>
    .replace(/\s+/g, ' ') // collapse multiple spaces
    .trim()
}
```
