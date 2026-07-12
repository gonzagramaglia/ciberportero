## 🚀 What is this PR?

This PR enhances the links administration by making the main links table more compact and visual, and allows admins to directly upload and set custom image icons for links instead of just using text.

## 🛠️ Key Changes

- **Admin UI:** Streamlined the links table in `/admin/links` by combining name, URL, and icon into a single column and rendering actual images.
- **Link Editor:** Added an image upload button next to the icon URL input in `LinkEditor.tsx` to upload images directly to Supabase Storage.
- **Link Rendering:** Improved robust external URL rendering for links and local images in the public `/links` page to prevent Next.js image URL parsing errors.
- **UI Tweaks:** Changed the "Agregar link" button on the `/links` page to "Editar links" for better clarity.

## 📸 Screenshot / Output

[Drag and drop a screenshot of the UI here. For non-UI changes (testing, config, backend), paste the terminal output or test results instead.]

## ✅ Checklist

- [ ] Build passes successfully (`yarn build`)
- [ ] Tests pass with ≥80% coverage (`yarn test:coverage`)
- [ ] Conventional Commits applied
- [ ] CodeRabbit review addressed (if applicable)

---

## Extended Description (Merge Commit)

- Admin UI: Streamlined the links table by combining name, URL, and icon.
- Link Editor: Added direct image upload to Supabase Storage.
- Link Rendering: Fixed image URL resolution bugs on the public links page.
