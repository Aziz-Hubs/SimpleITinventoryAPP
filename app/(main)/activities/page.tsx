import { ActivitiesLog } from "@/components/features/activities/activities-log";
import { getActivities } from "@/services/dashboard-service";

export default async function Page() {
  const activities = await getActivities();

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <ActivitiesLog activities={activities} />
    </div>
  );
}
