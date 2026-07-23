/**
 * Single source of truth for every piece of personal content on the site.
 * Edit this file — you should never have to touch a component to change copy.
 */

export const siteConfig = {
  // ---------------------------------------------------------------- identity
  name: "Punith KM",
  shortName: "Punith",
  initials: "P",
  role: "AI & Software Developer",
  tagline: "I build AI systems and the software that runs them.",
  intro:
    "I work across machine learning, computer vision, and applied AI — training the models, engineering the pipelines around them, and building the interfaces people actually use.",

  // -------------------------------------------------------------- about copy
  about: {
    heading: "About",
    paragraphs: [
      "I build intelligent systems end to end. That means the whole path: raw data through feature engineering, model training and evaluation, then the application that puts it in front of someone.",
      "A fraud detection pipeline trained on 284,000 transactions reaching 97.8% accuracy and 91% recall. Real-time gesture recognition running under 100ms. Multi-agent LLM workflows orchestrated with LangChain and CrewAI. Different problems, same shape — understand the data, pick the right model, then make it usable.",
      "I care about the parts that are easy to skip. Measuring a model honestly rather than quoting accuracy on a dataset where 99.8% of rows are one class. Knowing why a feature helps. Writing code that still reads clearly six months later.",
    ],
  },

  // ---------------------------------------------------------------- contact
  email: "punithkmv@gmail.com",
  // Deliberately omitted from the site — public pages get scraped and the
  // number is already on the résumé PDFs. Set it here only if you want it live.
  phone: "",
  location: "India · Open to remote",
  availability: "Open to new opportunities",

  // ----------------------------------------------------------------- social
  github: "Punith-14",
  social: {
    github: "https://github.com/Punith-14",
    linkedin: "https://www.linkedin.com/in/punith-km-91b831287",
    twitter: "",
  },

  // ------------------------------------------------------------------- meta
  url: "https://punith.dev", // TODO: your deployed domain — used for OG tags
} as const

// --------------------------------------------------------------- résumés
/** Role-specific versions. First entry is the primary download. */
export const resumes = [
  {
    label: "Software Developer",
    description: "Backend, full-stack and core programming",
    file: "/Punith_KM_Software_Developer.pdf",
  },
  {
    label: "ML Engineer",
    description: "Model training, deep learning, LLM orchestration",
    file: "/Punith_KM_ML_Engineer.pdf",
  },
  {
    label: "Data Scientist",
    description: "EDA, feature engineering, analytics dashboards",
    file: "/Punith_KM_Data_Scientist.pdf",
  },
] as const

// ------------------------------------------------------------------- skills
skills: {
  heading:"Skills"
}
export const skillGroups = [
  {
    title: "AI / Machine Learning",
    items: [
      "Supervised Learning",
      "Unsupervised Learning",
      "Deep Learning",
      "Computer Vision",
      "Natural Language Processing",
      "Feature Engineering",
      "Model Evaluation",
      "Scikit-learn",
    ],
  },
  {
    title: "AI Frameworks & Tools",
    items: [
      "LangChain",
      "LangGraph",
      "CrewAI",
      "RAG",
      "Prompt Engineering",
      "LLMs",
      "OpenCV",
      "MediaPipe",
    ],
  },

  {
    title: "Data Science",
    items: [
      "EDA",
      "Data Cleaning",
      "Data Wrangling",
      "Statistical Analysis",
      "Data Visualization",
      "Pandas",
      "NumPy",
    ],
  },
  {
    title: "Backend Development",
    items: [
      "REST APIs",
      "FastAPI",
      "Django",
    ],
  },
  {
    title: "Frontend Development",
    items: [
      "JavaScript",
      "Tailwind CSS",
      "HTML",
      "CSS",
    ],
  },
  {
    title: "Databases",
    items: [
      "MySQL",
      "MongoDB",
      "PostgreSQL",
    ],
  },
  {
    title: "Cloud & DevOps",
    items: [
      "AWS",
      "Git",
      "GitHub",
      "Vercel",
    ],
  },
  {
    title: "Programming Languages",
    items: [
      "Python",
      "Java",
      "JavaScript",
      "SQL",
      "C",
    ],
  },
] as const;

// --------------------------------------------------------------- what I do
/** Kept deliberately short — these are labels, not paragraphs. */
export const services = [
  {
    icon: "brain",
    title: "Machine Learning",
    description: "Training, evaluating and tuning models.",
  },
  {
    icon: "eye",
    title: "Computer Vision",
    description: "Real-time detection and gesture recognition.",
  },
  {
    icon: "bot",
    title: "LLM & Agentic AI",
    description: "Multi-agent workflows and orchestration.",
  },
  {
    icon: "chart",
    title: "Data Science",
    description: "EDA, feature engineering and dashboards.",
  },
] as const

/**
 * Hand-written project descriptions. These beat every other source — GitHub's
 * description, the README, and the AI — so anything you write here is exactly
 * what shows on the site. Keys are repo names, lowercased.
 */
export const projectOverrides: Record<string, string> = {
  "tourist-guider":
    "A Django travel app built around a custom email-based login system — the default username field is replaced entirely, with its own user manager and auth backend. Includes protected routes, profiles and a contact form.",
}

/** Repos to keep off the site entirely (lowercased names). */
export const hiddenRepos = [
  "punith-14",
  "portfolio",
  "punith_portfolio",
  "test",
  "config",
  "practice-codes",
]

export const navItems = [
  { name: "Home", href: "#home" },
  { name: "About", href: "#about" },
  { name: "Work", href: "#work" },
  { name: "Résumé", href: "#resume" },
  { name: "Contact", href: "#contact" },
] as const

export type SiteConfig = typeof siteConfig
