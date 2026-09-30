/**
 * Google Apps Script - Drive Image Upload API
 * 
 * INSTRUCTIONS:
 * 1. Go to script.google.com and create a new project
 * 2. Copy this entire code into the editor
 * 3. Save the project
 * 4. Click "Deploy" > "New deployment"
 * 5. Select "Web app" as the type
 * 6. Set "Execute as" to "Me"
 * 7. Set "Who has access" to "Anyone" (or "Anyone with Google Account" for more security)
 * 8. Deploy and copy the Web App URL
 * 9. Replace the GOOGLE_APPS_SCRIPT_URL in GamesPage.tsx with this URL
 */

function doPost(e) {
  try {
    // Parse the incoming JSON data
    const data = JSON.parse(e.postData.contents);
    
    // Get parameters
    const folderId = data.folderId;
    const beforeImage = data.beforeImage; // Base64 string
    const afterImage = data.afterImage;   // Base64 string
    const timestamp = data.timestamp;
    
    // Validate required parameters
    if (!folderId || !beforeImage || !afterImage) {
      return ContentService
        .createTextOutput(JSON.stringify({ success: false, error: 'Missing required parameters' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Get or create the folder
    let folder;
    try {
      folder = DriveApp.getFolderById(folderId);
    } catch (err) {
      return ContentService
        .createTextOutput(JSON.stringify({ success: false, error: 'Invalid folder ID' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Generate unique filenames
    const time = new Date(timestamp).toISOString().replace(/[:.]/g, '-');
    const beforeFileName = `before_${time}.jpg`;
    const afterFileName = `after_${time}.jpg`;
    
    // Function to decode base64 and upload
    function uploadBase64Image(base64Data, fileName) {
      // Remove data URL prefix if present
      const base64String = base64Data.replace(/^data:image\/\w+;base64,/, '');
      
      // Decode base64
      const byteCharacters = Utilities.base64Decode(base64String);
      const blob = Utilities.newBlob(byteCharacters, 'image/jpeg', fileName);
      
      // Upload to Drive
      return folder.createFile(blob).getId();
    }
    
    // Upload both images
    const beforeId = uploadBase64Image(beforeImage, beforeFileName);
    const afterId = uploadBase64Image(afterImage, afterFileName);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: true, 
        beforeFileId: beforeId,
        afterFileId: afterId,
        message: 'Images uploaded successfully!'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        error: error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Optional: Add doGet for testing
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ 
      status: 'ok', 
      message: 'Google Apps Script API is running. Use POST to upload images.',
      instructions: 'Send POST request with { folderId, beforeImage, afterImage, timestamp }'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
