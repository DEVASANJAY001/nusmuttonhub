import { useState, useEffect } from 'react'
import { supabase } from '../config/supabase'

const ConnectionTest = () => {
  const [connectionStatus, setConnectionStatus] = useState('Testing...')
  const [error, setError] = useState(null)

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    try {
      // Test basic connection
      const { data, error } = await supabase
        .from('user_roles')
        .select('count')
        .limit(1)

      if (error) {
        setError(error.message)
        setConnectionStatus('❌ Connection Failed')
      } else {
        setConnectionStatus('✅ Connected Successfully!')
      }
    } catch (err) {
      setError(err.message)
      setConnectionStatus('❌ Connection Failed')
    }
  }

  return (
    <div style={{ 
      padding: '20px', 
      textAlign: 'center',
      maxWidth: '600px',
      margin: '0 auto',
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    }}>
      <h1>🐐 Mutton Hub - Supabase Connection Test</h1>
      
      <div style={{ margin: '20px 0' }}>
        <h2>{connectionStatus}</h2>
        {error && (
          <div style={{ 
            color: 'red', 
            background: '#fee',
            padding: '10px',
            borderRadius: '8px',
            margin: '10px 0'
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>

      <div style={{ textAlign: 'left', margin: '20px 0' }}>
        <h3>Setup Checklist:</h3>
        <ul>
          <li>✅ Supabase project created</li>
          <li>✅ Database schema applied</li>
          <li>✅ Environment variables set</li>
          <li>✅ Connection test: {connectionStatus}</li>
        </ul>
      </div>

      {connectionStatus.includes('✅') && (
        <div style={{ 
          background: '#f0fff4',
          padding: '15px',
          borderRadius: '8px',
          margin: '20px 0'
        }}>
          <h3>🎉 Ready to Go!</h3>
          <p>Your Supabase connection is working. You can now:</p>
          <ol style={{ textAlign: 'left' }}>
            <li>Sign up with security code: <strong>7904116719</strong></li>
            <li>Choose "Owner" role for first user</li>
            <li>Start managing your mutton wholesale business!</li>
          </ol>
        </div>
      )}

      <button 
        onClick={testConnection}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#667eea',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          margin: '10px'
        }}
      >
        Test Connection Again
      </button>
    </div>
  )
}

export default ConnectionTest
