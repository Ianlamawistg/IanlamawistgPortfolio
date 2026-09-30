// ===== YOUR SETTINGS (edit these) =====
const OWNER_PASSWORD = "renebaterbonia";

const CLOUD_NAME    = "yxgwgxes";               // Cloudinary > Settings > API Keys
const UPLOAD_PRESET = "IanlamawistgPortfolio";  // the unsigned preset you created

const LINKS = {
  github:   "https://github.com/Ianlamawistg",
  email:    "mailto:iancarl.guevarra@cvsu.edu.ph",
  facebook: "https://www.facebook.com/shimbambalembalembang"
};
// ======================================

// ---------- Social icons ----------
const ICONS = {
  github:   "M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.69 1.25 3.35.96.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.08 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z",
  email:    "M2 5h20v14H2V5zm2 2v.5l8 5.5 8-5.5V7H4zm0 3v7h16v-7l-8 5.5L4 10z",
  facebook: "M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z"
};

function showSocials() {
  const box = document.getElementById("socials");
  if (!box) return;
  for (const name in ICONS) {
    const a = document.createElement("a");
    a.href = LINKS[name];
    a.setAttribute("aria-label", name);
    if (name !== "email") { a.target = "_blank"; a.rel = "noopener"; }
    a.innerHTML = `<svg viewBox="0 0 24 24"><path d="${ICONS[name]}"/></svg>`;
    box.append(a);
  }
}

// ---------- Owner ----------
const isOwner = () => sessionStorage.getItem("owner") === "yes";

function showOwnerArea() {
  const box = document.getElementById("owner-area");
  if (!box) return;

  if (isOwner()) {
    box.innerHTML = `
      <div class="owner-box">
        <h2>Add a file</h2>
        <input id="f-title" type="text" placeholder="Title (only for a single file)" aria-label="Title">
        <select id="f-category" aria-label="Category">
          <option value="exams">Examinations</option>
          <option value="quizzes">Quizzes</option>
          <option value="activities">Activities</option>
        </select>
        <input id="f-file" type="file" multiple accept="image/*,.pdf" aria-label="Files">
        <button id="f-add">Upload</button>
        <button id="f-out">Log out</button>
      </div>`;

    document.getElementById("f-add").onclick = uploadFiles;
    document.getElementById("f-out").onclick = () => {
      sessionStorage.removeItem("owner");
      location.href = "index.html";
    };

  } else if (location.search === "?owner") {
    // The login box only appears when the address ends with ?owner
    box.innerHTML = `
      <div class="owner-box">
        <h2>Owner login</h2>
        <input id="pw" type="password" placeholder="Password" aria-label="Password">
        <button id="pw-go">Log in</button>
      </div>`;
    document.getElementById("pw-go").onclick = () => {
      if (document.getElementById("pw").value === OWNER_PASSWORD) {
        sessionStorage.setItem("owner", "yes");
        location.href = "index.html";
      } else {
        alert("Wrong password.");
      }
    };
  }
}

// ---------- Upload to Cloudinary ----------
async function uploadFiles() {
  const files = document.getElementById("f-file").files;
  if (files.length === 0) { alert("Choose at least one file first."); return; }

  const category = document.getElementById("f-category").value;
  const typedTitle = document.getElementById("f-title").value.trim();
  const button = document.getElementById("f-add");
  button.disabled = true;
  button.textContent = "Uploading...";

  try {
    let count = 0;
    for (const file of files) {
      count++;
      // The title is stored inside the file's public ID
      const baseName = (files.length === 1 && typedTitle) ? typedTitle : file.name.replace(/\.[^.]+$/, "");
      const slug = baseName.replace(/[^A-Za-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "file";

      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", UPLOAD_PRESET);
      data.append("tags", "portfolio-" + category);
      data.append("public_id", Date.now() + count + "_" + slug);

      const res = await fetch("https://api.cloudinary.com/v1_1/" + CLOUD_NAME + "/image/upload", {
        method: "POST",
        body: data
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error ? result.error.message : "Upload failed");
    }
    alert(files.length + " file(s) uploaded. New files can take up to a minute to appear in the list.");
    document.getElementById("f-title").value = "";
    document.getElementById("f-file").value = "";
  } catch (err) {
    alert("Upload failed: " + err.message);
  }

  button.disabled = false;
  button.textContent = "Upload";
  showFiles();
}

// ---------- Show the file lists ----------
async function getList(category) {
  const url = "https://res.cloudinary.com/" + CLOUD_NAME + "/image/list/portfolio-" + category + ".json";
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return data.resources || [];
  } catch (err) {
    return [];
  }
}

async function showFiles() {
  const lists = document.querySelectorAll(".file-list");

  for (const list of lists) {
    const items = await getList(list.dataset.category);
    items.sort((a, b) => b.created_at.localeCompare(a.created_at));
    list.innerHTML = "";

    if (items.length === 0) {
      list.innerHTML = '<p class="empty">No files yet.</p>';
      continue;
    }

    items.forEach(item => {
      const title = item.public_id.replace(/^\d+_/, "").replace(/_/g, " ");
      const url = "https://res.cloudinary.com/" + CLOUD_NAME + "/image/upload/v" +
                  item.version + "/" + item.public_id + "." + item.format;

      const row = document.createElement("div");
      row.className = "file-row";

      const info = document.createElement("div");
      info.innerHTML = "<strong></strong><span></span>";
      info.children[0].textContent = title;
      info.children[1].textContent = new Date(item.created_at).toLocaleDateString();

      const viewBtn = document.createElement("button");
      viewBtn.textContent = "View";
      viewBtn.onclick = () => openViewer(title, url, item.format);

      row.append(info, viewBtn);
      list.append(row);
    });
  }
}

// ---------- File viewer ----------
function openViewer(title, url, format) {
  const body = document.getElementById("viewer-body");
  document.getElementById("viewer-title").textContent = title;
  document.getElementById("viewer-download").href = url;

  body.innerHTML = "";
  const show = document.createElement(format === "pdf" ? "iframe" : "img");
  show.src = url;
  body.append(show);

  document.getElementById("viewer").hidden = false;
  document.getElementById("viewer-close").onclick = () => {
    document.getElementById("viewer").hidden = true;
    body.innerHTML = "";
  };
}

// ---------- Start ----------
showSocials();
showOwnerArea();
showFiles();
