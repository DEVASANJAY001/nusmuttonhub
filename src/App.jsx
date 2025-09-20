import { useState, useEffect } from 'react'
import { supabase, ROLES } from './config/supabase'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'
import LoadingSpinner from './components/LoadingSpinner'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Test Supabase connection first
    const testConnection = async () => {
      try {
        console.log('Testing Supabase connection...')
        console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
        console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing')
        
        if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
          setError('Missing Supabase environment variables. Please check your .env file.')
          setLoading(false)
          return
        }

        // Get initial session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session error:', sessionError)
          setError('Supabase connection error: ' + sessionError.message)
          setLoading(false)
          return
        }

        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchUserRole(session.user.id)
        } else {
          setUserRole(null)
          setLoading(false)
        }
      } catch (err) {
        console.error('Connection test failed:', err)
        setError('Failed to connect to Supabase: ' + err.message)
        setLoading(false)
      }
    }

    testConnection()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id)
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchUserRole(session.user.id)
      } else {
        setUserRole(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserRole = async (userId) => {
    try {
      console.log('Fetching user role for:', userId)
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error('Error fetching user role:', error)
        // If there's an error (like RLS recursion), set a default role and continue
        setUserRole(ROLES.ACCOUNTANT)
        setLoading(false)
      } else {
        setUserRole(data.role)
        setLoading(false)
      }
    } catch (error) {
      console.error('Error fetching user role:', error)
      // Set default role and stop loading on any error
      setUserRole(ROLES.ACCOUNTANT)
      setLoading(false)
    }
  }

  if (error) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        maxWidth: '600px',
        margin: '50px auto',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e53e3e'
      }}>
        <h1 style={{ color: '#e53e3e' }}>❌ Connection Error</h1>
        <p style={{ color: '#666', margin: '20px 0' }}>{error}</p>
        <div style={{ textAlign: 'left', background: '#f7fafc', padding: '15px', borderRadius: '8px' }}>
          <h3>Check these:</h3>
          <ul>
            <li>✅ .env file exists in project root</li>
            <li>✅ VITE_SUPABASE_URL is set</li>
            <li>✅ VITE_SUPABASE_ANON_KEY is set</li>
            <li>✅ Supabase project is active</li>
            <li>✅ Database schema is applied</li>
          </ul>
        </div>
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            margin: '20px 0'
          }}
        >
          Retry Connection
        </button>
      </div>
    )
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return <Auth />
  }

  return <Dashboard user={user} userRole={userRole} />
}

export default App
