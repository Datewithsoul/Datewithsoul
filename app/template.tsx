// Templates re-mount on every navigation, so this plays a soft enter animation per page
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-page-enter flex flex-1 flex-col">{children}</div>;
}
