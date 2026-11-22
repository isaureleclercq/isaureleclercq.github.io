# Isaure Leclercq — personal portfolio

A small, build-tool-free portfolio for GitHub Pages. The default Parisian Gallery design pairs warm white, charcoal, and burgundy with serif headings and uncropped artwork. Four shared themes cover the homepage, artwork gallery, Fusion model page, and course. Project cards are generated from JSON.

## Switch the design

Change one property in `site.json`, save, and refresh your local preview:

```json
"theme": "parisian-gallery"
```

| Value | Design | Homepage |
| --- | --- | --- |
| `parisian-gallery` | Warm white, burgundy, serif type | Centered introduction and Opéra Garnier feature |
| `cobalt-studio` | Chalk, cobalt, bold sans serif | Split introduction and house model feature |
| `playful-sketchbook` | Blush, terracotta, lilac | Playful headline, June sketchbook feature, gently tilted covers |
| `midnight-atelier` | Ink, ivory, amber | Left-aligned serif introduction and house model feature |

The theme is applied on every page by `theme.js`. It resolves `site.json` relative to the script, so nested pages and GitHub Pages subdirectories use the same configuration. Missing, invalid, or unrecognized theme settings fall back to Parisian Gallery. No dependencies or build step are required.

This portfolio sets `"featuredProject": "house-renovation"` to keep House renovation first in every theme. Remove that property to use the theme defaults in the table above.

Optional homepage overrides in `site.json`:

- `featuredProject`: the `id` of a project in `projects.json`, such as `"opera-garnier"` or `"house-renovation"`. Omit it to use the theme’s default.
- `heroTitle` and `heroEmphasis`: replace the theme’s two-part headline. Omit them to use the theme’s wording.

`themes.css` holds the shared color and typography tokens. `styles.css` holds the homepage composition for each preset. Theme settings are site-wide; visitors do not need to choose a theme. To publish a configuration change, commit and push `site.json` to `main`.

## Personalize the introduction

Edit `site.json` to change the name, intro, eyebrow, and About copy. Keep the JSON punctuation (quotes and commas) intact. The current copy is a starting point; make it sound like you.

## Add a project

Add an object to the array in `projects.json`:

```json
[
  {
    "id": "my-project",
    "title": "Project title",
    "category": "Visual identity",
    "year": "2026",
    "description": "A short, one or two sentence introduction to the project.",
    "cover": "assets/project-cover.jpg",
    "coverAlt": "A concise description of the project image",
    "mark": "P",
    "url": "https://example.com/project",
    "links": [
      { "label": "Process notes", "url": "https://drive.google.com/your-share-link" }
    ]
  }
]
```

Only `title` is required. Give each project a unique `id` if you want to select it as the featured project. `cover` is optional; when omitted, a typographic cover uses `mark` and the selected theme. `url` makes the cover and title clickable. Local project links stay in the same tab; external links open in a new tab. `links` can hold a live demo, case study, or a Google Drive share link. Check Drive sharing settings before adding a link you want visitors to open.

The theme selects the lead project by `id`; `site.json` can override that choice with `featuredProject`. If that ID is unavailable, a project with `featured: true` is used, then the first project. The selected project appears once, followed by the remaining projects in JSON order.

For Adobe work, export a web-ready cover image into `assets/` and reference it with `cover`. Keep the editable source in your Adobe app or Drive; avoid uploading large working files to the website.

For drawings that should stay uncropped, set `coverFit` to `"contain"`. Optional `coverWidth` and `coverHeight` values describe the cover image dimensions. Use `featureCover`, `featureWidth`, and `featureHeight` for a larger image in the lead position. The homepage includes a complete static fallback gallery for visitors without JavaScript or when a JSON request fails; update that markup in `index.html` when changing the collection.

## Hand drawn artwork

Four artwork entries in `projects.json` link to `projects/hand-drawn-art.html`: the Opéra Garnier in Paris, a two-page school comic, a June sketchbook spread, and cat studies. The gallery includes all five scanned pages, with upright WebP images, click-to-enlarge views, and links to the four original PDFs. On phones the comic pages stack in reading order. Image and PDF links also work without JavaScript; the enlarged view supports Escape, a Close button, and a full-size image link.

The web images and original scans live in `assets/drawings/`. The PDFs were supplied in `~/Documents/isaure/portfolio`; their original filenames are mapped in `assets/README.md`. Artwork titles are descriptive labels. No dates are inferred from scan filenames.

## House renovation showcase

The house model is listed in `projects.json`, with a dedicated page at `projects/house-renovation.html`. It uses a cover captured from the shared model and loads Autodesk’s interactive viewer when the visitor chooses **Explore in 3D**. On phones, an **Open 3D model** link opens the full Autodesk viewer instead of squeezing its controls into the page. A direct Autodesk link also remains available on desktop if the embedded viewer is unavailable. The page needs no API key or build step; the model must remain shared through Autodesk.

Update the share link and iframe `data-src` in the project page if the Autodesk share changes, and recapture `assets/house-renovation.jpg` when you want a newer cover. Preview locally at `http://localhost:8000/projects/house-renovation.html`.

## Preview on your computer

Because the site loads JSON files, preview it through a local web server instead of opening `index.html` directly. From this folder, run:

```sh
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Learn how the site works

Open `http://localhost:8000/course/` for **Build your corner of the web**, an eight-lesson HTML course based on this portfolio. It covers local setup, HTML, CSS, responsive layouts, JavaScript, JSON project cards, accessibility, and GitHub Pages.

Each lesson includes a practical exercise, a worked solution, a knowledge check, a YouTube reference, and further reading. The course also includes an HTML/CSS workbench. Progress, exercise checkboxes, and workbench code are saved in the current browser using local storage; workbench experiments do not edit the portfolio files. Clear browser site data to reset saved course data.

The [Update your content guide](course/index.html#updating-content) explains how to edit About me, add paragraphs, update project descriptions, add images and projects, and preview and publish changes. It is a reference page outside the eight-lesson progress tracker.

The course lives in `course/index.html`, `course/course.css`, and `course/course.js`. It uses the same static server as the portfolio and needs no additional dependencies. All lesson text remains readable without JavaScript; interactive features require it. Videos open on YouTube. The course is published alongside the portfolio and follows the selected theme.

## Verify a change

Run `node --test tests/theme.test.cjs` to check theme loading, fallbacks, nested paths, featured-project selection, and project rendering. Check the homepage, both project pages, and the course in a browser at desktop and phone widths before publishing.

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
