/**
 * Your professional profile — used by the JD analyzer to score matches.
 * Fill this in accurately; the quality of the analysis depends on it.
 */
module.exports = {
  name: "Abhinav Sawarn",
  title: "Android / AOSP Engineer",
  experienceYears: 2, // update this

  skills: {
    strong: [
      "Android Framework (AOSP)",
      "Java",
      "Kotlin",
      "Android SDK",
      "Android HAL",
      "Binder IPC",
      "System Services",
      "Git",
    ],
    moderate: [
      "C++",
      "Python",
      "Linux Kernel basics",
      "JNI",
      "ADB / debugging tools",
      "React", // from this project :)
    ],
    learning: [
      // things you're currently picking up
    ],
  },

  // Describe what makes each CV variant different so Claude can recommend the right one
  cvVariants: {
    "Specialist (AOSP)": `
      Focuses on low-level Android: AOSP build system, platform development,
      HAL implementation, Binder IPC, system services, BSP bring-up.
      Best for: Platform/Framework engineer roles, embedded Android, OEM/ODM companies
      (Samsung, HARMAN, Qualcomm, MediaTek, etc.).
    `,
    "Generic": `
      Focuses on Android app and SDK development: Jetpack, MVVM, REST APIs,
      Retrofit, Room, Coroutines, UI/UX. Broader appeal.
      Best for: Product companies, startups, app-focused SDE roles.
    `,
  },

  // Add any extra context Claude should know when evaluating fit
  notes: `
    Open to remote and hybrid roles. Prefer Android platform/framework over pure app dev.
    Based in India. Targeting SDE-1 / SDE-2 level roles.
  `,
}
