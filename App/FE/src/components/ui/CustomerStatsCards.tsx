import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Users, UserPlus, UserX, Crown } from "lucide-react";

interface CustomerStatsProps {
  data: any;
  loading: boolean;
}

export default function CustomerStatsCards({
  data,
  loading,
}: CustomerStatsProps) {
  const stats = [
    {
      title: "Total Customers",
      value: data?.total_customers,
      icon: Users,
    },
    {
      title: "Active Customers",
      value: data?.active_customers,
      icon: UserPlus,
    },
    {
      title: "Blocked Customers",
      value: data?.blocked_customers,
      icon: UserX,
    },
    {
      title: "Top Customers",
      value: data?.top_customers?.length || 0,
      icon: Crown,
    },
    {
      title: "Today Register",
      value: data?.today_customers,
      icon: UserPlus,
    },
    {
      title: "This Week",
      value: data?.week_customers,
      icon: UserPlus,
    },
    {
      title: "This Month",
      value: data?.month_customers,
      icon: UserPlus,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4">
      {loading &&
        Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="p-4 flex items-center justify-center">
            <Loader2 className="animate-spin" />
          </Card>
        ))}

      {!loading &&
        stats.map((stat, i) => {
          const Icon = stat.icon;

          return (
            <Card
              key={i}
              className="rounded-xl w-full border shadow-none transition"
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-500">{stat.title}</p>
                  <h2 className="text-2xl font-bold">
                    {stat.value ?? 0}
                  </h2>
                </div>

                <div className="p-3 rounded-lg bg-neutral-100 dark:bg-white/10">
                  <Icon size={20} />
                </div>
              </CardContent>
            </Card>
          );
        })}
    </div>
  );
}