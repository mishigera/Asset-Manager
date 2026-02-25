## Packages
framer-motion | Page transitions and section animations (premium Vercel/Linear style)
react-markdown | Rendering MDX/Markdown content for projects and blog posts
remark-gfm | GitHub flavored markdown support for react-markdown
date-fns | Formatting dates for blog posts

## Notes
- Floating chatbot uses SSE. Standard `fetch` with `TextDecoder` to handle streaming from POST `/api/chat`.
- i18n is handled via a lightweight React Context since the app is small/medium sized.
- Relies on pre-installed `lucide-react` for icons and standard `shadcn/ui` components from the existing structure.
