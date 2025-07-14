import { google } from 'googleapis'

export async function getGoogleSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })

  const sheets = google.sheets({ version: 'v4', auth })
  return sheets
}

export async function addAttendanceToSheet(className: string, enrollmentNumbers: string[]) {
  try {
    const sheets = await getGoogleSheetsClient()
    const spreadsheetId = process.env.GOOGLE_SHEET_ID!
    
    // Get current date
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
    
    // Find the next available column
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!1:1', // Get first row to find next column
    })
    
    const nextColumnIndex = (response.data.values?.[0]?.length || 0) + 1
    const nextColumnLetter = String.fromCharCode(64 + nextColumnIndex) // Convert to A, B, C, etc.
    
    // Prepare data: [className, date, ...enrollmentNumbers]
    const columnData = [
      [className],
      [currentDate],
      ...enrollmentNumbers.map(num => [num])
    ]
    
    // Write to the next available column
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Sheet1!${nextColumnLetter}1:${nextColumnLetter}${columnData.length}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: columnData,
      },
    })
    
    return { success: true, message: 'Attendance added to Google Sheets successfully!' }
  } catch (error) {
    console.error('Error adding to Google Sheets:', error)
    return { success: false, message: 'Failed to add attendance to Google Sheets' }
  }
}