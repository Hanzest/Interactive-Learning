import React, { useState, useEffect } from 'react';
import { useTimer } from '../../hooks/useTimer';
import { useAppContext } from '../../context/AppContext';
import { storage } from '../../utils/storage';

export default function PomodoroTimer() {
  const { mode, display, progress, isRunning, start, pause, reset } = useTimer();
  const { state, dispatch, addToast } = useAppContext();

  const [isEditing, setIsEditing] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => storage.load<boolean>('pomodoroSoundEnabled', true));
  const [showModal, setShowModal] = useState(false);
  const [finishedMode, setFinishedMode] = useState<'focus' | 'break'>('focus');

  // Detect timer completion
  const totalSec = mode === 'focus' ? state.pomodoroFocusMinutes * 60 : state.pomodoroBreakMinutes * 60;
  const isFinished = state.pomodoroSeconds >= totalSec && state.pomodoroSeconds > 0;

  useEffect(() => {
    if (isFinished) {
      setFinishedMode(mode);
      setShowModal(true);
    }
  }, [isFinished, mode]);

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      storage.save('pomodoroSoundEnabled', next);
      return next;
    });
  };

  const handleTimeSubmit = (val: string) => {
    setIsEditing(false);

    const timeRegex = /^(\d{1,2}):(\d{2})$/;
    const match = val.trim().match(timeRegex);
    if (!match) {
      addToast('Invalid time format. Use MM:SS (e.g., 25:00)', 'error', 3000);
      return;
    }

    const mins = parseInt(match[1], 10);
    const secs = parseInt(match[2], 10);

    if (secs >= 60) {
      addToast('Seconds must be less than 60', 'error', 3000);
      return;
    }

    const totalRemaining = mins * 60 + secs;
    if (totalRemaining <= 0) {
      addToast('Time must be greater than 00:00', 'error', 3000);
      return;
    }

    dispatch({ type: 'POMODORO_SET_REMAINING', payload: totalRemaining });
  };

  return (
    <>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 12px',
        borderRadius: 8,
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <span style={{ fontSize: 18, lineHeight: 1 }}>{mode === 'focus' ? '🍅' : '☕'}</span>
        {isEditing ? (
          <input
            type="text"
            defaultValue={display}
            autoFocus
            onBlur={(e) => handleTimeSubmit(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleTimeSubmit(e.currentTarget.value);
              } else if (e.key === 'Escape') {
                setIsEditing(false);
              }
            }}
            style={{
              fontSize: 16,
              fontWeight: 600,
              fontVariantNumeric: 'tabular-nums',
              color: 'var(--text-primary)',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--accent)',
              borderRadius: '4px',
              width: '54px',
              textAlign: 'center',
              padding: '2px 4px',
              outline: 'none',
            }}
          />
        ) : (
          <span
            onClick={() => {
              if (!isRunning) {
                setIsEditing(true);
              }
            }}
            title={isRunning ? "Pause the timer to edit" : "Click to edit time"}
            style={{
              fontSize: 16,
              fontWeight: 600,
              fontVariantNumeric: 'tabular-nums',
              color: 'var(--text-primary)',
              minWidth: 48,
              textAlign: 'center',
              cursor: isRunning ? 'not-allowed' : 'pointer',
              padding: '2px 4px',
              borderRadius: '4px',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => {
              if (!isRunning) e.currentTarget.style.background = 'var(--bg-tertiary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            {display}
          </span>
        )}
        <button
          onClick={isRunning ? pause : start}
          title={isRunning ? 'Pause' : 'Start'}
          type="button"
          aria-label={isRunning ? 'Pause timer' : 'Start timer'}
          className="pomodoro-btn"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 28,
            height: 28,
            padding: 0,
            border: 'none',
            borderRadius: 6,
            background: 'transparent',
            color: 'var(--text-primary)',
            fontSize: 14,
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
        >
          {isRunning ? '⏸' : '▶'}
        </button>
        <button
          onClick={reset}
          title="Reset"
          type="button"
          aria-label="Reset timer"
          className="pomodoro-btn"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 28,
            height: 28,
            padding: 0,
            border: 'none',
            borderRadius: 6,
            background: 'transparent',
            color: 'var(--text-primary)',
            fontSize: 14,
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
        >
          ↺
        </button>
        <button
          onClick={toggleSound}
          title={soundEnabled ? "Mute notification sound" : "Unmute notification sound"}
          type="button"
          aria-label={soundEnabled ? "Mute notification sound" : "Unmute notification sound"}
          className="pomodoro-btn"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 28,
            height: 28,
            padding: 0,
            border: 'none',
            borderRadius: 6,
            background: 'transparent',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
        >
          {soundEnabled ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={16} height={16}>
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={16} height={16}>
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          )}
        </button>
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 3,
          background: 'var(--border-color)',
          borderRadius: '0 0 8px 8px',
          overflow: 'hidden',
        }}>
          <div
            style={{
              height: '100%',
              background: 'var(--accent)',
              borderRadius: '0 0 0 8px',
              transition: 'width 0.5s linear',
              width: `${progress}%`,
            }}
          />
        </div>
      </div>

      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          paddingTop: '72px',
          zIndex: 9999,
        }}>
          <div style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '24px',
            width: '320px',
            boxShadow: 'var(--shadow-lg)',
            textAlign: 'center',
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}>
              ⏰ Time's Up!
            </h3>
            <p style={{
              fontSize: '15px',
              color: 'var(--text-secondary)',
              marginBottom: '20px',
              lineHeight: 1.5,
            }}>
              {finishedMode === 'focus'
                ? 'Your focus session is complete. Take a well-deserved break!'
                : 'Your break is over. Ready to focus again?'}
            </p>
            <button
              onClick={() => setShowModal(false)}
              className="btn-base"
              style={{
                width: '100%',
                padding: '10px 16px',
                backgroundColor: 'var(--accent)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
