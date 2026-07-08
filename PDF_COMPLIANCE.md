# PDF Compliance Notes

## Current State — Phase 1

Phase 1 of SoloChief does not generate PDF documents. This file documents the approach and
limitations that will apply when PDF export is introduced (planned for a later phase).

## Planned PDF Generation

When PDF export is added (e.g. weekly review exports, commitment snapshots, audit reports), the
library under consideration is one of:

- **`@react-pdf/renderer`** — React-based, runs server-side, produces PDF 1.4–1.7
- **`puppeteer` / headless Chrome** — HTML-to-PDF via print, good for complex layouts
- **`pdfkit`** — programmatic PDF construction, low-level control

The choice will be recorded in DECISIONS.md when made.

## What a Generated PDF Will Support

Depending on the library chosen, generated PDFs will support:

- Text content with basic formatting (bold, italic, lists)
- Tables (commitment lists, weekly plans)
- Page numbers and headers
- A document title embedded in PDF metadata
- Creation date in metadata

## PDF Metadata

All generated PDFs must include the following XMP/Document Information metadata:

| Field    | Value                            |
|----------|----------------------------------|
| Title    | Document-specific (e.g. "Weekly Review — 23 Jun 2026") |
| Author   | The authenticated user's name    |
| Creator  | SoloChief                        |
| Language | `en-GB`                          |

Language must be set to `en-GB` to match the UK English copy used throughout the product.

## PDF/UA and Accessibility Limitations

Standard PDF generation libraries (`@react-pdf/renderer`, `pdfkit`) do **not** produce
PDF/UA-compliant (ISO 14289) output by default. PDF/UA requires:

- Tagged PDF structure (logical reading order, heading hierarchy, table headers)
- Alternative text on all images
- Language specified at document and content level
- A document title set in the viewer preferences

Without tagged PDF support, generated documents will fail PDF/UA accessibility checkers
(e.g. PAC 2024, Adobe Acrobat Accessibility Checker).

### Current position

- Phase 1: no PDF output — not applicable.
- When PDF export ships: documents will be **useful but not PDF/UA compliant**.
- If a user or enterprise customer requires PDF/UA, a tagged PDF engine (e.g. iText, Apache FOP,
  or a commercial HTML-to-tagged-PDF service) would need to be adopted. This is a significant
  architectural change and should be logged as a DECISIONS.md entry when required.

## Accessibility Checker Scores

If you run a generated PDF through an accessibility checker, you can expect:

| Check                        | Expected result (without PDF/UA work) |
|------------------------------|---------------------------------------|
| Tagged PDF                   | Fail                                  |
| Document title in viewer     | Pass (if metadata is set)             |
| Language set                 | Pass (if metadata is set)             |
| Reading order                | Unverified                            |
| Alt text on images           | Fail if images are present            |
| PDF/UA identifier            | Fail                                  |

These scores are acceptable for Phase 1 export use cases (personal productivity exports).
They are **not** acceptable for documents submitted to regulated bodies or used in formal
accessibility audits.

## Old Generated PDFs Do Not Auto-Update

Once a PDF is generated and downloaded or stored, it is a static snapshot. Changes made to
commitments, plans, or reviews in SoloChief after the PDF was generated are **not** reflected
in previously generated files. There is no mechanism to "refresh" an old PDF.

Users should regenerate exports after significant changes.

## Future Work

If PDF/UA compliance becomes a requirement:

1. Log the decision in DECISIONS.md.
2. Evaluate a tagged PDF library or HTML-to-tagged-PDF service.
3. Add automated accessibility checks to the PDF generation pipeline (e.g. via PAC CLI).
4. Document the new compliance level in this file.
