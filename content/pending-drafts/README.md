Drop a blog draft JSON file here (any filename, must end in `.json`) and push
to `main`. The `publish-blog-draft` GitHub Action picks it up, submits it to
`/api/blog-drafts`, deletes the file, and marks its topic used in
`../blog-topic-queue.md` — all with a normal internet connection on GitHub's
runners, which avoids relying on outbound network access from wherever the
file was written.

File shape: the same JSON body documented for the ingest API (`title`,
`excerpt`, `coverImage`, `coverImageAlt`, `category`, `tags`, `seoTitle`,
`seoDescription`, `bodyMarkdown`, `focusKeyword`), plus one extra optional
field, `topicQueueEntry`, holding the exact bullet text to add under
`## Completed` in the topic queue. That field is stripped before the file is
posted to the API.

If the API call fails (non-201, or `ok` isn't `true`), the workflow fails
and leaves the file in place rather than guessing — check the failed run's
logs before retrying.
