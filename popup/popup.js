// Wait for the DOM to fully load
document.addEventListener('DOMContentLoaded', function() {
    const commentInput = document.getElementById('comment-input');
    const saveButton = document.getElementById('save-button');
    const bookmarksList = document.getElementById('bookmarks-list');
    
    // Get the current active tab
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      const currentTab = tabs[0];
      
      // Set up the save button
      saveButton.addEventListener('click', function() {
        const comment = commentInput.value.trim();
        
        if (comment) {
          // Create a new bookmark
          chrome.bookmarks.create({
            title: currentTab.title,
            url: currentTab.url
          }, function(newBookmark) {
            // Save the comment with the bookmark ID as key
            chrome.storage.sync.set({[newBookmark.id]: comment}, function() {
              // Refresh the list and clear input
              loadRecentBookmarks();
              commentInput.value = '';
            });
          });
        }
      });
    });
    
    // Load and display recent bookmarks with comments
    function loadRecentBookmarks() {
      bookmarksList.innerHTML = '';
      
      // Get the 10 most recent bookmarks
      chrome.bookmarks.getRecent(10, function(bookmarks) {
        // Get all saved comments
        chrome.storage.sync.get(null, function(comments) {
          
          bookmarks.forEach(bookmark => {
            const bookmarkElement = document.createElement('div');
            bookmarkElement.className = 'bookmark-item';
            
            const comment = comments[bookmark.id] || 'No comment added';
            
            bookmarkElement.innerHTML = `
              <a class="bookmark-title" href="${bookmark.url}" target="_blank">
                ${bookmark.title}
              </a>
              <span class="bookmark-comment">${comment}</span>
            `;
            
            bookmarksList.appendChild(bookmarkElement);
          });
        });
      });
    }
    
    // Initial load of bookmarks
    loadRecentBookmarks();
  });