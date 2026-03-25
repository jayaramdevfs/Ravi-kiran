const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
        LevelFormat, Header, Footer, PageNumber, PageBreak } = require('docx');
const fs = require('fs');

const border = { style: BorderStyle.SINGLE, size: 1, color: "999999" };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 60, bottom: 60, left: 100, right: 100 };

function headerCell(text, width) {
  return new TableCell({
    borders, width: { size: width, type: WidthType.DXA },
    shading: { fill: "1B2A4A", type: ShadingType.CLEAR },
    margins: cellMargins,
    verticalAlign: "center",
    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text, bold: true, color: "FFFFFF", font: "Arial", size: 20 })] })]
  });
}

function cell(text, width, shade) {
  return new TableCell({
    borders, width: { size: width, type: WidthType.DXA },
    shading: shade ? { fill: shade, type: ShadingType.CLEAR } : undefined,
    margins: cellMargins,
    children: [new Paragraph({ children: [new TextRun({ text, font: "Arial", size: 20 })] })]
  });
}

function phaseCell(text, width) {
  const color = text.includes("LEARN") ? "0D6EFD" : text.includes("REVISE") ? "198754" : text.includes("PRACTICE") ? "DC3545" : text.includes("RECOVERY") ? "6F42C1" : text.includes("TARGETED") ? "FD7E14" : "333333";
  return new TableCell({
    borders, width: { size: width, type: WidthType.DXA },
    margins: cellMargins,
    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text, bold: true, color, font: "Arial", size: 20 })] })]
  });
}

function scheduleRow(time, block, activity, phase) {
  const isBreak = block === "\u2014" || activity.includes("Break") || activity.includes("Lunch") || activity.includes("REST");
  const shade = isBreak ? "F0F0F0" : undefined;
  return new TableRow({
    children: [
      cell(time, 1200, shade),
      cell(block, 600, shade),
      cell(activity, 5760, shade),
      phaseCell(phase, 1800)
    ]
  });
}

const day1Rows = [
  ["8:00-9:00", "1", "Read Self-Introduction script. Memorize 60-sec version. Practice 3x aloud in mirror.", "LEARN"],
  ["9:00-9:15", "\u2014", "Break", "\u2014"],
  ["9:15-10:45", "2", "Project Deep Dive: SOC Threat Detection. Read the guide, understand every component, practice explaining the architecture from memory.", "LEARN"],
  ["10:45-11:00", "\u2014", "Break", "\u2014"],
  ["11:00-11:30", "3", "REVISION 1: Self-Intro (say it aloud) + SOC project (explain architecture without notes)", "REVISE 1"],
  ["11:30-1:00", "4", "Project Deep Dive: SOAR-Lite. Read guide, memorize 4 tables, understand SOAR flow, practice explaining.", "LEARN"],
  ["1:00-1:30", "\u2014", "Lunch break", "\u2014"],
  ["1:30-2:30", "5", "AWS Questions (Q1-Q15 from bank). Read question, read answer, close eyes and repeat.", "LEARN"],
  ["2:30-3:30", "6", "Terraform Questions (Q26-Q35) + Networking Questions (Q46-Q55)", "LEARN"],
  ["3:30-3:45", "\u2014", "Break", "\u2014"],
  ["3:45-4:15", "7", "REVISION 2: Self-Intro + Both Projects + AWS + Terraform (rapid recall, no notes)", "REVISE 2"],
  ["4:15-5:15", "8", "Resume-Based Questions (Q76-Q95). Prepare specific stories for TefoLogic. Write bullet points.", "LEARN"],
  ["5:15-6:15", "9", "Behavioral Questions (Q126-Q140). Write STAR-format answers for top 5.", "LEARN"],
  ["6:15-6:30", "\u2014", "Break", "\u2014"],
  ["6:30-7:00", "10", "Quick Reference Cheat Sheet \u2014 read through once, highlight what you don't know.", "LEARN"],
  ["7:00-7:30", "11", "REVISION 3: Full rapid-fire \u2014 Self-Intro \u2192 Projects \u2192 Top 10 technical \u2192 Top 3 behavioral", "REVISE 3"],
  ["Before sleep", "\u2014", "Read cheat sheet one more time (passive review)", "REVISE 3.5"],
];

const day2Rows = [
  ["7:00-7:30", "1", "Morning cold recall: Self-Intro (no notes) + draw both architectures on paper", "REVISE 4 (final)"],
  ["7:30-8:30", "2", "Kubernetes Crash Course (Q36-Q45). Focus on concepts: Pods, Deployments, Services, EKS/AKS.", "LEARN"],
  ["8:30-8:45", "\u2014", "Break", "\u2014"],
  ["8:45-9:45", "3", "CI/CD Questions (Q56-Q65) + Incident Response (Q66-Q75)", "LEARN"],
  ["9:45-10:45", "4", "Azure Basics (Q16-Q25) \u2014 enough to show awareness, not deep expertise", "LEARN"],
  ["10:45-11:00", "\u2014", "Break", "\u2014"],
  ["11:00-11:30", "5", "TMX Research: What TMX does, TSX, TSXV, MX, financial compliance", "LEARN"],
  ["11:30-12:30", "6", "MOCK INTERVIEW 1: Record yourself on phone. Answer 15 random questions from bank. Watch playback.", "PRACTICE 1"],
  ["12:30-1:00", "\u2014", "Lunch", "\u2014"],
  ["1:00-2:00", "7", "MOCK INTERVIEW 2: Have brother/friend ask questions. Full simulation.", "PRACTICE 2"],
  ["2:00-3:00", "8", "Fix weak areas identified in mock interviews. Re-study those specific questions.", "TARGETED REVISION"],
  ["3:00-3:15", "\u2014", "Break", "\u2014"],
  ["3:15-4:15", "9", "Project-Based Questions (Q96-Q125). Practice explaining code decisions.", "LEARN + PRACTICE"],
  ["4:15-5:15", "10", "FINAL MOCK: Self-Intro (60s) \u2192 Project 1 (3m) \u2192 Project 2 (3m) \u2192 10 technical \u2192 5 behavioral \u2192 Questions for us", "PRACTICE 3"],
  ["5:15-5:30", "11", "Read cheat sheet one final time.", "FINAL REVIEW"],
  ["Evening", "\u2014", "REST. No more studying. Watch something relaxing. Sleep early.", "RECOVERY"],
];

function makeScheduleTable(rows) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [1200, 600, 5760, 1800],
    rows: [
      new TableRow({ children: [headerCell("Time", 1200), headerCell("Block", 600), headerCell("Activity", 5760), headerCell("1-4-3 Phase", 1800)] }),
      ...rows.map(r => scheduleRow(r[0], r[1], r[2], r[3]))
    ]
  });
}

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Arial", color: "1B2A4A" },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Arial", color: "2E5090" },
        paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 1 } },
    ]
  },
  numbering: {
    config: [
      { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbers", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    headers: {
      default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "TMX Cloud Engineer \u2014 Interview Prep", italics: true, color: "999999", font: "Arial", size: 18 })] })] })
    },
    footers: {
      default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Page ", color: "999999", font: "Arial", size: 18 }), new TextRun({ children: [PageNumber.CURRENT], color: "999999", font: "Arial", size: 18 })] })] })
    },
    children: [
      // Title
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: "RAVI KIRAN KAMBHAMPATI", bold: true, size: 44, font: "Arial", color: "1B2A4A" })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: "2-DAY INTERVIEW PREPARATION SCHEDULE", bold: true, size: 32, font: "Arial", color: "2E5090" })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: "Cloud Engineer (R-5764) \u2014 TMX Group, Toronto", size: 24, font: "Arial", color: "666666" })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "2E5090", space: 1 } }, children: [new TextRun({ text: "Applying the 1-4-3 Study Rule", italics: true, size: 22, font: "Arial", color: "888888" })] }),

      // 1-4-3 Rule
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("THE 1-4-3 RULE EXPLAINED")] }),
      new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: "1 = ", bold: true, color: "0D6EFD" }), new TextRun("Learn the topic ONCE (focused first exposure)")] }),
      new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: "4 = ", bold: true, color: "198754" }), new TextRun("Revise 4 times at spaced intervals (1hr later, 4hrs later, next morning, before interview)")] }),
      new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: "3 = ", bold: true, color: "DC3545" }), new TextRun("Practice explaining 3 times (alone aloud, recorded, mock with someone)")] }),

      // Day 1
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("DAY 1 \u2014 FOUNDATION DAY (~10 hours)")] }),
      makeScheduleTable(day1Rows),

      // Page break
      new Paragraph({ children: [new PageBreak()] }),

      // Day 2
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("DAY 2 \u2014 SHARPENING DAY (~10 hours)")] }),
      makeScheduleTable(day2Rows),

      // Interview Day
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("INTERVIEW DAY MORNING (30 min before)")] }),
      ...[
        "Read Self-Intro script once",
        "Read cheat sheet once",
        "Read \"Questions for them\" list",
        "Deep breaths, confident posture",
        "Arrive 10 minutes early"
      ].map(item => new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: item, font: "Arial", size: 22 })] })),

      // Priority ranking
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("PRIORITY TOPIC RANKING (Study these first)")] }),
      ...[
        "Self-Introduction (60-sec version) \u2014 HIGHEST PRIORITY",
        "Both Project Explanations (architecture + code flow)",
        "AWS Services (IAM, VPC, EC2, S3, CloudTrail, CloudWatch)",
        "Terraform (init/plan/apply, state, modules)",
        "TefoLogic Internship Stories (specific examples)",
        "Kubernetes Basics (Pods, Deployments, Services, EKS/AKS)",
        "Networking (VPC, subnets, SGs, NACLs, VPN)",
        "CI/CD Pipeline Concepts",
        "Azure Basics",
        "Behavioral Questions (STAR format)"
      ].map(item => new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: item, font: "Arial", size: 22 })] })),

      // Color legend
      new Paragraph({ spacing: { before: 300 }, children: [new TextRun({ text: "PHASE COLOR LEGEND:", bold: true, size: 22 })] }),
      new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "\u25CF LEARN", bold: true, color: "0D6EFD", size: 20 }), new TextRun({ text: "  \u25CF REVISE", bold: true, color: "198754", size: 20 }), new TextRun({ text: "  \u25CF PRACTICE", bold: true, color: "DC3545", size: 20 }), new TextRun({ text: "  \u25CF TARGETED", bold: true, color: "FD7E14", size: 20 }), new TextRun({ text: "  \u25CF RECOVERY", bold: true, color: "6F42C1", size: 20 })] }),
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("C:\\Users\\jayar\\OneDrive\\Desktop\\Ravi kiran\\04_Two_Day_Study_Schedule.docx", buffer);
  console.log("Created: 04_Two_Day_Study_Schedule.docx");
});
