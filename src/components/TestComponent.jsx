import { useState } from 'react'

const TestComponent = () => {
  const [count, setCount] = useState(0)

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>🐐 Mutton Hub - Test Component</h1>
      <p>If you can see this, the React app is working!</p>
      <button 
        onClick={() => setCount(count + 1)}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#667eea',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
      >
        Count: {count}
      </button>
      <p style={{ marginTop: '20px', color: '#666' }}>
        Next steps: Configure Supabase and test authentication
      </p>
    </div>
  )
}

export default TestComponent
