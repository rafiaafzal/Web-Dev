import { requireRole } from '@/lib/auth';
import { listMyNotifications } from '@/app/actions/notifications';
import { CandidateNotificationsList } from '@/components/CandidateNotificationsList';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Notifications | TalentAI Candidate Portal',
};

export default async function CandidateNotificationsPage() {
  await requireRole('candidate');

  const res = await listMyNotifications(50);
  const items = res.ok && res.data ? res.data.items : [];
  const unreadCount = res.ok && res.data ? res.data.unreadCount : 0;

  return (
    <div className="max-w-4xl mx-auto py-2">
      <CandidateNotificationsList
        initialItems={items}
        initialUnreadCount={unreadCount}
      />
    </div>
  );
}
