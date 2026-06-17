import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';

interface DonationOverlayProps {
  onClose: () => void;
}

const AMOUNTS = [
  { label: '20.000 VND', value: 20000 },
  { label: '50.000 VND', value: 50000 },
  { label: '100.000 VND', value: 100000 },
  { label: '200.000 VND', value: 200000 },
  { label: '500.000 VND', value: 500000 },
];

export default function DonationOverlay({ onClose }: DonationOverlayProps) {
  const { t } = useTranslation();
  const [method, setMethod] = useState<'vietqr' | 'coffee'>('vietqr');
  const [amount, setAmount] = useState<number>(50000);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(label);
      setTimeout(() => setCopySuccess(null), 2000);
    });
  };

  // Generate VietQR URL based on specified format
  const qrUrl = `https://api.vietqr.io/image/970425-0211036332095-4uTX9bf.jpg?accountName=HO%20QUOC%20KHANH&amount=${amount}&addInfo=INTERACTIVE%20LEARN%20DONATE`;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        padding: '1rem',
        animation: 'fadeIn 200ms ease',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          borderRadius: 20,
          boxShadow: 'var(--shadow-lg), 0 20px 25px -5px rgba(0, 0, 0, 0.2)',
          width: '100%',
          maxWidth: 420,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid var(--border-color)',
          animation: 'slideUp 250ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-color)',
          }}
        >
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <span>❤️</span> {t('donation.title')}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: '1.25rem',
              cursor: 'pointer',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 8,
              transition: 'background var(--transition-fast), color var(--transition-fast)',
            }}
            title={t('donation.close')}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            padding: '1.5rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          {/* Tabs */}
          <div
            style={{
              display: 'flex',
              background: 'var(--bg-tertiary)',
              padding: '0.25rem',
              borderRadius: '10px',
              gap: '0.25rem',
            }}
          >
            <button
              onClick={() => setMethod('vietqr')}
              style={{
                flex: 1,
                padding: '0.5rem',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.875rem',
                backgroundColor: method === 'vietqr' ? 'var(--bg-primary)' : 'transparent',
                color: method === 'vietqr' ? 'var(--accent)' : 'var(--text-secondary)',
                boxShadow: method === 'vietqr' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              {t('donation.vietqr')}
            </button>
            <button
              onClick={() => setMethod('coffee')}
              style={{
                flex: 1,
                padding: '0.5rem',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.875rem',
                backgroundColor: method === 'coffee' ? 'var(--bg-primary)' : 'transparent',
                color: method === 'coffee' ? 'var(--accent)' : 'var(--text-secondary)',
                boxShadow: method === 'coffee' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              {t('donation.coffee')}
            </button>
          </div>

          {method === 'coffee' ? (
            <div
              style={{
                textAlign: 'center',
                padding: '2.5rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  fontSize: '3.5rem',
                  animation: 'bounce 2s infinite',
                }}
              >
                ☕
              </div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>{t('donation.coffeeTitle')}</h3>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5,
                }}
              >
                {t('donation.coffeeUnderConstruction')}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Dropdown Selector */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                  }}
                >
                  {t('donation.selectAmount')}
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '0.625rem 2.25rem 0.625rem 0.75rem',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      appearance: 'none',
                      outline: 'none',
                    }}
                  >
                    {AMOUNTS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <span
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none',
                      color: 'var(--text-muted)',
                      fontSize: '0.75rem',
                    }}
                  >
                    ▼
                  </span>
                </div>
              </div>

              {/* QR Code display */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '1rem',
                  backgroundColor: '#fff',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  boxShadow: 'var(--shadow-sm)',
                  position: 'relative',
                  minHeight: 280,
                }}
              >
                <img
                  src={qrUrl}
                  alt="VietQR Donation"
                  style={{
                    maxWidth: '100%',
                    maxHeight: 280,
                    objectFit: 'contain',
                  }}
                />
              </div>

              {/* Account Details info */}
              <div
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: '10px',
                  padding: '0.875rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.625rem',
                  fontSize: '0.85rem',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{t('donation.bank')}</span>
                  <span style={{ fontWeight: 600 }}>ABBank</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{t('donation.accountName')}</span>
                  <span style={{ fontWeight: 600 }}>HO QUOC KHANH</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{t('donation.accountNumber')}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>0211036332095</span>
                    <button
                      onClick={() => handleCopy('0211036332095', 'acc')}
                      style={{
                        padding: '2px 6px',
                        fontSize: '0.7rem',
                        backgroundColor: 'var(--bg-primary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        color: copySuccess === 'acc' ? 'var(--success)' : 'var(--text-secondary)',
                        fontWeight: 500,
                      }}
                    >
                      {copySuccess === 'acc' ? t('donation.copied') : t('donation.copy')}
                    </button>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{t('donation.message')}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.75rem', fontFamily: 'monospace' }}>INTERACTIVE LEARN DONATE</span>
                    <button
                      onClick={() => handleCopy('INTERACTIVE LEARN DONATE', 'msg')}
                      style={{
                        padding: '2px 6px',
                        fontSize: '0.7rem',
                        backgroundColor: 'var(--bg-primary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        color: copySuccess === 'msg' ? 'var(--success)' : 'var(--text-secondary)',
                        fontWeight: 500,
                      }}
                    >
                      {copySuccess === 'msg' ? t('donation.copied') : t('donation.copy')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border-color)',
            textAlign: 'center',
            backgroundColor: 'var(--bg-secondary)',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
          }}
        >
          {t('donation.thankYou')}
        </div>
      </div>
    </div>
  );
}
