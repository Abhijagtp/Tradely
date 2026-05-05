import { useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import AuthContainer from '../sections/auth/AuthContainer'

function AuthPage() {
  const { mode } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  })
  const [signupForm, setSignupForm] = useState({
    fullName: '',
    email: '',
    password: '',
  })

  useEffect(() => {
    if (!location.state?.prefillEmail) {
      return
    }

    setLoginForm((current) => ({
      ...current,
      email: location.state.prefillEmail,
    }))
    setSignupForm((current) => ({
      ...current,
      email: location.state.prefillEmail,
    }))
  }, [location.state?.prefillEmail])

  if (mode !== 'login' && mode !== 'signup') {
    return <Navigate to="/auth/login" replace />
  }

  function handleModeChange(nextMode) {
    if (nextMode === mode) {
      return
    }

    navigate(`/auth/${nextMode}`)
  }

  function handleLoginFieldChange(field, value) {
    setLoginForm((current) => ({ ...current, [field]: value }))

    if (field === 'email') {
      setSignupForm((current) => ({ ...current, email: value }))
    }
  }

  function handleSignupFieldChange(field, value) {
    setSignupForm((current) => ({ ...current, [field]: value }))

    if (field === 'email') {
      setLoginForm((current) => ({ ...current, email: value }))
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(210,180,140,0.08),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(139,94,60,0.12),_transparent_28%),linear-gradient(180deg,#120C08_0%,#1A110B_48%,#0E0906_100%)] px-4 py-8 sm:px-6">
      <div className="pointer-events-none absolute inset-0 opacity-50 [background-image:radial-gradient(rgba(210,180,140,0.16)_1px,transparent_1px)] [background-size:28px_28px]" />
      <div className="pointer-events-none absolute left-[10%] top-[18%] h-px w-36 rotate-[18deg] bg-[linear-gradient(90deg,transparent,rgba(210,180,140,0.3),transparent)]" />
      <div className="pointer-events-none absolute right-[12%] top-[28%] h-px w-44 -rotate-[16deg] bg-[linear-gradient(90deg,transparent,rgba(210,180,140,0.24),transparent)]" />
      <div className="pointer-events-none absolute bottom-[20%] left-[16%] h-px w-40 rotate-[8deg] bg-[linear-gradient(90deg,transparent,rgba(210,180,140,0.2),transparent)]" />

      <AuthContainer
        mode={mode}
        onModeChange={handleModeChange}
        loginForm={loginForm}
        onLoginFieldChange={handleLoginFieldChange}
        signupForm={signupForm}
        onSignupFieldChange={handleSignupFieldChange}
        notice={mode === 'login' ? location.state?.authNotice : ''}
      />
    </main>
  )
}

export default AuthPage
