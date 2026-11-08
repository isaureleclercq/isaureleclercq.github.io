# Isaure Leclercq — personal portfolio

A small, build-tool-free portfolio for GitHub Pages. The design is an editorial project journal: warm parchment, moss green, and marigold accents, and an abstract orbit illustration. Project cards are generated from JSON, so new work can be added without editing the layout.

## Personalize the introduction

Edit `site.json` to change the name, intro, eyebrow, and About copy. Keep the JSON punctuation (quotes and commas) intact. The current copy is a starting point; make it sound like you.

## Add a project

Add an object to the array in `projects.json`:

```json
[
  {
    "title": "Project title",
    "category": "Visual identity",
    "year": "2026",
    "description": "A short, one or two sentence introduction to the project.",
    "cover": "assets/project-cover.jpg",
    "coverAlt": "A concise description of the project image",
    "color": "#e4e6da",
    "mark": "P",
    "url": "https://example.com/project",
    "links": [
      { "label": "Process notes", "url": "https://drive.google.com/your-share-link" }
    ]
  }
]
```

Only `title` is required. `cover` is optional; when omitted, a simple typographic cover is generated using `color` and `mark`. `url` makes the cover clickable. `links` can hold a live demo, case study, or a Google Drive share link. Check Drive sharing settings before adding a link you want visitors to open.

For Adobe work, export a web-ready cover image into `assets/` and reference it with `cover`. Keep the editable source in your Adobe app or Drive; avoid uploading large working files to the website.

## Preview on your computer

Because the site loads JSON files, preview it through a local web server instead of opening `index.html` directly. From this folder, run:

```sh
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Publish with GitHub Pages

This site repository is **`isaureleclercq.github.io`**. In the repository, open **Settings → Pages** and choose **Deploy from a branch**, then select **main** and **/(root)**. GitHub Pages publishes the site at **https://isaureleclercq.github.io**. The first deploy can take a few minutes.

GitHub Free requires a public repository for Pages; Pages websites are publicly accessible on the internet. If the repository is still private, change its visibility in **Settings → General → Danger Zone → Change repository visibility** before enabling Pages.

## Update the live site

Clone the repository once, then edit files in that folder:

```sh
git clone https://github.com/isaureleclercq/isaureleclercq.github.io.git
cd isaureleclercq.github.io
```

To publish an update, add your `site.json` or `projects.json` edits and any new `assets/` images, then run:

```sh
git add .
git commit -m "Update portfolio"
git push
```

GitHub Pages republishes the site after each push to `main`.
