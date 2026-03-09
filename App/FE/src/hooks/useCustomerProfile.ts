import { useState, useEffect, useMemo } from "react";
import { BadgeService } from "@/services/badge.service";

export function useCustomerProfile(user: any) {
  const [activeTab, setActiveTab] = useState("profile");
  const [allBadges, setAllBadges] = useState<any[]>([]);
  const [badgeIdx, setBadgeIdx] = useState(0);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const { data } = await BadgeService.getBadges();
        if (data?.data) {
          const sorted = [...data.data].sort((a, b) => a.min_spend - b.min_spend);
          setAllBadges(sorted);
          const currentIdx = sorted.findIndex((b: any) => Number(b.id) === Number(user?.badge_id));
          setBadgeIdx(currentIdx === -1 ? 0 : currentIdx);
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (user) fetchBadges();
  }, [user]);

  const currentBadge = useMemo(() => 
    allBadges.find((b: any) => Number(b.id) === Number(user?.badge_id)) || allBadges[0]
  , [allBadges, user]);

  const viewedBadge = allBadges[badgeIdx];
  
  const isUnlocked = useMemo(() => 
    viewedBadge && currentBadge ? viewedBadge.min_spend <= currentBadge.min_spend : false
  , [viewedBadge, currentBadge]);

  const isCurrentBadge = useMemo(() => 
    user?.badge_id ? Number(viewedBadge?.id) === Number(user?.badge_id) : badgeIdx === 0
  , [user, viewedBadge, badgeIdx]);

  const nextBadge = () => setBadgeIdx((p) => (p + 1) % allBadges.length);
  const prevBadge = () => setBadgeIdx((p) => (p - 1 + allBadges.length) % allBadges.length);

  return {
    activeTab,
    setActiveTab,
    allBadges,
    badgeIdx,
    viewedBadge,
    isUnlocked,
    isCurrentBadge,
    nextBadge,
    prevBadge
  };
}