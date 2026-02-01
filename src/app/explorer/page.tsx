import { RedirectType, redirect } from 'next/navigation';

export default function ExplorerRootPage() {
  redirect('/explorer/topics', RedirectType.replace);
}
