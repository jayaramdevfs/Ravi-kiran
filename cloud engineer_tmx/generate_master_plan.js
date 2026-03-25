const docx = require("docx");
const fs = require("fs");

const {
  Document, Packer, Paragraph, Table, TableRow, TableCell,
  TextRun, Header, Footer, PageNumber, NumberFormat,
  WidthType, AlignmentType, BorderStyle, HeadingLevel,
  TableLayoutType, ShadingType, VerticalAlign, PageNumberSeparator
} = docx;

const NAVY = "1B2A4A";
const WHITE = "FFFFFF";
const LIGHT_GRAY = "F2F4F7";
const FONT = "Arial";

function heading(text, level = 1) {
  const sizes = { 1: 32, 2: 26 };
  return new Paragraph({
    spacing: { before: level === 1 ? 400 : 300, after: 200 },
    children: [
      new TextRun({
        text: text,
        font: FONT,
        size: sizes[level] || 26,
        bold: true,
        color: NAVY,
      }),
    ],
  });
}

function sectionHeading(text) {
  return new Paragraph({
    spacing: { before: 360, after: 200 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, color: NAVY },
    },
    children: [
      new TextRun({
        text: text,
        font: FONT,
        size: 28,
        bold: true,
        color: NAVY,
      }),
    ],
  });
}

function subSectionHeading(text) {
  return new Paragraph({
    spacing: { before: 280, after: 160 },
    children: [
      new TextRun({
        text: text,
        font: FONT,
        size: 24,
        bold: true,
        color: NAVY,
      }),
    ],
  });
}

function bodyText(text) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [
      new TextRun({
        text: text,
        font: FONT,
        size: 22,
      }),
    ],
  });
}

function bulletPoint(text) {
  return new Paragraph({
    spacing: { after: 80 },
    bullet: { level: 0 },
    children: [
      new TextRun({
        text: text,
        font: FONT,
        size: 22,
      }),
    ],
  });
}

function numberedItem(num, text) {
  return new Paragraph({
    spacing: { after: 100 },
    indent: { left: 360 },
    children: [
      new TextRun({
        text: `${num}. `,
        font: FONT,
        size: 22,
        bold: true,
        color: NAVY,
      }),
      new TextRun({
        text: text,
        font: FONT,
        size: 22,
      }),
    ],
  });
}

function headerCell(text, width) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: { type: ShadingType.SOLID, color: NAVY, fill: NAVY },
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 60, bottom: 60, left: 120, right: 120 },
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: text,
            font: FONT,
            size: 20,
            bold: true,
            color: WHITE,
          }),
        ],
      }),
    ],
  });
}

function dataCell(text, width, bold = false, shade = false) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: shade ? { type: ShadingType.SOLID, color: LIGHT_GRAY, fill: LIGHT_GRAY } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 60, bottom: 60, left: 120, right: 120 },
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: text,
            font: FONT,
            size: 20,
            bold: bold,
          }),
        ],
      }),
    ],
  });
}

function twoColTable(headers, rows) {
  const w1 = 3200, w2 = 7000;
  const tableRows = [
    new TableRow({ children: [headerCell(headers[0], w1), headerCell(headers[1], w2)] }),
    ...rows.map((r, i) => new TableRow({
      children: [dataCell(r[0], w1, true, i % 2 === 1), dataCell(r[1], w2, false, i % 2 === 1)],
    })),
  ];
  return new Table({
    width: { size: 10200, type: WidthType.DXA },
    rows: tableRows,
  });
}

function fourColTable(headers, rows, widths) {
  const tableRows = [
    new TableRow({ children: headers.map((h, i) => headerCell(h, widths[i])) }),
    ...rows.map((r, ri) => new TableRow({
      children: r.map((c, ci) => dataCell(c, widths[ci], ci === 0, ri % 2 === 1)),
    })),
  ];
  return new Table({
    width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
    rows: tableRows,
  });
}

function threeColTable(headers, rows, widths) {
  const tableRows = [
    new TableRow({ children: headers.map((h, i) => headerCell(h, widths[i])) }),
    ...rows.map((r, ri) => new TableRow({
      children: r.map((c, ci) => dataCell(c, widths[ci], ci === 0, ri % 2 === 1)),
    })),
  ];
  return new Table({
    width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
    rows: tableRows,
  });
}

// Build document
const doc = new Document({
  styles: {
    default: {
      listParagraph: {
        run: { font: FONT, size: 22 },
      },
    },
  },
  numbering: {
    config: [
      {
        reference: "bullet-list",
        levels: [
          {
            level: 0,
            format: "bullet",
            text: "\u2022",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } },
          },
        ],
      },
    ],
  },
  sections: [
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
        },
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: "Interview Cracking Master Plan — Ravi Kiran Kambhampati", font: FONT, size: 16, color: "888888" }),
                new TextRun({ text: "    |    Page ", font: FONT, size: 16, color: "888888" }),
                new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 16, color: "888888" }),
                new TextRun({ text: " of ", font: FONT, size: 16, color: "888888" }),
                new TextRun({ children: [PageNumber.TOTAL_PAGES], font: FONT, size: 16, color: "888888" }),
              ],
            }),
          ],
        }),
      },
      children: [
        // Title block
        new Paragraph({ spacing: { before: 600, after: 0 }, alignment: AlignmentType.CENTER, children: [] }),
        new Paragraph({
          spacing: { before: 200, after: 100 },
          alignment: AlignmentType.CENTER,
          border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: NAVY } },
          children: [
            new TextRun({ text: "INTERVIEW CRACKING MASTER PLAN", font: FONT, size: 44, bold: true, color: NAVY }),
          ],
        }),
        new Paragraph({
          spacing: { before: 200, after: 60 },
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "Cloud Engineer (R-5764) — TMX Group, Toronto", font: FONT, size: 28, color: NAVY }),
          ],
        }),
        new Paragraph({
          spacing: { before: 60, after: 400 },
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "Ravi Kiran Kambhampati — Preparation Strategy", font: FONT, size: 24, color: "555555", italics: true }),
          ],
        }),

        // SECTION 1
        sectionHeading("SECTION 1: TARGET ROLE SUMMARY"),
        twoColTable(["Field", "Detail"], [
          ["Position", "Cloud Engineer (R-5764)"],
          ["Company", "TMX Group (Toronto Stock Exchange)"],
          ["Location", "Toronto, ON — 100 Adelaide St W (Hybrid 2-3 days)"],
          ["Salary", "CAD $100,000 - $115,000/year"],
          ["Posted", "March 4, 2026"],
          ["Key Focus", "Cloud infrastructure deployment, operational reliability, cloud modernization across AWS and Azure"],
        ]),

        // SECTION 2
        sectionHeading("SECTION 2: CANDIDATE PROFILE"),
        twoColTable(["Field", "Detail"], [
          ["Name", "Ravi Kiran Kambhampati"],
          ["Location", "Toronto, ON"],
          ["Education", "Post-Grad CloudOps (York, Sept 2025 - Apr 2026, current) + Post-Grad CyberSecurity Ops (York, Jan 2025 - Sept 2025, completed)"],
          ["Experience", "Cloud Engineer Intern at TefoLogic (Apr-Jul 2024) — AWS, GCP, Terraform, CI/CD"],
          ["Projects", "SOC Threat Detection Log Analyzer + SOAR-Lite Platform"],
          ["Certifications", "CompTIA Security+ (in progress), Python Full Stack (KodNest 2024)"],
          ["Key Skills", "Python, Bash, PowerShell, AWS (IAM, EC2, S3, CloudTrail, Lambda), Terraform, Docker, SIEM (Splunk, ELK), NIST, ISO 27001"],
        ]),

        // SECTION 3
        sectionHeading("SECTION 3: GAP ANALYSIS — RESUME vs JD"),
        fourColTable(
          ["JD Requirement", "Ravi's Level", "Gap Size", "Strategy"],
          [
            ["2-4 yrs cloud experience", "4-month internship + projects", "BIG", "Frame: 4 months production + 1.5 yrs academic + labs = equivalent"],
            ["AWS/Azure (IaaS, PaaS, IAM, networking)", "AWS: IAM, EC2, CloudTrail, SGs, S3, Lambda", "Moderate", "Brush up Azure basics"],
            ["Managed Kubernetes (EKS/AKS)", "Docker only", "BIG", "Crash course on concepts — Pods, Deployments, Services"],
            ["Cloud Certification (AWS SA / Azure Admin)", "CompTIA Security+ in progress", "Gap", 'Say: "Security+ next month, AWS SAA planned right after"'],
            ["Terraform/IaC", "Used at TefoLogic (production)", "OK", "Prepare specific examples"],
            ["CI/CD workflows", "Used at TefoLogic", "OK", "Prepare: tools used, pipeline stages"],
            ["Networking (firewalls, VPNs)", "TCP/IP, DNS, HTTP, SGs", "Moderate", "Study VPN types, VPC peering, NACLs vs SGs"],
            ["Communication", "Strong on resume", "OK", "Practice self-intro until flawless"],
          ],
          [2600, 2800, 1200, 3600]
        ),

        // SECTION 4
        sectionHeading("SECTION 4: PREFERRED SKILLS (BONUS POINTS)"),
        threeColTable(
          ["Preferred Skill", "Ravi's Status", "Action"],
          [
            ["Python/PowerShell/Bash scripting", "STRONG — both projects prove this", "Highlight with examples"],
            ["Security/Compliance (CIS, NIST, ISO 27001)", "Has NIST + ISO 27001", "Explain NIST 5 functions, ISO 27001 controls"],
            ["Cloud cost management", "Needs study", "Learn: Reserved Instances, Spot, right-sizing, Cost Explorer"],
            ["Additional certifications", "Security+ in progress", "Position as advantage for security-focused cloud role"],
          ],
          [3400, 3400, 3400]
        ),

        // SECTION 5
        sectionHeading("SECTION 5: RAVI'S COMPETITIVE ADVANTAGES"),
        numberedItem(1, "UNIQUE BLEND: Security + Cloud — Most cloud engineers don't have SOC/SIEM experience. Most security analysts don't have Terraform/CI/CD skills. Ravi bridges both."),
        numberedItem(2, "TWO POST-GRAD PROGRAMS: CyberSecurity Ops + CloudOps = comprehensive, current knowledge"),
        numberedItem(3, "REAL PRODUCTION EXPERIENCE: TefoLogic internship with actual AWS/GCP infrastructure"),
        numberedItem(4, "STRONG PROJECTS: Two working security automation platforms with Docker, databases, dashboards"),
        numberedItem(5, "SECURITY-FIRST MINDSET: Critical differentiator for financial sector like TMX"),
        numberedItem(6, "ALREADY IN TORONTO: Authorized to work in Canada, no relocation needed"),
        numberedItem(7, "AUTOMATION FOCUS: Both internship and projects demonstrate automation-first approach"),

        // SECTION 6
        sectionHeading("SECTION 6: PREPARATION MATERIALS CREATED"),
        threeColTable(
          ["File", "Description", "When to Study"],
          [
            ["01_Self_Introduction_Script.docx", "60-sec and 90-sec self-intro scripts, key answers (Why TMX, Why hire me, Weakness, Questions to ask)", "Day 1, Hour 1"],
            ["02_Project_Deep_Dive_Guide.docx", "Both projects explained line-by-line with 30 Q&As, architecture diagrams, design decisions", "Day 1, Hours 2-4"],
            ["03_Interview_Questions_Bank.docx", "145+ predicted questions with model answers — JD, Resume, Projects, Behavioral, TMX", "Day 1-2, Hours 5+"],
            ["04_Two_Day_Study_Schedule.docx", "Hour-by-hour schedule with 1-4-3 rule (Learn, Revise 4x, Practice 3x)", "Start immediately"],
            ["05_Quick_Reference_Cheat_Sheet.docx", "Rapid-fire reference — AWS, Azure, Terraform, K8s, Networking, NIST, power phrases", "Day 1-2, quick reference"],
            ["06_Resume_AND_JD_Technology_Prep.docx", "Every resume + JD technology explained with Ravi's examples and must-know details", "Day 1-2, reference"],
          ],
          [3200, 4600, 2400]
        ),

        // SECTION 7
        sectionHeading("SECTION 7: 2-DAY SCHEDULE OVERVIEW"),
        subSectionHeading("Day 1 — Foundation (~10 hours)"),
        threeColTable(
          ["Time", "Activity", "Phase"],
          [
            ["8:00-9:00", "Self-Introduction: memorize, practice 3x aloud", "LEARN"],
            ["9:15-10:45", "Project Deep Dive: SOC Threat Detection", "LEARN"],
            ["11:00-11:30", "Revision 1: Self-Intro + SOC project (no notes)", "REVISE 1"],
            ["11:30-1:00", "Project Deep Dive: SOAR-Lite", "LEARN"],
            ["1:30-2:30", "AWS Questions (Q1-Q15)", "LEARN"],
            ["2:30-3:30", "Terraform + Networking Questions", "LEARN"],
            ["3:45-4:15", "Revision 2: All topics rapid recall", "REVISE 2"],
            ["4:15-5:15", "Resume-Based Questions — TefoLogic stories", "LEARN"],
            ["5:15-6:15", "Behavioral Questions — STAR format", "LEARN"],
            ["6:30-7:00", "Cheat Sheet review", "LEARN"],
            ["7:00-7:30", "Revision 3: Full rapid-fire", "REVISE 3"],
          ],
          [1800, 6200, 2200]
        ),

        subSectionHeading("Day 2 — Sharpening (~10 hours)"),
        threeColTable(
          ["Time", "Activity", "Phase"],
          [
            ["7:00-7:30", "Morning cold recall — Self-Intro + architectures", "REVISE 4"],
            ["7:30-8:30", "Kubernetes Crash Course", "LEARN"],
            ["8:45-9:45", "CI/CD + Incident Response", "LEARN"],
            ["9:45-10:45", "Azure Basics", "LEARN"],
            ["11:00-11:30", "TMX Research", "LEARN"],
            ["11:30-12:30", "Mock Interview 1: Record yourself", "PRACTICE 1"],
            ["1:00-2:00", "Mock Interview 2: With someone", "PRACTICE 2"],
            ["2:00-3:00", "Fix weak areas", "TARGETED"],
            ["3:15-4:15", "Project-Based Questions", "PRACTICE"],
            ["4:15-5:15", "Final Mock: Full simulation", "PRACTICE 3"],
            ["Evening", "REST — no more studying", "RECOVERY"],
          ],
          [1800, 6200, 2200]
        ),

        // SECTION 8
        sectionHeading("SECTION 8: INTERVIEW DAY CHECKLIST"),
        bulletPoint("Read Self-Intro script once (5 min)"),
        bulletPoint("Read cheat sheet once (10 min)"),
        bulletPoint('Read "Questions for them" list (5 min)'),
        bulletPoint("Check laptop/camera/mic if virtual (5 min)"),
        bulletPoint("Dress professionally (business casual minimum)"),
        bulletPoint("Have water and notepad ready"),
        bulletPoint("Deep breaths, confident posture"),
        bulletPoint("Arrive 10 minutes early"),
        bulletPoint("Smile when greeting, maintain eye contact"),
        bulletPoint("Remember: You have REAL experience and REAL projects — own it"),

        // SECTION 9
        sectionHeading("SECTION 9: SUCCESS CRITERIA"),
        bulletPoint("Can deliver 60-second self-intro without hesitation"),
        bulletPoint("Can draw both project architectures from memory"),
        bulletPoint("Can answer 90%+ of the 145 questions without looking"),
        bulletPoint("Can explain every Python file's purpose and key logic"),
        bulletPoint("Can connect projects to TMX Cloud Engineer role convincingly"),
        bulletPoint("Has 3-5 questions ready for the interviewers"),
        bulletPoint("Knows what TMX Group does and why cloud engineering matters there"),
        bulletPoint("Can explain every technology on the resume with a specific example"),
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buffer) => {
  const outPath = "C:\\Users\\jayar\\OneDrive\\Desktop\\Ravi kiran\\00_Interview_Cracking_Master_Plan.docx";
  fs.writeFileSync(outPath, buffer);
  console.log("Document created successfully: " + outPath);
}).catch((err) => {
  console.error("Error:", err);
});
