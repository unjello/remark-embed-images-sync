import path from 'node:path'
import test from 'ava'
import {remark} from 'remark'
import {read, readSync} from 'to-vfile'
import remarkHtml from 'remark-html'
import remarkEmbedFrontmatter from 'remark-embed-frontmatter/build/module'
import {
  remarkEmbedFrontMatterImageSync,
  remarkEmbedImages,
  remarkEmbedImagesSync
} from '../build/module/index.js'

test('remarkEmbedImages', async (t) => {
  t.plan(6)

  t.regex(
    String(
      await remark()
        .use(remarkEmbedImages)
        .process('![](./test/fixtures/foo.png)')
    ),
    /!\[]\(data:image\/png;base64,/,
    'should inline images w/o file path'
  )

  t.deepEqual(
    String(
      await remark()
        .use(remarkEmbedImages)
        .process(await read(path.join('test', 'fixtures', 'foo.md')))
    ),
    String(await read(path.join('test', 'fixtures', 'foo_result.md'))).replace(
      /\r\n/g,
      '\n'
    ),
    'should inline images'
  )

  t.deepEqual(
    String(
      await remark()
        .use(remarkEmbedImages)
        .use(remarkHtml, {sanitize: false})
        .process(await read(path.join('test', 'fixtures', 'foo.md')))
    ),
    String(
      await read(path.join('test', 'fixtures', 'foo_result.html'))
    ).replace(/\r\n/g, '\n'),
    'should integrate with remark-html'
  )

  await t.throwsAsync(
    async () => {
      await remark()
        .use(remarkEmbedImages)
        .process(await read(path.join('test', 'fixtures', 'error.md')))
    },
    {instanceOf: Error, message: /^ENOENT: no such file or directory, open.*/},
    'should fail on missing images'
  )

  t.deepEqual(
    String(
      await remark()
        .use(remarkEmbedImages)
        .process(await read(path.join('test', 'fixtures', 'empty.md')))
    ),
    String(await read(path.join('test', 'fixtures', 'empty.md'))).replace(
      /\r\n/g,
      '\n'
    ),
    'should work on documents without images'
  )

  t.deepEqual(
    String(
      await remark()
        .use(remarkEmbedImages)
        .process(await read(path.join('test', 'fixtures', 'unknown_mime.md')))
    ),
    String(
      await read(path.join('test', 'fixtures', 'unknown_mime.md'))
    ).replace(/\r\n/g, '\n'),
    'should ignore extensions that are unknown'
  )
})

test('remarkEmbedImagesSync', (t) => {
  t.plan(6)

  t.regex(
    String(
      remark()
        .use(remarkEmbedImagesSync)
        .processSync('![](./test/fixtures/foo.png)')
    ),
    /!\[]\(data:image\/png;base64,/,
    'should inline images w/o file path'
  )

  t.deepEqual(
    String(
      remark()
        .use(remarkEmbedImagesSync)
        .processSync(readSync(path.join('test', 'fixtures', 'foo.md')))
    ),
    String(readSync(path.join('test', 'fixtures', 'foo_result.md'))).replace(
      /\r\n/g,
      '\n'
    ),
    'should inline images'
  )

  t.deepEqual(
    String(
      remark()
        .use(remarkEmbedImagesSync)
        .use(remarkHtml, {sanitize: false})
        .processSync(readSync(path.join('test', 'fixtures', 'foo.md')))
    ),
    String(readSync(path.join('test', 'fixtures', 'foo_result.html'))).replace(
      /\r\n/g,
      '\n'
    ),
    'should integrate with remark-html'
  )

  t.throws(
    () => {
      remark()
        .use(remarkEmbedImagesSync)
        .processSync(readSync(path.join('test', 'fixtures', 'error.md')))
    },
    {
      instanceOf: Error,
      message: /^ENOENT: no such file or directory, open.*/
    },
    'should fail on missing images'
  )

  t.deepEqual(
    String(
      remark()
        .use(remarkEmbedImagesSync)
        .processSync(readSync(path.join('test', 'fixtures', 'empty.md')))
    ),
    String(readSync(path.join('test', 'fixtures', 'empty.md'))).replace(
      /\r\n/g,
      '\n'
    ),
    'should work on documents without images'
  )

  t.deepEqual(
    String(
      remark()
        .use(remarkEmbedImagesSync)
        .processSync(readSync(path.join('test', 'fixtures', 'unknown_mime.md')))
    ),
    String(readSync(path.join('test', 'fixtures', 'unknown_mime.md'))).replace(
      /\r\n/g,
      '\n'
    ),
    'should ignore extensions that are unknown'
  )
})

test('remarkEmbedFrontMatterImageSync', (t) => {
  t.plan(1)

  t.throws(
    () => {
      remark()
        .use(remarkEmbedFrontmatter)
        .use(remarkEmbedFrontMatterImageSync, {images: 'hero'})
        .processSync(
          readSync(path.join('test', 'fixtures', 'error_frontmatter.md'))
        )
    },
    {
      instanceOf: Error,
      message: /^ENOENT: no such file or directory, open.*/
    },
    'should fail on missing images'
  )
})
