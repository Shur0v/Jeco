"use client";
import Link from "next/link";
import { Campaign, campaignActive } from "@/lib/merchant-store";
export function SaleBanner({
  campaign,
  hovered = false,
  preview = false,
}: {
  campaign: Campaign;
  hovered?: boolean;
  preview?: boolean;
}) {
  if (!campaignActive(campaign) || (campaign.mode === "hover" && !hovered))
    return null;
  return (
    <div
      className={`managed-sale sale-${campaign.layout}`}
      style={{
        height: Math.min(52, Math.max(28, campaign.height)),
        backgroundColor: campaign.color,
        color: campaign.textColor,
        backgroundImage: campaign.image
          ? `url("${campaign.image}")`
          : undefined,
      }}
    >
      {preview ? (
        <span>{campaign.text}</span>
      ) : (
        <Link href={campaign.href}>{campaign.text}</Link>
      )}
      {campaign.layout === "split" && <small>Discover the offer →</small>}
    </div>
  );
}
