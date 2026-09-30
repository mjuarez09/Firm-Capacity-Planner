# Firm Capacity Planner

A browser-based staffing and funnel capacity calculator for a law firm.

## Run locally
Open `index.html` in a browser.

## Publish with GitHub Pages
1. Create a GitHub repository and upload `index.html`, `styles.css`, and `app.js`.
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, select **Deploy from a branch**.
4. Select the main branch and `/ (root)`, then save.
5. GitHub will provide the site URL after deployment.

## Notes
- Inputs save in the user's browser using localStorage.
- No client data should be entered; this version is designed for aggregate operational metrics.
- Seasonality weights are normalized to the annual target, but the planner flags when they do not total 100%.
- Intake assumptions should be replaced with validated time-study data.
