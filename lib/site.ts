export const site = {
  name: "Clinical AI Safety",
  domain: "clinicalaisafety.co.uk",
  url: "https://clinicalaisafety.co.uk",
  tagline: "Practical clinical safety training for NHS AI deployment",
  description:
    "Practical clinical safety training for NHS Clinical Safety Officers deploying or evaluating AI-enabled digital health technologies. DCB0129, DCB0160, DTAC, PSIRF, ISO 14971 and AI safety frameworks applied in real clinical settings.",
  author: {
    name: "Dr Doju Cheriachan",
    credentials:
      "MBBS, GMC registered · Internal Medicine Trainee, Sheffield Teaching Hospitals NHS Foundation Trust · CSO certified",
  },
  disclaimer:
    "Independent educational resource — not affiliated with NHS England or any regulatory body. For educational use only.",
} as const;

export const nav = [
  { href: "/", label: "Home" },
  { href: "/modules", label: "Modules" },
  { href: "/simulators", label: "Simulators" },
  { href: "/resources", label: "Resources" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export type Module = {
  number: number;
  title: string;
  summary: string;
  frameworks: string[];
  status: "Launch module" | "In development" | "Planned";
  href?: string;
};

export const launchModules: Module[] = [
  {
    number: 5,
    title: "Writing a Hazard Log That Actually Works",
    summary:
      "Beyond the template. How to identify, articulate and quantify clinical hazards so your DCB0129 hazard log withstands audit — and actually prevents harm on the ward.",
    frameworks: ["DCB0129", "ISO 14971"],
    status: "Launch module",
  },
  {
    number: 7,
    title: "Evaluating a Supplier Safety Case",
    summary:
      "Reading between the lines of a DCB0129 Safety Case Report. What questions to ask a vendor. What absence of evidence actually means when you sign the Clinical Safety Case.",
    frameworks: ["DCB0129", "DTAC"],
    status: "Launch module",
  },
  {
    number: 11,
    title: "Why AI Breaks DCB Standards",
    summary:
      "DCB0129 assumes deterministic software behaviour. AI systems don't deliver it. What changes when you are deploying a model — drift, distributional shift, opacity — and how to adapt your safety case.",
    frameworks: ["DCB0129", "BS AAMI 34971", "MHRA AIaMD"],
    status: "Launch module",
  },
];

export const frameworks = [
  {
    code: "DCB0129",
    name: "Clinical Risk Management — Manufacturer",
    body: "Defines the obligations on health IT manufacturers to operate a clinical risk management system and produce a Safety Case.",
  },
  {
    code: "DCB0160",
    name: "Clinical Risk Management — Deployment",
    body: "The deploying organisation's counterpart to DCB0129. Governs how Trusts implement and monitor health IT safely.",
  },
  {
    code: "DTAC",
    name: "Digital Technology Assessment Criteria",
    body: "NHS England's baseline assessment covering clinical safety, data protection, technical assurance, interoperability and usability.",
  },
  {
    code: "PSIRF",
    name: "Patient Safety Incident Response Framework",
    body: "The NHS's approach to learning from patient safety incidents. Replaces the Serious Incident Framework.",
  },
  {
    code: "ISO 14971",
    name: "Risk Management for Medical Devices",
    body: "The international standard for applying risk management across the medical device lifecycle.",
  },
  {
    code: "BS AAMI 34971",
    name: "AI Risk Management Guidance",
    body: "Guidance on applying ISO 14971 to machine learning enabled medical devices, addressing AI-specific failure modes.",
  },
  {
    code: "MHRA AIaMD",
    name: "AI as a Medical Device",
    body: "The MHRA's evolving regulatory approach to software and AI as a medical device in the UK.",
  },
  {
    code: "UK GDPR / DPIA",
    name: "Data Protection",
    body: "Data Protection Impact Assessments where AI processing presents risks to patient rights and freedoms.",
  },
  {
    code: "NICE ESF",
    name: "Evidence Standards Framework",
    body: "NICE's framework for evaluating digital health technologies, including AI-driven tools.",
  },
  {
    code: "EU AI Act",
    name: "High-Risk AI Regulation",
    body: "EU-wide regulation of high-risk AI systems, including health applications. Relevant to UK suppliers operating cross-border.",
  },
  {
    code: "AMLAS",
    name: "Assurance of Machine Learning for Autonomous Systems",
    body: "A structured argumentation-based methodology for assuring the safety of machine learning components.",
  },
  {
    code: "ECSF",
    name: "England Clinical Safety Framework",
    body: "Emerging national framework coordinating clinical safety practice across NHS England.",
  },
] as const;

export const curriculumOverview = {
  moduleCount: 30,
  simulatorCount: 10,
  frameworkCount: 12,
} as const;
