import { PlusCircle, UserCheck, Award, LayoutDashboard } from "lucide-react";

const features = [
  {
    icon: PlusCircle,
    iconBg: "bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-400",
    title: "Create Events",
    description:
      "Organise local events in minutes with customised location pins, schedules, and volunteer details.",
  },
  {
    icon: UserCheck,
    iconBg: "bg-amber-100 dark:bg-amber-950 text-amber-600",
    title: "Join in 1-Click",
    description:
      "RSVP instantly to tree plantations, blood drives, and food distributions near your neighbourhood.",
  },
  {
    icon: Award,
    iconBg: "bg-emerald-100 dark:bg-emerald-950 text-emerald-600",
    title: "Track Your Impact",
    description:
      "Earn community service badges, track volunteer hours, and share your social contribution.",
  },
  {
    icon: LayoutDashboard,
    iconBg: "bg-blue-100 dark:bg-blue-950 text-blue-600",
    title: "Manage Easily",
    description:
      "Update schedules, view attendee lists, and handle volunteer logistics from your phone or desktop.",
  },
];

export default function Features() {
  return (
    <section id="how-it-works" className="border-y border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-slate-900 scroll-mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            How Shohojogi Works
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Designed for volunteers, organisers, and local youth clubs across Bangladesh.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, iconBg, title, description }) => (
            <div
              key={title}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-6 transition hover:shadow-lg dark:border-slate-800 dark:bg-slate-950"
            >
              <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${iconBg}`}>
                <Icon size={24} aria-hidden="true" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
              <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
