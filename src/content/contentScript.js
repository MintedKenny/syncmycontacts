function extractProfileData() {
    const data = {
      name: '',
      company: '',
      jobTitle: '',
      location: '',
      email: '',
      phoneNumber: '',
      pictureUrl: '',
      education: []
    };
  
    // Name
    const nameElement = document.querySelector('h1.text-heading-xlarge');
    if (nameElement) data.name = nameElement.innerText.trim();
  
    // Job Title and Company
    const experienceElement = document.querySelector('div.text-body-medium');
    if (experienceElement) {
      const parts = experienceElement.innerText.split(' at ');
      data.jobTitle = parts[0].trim();
      data.company = parts[1] ? parts[1].trim() : '';
    }
  
    // Location
    const locationElement = document.querySelector('.pv-text-details__left-panel .text-body-small');
    if (locationElement) data.location = locationElement.innerText.trim();
  
    // Profile Picture
    const pictureElement = document.querySelector('.pv-top-card-profile-picture__image');
    if (pictureElement) data.pictureUrl = pictureElement.src;
  
    // Education
    const educationElements = document.querySelectorAll('#education-section .pv-entity__school-name');
    educationElements.forEach(el => {
      data.education.push(el.innerText.trim());
    });
  
    // Email and Phone (these are often not publicly visible)
    // You might need to navigate to the contact info section to get these
  
    return data;
  }
  
  function addNotionButton() {
    const messageButton = document.querySelector('.pv-top-card-v2-ctas');
    if (messageButton && !document.querySelector('#add-to-notion-btn')) {
      const notionButton = document.createElement('button');
      notionButton.id = 'add-to-notion-btn';
      notionButton.innerText = 'Add to Notion';
      notionButton.className = 'artdeco-button artdeco-button--2 artdeco-button--primary';
      notionButton.style.marginLeft = '8px';
      notionButton.addEventListener('click', handleNotionButtonClick);
      messageButton.appendChild(notionButton);
    }
  }
  
  function handleNotionButtonClick() {
    const profileData = extractProfileData();
    chrome.runtime.sendMessage({action: 'addToNotion', data: profileData});
  }
  
  // Run when the script is injected
  addNotionButton();
  
  // Listen for page changes (LinkedIn uses client-side routing)
  const observer = new MutationObserver(addNotionButton);
  observer.observe(document.body, { childList: true, subtree: true });