import React, { useState, useMemo } from 'react';
import {
  Copy,
  Trash2,
  KeyRound,
  AlertCircle,
  Sparkles,
  Check,
  ShieldCheck,
  ShieldAlert,
  Info
} from 'lucide-react';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';

// Base64Url decode helper
function b64urlDecode(str: string): string {
  let output = str.replace(/-/g, '+').replace(/_/g, '/');
  switch (output.length % 4) {
    case 0:
      break;
    case 2:
      output += '==';
      break;
    case 3:
      output += '=';
      break;
    default:
      throw new Error('Illegal base64url string');
  }
  const binary = atob(output);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

// Standard Claims descriptions
const CLAIM_DESCRIPTIONS: Record<string, string> = {
  iss: 'Issuer (Principal that issued the JWT)',
  sub: 'Subject (Subject/Owner of the JWT, e.g. User ID)',
  aud: 'Audience (Recipients that the JWT is intended for)',
  exp: 'Expiration Time (Time on or after which the JWT MUST NOT be accepted)',
  nbf: 'Not Before (Time before which the JWT MUST NOT be accepted)',
  iat: 'Issued At (Time at which the JWT was created)',
  jti: 'JWT ID (Unique identifier for the token)',
  email: 'User Email Address',
  name: 'Full Display Name',
  roles: 'Assigned RBAC Security Roles',
  permissions: 'Specific API Permissions Granted',
  scope: 'OAuth 2.0 Granted Scopes'
};

// Generate sample tokens
const nowSec = Math.floor(Date.now() / 1000);
const futureExp = nowSec + 86400 * 7; // 7 days from now
const pastExp = nowSec - 86400 * 30; // 30 days ago

function createSampleJwt(header: object, payload: object, sig = 'mock_signature_h256'): string {
  const b64 = (obj: object) =>
    btoa(JSON.stringify(obj))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  return `${b64(header)}.${b64(payload)}.${sig}`;
}

const SAMPLE_JWTS = {
  active: createSampleJwt(
    { alg: 'RS256', typ: 'JWT', kid: 'sec_key_2026_01' },
    {
      iss: 'https://auth.toolboxx.dev/',
      sub: 'usr_89214710',
      aud: 'https://api.toolboxx.dev',
      iat: nowSec - 3600,
      exp: futureExp,
      email: 'security.lead@toolboxx.dev',
      name: 'Alex Taylor',
      roles: ['admin', 'developer', 'billing_manager'],
      tier: 'enterprise_pro'
    }
  ),
  expired: createSampleJwt(
    { alg: 'HS256', typ: 'JWT' },
    {
      iss: 'https://accounts.google.com',
      sub: 'google_oauth_10928374',
      aud: 'my_web_app_client',
      iat: pastExp - 3600,
      exp: pastExp,
      email: 'expired.session@example.com',
      scope: 'openid email profile'
    }
  ),
  firebase: createSampleJwt(
    { alg: 'RS256', typ: 'JWT', kid: 'fb_key_982' },
    {
      iss: 'https://securetoken.google.com/toolboxx-prod',
      sub: 'fb_usr_7719284',
      aud: 'toolboxx-prod',
      auth_time: nowSec - 1800,
      user_id: 'fb_usr_7719284',
      iat: nowSec - 1800,
      exp: nowSec + 3600,
      email: 'alex@startup.io',
      email_verified: true,
      firebase: {
        identities: { email: ['alex@startup.io'] },
        sign_in_provider: 'password'
      }
    }
  )
};

export const JwtDecoder: React.FC = () => {
  const [jwtInput, setJwtInput] = useState<string>(SAMPLE_JWTS.active);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Decode JWT
  const decoded = useMemo(() => {
    const trimmed = jwtInput.trim();
    if (!trimmed) {
      return { header: null, payload: null, signature: '', error: null, parts: [] };
    }

    const parts = trimmed.split('.');
    if (parts.length !== 3) {
      return {
        header: null,
        payload: null,
        signature: '',
        error: 'Invalid JWT structure: A valid JWT must have 3 dot-separated parts (Header.Payload.Signature)',
        parts
      };
    }

    try {
      const headerStr = b64urlDecode(parts[0]);
      const payloadStr = b64urlDecode(parts[1]);
      const header = JSON.parse(headerStr);
      const payload = JSON.parse(payloadStr);

      return {
        header,
        payload,
        signature: parts[2],
        error: null,
        parts
      };
    } catch (err) {
      return {
        header: null,
        payload: null,
        signature: parts[2] || '',
        error: err instanceof Error ? err.message : 'Failed to decode Base64Url JWT parts',
        parts
      };
    }
  }, [jwtInput]);

  // Expiration and Validity Status Analysis
  const statusInfo = useMemo(() => {
    if (!decoded.payload) return null;
    const now = Math.floor(Date.now() / 1000);
    const exp = decoded.payload.exp;
    const nbf = decoded.payload.nbf;
    const iat = decoded.payload.iat;

    let isExpired = false;
    let notYetValid = false;
    let statusText = 'Valid & Active';
    let badgeType: 'success' | 'warning' | 'neutral' = 'success';
    let timeRemaining = '';

    if (exp) {
      const diff = exp - now;
      if (diff <= 0) {
        isExpired = true;
        statusText = 'Token Expired';
        badgeType = 'warning';
        const ago = Math.abs(diff);
        if (ago > 86400) timeRemaining = `Expired ${Math.floor(ago / 86400)} days ago`;
        else if (ago > 3600) timeRemaining = `Expired ${Math.floor(ago / 3600)} hours ago`;
        else timeRemaining = `Expired ${Math.floor(ago / 60)} minutes ago`;
      } else {
        if (diff > 86400) timeRemaining = `Expires in ${Math.floor(diff / 86400)} days`;
        else if (diff > 3600) timeRemaining = `Expires in ${Math.floor(diff / 3600)} hours`;
        else timeRemaining = `Expires in ${Math.floor(diff / 60)} minutes`;
      }
    } else {
      timeRemaining = 'No expiration claim (Never expires)';
    }

    if (nbf && now < nbf) {
      notYetValid = true;
      statusText = 'Not Valid Yet (nbf in future)';
      badgeType = 'warning';
    }

    return {
      isExpired,
      notYetValid,
      statusText,
      badgeType,
      timeRemaining,
      expDate: exp ? new Date(exp * 1000).toLocaleString() : 'N/A',
      iatDate: iat ? new Date(iat * 1000).toLocaleString() : 'N/A'
    };
  }, [decoded.payload]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(label);
    showToast({ type: 'success', title: `Copied ${label}` });
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Token Status"
          value={statusInfo ? statusInfo.statusText : decoded.error ? 'Invalid JWT' : 'Waiting Input'}
          badge={statusInfo ? (statusInfo.isExpired ? 'EXPIRED' : 'ACTIVE') : 'IDLE'}
          badgeType={statusInfo?.badgeType || 'neutral'}
        />
        <StatCard
          label="Signature Algorithm"
          value={decoded.header?.alg || '-'}
          subValue={decoded.header?.typ ? `Type: ${decoded.header.typ}` : undefined}
        />
        <StatCard
          label="Token Expiration"
          value={statusInfo ? statusInfo.timeRemaining : '-'}
          subValue={statusInfo?.expDate !== 'N/A' ? statusInfo?.expDate : undefined}
        />
        <StatCard
          label="Claims Count"
          value={decoded.payload ? Object.keys(decoded.payload).length : 0}
          subValue="Decoded claims"
        />
      </div>

      {/* Main Workspace Card */}
      <div className="p-5 sm:p-7 rounded-3xl border border-[var(--c-border)] bg-[var(--c-card)] shadow-xl space-y-6">
        {/* Header Preset Picker */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--c-border)]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-[var(--c-subtle)] font-medium flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[var(--c-gold)]" /> Samples:
            </span>
            <button
              type="button"
              onClick={() => setJwtInput(SAMPLE_JWTS.active)}
              className="px-2.5 py-1 rounded-lg text-xs bg-[var(--c-surface)] hover:bg-[var(--c-border)] text-[var(--c-muted)] hover:text-[var(--c-text)] transition-colors"
            >
              Active OAuth2 Token
            </button>
            <button
              type="button"
              onClick={() => setJwtInput(SAMPLE_JWTS.expired)}
              className="px-2.5 py-1 rounded-lg text-xs bg-[var(--c-surface)] hover:bg-[var(--c-border)] text-rose-400 hover:text-rose-300 transition-colors"
            >
              Expired Token
            </button>
            <button
              type="button"
              onClick={() => setJwtInput(SAMPLE_JWTS.firebase)}
              className="px-2.5 py-1 rounded-lg text-xs bg-[var(--c-surface)] hover:bg-[var(--c-border)] text-[var(--c-muted)] hover:text-[var(--c-text)] transition-colors"
            >
              Firebase Auth Token
            </button>
          </div>

          {jwtInput && (
            <button
              type="button"
              onClick={() => setJwtInput('')}
              className="px-2.5 py-1 text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear Token
            </button>
          )}
        </div>

        {/* Input JWT String */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-[var(--c-muted)]">
            <span className="flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-[var(--c-gold)]" /> Encoded JWT Token String
            </span>
            <span className="font-mono text-[11px] text-[var(--c-subtle)]">
              {jwtInput.trim().split('.').length === 3 ? '3 parts detected' : ''}
            </span>
          </div>
          <textarea
            rows={5}
            value={jwtInput}
            onChange={(e) => setJwtInput(e.target.value)}
            placeholder="Paste your JSON Web Token (JWT) here..."
            className="w-full p-4 rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-text)] font-mono text-xs leading-relaxed focus:ring-2 focus:ring-[var(--c-gold)] outline-none resize-y shadow-inner"
            spellCheck={false}
          />
        </div>

        {/* Error Alert */}
        {decoded.error && (
          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-200 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold">JWT Decoding Error</h4>
              <p className="font-mono text-xs text-rose-300 mt-0.5">{decoded.error}</p>
            </div>
          </div>
        )}

        {/* Status Indicator Banner */}
        {statusInfo && (
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between flex-wrap gap-3 ${
              statusInfo.isExpired
                ? 'bg-rose-950/20 border-rose-800/50 text-rose-300'
                : 'bg-emerald-950/20 border-emerald-800/50 text-emerald-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {statusInfo.isExpired ? (
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              )}
              <div>
                <span className="font-bold text-xs sm:text-sm">{statusInfo.statusText}</span>
                <p className="text-xs opacity-80">{statusInfo.timeRemaining}</p>
              </div>
            </div>

            <div className="text-xs font-mono text-right opacity-80">
              {statusInfo.expDate !== 'N/A' && <div>Expires: {statusInfo.expDate}</div>}
              {statusInfo.iatDate !== 'N/A' && <div>Issued: {statusInfo.iatDate}</div>}
            </div>
          </div>
        )}

        {/* Decoded Sections: 3 Column Panels */}
        {decoded.header && decoded.payload && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Header Box */}
            <div className="p-4 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)] space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-[var(--c-border)]">
                  <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                    Header: Algorithm & Type
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(JSON.stringify(decoded.header, null, 2), 'Header')}
                    className="p-1 text-[var(--c-muted)] hover:text-[var(--c-text)] rounded"
                  >
                    {copiedSection === 'Header' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <pre className="mt-3 font-mono text-xs text-rose-300 whitespace-pre-wrap overflow-x-auto">
                  {JSON.stringify(decoded.header, null, 2)}
                </pre>
              </div>
              <div className="text-[11px] text-[var(--c-subtle)] pt-2 border-t border-[var(--c-border)]">
                Alg: <span className="font-mono text-[var(--c-text)]">{decoded.header.alg}</span>
              </div>
            </div>

            {/* Payload Box */}
            <div className="p-4 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)] space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-[var(--c-border)]">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                    Payload: Data Claims
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(JSON.stringify(decoded.payload, null, 2), 'Payload')}
                    className="p-1 text-[var(--c-muted)] hover:text-[var(--c-text)] rounded"
                  >
                    {copiedSection === 'Payload' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <pre className="mt-3 font-mono text-xs text-indigo-300 whitespace-pre-wrap overflow-x-auto max-h-[320px] overflow-y-auto">
                  {JSON.stringify(decoded.payload, null, 2)}
                </pre>
              </div>
              <div className="text-[11px] text-[var(--c-subtle)] pt-2 border-t border-[var(--c-border)]">
                Subject: <span className="font-mono text-[var(--c-text)]">{String(decoded.payload.sub || 'N/A')}</span>
              </div>
            </div>

            {/* Signature Box */}
            <div className="p-4 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)] space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-[var(--c-border)]">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Signature
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(decoded.signature, 'Signature')}
                    className="p-1 text-[var(--c-muted)] hover:text-[var(--c-text)] rounded"
                  >
                    {copiedSection === 'Signature' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="mt-3 p-3 rounded-xl bg-[var(--c-card)] border border-[var(--c-border)]">
                  <p className="font-mono text-xs text-amber-300 break-all leading-relaxed">
                    {decoded.signature || 'No Signature Provided'}
                  </p>
                </div>
              </div>
              <div className="text-[11px] text-[var(--c-subtle)] pt-2 border-t border-[var(--c-border)] flex items-center gap-1">
                <Info className="w-3.5 h-3.5" /> Signature verified on client/backend with public key.
              </div>
            </div>
          </div>
        )}

        {/* Detailed Claims Inspector Table */}
        {decoded.payload && (
          <div className="p-4 sm:p-5 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)] space-y-4">
            <h4 className="text-xs font-bold text-[var(--c-text)] uppercase tracking-wider">
              Decoded Claims & Metadata Reference
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--c-border)] text-[var(--c-subtle)] font-medium">
                    <th className="py-2 px-3 w-28">Claim Key</th>
                    <th className="py-2 px-3">Description</th>
                    <th className="py-2 px-3">Parsed Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--c-border)] font-mono">
                  {Object.entries(decoded.payload).map(([k, val]) => {
                    let formattedVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
                    if ((k === 'exp' || k === 'iat' || k === 'nbf' || k === 'auth_time') && typeof val === 'number') {
                      formattedVal = `${val} (${new Date(val * 1000).toLocaleString()})`;
                    }
                    return (
                      <tr key={k} className="hover:bg-[var(--c-card)]/40 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-[var(--c-gold)]">{k}</td>
                        <td className="py-2.5 px-3 font-sans text-[var(--c-muted)] text-xs">
                          {CLAIM_DESCRIPTIONS[k] || 'Custom application claim'}
                        </td>
                        <td className="py-2.5 px-3 text-[var(--c-text)] break-all">{formattedVal}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <PostCompletionRecommendations currentToolId="jwt-decoder" onReset={() => setJwtInput('')} />
    </div>
  );
};
