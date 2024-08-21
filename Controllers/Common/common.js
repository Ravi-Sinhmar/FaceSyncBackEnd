
function formatString(str) {
    // Replace all %20 with a single space
    const replacedString = str.replace(/%20/g, ' ');
    // Remove extra spaces
    const finalString = replacedString.replace(/\s+/g, ' ');
    return finalString;
  }

  function extractMeetingId(str) {
    // Regular expression to match the last 6 digits
    const regex = /\d{6}$/;
    const match = str.match(regex);
  
    if (match) {
      return match[0]; // Return the matched digits
    } else {
      // Handle cases where there are no 6 digits at the end
      return ''; // Or handle it differently based on your requirements
    }
  }



module.exports  = {formatString,extractMeetingId};

