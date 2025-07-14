import { useState } from 'react'
import { supabase } from '../../lib/supabase'
// import Link from 'next/link'

export default function StudentPage() {
  const [enrollmentNumber, setEnrollmentNumber] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!enrollmentNumber.trim()) {
      setMessage('Please enter your enrollment number')
      return
    }
    
    setIsSubmitting(true)
    setMessage('')
    
    try {
      // Check if enrollment number already exists
      const { data: existing } = await supabase
        .from('attendance')
        .select('*')
        .eq('enrollment_number', enrollmentNumber.trim())
        .single()
      
      if (existing) {
        setMessage('Attendance already marked for this enrollment number!')
        setIsSubmitting(false)
        return
      }
      
      // Insert new attendance record
      const { error } = await supabase
        .from('attendance')
        .insert([
          { enrollment_number: enrollmentNumber.trim() }
        ])
      
      if (error) throw error
      
      setMessage('Attendance marked successfully!')
      setEnrollmentNumber('')
    } catch (error) {
      console.error('Error:', error)
      setMessage('Error marking attendance. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f5f5f5',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{ 
          textAlign: 'center', 
          marginBottom: '30px',
          color: '#333'
        }}>
          Student Attendance
        </h1>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              fontWeight: 'bold',
              color: '#555'
            }}>
              Enrollment Number:
            </label>
            <input
              type="text"
              value={enrollmentNumber}
              onChange={(e) => setEnrollmentNumber(e.target.value)}
              placeholder="Enter your enrollment number"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              disabled={isSubmitting}
            />
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: isSubmitting ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              fontSize: '16px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              marginBottom: '20px'
            }}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </form>
        
        {message && (
          <div style={{
            padding: '10px',
            borderRadius: '5px',
            backgroundColor: message.includes('Error') ? '#f8d7da' : '#d4edda',
            color: message.includes('Error') ? '#721c24' : '#155724',
            marginBottom: '20px'
          }}>
            {message}
          </div>
        )}
        
        
      </div>
    </div>
  )
}