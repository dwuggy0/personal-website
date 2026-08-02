const elements = {
  siteName: document.getElementById('siteName'),
  tagline: document.getElementById('tagline'),
  aboutText: document.getElementById('aboutText'),
  subtext: document.getElementById('subtext'),
  projectsText: document.getElementById('projectsText'),
  discord: document.getElementById('discord'),
  github: document.getElementById('github'),
  email: document.getElementById('email')
};

const form = {
  siteName: document.getElementById('editSiteName'),
  tagline: document.getElementById('editTagline'),
  about: document.getElementById('editAbout'),
  subtext: document.getElementById('editSubtext'),
  projects: document.getElementById('editProjects'),
  discord: document.getElementById('editDiscord'),
  github: document.getElementById('editGithub'),
  email: document.getElementById('editEmail')
};

const saveBtn = document.getElementById('saveBtn');
const statusEl = document.getElementById('status');
const unlockOverlay = document.getElementById('unlockOverlay');
const unlockPasswordInput = document.getElementById('unlockPassword');
const unlockBtn = document.getElementById('unlockBtn');
const unlockStatus = document.getElementById('unlockStatus');
const editorPanel = document.querySelector('.editor-panel');
const EDIT_PASSWORD = 'Hh69696969!';
let activePassword = '';

function applyContent(data) {
  elements.siteName.textContent = data.siteName || 'Nova Lane';
  elements.tagline.textContent = data.tagline || '';
  elements.aboutText.textContent = data.about || '';
  elements.subtext.textContent = data.subtext || '';
  elements.projectsText.textContent = data.projects || '';
  elements.discord.textContent = `Discord ${data.contact?.discord || ''}`;
  elements.github.textContent = `GitHub ${data.contact?.github || ''}`;
  elements.email.textContent = `Email ${data.contact?.email || ''}`;

  form.siteName.value = data.siteName || '';
  form.tagline.value = data.tagline || '';
  form.about.value = data.about || '';
  form.subtext.value = data.subtext || '';
  form.projects.value = data.projects || '';
  form.discord.value = data.contact?.discord || '';
  form.github.value = data.contact?.github || '';
  form.email.value = data.contact?.email || '';
}

function loadLocalContent() {
  try {
    const saved = localStorage.getItem('nova-lane-content');
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function saveLocalContent(data) {
  localStorage.setItem('nova-lane-content', JSON.stringify(data));
}

async function loadContent() {
  const localData = loadLocalContent();
  if (Object.keys(localData).length) {
    applyContent(localData);
  }

  try {
    const res = await fetch('/api/content');
    if (!res.ok) {
      return;
    }
    const data = await res.json();
    applyContent(data);
    saveLocalContent(data);
  } catch {
    if (!Object.keys(localData).length) {
      statusEl.textContent = 'Could not load content';
    }
  }
}

function unlockEditor() {
  if (unlockPasswordInput.value === EDIT_PASSWORD) {
    activePassword = unlockPasswordInput.value;
    unlockOverlay.classList.add('hidden');
    editorPanel.classList.remove('hidden');
    unlockStatus.textContent = 'Editor unlocked';
    statusEl.textContent = 'Editor unlocked';
  } else {
    unlockStatus.textContent = 'Incorrect password';
  }
}

unlockBtn.addEventListener('click', unlockEditor);
unlockPasswordInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    unlockEditor();
  }
});

saveBtn.addEventListener('click', async () => {
  if (!activePassword) {
    statusEl.textContent = 'Unlock the editor first';
    return;
  }

  statusEl.textContent = 'Saving...';
  const payload = {
    siteName: form.siteName.value,
    tagline: form.tagline.value,
    about: form.about.value,
    subtext: form.subtext.value,
    projects: form.projects.value,
    contact: {
      discord: form.discord.value,
      github: form.github.value,
      email: form.email.value
    }
  };

  try {
    const res = await fetch('/api/content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-edit-password': activePassword
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      applyContent(data);
      saveLocalContent(data);
      statusEl.textContent = 'Saved successfully';
    } else if (res.status === 401) {
      statusEl.textContent = 'Password incorrect';
    } else {
      applyContent(payload);
      saveLocalContent(payload);
      statusEl.textContent = 'Saved locally';
    }
  } catch {
    applyContent(payload);
    saveLocalContent(payload);
    statusEl.textContent = 'Saved locally';
  }
});

loadContent();
