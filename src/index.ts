import fs from 'node:fs'
import path from 'node:path'

import isRelativeUrl from 'is-relative-url'
import mimes from 'mime/lite'
import {visit} from 'unist-util-visit'
import type unified from 'unified'
import type mdast from 'mdast'

export type Options = {
  readonly images?: string
}

export type Root = mdast.Root

export function remarkEmbedImages(): unified.Transformer<Root, Root> {
  return (tree, file, done): void => {
    let count = 0
    const base = file.dirname ? path.resolve(file.cwd, file.dirname) : file.cwd

    visit(tree, 'image', (node): void => {
      if (node.url && isRelativeUrl(node.url) && !node.url.startsWith('/')) {
        count++

        fs.readFile(path.resolve(base, node.url), 'base64', (error, data) => {
          if (error) {
            count = Number.POSITIVE_INFINITY
            done(error)
          }

          const mime = mimes.getType(path.extname(node.url))

          if (mime) {
            node.url = 'data:' + mime + ';base64,' + data
          }

          if (--count === 0) {
            done()
          }
        })
      }
    })

    if (!count) {
      done()
    }
  }
}

export function remarkEmbedImagesSync(): unified.Transformer<Root, Root> {
  return (tree, file, done) => {
    const base = file.dirname ? path.resolve(file.cwd, file.dirname) : file.cwd

    visit(tree, 'image', (node) => {
      if (node.url && isRelativeUrl(node.url) && !node.url.startsWith('/')) {
        try {
          const data = fs.readFileSync(path.resolve(base, node.url), 'base64')
          const mime = mimes.getType(path.extname(node.url))
          if (mime) {
            node.url = 'data:' + mime + ';base64,' + data
          }
        } catch (error: unknown) {
          done(error as Error | undefined)
        }
      }
    })
    done()
  }
}

export function remarkEmbedFrontMatterImageSync(
  options?: Options
): unified.Transformer<Root, Root> {
  const image = options?.images ?? 'hero'

  return (_, file, done): void => {
    const base = file.dirname ? path.resolve(file.cwd, file.dirname) : file.cwd

    const data = file.data as Readonly<Record<string, any>>
    const imageUrl = data.frontmatter[image] as string
    if (imageUrl && !imageUrl.startsWith('/')) {
      try {
        const imageData = fs.readFileSync(
          path.resolve(base, imageUrl),
          'base64'
        )
        const mime = mimes.getType(path.extname(imageUrl))
        if (mime) {
          data.frontmatter[image] = 'data:' + mime + ';base64,' + imageData
        }

        done()
      } catch (error: unknown) {
        done(error as Error | undefined)
      }
    }

    done()
  }
}
