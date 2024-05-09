import React, { useState } from 'react'
import useCredentialsGenerator from './credentialsGenerator' // Adjust the path based on your project structure

const CredsGenerator = () => {
  const { generateCredentials } = useCredentialsGenerator()
  const [credentials, setCredentials] = useState(null)
  const [copyEnabled, setCopyEnabled] = useState(false) // State to track whether copy is enabled
  const [showTooltip, setShowTooltip] = useState(false) // State to track tooltip visibility

  const handleGenerate = () => {
    try {
      const newCredentials = generateCredentials()
      setCredentials(newCredentials)
      setCopyEnabled(true) // Enable copy after generating credentials
    } catch (error) {
      console.error(error.message)
    }
  }

  const handleCopy = (value) => {
    navigator.clipboard
      .writeText(value)
      .then(() => {
        setShowTooltip(true) // Show tooltip on successful copy
        setTimeout(() => setShowTooltip(false), 2000) // Hide tooltip after 2 seconds
      })
      .catch((err) => console.error('Copy failed:', err))
  }

  return (
    <div className="credentials-box">
      <h2 style={{ textAlign: 'center', fontSize: '1.5rem', marginBottom: '15px' }}>
        Generate Credentials
      </h2>
      <div className="credentials-container">
        <div>
          <p style={{ fontSize: '0.8rem', marginBottom: '5px', marginTop: '10px' }}>CREDS_KEY</p>
          <div className="input-container">
            <input type="text" value={credentials?.CREDS_KEY || ''} placeholder="" readOnly />
            <button
              className="copy-button"
              onClick={() => handleCopy(credentials?.CREDS_KEY)}
              disabled={!copyEnabled}
            >
              Copy
            </button>
          </div>
        </div>
        <div>
          <p style={{ fontSize: '0.8rem', marginBottom: '5px', marginTop: '10px' }}>CREDS_IV</p>
          <div className="input-container">
            <input type="text" value={credentials?.CREDS_IV || ''} placeholder="" readOnly />
            <button
              className="copy-button"
              onClick={() => handleCopy(credentials?.CREDS_IV)}
              disabled={!copyEnabled}
            >
              Copy
            </button>
          </div>
        </div>
        <div>
          <p style={{ fontSize: '0.8rem', marginBottom: '5px', marginTop: '10px' }}>JWT_SECRET</p>
          <div className="input-container">
            <input type="text" value={credentials?.JWT_SECRET || ''} placeholder="" readOnly />
            <button
              className="copy-button"
              onClick={() => handleCopy(credentials?.JWT_SECRET)}
              disabled={!copyEnabled}
            >
              Copy
            </button>
          </div>
        </div>
        <div>
          <p style={{ fontSize: '0.8rem', marginBottom: '5px', marginTop: '10px' }}>
            JWT_REFRESH_SECRET
          </p>
          <div className="input-container">
            <input
              type="text"
              value={credentials?.JWT_REFRESH_SECRET || ''}
              placeholder=""
              readOnly
            />
            <button
              className="copy-button"
              onClick={() => handleCopy(credentials?.JWT_REFRESH_SECRET)}
              disabled={!copyEnabled}
            >
              Copy
            </button>
          </div>
        </div>
        <div>
          <p style={{ fontSize: '0.8rem', marginBottom: '5px', marginTop: '10px' }}>
            MEILI_MASTER_KEY
          </p>
          <div className="input-container">
            <input type="text" value={credentials?.MEILI_KEY || ''} placeholder="" readOnly />
            <button
              className="copy-button"
              onClick={() => handleCopy(credentials?.MEILI_KEY)}
              disabled={!copyEnabled}
            >
              Copy
            </button>
          </div>
        </div>
      </div>
      {showTooltip && <div className="tooltip">Copied to Clipboard</div>}
      <button
        className="generate-button"
        style={{ display: 'block', margin: '0 auto', marginTop: '15px' }}
        onClick={handleGenerate}
      >
        Generate
      </button>
      <style jsx>{`
        .credentials-box {
          position: relative;
          padding: 10px;
          // border: 1px solid #ccc;
          border-radius: 20px;
          display: inline-block;
          width: 100%;
          margin: 0 auto;
        }
        .credentials-container {
          margin-top: 10px;
        }
        .input-container {
          display: flex;
          align-items: center;
        }
        .input-container input {
          width: calc(100% - 70px);
          margin-right: 10px;
          border: 1px solid #ccc;
          border-radius: 5px;
          padding: 5px;
        }
        .copy-button {
          padding: 6px 12px; /* Adjust as needed */
          background: rgb(30, 163, 128);
          color: #fff;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          width: auto;
          font-size: 0.8rem; /* Adjusted size */
        }
        .generate-button {
          padding: 6px 12px; /* Adjust as needed */
          background: rgb(30, 163, 128);
          color: #fff;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          width: auto;
          font-size: 1rem; /* Adjusted size */
        }
        .tooltip {
          position: absolute;
          top: 10px;
          right: 10px;
          background-color: rgba(30, 163, 128, 0.5);
          color: #fff;
          padding: 5px 10px;
          border-radius: 5px;
          z-index: 999; /* Ensure a higher z-index */
        }
      `}</style>
    </div>
  )
}

export default CredsGenerator
