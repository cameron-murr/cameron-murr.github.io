# Systems Engineering Portfolio

Personal portfolio site built with Jekyll, hosted on GitHub Pages.

## Local Development

```bash
# Install dependencies
bundle install

# Serve locally with live reload
bundle exec jekyll serve --livereload

# Open http://localhost:4000
```

## Deployment

Push to `main` — GitHub Actions builds and deploys automatically via `.github/workflows/deploy.yml`.

**First-time setup:**
1. Go to repo Settings → Pages
2. Set Source to "GitHub Actions"
3. Push to `main`

## Customization Checklist

Before publishing, update:

- [ ] `_config.yml` — set `url` to your actual GitHub Pages URL (`https://yourusername.github.io`)
- [ ] `_config.yml` — update `baseurl` if deploying to a project page (e.g. `/portfolio`) vs user/org page (leave blank)
- [ ] `_layouts/default.html` — update GitHub link in nav
- [ ] `about.md` — update GitHub and LinkedIn URLs in sidebar
- [ ] `index.html` — update project row links once project slugs are confirmed
- [ ] Each `_projects/*.md` — update artifact links to point to actual GitHub repos

## File Structure

```
portfolio/
├── _config.yml              # Jekyll config
├── _layouts/
│   ├── default.html         # Base layout (nav, footer)
│   └── project.html         # Project page layout
├── _projects/               # One .md per project
│   ├── requirements-traceability-tool.md
│   ├── functional-architecture-model.md
│   ├── robotic-arm.md
│   ├── iec-62304-sdp.md
│   └── custom-flight-controller.md
├── assets/
│   ├── css/main.css         # All styles
│   └── js/main.js           # Minimal JS
├── index.html               # Homepage
├── about.md                 # About page
├── Gemfile                  # Ruby dependencies
└── .github/workflows/
    └── deploy.yml           # GitHub Actions deployment
```

## Adding a New Project

1. Create `_projects/your-project-slug.md`
2. Copy front matter from an existing project file
3. Update `number`, `title`, `subtitle`, `status`, `tags`, `problem`, `artifacts`, `reflection`, `standards`
4. Write architecture/approach content as the body (renders as Section 02)
5. Add a row to the project list in `index.html`

## Status Values

Projects support three status values in front matter:
- `complete` — green badge
- `in-progress` — amber badge  
- `planned` — grey badge

The `locked` class on project rows in `index.html` disables click behavior for projects without a live page. Remove it when the project page is ready.
