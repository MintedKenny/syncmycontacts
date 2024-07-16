const CLIENT_ID = process.env.NOTION_CLIENT_ID;
const CLIENT_SECRET = process.env.NOTION_CLIENT_SECRET;
const REDIRECT_URI = chrome.identity.getRedirectURL();
const NOTION_AUTH_URL = `https://api.notion.com/v1/oauth/authorize?client_id=${CLIENT_ID}&response_type=code&owner=user&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;

export async function initiateNotionAuth() {
  return new Promise((resolve, reject) => {
    chrome.identity.launchWebAuthFlow(
      {
        url: NOTION_AUTH_URL,
        interactive: true
      },
      (redirectUrl) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          const url = new URL(redirectUrl);
          const code = url.searchParams.get('code');
          if (code) {
            exchangeCodeForToken(code).then(resolve).catch(reject);
          } else {
            reject(new Error('No authorization code found in the redirect.'));
          }
        }
      }
    );
  });
}

async function exchangeCodeForToken(code) {
  const response = await fetch('https://api.notion.com/v1/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET
    })
  });

  if (!response.ok) {
    throw new Error('Failed to exchange code for token');
  }

  const data = await response.json();
  await chrome.storage.sync.set({ 
    notionToken: data.access_token,
    workspaceId: data.workspace_id,
    botId: data.bot_id
  });
  return data;
}

export async function fetchNotionDatabases() {
  const { notionToken } = await chrome.storage.sync.get('notionToken');
  if (!notionToken) {
    throw new Error('Not authenticated with Notion');
  }

  const response = await fetch('https://api.notion.com/v1/search', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${notionToken}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28'
    },
    body: JSON.stringify({
      filter: {
        value: 'database',
        property: 'object'
      }
    })
  });

  if (!response.ok) {
    throw new Error('Failed to fetch Notion databases');
  }

  const data = await response.json();
  return data.results;
}

export async function addToNotion(profileData, databaseId) {
  const { notionToken } = await chrome.storage.sync.get('notionToken');
  if (!notionToken) {
    throw new Error('Not authenticated with Notion');
  }

  const response = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${notionToken}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28'
    },
    body: JSON.stringify({
      parent: { database_id: databaseId },
      properties: {
        Name: { title: [{ text: { content: profileData.name } }] },
        Company: { rich_text: [{ text: { content: profileData.company } }] },
        'Job Title': { rich_text: [{ text: { content: profileData.jobTitle } }] },
        Location: { rich_text: [{ text: { content: profileData.location } }] },
        Email: { email: profileData.email },
        'Phone Number': { phone_number: profileData.phoneNumber },
        'Profile Picture': { url: profileData.pictureUrl },
        Education: { multi_select: profileData.education.map(edu => ({ name: edu })) }
      }
    })
  });

  if (!response.ok) {
    throw new Error('Failed to add contact to Notion');
  }

  return await response.json();
}