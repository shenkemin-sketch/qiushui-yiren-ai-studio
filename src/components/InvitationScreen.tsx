
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useRef } from 'react';
import { DiamondIcon, ArrowRightIcon } from './icons';

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

interface InvitationCode {
  code: string;
  used: boolean;
}

const INITIAL_CODES: string[] = [
  '281904', '735216', '904758', '112358', '558743',
  '891264', '347890', '610345', '428197', '852963',
];

const CODES_STORAGE_KEY = 'invitationCodes_v1';
const CODE_LENGTH = 6;

interface InvitationScreenProps {
  onAccessGranted: () => void;
}


const InvitationScreen: React.FC<InvitationScreenProps> = ({ onAccessGranted }) => {
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [allCodes, setAllCodes] = useState<InvitationCode[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);

  // New state for API Key flow
  const [needsApiKey, setNeedsApiKey] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const storedCodes = localStorage.getItem(CODES_STORAGE_KEY);
    if (!storedCodes) {
      const initialCodeState = INITIAL_CODES.map(c => ({ code: c, used: false }));
      localStorage.setItem(CODES_STORAGE_KEY, JSON.stringify(initialCodeState));
      setAllCodes(initialCodeState);
    } else {
      setAllCodes(JSON.parse(storedCodes));
    }
    // Only focus if we are in the code entry phase
    if (!needsApiKey && !isSuccess) {
      inputRefs.current[0]?.focus();
    }
  }, [needsApiKey, isSuccess]);

  useEffect(() => {
    const fullCode = code.join('');
    if (fullCode.length === CODE_LENGTH) {
      handleSubmit();
    }
  }, [code]);

  const triggerError = (message: string) => {
    setError(message);
    setIsShaking(true);
    setTimeout(() => {
      setIsShaking(false);
      setCode(Array(CODE_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    }, 820);
  };

  const proceedToApp = () => {
    setIsSuccess(true);
    setTimeout(() => {
      localStorage.setItem('betaAccessGranted', 'true');
      onAccessGranted();
    }, 1200);
  };

  const handleApiKeySelection = async () => {
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        // As per guidelines: Assume success and proceed immediately to mitigate race condition
        proceedToApp();
      } catch (e: any) {
        console.error(e);
        if (e.message && e.message.includes("Requested entity was not found")) {
          // If specific error, stay on screen but clear state if needed
          console.warn("Key selection entity not found, retrying...");
        }
      }
    } else {
      // Fallback for local dev/environments without aistudio wrapper
      console.warn("window.aistudio not found, proceeding...");
      proceedToApp();
    }
  };

  const handleSubmit = async () => {
    if (isSuccess || needsApiKey) return;
    setError('');
    const inputCode = code.join('');

    if (inputCode.length !== CODE_LENGTH) {
      return;
    }

    try {
      const currentCodes: InvitationCode[] = JSON.parse(localStorage.getItem(CODES_STORAGE_KEY) || '[]');
      const foundCode = currentCodes.find(c => c.code === inputCode);

      if (foundCode) {
        if (foundCode.used) {
          triggerError('此邀请码已被使用。');
        } else {
          // 1. Mark code as used
          const updatedCodes = currentCodes.map(c =>
            c.code === inputCode ? { ...c, used: true } : c
          );
          localStorage.setItem(CODES_STORAGE_KEY, JSON.stringify(updatedCodes));
          setAllCodes(updatedCodes);

          // 2. Check for API Key Requirement
          if (window.aistudio) {
            const hasKey = await window.aistudio.hasSelectedApiKey();
            if (!hasKey) {
              setNeedsApiKey(true);
            } else {
              proceedToApp();
            }
          } else {
            proceedToApp();
          }
        }
      } else {
        triggerError('无效的邀请码。');
      }
    } catch (err) {
      console.error("验证时发生错误:", err);
      triggerError("验证时发生错误，请稍后重试。");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/[^0-9]/g, '');
    if (paste.length === CODE_LENGTH) {
      const newCode = paste.split('');
      setCode(newCode);
      inputRefs.current[CODE_LENGTH - 1]?.focus();
    }
  };

  const successContainerStyle: React.CSSProperties = {
    animation: `fade-out-up 0.6s ease-in forwards`,
    animationDelay: '0.6s',
  };

  const successDigitStyle = (index: number): React.CSSProperties => ({
    animation: `success-digit-anim 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`,
    animationDelay: `${index * 80}ms`,
  });

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle at center, #9A3B3B 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      <div
        className="w-full max-w-lg mx-auto text-center animate-fade-in relative z-10"
        style={isSuccess ? successContainerStyle : undefined}
      >
        <div className="flex flex-col items-center mb-12">
          <h1 className="font-serif text-3xl md:text-4xl text-[var(--text-primary)] tracking-tight mb-2">
            秋水伊人
          </h1>
          <p className="text-[11px] uppercase tracking-[0.4em] text-[var(--text-tertiary)] ml-1">
            AI Photography Workbench
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm border border-[var(--border-subtle)] shadow-[var(--shadow-soft)] rounded-2xl p-8 md:p-12 transition-all duration-500 hover:shadow-[var(--shadow-raised)]">
          {!needsApiKey ? (
            <>
              <p className="mb-10 text-sm text-[var(--text-secondary)] font-light leading-relaxed">
                欢迎进入体验版 <span className="font-serif italic text-[var(--text-primary)]">Limited Beta</span>
                <br />请输入您的专属邀请码
              </p>

              <div className="relative flex flex-col items-center mb-10">
                <div className={`flex items-center justify-center gap-2 sm:gap-3 ${isShaking ? 'shake' : ''}`}>
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      ref={el => { inputRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(e, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      className="w-10 h-14 sm:w-12 sm:h-16 text-center text-2xl font-serif bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] focus:bg-white focus:border-[var(--brand-accent)] focus:ring-1 focus:ring-[var(--brand-accent)] focus:outline-none transition-all duration-300 shadow-sm hover:border-[var(--text-tertiary)]"
                      autoFocus={index === 0}
                      style={isSuccess ? successDigitStyle(index) : undefined}
                      readOnly={isSuccess}
                    />
                  ))}
                </div>
              </div>

              <div className="text-center min-h-[60px]">
                {error ? (
                  <p className="text-[var(--brand-accent)] text-xs animate-fade-in font-medium tracking-wide flex items-center justify-center gap-2">
                    <DiamondIcon className="w-3 h-3" />
                    {error}
                  </p>
                ) : (
                  <div className="flex flex-col items-center">
                    <button onClick={() => setShowHelp(!showHelp)} className="text-[11px] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors uppercase tracking-widest border-b border-transparent hover:border-[var(--text-secondary)] pb-0.5">
                      Need an invitation code?
                    </button>
                    {showHelp && (
                      <div className="mt-4 absolute bottom-[-140px] left-1/2 transform -translate-x-1/2 w-64 bg-white p-4 rounded-xl border border-[var(--border-subtle)] shadow-[var(--shadow-raised)] animate-fade-in z-50">
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-t border-l border-[var(--border-subtle)]"></div>
                        <h3 className="text-[var(--text-secondary)] font-medium mb-3 text-center text-[11px] uppercase tracking-widest">Available Codes</h3>
                        <ul className="grid grid-cols-2 gap-2 text-xs font-mono text-center text-[var(--text-secondary)]">
                          {allCodes.filter(c => !c.used).slice(0, 6).map(({ code }) => (
                            <li key={code} className="p-1.5 rounded bg-[var(--bg-primary)] hover:bg-[var(--bg-secondary)] transition-colors cursor-default select-all">
                              {code}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="animate-fade-in flex flex-col items-center gap-6 max-w-sm mx-auto">
              <div className="bg-[var(--bg-primary)] border border-[var(--brand-accent)]/10 p-5 rounded-xl text-left w-full">
                <div className="flex items-center gap-2 mb-3">
                  <DiamondIcon className="w-4 h-4 text-[var(--brand-accent)]" />
                  <h3 className="font-serif font-medium text-[var(--brand-accent)] text-sm">Gemini 3.0 Pro</h3>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  本应用接入了 Google Cloud <strong>Vertex AI</strong> 以提供影棚级图像生成能力。请连接已配置 Billing 的项目以继续。
                </p>
              </div>

              <button
                onClick={handleApiKeySelection}
                className="w-full btn btn-accent py-3.5 group"
              >
                <span className="font-medium tracking-wide">Connect Google Cloud</span>
                <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <p className="text-[11px] text-[var(--text-tertiary)] text-center">
                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="hover:text-[var(--text-primary)] transition-colors underline decoration-[var(--border-subtle)] underline-offset-2">
                  Billing Documentation
                </a>
              </p>
            </div>
          )}
        </div>

        <div className="mt-12 opacity-40 hover:opacity-100 transition-opacity duration-500">
          <p className="text-[11px] font-sans text-[var(--text-tertiary)] tracking-widest flex items-center justify-center gap-2">
            <span>DESIGNED BY ANTIGRAVITY</span>
            <span className="w-px h-3 bg-[var(--border-subtle)]"></span>
            <span>POWERED BY GEMINI</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvitationScreen;
