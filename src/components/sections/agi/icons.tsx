import {
  Award,
  Baby,
  BookOpen,
  CalendarDays,
  Globe,
  GraduationCap,
  HeartHandshake,
  Languages,
  Laptop,
  MapPin,
  PenLine,
  School,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  type LucideIcon,
} from "lucide-react"

/* Built-in icons editors can pick for AGI cards (no SVG upload needed). */
export const AGI_ICONS: Record<string, { label: string; Icon: LucideIcon }> = {
  "graduation-cap": { label: "Graduation cap", Icon: GraduationCap },
  "book-open": { label: "Book", Icon: BookOpen },
  globe: { label: "Globe", Icon: Globe },
  languages: { label: "Languages", Icon: Languages },
  school: { label: "School", Icon: School },
  users: { label: "People", Icon: Users },
  "heart-handshake": { label: "Care / support", Icon: HeartHandshake },
  award: { label: "Award", Icon: Award },
  "shield-check": { label: "Accredited / safe", Icon: ShieldCheck },
  sparkles: { label: "Creative", Icon: Sparkles },
  star: { label: "Star", Icon: Star },
  laptop: { label: "Online / laptop", Icon: Laptop },
  "pen-line": { label: "Writing / exams", Icon: PenLine },
  baby: { label: "Young children", Icon: Baby },
  "calendar-days": { label: "Calendar", Icon: CalendarDays },
  "map-pin": { label: "Location", Icon: MapPin },
}

export function AgiIcon({ name, className }: { name?: string | null; className?: string }) {
  if (!name) return null
  const entry = AGI_ICONS[name]
  if (!entry) return null
  const { Icon } = entry
  return <Icon className={className} aria-hidden strokeWidth={1.5} />
}
