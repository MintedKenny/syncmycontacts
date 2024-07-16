import { addToNotion } from '../utils/api.js';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'addToNotion') {
    chrome.storage.sync.get('selectedDatabaseId', async (data) => {
      if (!data.selectedDatabaseId) {
        sendResponse({ success: false, error: 'No Notion database selected' });
        return;
      }
      try {
        const result = await addToNotion(request.data, data.selectedDatabaseId);
        sendResponse({ success: true, result });
      } catch (error) {
        sendResponse({ success: false, error: error.message });
      }
    });
    return true; // Indicates we will send a response asynchronously
  }
});