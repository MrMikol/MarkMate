document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const commentInput = document.getElementById('comment-input');
    const saveButton = document.getElementById('save-button');
    const bookmarksList = document.getElementById('bookmarks-list');
    const donationAmount = document.getElementById('donation-amount');
    const donateButton = document.getElementById('donate-button');
  
    // Configuration (replace with your PayPal email)
    const PAYPAL_EMAIL = 'mneiltan07@yahoo.com';
  
    // Load current tab and initialize
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      const currentTab = tabs[0];
      
      // Set up save bookmark functionality
      saveButton.addEventListener('click', () => saveBookmark(currentTab));
      
      // Set up donation functionality
      donateButton.addEventListener('click', openPayPalDonation);
      
      // Input validation for donation amount
      donationAmount.addEventListener('input', validateDonationAmount);
      
      // Load existing bookmarks
      loadRecentBookmarks();
    });
  
    // ======================
    // Core Functions
    // ======================
  
    function saveBookmark(tab) {
      const comment = commentInput.value.trim();
      
      if (!comment) {
        commentInput.placeholder = 'Please enter a comment...';
        commentInput.classList.add('error');
        return;
      }
  
      chrome.bookmarks.create({
        title: tab.title,
        url: tab.url
      }, function(newBookmark) {
        // Save comment with bookmark ID as key
        chrome.storage.sync.set({ [newBookmark.id]: comment }, () => {
          // Update UI
          loadRecentBookmarks();
          commentInput.value = '';
          showTempMessage(saveButton, '✓ Saved!');
        });
      });
    }
  
    function loadRecentBookmarks() {
      bookmarksList.innerHTML = '';
      
      chrome.bookmarks.getRecent(10, (bookmarks) => {
        chrome.storage.sync.get(null, (comments) => {
          bookmarks.forEach(bookmark => {
            const comment = comments[bookmark.id] || 'No comment';
            bookmarksList.appendChild(createBookmarkElement(bookmark, comment));
          });
        });
      });
    }
  
    function createBookmarkElement(bookmark, comment) {
      const element = document.createElement('div');
      element.className = 'bookmark-item';
      element.innerHTML = `
        <a class="bookmark-title" href="${bookmark.url}" target="_blank">
          ${bookmark.title}
        </a>
        <span class="bookmark-comment">${comment}</span>
      `;
      return element;
    }
  
    // ======================
    // Donation Functions
    // ======================
  
    function openPayPalDonation() {
      const amount = parseFloat(donationAmount.value);
      
      if (isNaN(amount)) {
        donationAmount.style.borderColor = 'red';
        return;
      }
  
      const url = new URL('https://www.paypal.com/sendmoney');
      url.searchParams.set('business', PAYPAL_EMAIL);
      url.searchParams.set('amount', Math.max(1, amount).toFixed(2));
      url.searchParams.set('item_name', 'Micro Bookmark Comments Support');
      url.searchParams.set('currency_code', 'USD');
      url.searchParams.set('source', 'chrome_extension');
  
      chrome.tabs.create({ url: url.toString() });
    }
  
    function validateDonationAmount() {
      const value = parseFloat(this.value);
      if (value < 1) this.value = 1;
      this.style.borderColor = '#ddd';
    }
  
    // ======================
    // UI Helpers
    // ======================
  
    function showTempMessage(element, message) {
      const originalText = element.textContent;
      element.textContent = message;
      setTimeout(() => {
        element.textContent = originalText;
      }, 1500);
    }
  
    // Clear error state when typing
    commentInput.addEventListener('input', () => {
      commentInput.classList.remove('error');
    });
  });