/**
 * Re-mounts on every client navigation (unlike layout). Drives the shared page-enter animation.
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/template
 */

export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="m-page flex min-h-0 flex-1 flex-col">{children}</div>;
}
