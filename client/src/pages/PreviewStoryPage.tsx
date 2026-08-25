import { useParams } from 'react-router-dom'
import { NotFoundPage } from './NotFoundPage'
import { STORIES } from './previewStories'

// Dev-only: renders a single story full-screen as the route content, so it sits
// inside the app Layout (header + footer) and looks like a complete page.
export const PreviewStoryPage = () => {
  const { id = '' } = useParams()
  const story = STORIES.find((s) => s.id === id)
  return <>{story ? story.node : <NotFoundPage />}</>
}
