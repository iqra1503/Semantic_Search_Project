import { Link } from 'react-router-dom'

const AuthCard = ({ title, subtitle, error, children, footerText, footerLinkLabel, footerLinkTo }) => {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        {error && <p className="error-banner">{error}</p>}
        {children}
        <p className="auth-footer">
          {footerText} <Link to={footerLinkTo}>{footerLinkLabel}</Link>
        </p>
      </div>
    </div>
  )
}

export default AuthCard
