import './globals.css'

export const metadata = {
  title: 'TinyLink - Smart URL Shortener',
  description: 'Shorten your URLs easily with TinyLink',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}