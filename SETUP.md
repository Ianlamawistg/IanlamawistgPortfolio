# Cloudinary setup

1. Cloudinary > Settings > API Keys: confirm your Cloud name.
   Settings > Upload > Upload Presets: confirm your unsigned preset name
   (use the copy icon next to it). Put both at the top of script.js.
2. Settings > Security > Restricted media types: clear (uncheck) "Resource list", Save.
   This lets the site read the list of uploaded files.
3. Same Security page, "PDF and ZIP files delivery": tick
   "Allow delivery of PDF and ZIP files", Save. Needed for PDFs to open.
4. (Recommended) Edit your upload preset and set "Allowed formats" to
   jpg, png, pdf so nobody can upload anything else.
5. Change OWNER_PASSWORD in script.js.
6. Put the site online (GitHub Pages, Netlify, or Firebase Hosting).
7. Open the site with ?owner at the end, log in, upload.

Delete files from Cloudinary: Assets > Media Library > select the file > delete.
Uploaded/deleted files can take up to a minute to appear or disappear on the site.
