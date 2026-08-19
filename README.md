# The Colony Select-Service Portfolio — Microsite

Static, self-contained single-page microsite for the Hodges Ward Elliott offering.
No build step and no dependencies: upload the contents of this folder to any static
host (or open `index.html`) and it runs.

```
microsite/
├── index.html          the page
└── assets/
    ├── css/site.css    design system + layout
    ├── js/site.js      scroll reveal, count-ups, disclosures, hotspots, lightbox
    ├── img/            photography + aerials (WebP)
    ├── logo/           brand + market logos (SVG)
    └── tex/            paper / concrete background textures
```

## Local preview

```bash
cd microsite && python3 -m http.server 8912
```

Then open http://127.0.0.1:8912

## Content sources

All prose is reproduced **verbatim** from
`xx Working Files xx/The Colony Select-Service Portfolio Microsite Outline.docx`.
Emphasis (`<strong>`) only wraps existing substrings — no copy was rewritten.

Property snapshot data comes from the `CY / FFI / RI Property Overview` tabs and the
sports demand-generator table from the `Sports Map` tab of
`Microsite Working File - The Colony Select Service Portfolio.xlsx`.

## Open items for the deal team

1. **Confidentiality Agreement buttons** — the four CTAs (`[data-cta="sign"]`,
   `[data-cta="download"]`) are `href="#"` placeholders. Point them at the CA
   e-sign URL and the PDF.
2. **Grandscape aerial call-outs** — the annotated aerial carries three verified
   hotspots (Grandscape, State Highway 121, The Portfolio). The outline asks for
   call-outs on the *individual* properties; confirm which building is which hotel
   and the pins can be split out (positions are simple `left/top` percentages on
   `.hotspot` in `index.html`).
3. **Sports demand-generator map** — the working file supplies the table (built here
   as an interactive proximity list) and a Google MyMaps link, but no map artwork.
   Drop the exported map beside the table when it is available.
