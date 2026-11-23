export type SearchHit = {
  id: string
  title: string
  subtitle: string
  to: string
  group: 'Pages' | 'Tasks' | 'Events' | 'Notes' | 'Files'
}
