// Initial Application Data & State Definitions

export const INITIAL_OFFICER_PROFILE = {
  name: "Inspector Rajesh Sharma",
  email: "inspector.sharma@gov.in",
  inspectorId: "IND-LM-9921",
  role: "Senior Legal Metrology & Quality Assurance Officer",
  ministry: "Dept. of Consumer Affairs, Govt. of India",
  zone: "Zone North (Delhi NCR)",
  fieldStation: "FIELD STATION #04",
  shift: "0800 - 1630 IST",
  stats: {
    inspections: 1428,
    sealIntegrity: 99.8,
    syncQueue: 4
  },
  security: {
    nodeId: "DL-INSP-09",
    sovereignHash: "e8b2::99c0::441f::d07a::8f12",
    engineVersion: "v4.2-RELEASE",
    biometricEnabled: true,
    charterRef: "Gazette Notification Ref #2024-LM-08"
  }
};

export const RECENT_INSPECTIONS = [
  {
    id: "INSP-2026-9041",
    productName: "Fortified Wheat Flour 5kg",
    batch: "S-260909",
    sku: "8812",
    date: "09 Sep 2026 • 11:24",
    verdict: "COMPLIANT",
    rulesTag: "RULE 6 & 18 VALID",
    image: "/assets/shakti_bhog_atta.jpg",
    details: "Full verification passed under Legal Metrology (Packaged Commodities) Rules 2011 & FSSAI Standards 2026."
  },
  {
    id: "INSP-2026-9039",
    productName: "Aashirvaad Pure Ghee 1L",
    batch: "AGH-0820",
    sku: "7419",
    date: "07 Sep 2026 • 09:15",
    verdict: "WARNING",
    violationNotice: "Advisory: Font height of Net Quantity below 4mm threshold",
    noticeStatus: "RECTIFICATION DUE",
    image: "/assets/aashirvaad_ghee.jpg",
    details: "Minor regulatory advisory issued to manufacturer. Rectification period: 15 business days."
  }
];

export const INITIAL_EXTRACTED_FIELDS = [
  {
    id: "01",
    label: "01. GENERIC PRODUCT DESIGNATION",
    value: "Fortified Whole Wheat Flour (Atta)",
    badge: "CORE ENTITY",
    standard: "Packaging Standard: Legal Metrology (Packaged Commodities)",
    status: "valid"
  },
  {
    id: "02",
    label: "02. MANUFACTURER IDENTITY",
    value: "Registered Domestic Producer",
    badge: "DOMESTIC ORIGIN",
    standard: "Registered Domestic Producer",
    status: "valid"
  },
  {
    id: "03",
    label: "03. REGISTERED PRODUCTION FACILITY ADDRESS",
    value: "Plot No. 42-44, Sector 18, Industrial Area, Okhla, New Delhi - 110020, India",
    badge: "VERIFIED POSTAL",
    standard: "GEO-ZONE: DEL-OKH-110020",
    status: "valid"
  },
  {
    id: "04",
    label: "04. DESIGNATED PACKER ENTITY",
    value: "Packaged Goods Division",
    badge: "PACKER MATCH",
    status: "valid"
  },
  {
    id: "05",
    label: "05. PACKAGING FACILITY LOCATION",
    value: "Unit 3, Kundli Industrial Corridor, Sonipat, Haryana - 131028",
    badge: "MATCHED REGISTRY",
    standard: "STATE REG: HR-SON-131028",
    status: "valid"
  },
  {
    id: "06",
    label: "06. IMPORTER NAME",
    value: "N/A (Domestic)",
    badge: "EXEMPTED",
    status: "valid"
  },
  {
    id: "07",
    label: "07. IMPORTER ADDRESS",
    value: "N/A",
    badge: "NOT APPLICABLE",
    status: "valid"
  },
  {
    id: "10",
    label: "10. NET QUANTITY DECLARED",
    value: "5 kg",
    section: "NET METROLOGICAL METRICS",
    status: "valid"
  },
  {
    id: "11",
    label: "11. UNIT REPRESENTATION",
    value: "Kilograms (kg)",
    status: "valid"
  },
  {
    id: "12",
    label: "12. SOLD BY COUNT (IF APPLICABLE)",
    value: "Single Commodity Pack",
    status: "valid"
  },
  {
    id: "13",
    label: "13. MAX RETAIL PRICE",
    value: "₹260.00",
    badge: "INCLUSIVE OF TAXES",
    status: "valid"
  },
  {
    id: "14",
    label: "14. TAX AFFIRMATION",
    value: "Inclusive of all taxes",
    status: "valid"
  },
  {
    id: "15",
    label: "15. MANUFACTURE WINDOW",
    value: "SEP 2023",
    status: "warning",
    warningText: "Package exceeds statutory shelf life window limit"
  },
  {
    id: "20",
    label: "20. COMMODITY GEOMETRY",
    value: "24 cm x 18 cm x 9 cm",
    status: "valid"
  },
  {
    id: "17",
    label: "17. CONSUMER CARE POSTAL ADDRESS",
    value: "P.O. Box 7012, New Delhi - 110001",
    section: "CONSUMER CARE REDRESSAL",
    status: "valid"
  },
  {
    id: "18",
    label: "18. TOLL-FREE PHONE",
    value: "1800-11-2345",
    status: "valid"
  },
  {
    id: "19",
    label: "19. ELECTRONIC MAIL",
    value: "care@sampleproducer.in",
    status: "valid"
  }
];

export const INITIAL_DOSSIERS = [
  {
    id: "PRAK-2026-002",
    title: "Apex Mustard Oil 1L",
    priority: "HIGH PRIORITY",
    status: "UNDER REVIEW",
    statusText: "UNDER REVIEW",
    subDiv: "SUB-DIV 4",
    description: "Dual MRP sticker detected, price inflated by ₹35 above baseline Gazette notification.",
    time: "08 Sep 2026 • 11:20 IST",
    assignedOfficer: "Officer R. Shinde en route",
    image: "/assets/sunrise_turmeric.jpg",
    actionRequired: "Enforcement Audit"
  },
  {
    id: "PRAK-2026-003",
    title: "Royal Assam Tea Gold 500g",
    priority: "MEDIUM PRIORITY",
    status: "UNDER REVIEW",
    statusText: "UNDER REVIEW",
    subDiv: "SUB-DIV 2",
    description: "FSSAI License number missing on secondary packaging panel.",
    time: "07 Sep 2026 • 16:45 IST",
    assignedOfficer: "Awaiting vendor laboratory batch report",
    image: "/assets/aashirvaad_ghee.jpg",
    actionRequired: "Lab Report Review"
  },
  {
    id: "PRAK-2026-004",
    title: "Basmati Rice 5kg",
    priority: "LOW PRIORITY",
    status: "RESOLVED",
    statusText: "RESOLVED",
    subDiv: "SUB-DIV 1",
    description: "Net weight shortfall of 180g against declared 5kg container weight.",
    time: "04 Sep 2026 • 09:30 IST",
    assignedOfficer: "PENALTY IMPOSED: ₹25,000",
    image: "/assets/shakti_bhog_atta.jpg",
    actionRequired: "ARCHIVED"
  },
  {
    id: "PRAK-2026-005",
    title: "Fortune Refined Soyabean Oil 1L",
    priority: "HIGH PRIORITY",
    status: "OPEN",
    statusText: "OPEN",
    subDiv: "SUB-DIV 3",
    description: "Missing mandatory country of origin declaration on front panel.",
    time: "03 Sep 2026 • 18:10 IST",
    assignedOfficer: null,
    image: "/assets/aashirvaad_ghee.jpg",
    actionRequired: "Assign Field Inspector"
  },
  {
    id: "PRAK-2026-006",
    title: "Catch Red Chilli Powder 200g",
    priority: "MEDIUM PRIORITY",
    status: "OPEN",
    statusText: "OPEN",
    subDiv: "SUB-DIV 2",
    description: "Consumer redressal toll-free number inactive during verified sample test.",
    time: "02 Sep 2026 • 12:40 IST",
    assignedOfficer: null,
    image: "/assets/sunrise_turmeric.jpg",
    actionRequired: "Assign Field Inspector"
  }
];

export const AUDIT_CHECKS = [
  {
    title: "Net Quantity Font Dimension",
    status: "WARNING",
    detected: "2.8 mm",
    required: "4.0 mm statutory min",
    reason: "Pack weight exceeds 1kg threshold. Rule 9 of LMPC requires minimum 4.0mm numeral height."
  },
  {
    title: "Product Name Declaration",
    status: "PASS",
    detected: "Fortified Whole Wheat Flour (Atta)",
    required: "Clear prominent display on principal display panel",
    reason: "Verified compliant under Rule 6."
  },
  {
    title: "Manufacturer Identity & Address",
    status: "PASS",
    detected: "Complete postal address & consumer care verified",
    required: "Full manufacturer disclosures",
    reason: "Verified compliant."
  },
  {
    title: "FSSAI Logo & License Number",
    status: "PASS",
    detected: "LIC #10014011002341 (Active)",
    required: "FSSAI logo + 14 digit license",
    reason: "Verified compliant."
  },
  {
    title: "MRP & Tax Declaration",
    status: "PASS",
    detected: "₹260.00 (Inclusive of all taxes)",
    required: "Inclusive of all taxes clause formatted properly",
    reason: "Verified compliant."
  }
];
