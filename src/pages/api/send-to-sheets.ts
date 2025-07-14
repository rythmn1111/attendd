import { NextApiRequest, NextApiResponse } from 'next'
import { addAttendanceToSheet } from '../../../lib/googleSheets'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { className, enrollmentNumbers } = req.body

  if (!className || !enrollmentNumbers || !Array.isArray(enrollmentNumbers)) {
    return res.status(400).json({ message: 'Invalid request data' })
  }

  try {
    const result = await addAttendanceToSheet(className, enrollmentNumbers)
    res.status(200).json(result)
  } catch (error) {
    console.error('API Error:', error)
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
}