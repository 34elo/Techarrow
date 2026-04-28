export type NavTabConfig = {
  href: string
  translationKey: string
}

export const navTabs: NavTabConfig[] = [
  { href: "/quests", translationKey: "tabs.moderation" },
  { href: "/reports", translationKey: "tabs.published" },
  { href: "/requests", translationKey: "tabs.complaints" },
]
