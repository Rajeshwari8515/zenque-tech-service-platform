export const SERVICES_DATA = [
  {
    id: "web-development",
    title: "Web Development",
    shortDescription: "Custom websites, web applications, responsive digital platforms built for scale.",
    fullDescription: "High-performance web applications and enterprise portals engineered with modern frontend interfaces, scalable backend systems, and clean code architecture.",
    whatWeProvide: [
      { title: "Custom Websites", desc: "Tailored responsive web applications built for optimal performance." },
      { title: "Web Applications", desc: "Full-stack SaaS solutions with dynamic user workflows." },
      { title: "Responsive Design", desc: "Pixel-perfect mobile and desktop interfaces across all viewports." },
      { title: "Backend Integration", desc: "Secure REST & GraphQL APIs with cloud database architecture." }
    ],
    technologies: ["React", "TypeScript", "Node.js", "PostgreSQL", "Next.js", "Docker", "TailwindCSS"],
    packages: [
      {
        id: "web-basic",
        tier: "Basic",
        name: "Basic Web Package",
        price: "$3,500",
        duration: "2 - 3 Weeks",
        description: "Ideal for startups needing a high-speed landing portal or baseline web app.",
        features: [
          "Up to 5 Responsive Custom Pages",
          "Clean UI/UX Design System",
          "Contact & Enquiry Integration",
          "SEO Optimization & Fast Loading",
          "2 Weeks Post-Launch Support"
        ]
      },
      {
        id: "web-standard",
        tier: "Standard",
        name: "Standard Web Application",
        price: "$7,800",
        duration: "4 - 6 Weeks",
        isFeatured: true,
        description: "Comprehensive SaaS or web platform with user accounts and database integration.",
        features: [
          "Up to 15 Complex App Views",
          "Custom Database & User Authentication",
          "Admin Portal & CMS Dashboard",
          "Third-Party API Integration",
          "4 Weeks Support & SLA"
        ]
      },
      {
        id: "web-premium",
        tier: "Premium",
        name: "Enterprise Platform",
        price: "$14,500+",
        duration: "8 - 12 Weeks",
        description: "Large-scale web infrastructure migration, microservices architecture, and custom integrations.",
        features: [
          "Unlimited Dynamic App Modules",
          "Microservices & High Availability Cloud",
          "Multi-Tenant Database Architecture",
          "Automated CI/CD Pipeline",
          "3 Months Priority Support & SLA"
        ]
      }
    ]
  },
  {
    id: "mobile-development",
    title: "Mobile App Development",
    shortDescription: "Cross-platform iOS & Android mobile applications with seamless user experience.",
    fullDescription: "Native and cross-platform mobile apps engineered for fast performance, offline readiness, push notifications, and intuitive mobile UI design.",
    whatWeProvide: [
      { title: "iOS & Android Apps", desc: "Cross-platform mobile applications compiled for dual deployment." },
      { title: "Native Features", desc: "Camera, GPS, push notifications, and biometric authentication." },
      { title: "Offline Syncing", desc: "Local caching and automated background data synchronization." },
      { title: "App Store Publishing", desc: "Complete submission guidance for Apple App Store & Google Play." }
    ],
    technologies: ["React Native", "Flutter", "Swift", "Kotlin", "Firebase", "REST APIs"],
    packages: [
      {
        id: "mobile-basic",
        tier: "Basic",
        name: "Basic Mobile App",
        price: "$4,200",
        duration: "3 - 4 Weeks",
        description: "Essential cross-platform app with core screens and cloud connectivity.",
        features: [
          "Cross-Platform iOS & Android Build",
          "Up to 6 Mobile Views",
          "Push Notification Integration",
          "App Store Submission Readiness",
          "2 Weeks Technical Support"
        ]
      },
      {
        id: "mobile-standard",
        tier: "Standard",
        name: "Standard Mobile Platform",
        price: "$9,200",
        duration: "6 - 8 Weeks",
        isFeatured: true,
        description: "Feature-rich mobile app with user authentication, database, and real-time syncing.",
        features: [
          "Up to 15 Interactive Screen Workflows",
          "User Profile & Auth System",
          "Real-time Data & Offline Support",
          "Payment Gateway & Analytics Integration",
          "4 Weeks Support & App Store Publishing"
        ]
      },
      {
        id: "mobile-premium",
        tier: "Premium",
        name: "Enterprise Mobile Solution",
        price: "$16,800+",
        duration: "10 - 14 Weeks",
        description: "Custom enterprise mobile platform with advanced security, biometric auth, and backend integrations.",
        features: [
          "Custom Native Modules & Security Hardening",
          "Complex Role-Based Workflows",
          "Enterprise API & Legacy System Sync",
          "Automated Testing & CI/CD Builds",
          "3 Months Support & SLA Guarantee"
        ]
      }
    ]
  },
  {
    id: "uiux-design",
    title: "UI/UX Design",
    shortDescription: "Design intuitive and compelling digital experiences that captivate users.",
    fullDescription: "User-centric UI/UX research, wireframing, interactive prototyping, and design system creation for web and mobile platforms.",
    whatWeProvide: [
      { title: "User Research & Audits", desc: "In-depth competitor analysis and user journey mapping." },
      { title: "Wireframes & Prototypes", desc: "Interactive Figma wireframes to test product workflows." },
      { title: "Design Systems", desc: "Scalable component libraries, design tokens, and style guides." },
      { title: "Usability Testing", desc: "Validation testing with real users for conversion optimization." }
    ],
    technologies: ["Figma", "Design Systems", "Prototyping", "User Research", "Adobe CC"],
    packages: [
      {
        id: "uiux-basic",
        tier: "Basic",
        name: "Basic Design Kit",
        price: "$2,500",
        duration: "1 - 2 Weeks",
        description: "Essential UI design for small apps, landing pages, or product wireframes.",
        features: [
          "Up to 5 Core Screen UI Designs",
          "Interactive Figma Prototype",
          "Color & Typography Guidelines",
          "Exported Asset Library",
          "1 Round of Revisions"
        ]
      },
      {
        id: "uiux-standard",
        tier: "Standard",
        name: "Standard UX & Design System",
        price: "$5,500",
        duration: "3 - 4 Weeks",
        isFeatured: true,
        description: "Complete product design with reusable component library and high-fidelity prototype.",
        features: [
          "Up to 15 Complex App Screens",
          "Comprehensive Design System in Figma",
          "Clickable Mobile & Desktop Prototypes",
          "User Journey & Flow Diagrams",
          "Developer Handoff Documentation"
        ]
      },
      {
        id: "uiux-premium",
        tier: "Premium",
        name: "Enterprise Product Redesign",
        price: "$10,500+",
        duration: "6 - 8 Weeks",
        description: "End-to-end design overhaul for complex SaaS platforms or multi-platform ecosystems.",
        features: [
          "Full SaaS Platform Architecture Design",
          "User Testing & UX Audits",
          "Multi-Platform Design System (Web + Mobile)",
          "Design Token Export for Codebase",
          "Dedicated Senior UX Strategist"
        ]
      }
    ]
  },
  {
    id: "aiml-solutions",
    title: "AI & ML Solutions",
    shortDescription: "Tailored intelligent systems, machine learning models, and LLM integrations.",
    fullDescription: "Deploy cutting-edge artificial intelligence, custom generative LLM pipelines, and predictive analytics tailored to enterprise automation.",
    whatWeProvide: [
      { title: "Generative AI & LLMs", desc: "Custom RAG pipelines and enterprise knowledge bases." },
      { title: "Predictive Analytics", desc: "Machine learning models for forecasting and anomaly detection." },
      { title: "Computer Vision & OCR", desc: "Automated document processing and visual recognition." },
      { title: "AI API Integration", desc: "Seamless integration of OpenAI, Claude, and open-source models." }
    ],
    technologies: ["Python", "PyTorch", "OpenAI", "LangChain", "FastAPI", "Pinecone", "TensorFlow"],
    packages: [
      {
        id: "ai-basic",
        tier: "Basic",
        name: "AI Integration MVP",
        price: "$4,800",
        duration: "3 - 4 Weeks",
        description: "Integrate LLM API capabilities or smart automation into your app.",
        features: [
          "OpenAI / Anthropic API Endpoint Setup",
          "Custom Prompt Engineering & Guardrails",
          "Document Processing Pipeline",
          "Basic Admin Monitoring Interface",
          "2 Weeks Support"
        ]
      },
      {
        id: "ai-standard",
        tier: "Standard",
        name: "Enterprise RAG Platform",
        price: "$11,500",
        duration: "6 - 8 Weeks",
        isFeatured: true,
        description: "Private internal AI chatbot & document search using your proprietary data.",
        features: [
          "Vector Database Setup (Pinecone/Milvus)",
          "Automated Document Ingestion Pipeline",
          "Role-Based Security & PII Anonymization",
          "Custom Chatbot UI & API Integration",
          "4 Weeks Technical Support & Optimization"
        ]
      },
      {
        id: "ai-premium",
        tier: "Premium",
        name: "Bespoke Machine Learning System",
        price: "$22,000+",
        duration: "10 - 16 Weeks",
        description: "Proprietary model training, fine-tuning, real-time analytics, and enterprise infrastructure.",
        features: [
          "Custom ML Model Fine-Tuning & Training",
          "Real-Time Data Streaming Pipeline",
          "Scalable GPU Cloud Infrastructure Setup",
          "Enterprise Governance & Security Audit",
          "3 Months Dedicated AI Support"
        ]
      }
    ]
  },
  {
    id: "custom-software",
    title: "Custom Software",
    shortDescription: "Create custom digital tools built for your specific business requirements.",
    fullDescription: "Tailor-made internal business tools, ERP platforms, automated workflows, and complex software systems built to streamline operations.",
    whatWeProvide: [
      { title: "Internal Workflows", desc: "Automated business software replacing manual spreadsheets." },
      { title: "ERP & CRM Systems", desc: "Custom management dashboards with role-based permissions." },
      { title: "Legacy Migration", desc: "Modernize legacy desktop software into secure cloud platforms." },
      { title: "API Integrations", desc: "Unify fragmented software tools into a single connected platform." }
    ],
    technologies: ["Node.js", "Python", "Go", "PostgreSQL", "Docker", "GraphQL", "React"],
    packages: [
      {
        id: "software-basic",
        tier: "Basic",
        name: "Basic Internal Tool",
        price: "$3,800",
        duration: "3 - 4 Weeks",
        description: "Custom internal tool for team management or simple workflow automation.",
        features: [
          "Up to 4 Custom Workflow Screens",
          "Database Setup & Data Import",
          "User Role Permissions (Admin/User)",
          "Export & Reporting Features",
          "2 Weeks Technical Support"
        ]
      },
      {
        id: "software-standard",
        tier: "Standard",
        name: "Standard ERP / Management Platform",
        price: "$8,500",
        duration: "6 - 8 Weeks",
        isFeatured: true,
        description: "Full-scale custom software for operational tracking, reporting, and staff collaboration.",
        features: [
          "Up to 12 Core Business Modules",
          "Advanced User Access & Audit Logs",
          "Third-Party System & API Sync",
          "Automated Email & Notification Workflows",
          "4 Weeks SLA & Training Sessions"
        ]
      },
      {
        id: "software-premium",
        tier: "Premium",
        name: "Enterprise System Modernization",
        price: "$17,500+",
        duration: "10 - 14 Weeks",
        description: "Large-scale legacy code migration, high-security backend, and automated multi-branch operations.",
        features: [
          "Complete Legacy System Refactoring",
          "Multi-Database Data Synchronization",
          "High-Throughput Microservices",
          "SOC2 / Security Audit Readiness",
          "3 Months SLA & On-Call Engineering"
        ]
      }
    ]
  },
  {
    id: "digital-solutions",
    title: "Digital Solutions",
    shortDescription: "Technology guidance designed for business growth and digital transformation.",
    fullDescription: "Strategic technology advisory, cloud infrastructure setup, performance auditing, and digital modernization for evolving businesses.",
    whatWeProvide: [
      { title: "Cloud Setup", desc: "Migrate and optimize workloads on AWS, GCP, or Azure." },
      { title: "Security Audits", desc: "Vulnerability analysis and system compliance reviews." },
      { title: "Tech Strategy", desc: "Architectural roadmaps for scaling digital infrastructure." },
      { title: "DevOps Automation", desc: "Automated deployments, monitoring, and zero-downtime releases." }
    ],
    technologies: ["AWS", "Google Cloud", "Kubernetes", "Terraform", "GitHub Actions", "SonarQube"],
    packages: [
      {
        id: "digital-basic",
        tier: "Basic",
        name: "Basic Cloud Setup",
        price: "$2,800",
        duration: "1 - 2 Weeks",
        description: "Migrate web application to managed cloud hosting with SSL and backups.",
        features: [
          "AWS / GCP Server Setup",
          "SSL Certificate & DNS Configuration",
          "Automated Daily Backup Scripts",
          "Basic Security Hardening",
          "2 Weeks Monitoring Support"
        ]
      },
      {
        id: "digital-standard",
        tier: "Standard",
        name: "DevOps & Security Audit",
        price: "$6,200",
        duration: "3 - 4 Weeks",
        isFeatured: true,
        description: "Infrastructure as Code, CI/CD automation, and thorough application security review.",
        features: [
          "Terraform Infrastructure as Code",
          "Automated CI/CD Pipeline Setup",
          "Penetration Testing & Security Audit",
          "Cloud Cost Optimization Review",
          "4 Weeks Support & Documentation"
        ]
      },
      {
        id: "digital-premium",
        tier: "Premium",
        name: "Enterprise Digital Transformation",
        price: "$13,500+",
        duration: "6 - 10 Weeks",
        description: "Multi-region cloud resilience, 24/7 monitoring infrastructure, and fractional CTO advisory.",
        features: [
          "Multi-Cloud High Availability Setup",
          "Disaster Recovery & Failover Systems",
          "Continuous Vulnerability Management",
          "Fractional CTO & Architecture Advisory",
          "3 Months SLA & On-Call Retainer"
        ]
      }
    ]
  }
];

export const PROCESS_STEPS = [
  { step: "01", title: "Choose a Service", description: "Select from our technology services or choose a pre-configured package." },
  { step: "02", title: "Tell Us Your Requirements", description: "Provide your project specifications, timeline, budget, and contact info." },
  { step: "03", title: "Receive a Quotation", description: "Get a formal quotation reference (e.g. ZT-10234) issued by our architects." },
  { step: "04", title: "Start Your Project", description: "Review and accept your quotation online to commence milestone execution." }
];
