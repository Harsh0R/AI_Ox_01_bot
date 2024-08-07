import fs from 'fs';


const logError = (message, error) => {
  const timestamp = new Date().toISOString();
  const errorMessage = `[${timestamp}] ${message}\n${error.stack || error}\n\n`;

  fs.appendFile('error.txt', errorMessage, (err) => {
    if (err) {
      console.error('Failed to write to error log:', err);
    }
  });
};

export default logError;
