export let mockUsers = {
  "admin@gov.in": { 
    password: "adminpassword", 
    role: "admin", 
    name: "Admin Officer" 
  },
  "contractor@build.com": { 
    password: "contractorpassword", 
    role: "contractor", 
    name: "BuildCorp Inc.", 
    class: "Class 1",
    // --- New detailed fields ---
    gstNumber: "27AACCT1234F1Z5",
    panNumber: "AACCT1234F",
    yearsExperience: 15,
    turnover: 75.5, // in Crores
    avgRating: 4.8,
  },
};

// The mockTenders data remains the same, no changes needed here.
export let mockTenders = [
    {
    id: "TENDER-001",
    title: "Construction of City Central Bridge",
    issuingAuthority: "Metropolis Public Works",
    status: "In Progress",
    totalValue: 50000000,
    eligibleClasses: ["Class 1"],
    description: "A project to construct a 4-lane bridge over the Grand River to ease city traffic. Requires significant prior experience and financial stability.",
    bids: [{ contractorName: "BuildCorp Inc.", bidDocument: "BuildCorp_Bridge_Proposal.pdf", awarded: true }],
    milestones: [
      { id: 1, name: "Foundation & Piling", status: "Paid", payoutAmount: 10000000 },
      { id: 2, name: "Superstructure Erection", status: "Approved", payoutAmount: 20000000 },
      { id: 3, name: "Deck and Pavement", status: "Pending", payoutAmount: 15000000 },
      { id: 4, name: "Finishing & Inauguration", status: "Pending", payoutAmount: 5000000 },
    ],
  },
  {
    id: "TENDER-002",
    title: "City-Wide WiFi Network Installation",
    issuingAuthority: "Department of Technology",
    status: "Open",
    totalValue: 12000000,
    eligibleClasses: ["Class 2", "Class 3"],
    description: "Installation of public WiFi hotspots in all major parks, squares, and public transport hubs.",
    bids: [],
     milestones: [
      { id: 1, name: "Hardware Procurement", status: "Pending", payoutAmount: 4000000 },
      { id: 2, name: "Zone 1 Installation", status: "Pending", payoutAmount: 3000000 },
      { id: 3, name: "Zone 2 Installation", status: "Pending", payoutAmount: 3000000 },
      { id: 4, name: "Network Stress Test & Handover", status: "Pending", payoutAmount: 2000000 },
    ],
  },
    {
    id: "TENDER-003",
    title: "Annual Maintenance Contract for Govt. Offices",
    issuingAuthority: "General Administration Dept.",
    status: "Open",
    totalValue: 5000000,
    eligibleClasses: ["Class 3"],
    description: "A 1-year maintenance contract for plumbing and electrical works across 20 government office buildings.",
     bids: [],
     milestones: [
      { id: 1, name: "Q1 Service Completion", status: "Pending", payoutAmount: 1250000 },
      { id: 2, name: "Q2 Service Completion", status: "Pending", payoutAmount: 1250000 },
      { id: 3, name: "Q3 Service Completion", status: "Pending", payoutAmount: 1250000 },
      { id: 4, name: "Q4 Service Completion & Report", status: "Pending", payoutAmount: 1250000 },
    ],
  },
];