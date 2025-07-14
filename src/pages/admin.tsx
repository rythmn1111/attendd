import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'

interface AttendanceRecord {
  id: number
  enrollment_number: string
  created_at: string
}

export default function AdminPage() {
  const [className, setClassName] = useState('')
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [message, setMessage] = useState('')

  // Fetch attendance records
  const fetchAttendance = async () => {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setAttendanceRecords(data || [])
    } catch (error) {
      console.error('Error fetching attendance:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAttendance()
  }, [])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!className.trim()) {
      setMessage('Please enter a class name')
      return
    }
    
    if (attendanceRecords.length === 0) {
      setMessage('No attendance records to send')
      return
    }
    
    setIsSending(true)
    setMessage('')
    
    try {
      // Send to Google Sheets
      const enrollmentNumbers = attendanceRecords.map(record => record.enrollment_number)
      
      const response = await fetch('/api/send-to-sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          className: className.trim(),
          enrollmentNumbers,
        }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Delete all records from Supabase
        const { error } = await supabase
          .from('attendance')
          .delete()
          .neq('id', 0) // Delete all records
        
        if (error) throw error
        
        setMessage('Attendance sent to Google Sheets and cleared from database!')
        setClassName('')
        setAttendanceRecords([])
      } else {
        setMessage(result.message || 'Failed to send attendance')
      }
    } catch (error) {
      console.error('Error:', error)
      setMessage('Error sending attendance. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      padding: '20px',
      backgroundColor: '#f5f5f5',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ 
          textAlign: 'center', 
          marginBottom: '30px',
          color: '#333'
        }}>
          Admin Panel
        </h1>
        
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '10px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          marginBottom: '30px'
        }}>
          <h2 style={{ marginBottom: '20px', color: '#555' }}>
            Send Attendance to Google Sheets
          </h2>
          
          <form onSubmit={handleSend}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px',
                fontWeight: 'bold',
                color: '#555'
              }}>
                Class Name:
              </label>
              <input
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="Enter class name"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
                disabled={isSending}
              />
            </div>
            
            <button
              type="submit"
              disabled={isSending || attendanceRecords.length === 0}
              style={{
                padding: '12px 30px',
                backgroundColor: (isSending || attendanceRecords.length === 0) ? '#ccc' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                fontSize: '16px',
                cursor: (isSending || attendanceRecords.length === 0) ? 'not-allowed' : 'pointer'
              }}
            >
              {isSending ? 'Sending...' : 'Send to Google Sheets'}
            </button>
          </form>
          
          {message && (
            <div style={{
              padding: '10px',
              borderRadius: '5px',
              backgroundColor: message.includes('Error') ? '#f8d7da' : '#d4edda',
              color: message.includes('Error') ? '#721c24' : '#155724',
              marginTop: '20px'
            }}>
              {message}
            </div>
          )}
        </div>
        
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '10px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ marginBottom: '20px', color: '#555' }}>
            Current Attendance ({attendanceRecords.length} students)
          </h2>
          
          {isLoading ? (
            <p>Loading attendance records...</p>
          ) : attendanceRecords.length === 0 ? (
            <p style={{ color: '#666' }}>No attendance records found</p>
          ) : (
            <div style={{ 
              maxHeight: '400px', 
              overflowY: 'auto',
              border: '1px solid #ddd',
              borderRadius: '5px'
            }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                background: 'black',
                color: 'white',
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#222' }}>
                    <th style={{ 
                      padding: '12px', 
                      textAlign: 'left',
                      borderBottom: '1px solid #444',
                      color: 'white'
                    }}>
                      Enrollment Number
                    </th>
                    <th style={{ 
                      padding: '12px', 
                      textAlign: 'left',
                      borderBottom: '1px solid #444',
                      color: 'white'
                    }}>
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords.map((record) => (
                    <tr key={record.id} style={{ backgroundColor: '#111' }}>
                      <td style={{ 
                        padding: '12px',
                        borderBottom: '1px solid #333',
                        color: 'white'
                      }}>
                        {record.enrollment_number}
                      </td>
                      <td style={{ 
                        padding: '12px',
                        borderBottom: '1px solid #333',
                        color: 'white'
                      }}>
                        {new Date(record.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link href="/" style={{ 
            color: '#007bff',
            textDecoration: 'none',
            fontSize: '14px'
          }}>
            ← Back to Student Page
          </Link>
        </div>
      </div>
    </div>
  )
}