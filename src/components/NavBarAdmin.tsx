import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'

export default function NavBarAdmin() {
  const navigate = useNavigate()
  const location = useLocation()
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const handleFocus = () => setVisible(false)
    const handleBlur = () => setTimeout(() => setVisible(true), 100)

    window.addEventListener('focusin', handleFocus)
    window.addEventListener('focusout', handleBlur)

    return () => {
      window.removeEventListener('focusin', handleFocus)
      window.removeEventListener('focusout', handleBlur)
    }
  }, [])

  if (!visible) return null

  const tabs = [
    { path: '/', label: 'Новые', icon: '🆕' },
    { path: '/admin/done', label: 'Разобранные', icon: '✅' },
    { path: '/admin/clients', label: 'Клиенты', icon: '👥' },
    { path: '/admin/settings', label: 'Настройки', icon: '⚙️' },
  ]

  return (
    <div style={navStyle}>
      {tabs.map(tab => (
        <button
          key={tab.path}
          onClick={() => navigate(tab.path)}
          style={{
            ...tabStyle,
            color: location.pathname === tab.path ? '#1A1A1A' : '#8A7F6E',
            borderTop: location.pathname === tab.path ? '2px solid #1A1A1A' : '2px solid transparent',
          }}
        >
          <span style={{ fontSize: '20px' }}>{tab.icon}</span>
          <span style={{ fontSize: '10px', fontWeight: location.pathname === tab.path ? 600 : 400 }}>
            {tab.label}
          </span>
        </button>
      ))}
    </div>
  )
}

const navStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  background: '#EDE5D0',
  borderTop: '1px solid #D4C9B0',
  display: 'flex',
  padding: '8px 0 28px',
  zIndex: 100,
}

const tabStyle: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '4px',
  background: 'none',
  border: 'none',
  borderTop: '2px solid transparent',
  cursor: 'pointer',
  padding: '8px 0',
}
