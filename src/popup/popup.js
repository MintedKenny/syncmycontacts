import { initiateNotionAuth, fetchNotionDatabases } from '../utils/api.js';

document.addEventListener('DOMContentLoaded', async () => {
  const connectButton = document.getElementById('connectNotion');
  const databaseSelect = document.getElementById('databaseSelect');
  const statusMessage = document.getElementById('statusMessage');

  connectButton.addEventListener('click', async () => {
    try {
      statusMessage.textContent = 'Connecting to Notion...';
      await initiateNotionAuth();
      statusMessage.textContent = 'Connected to Notion successfully!';
      loadDatabases();
    } catch (error) {
      console.error('Error connecting to Notion:', error);
      statusMessage.textContent = `Error: ${error.message}`;
    }
  });

  databaseSelect.addEventListener('change', async (event) => {
    const selectedDatabaseId = event.target.value;
    await chrome.storage.sync.set({ selectedDatabaseId });
    statusMessage.textContent = 'Database selected and saved.';
  });

  async function loadDatabases() {
    try {
      const databases = await fetchNotionDatabases();
      databaseSelect.innerHTML = '<option value="">Select a database</option>';
      databases.forEach(db => {
        const option = document.createElement('option');
        option.value = db.id;
        option.textContent = db.title[0]?.plain_text || 'Untitled';
        databaseSelect.appendChild(option);
      });
      databaseSelect.style.display = 'block';
    } catch (error) {
      console.error('Error fetching databases:', error);
      statusMessage.textContent = `Error: ${error.message}`;
    }
  }

  // Check if already connected and load databases if so
  const { notionToken } = await chrome.storage.sync.get('notionToken');
  if (notionToken) {
    connectButton.textContent = 'Reconnect to Notion';
    loadDatabases();
  }
});