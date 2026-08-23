import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  Download,
  QrCode as QrIcon,
  Sliders,
  Wifi,
  Link as LinkIcon,
  Mail,
  Phone,
  MessageSquare,
  Type,
  CheckCircle2,
  Image as ImageIcon,
  Upload,
  Trash2,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { downloadBlob, readFileAsDataURL } from '../../../utils/fileUtils';

type QrType = 'url' | 'text' | 'wifi' | 'email' | 'phone' | 'sms';

export const QrCodeGenerator: React.FC = () => {
  const [type, setType] = useState<QrType>('url');

  // Input fields
  const [url, setUrl] = useState<string>('https://toolboxx.dev');
  const [text, setText] = useState<string>('Hello from ToolBoxX!');
  const [emailTo, setEmailTo] = useState<string>('contact@example.com');
  const [emailSubject, setEmailSubject] = useState<string>('Inquiry');
  const [emailBody, setEmailBody] = useState<string>('Hello,\n\nI would like to get in touch.');
  const [phoneNumber, setPhoneNumber] = useState<string>('+1 555 123 4567');
  const [smsNumber, setSmsNumber] = useState<string>('+1 555 123 4567');
  const [smsMessage, setSmsMessage] = useState<string>('Hello via ToolBoxX QR!');
  const [wifiSsid, setWifiSsid] = useState<string>('MyHomeWiFi');
  const [wifiPassword, setWifiPassword] = useState<string>('SuperSecretPassword');
  const [wifiAuth, setWifiAuth] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [wifiHidden, setWifiHidden] = useState<boolean>(false);

  // Styling options
  const [fgColor, setFgColor] = useState<string>('#000000');
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [size, setSize] = useState<number>(512);
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<'L' | 'M' | 'Q' | 'H'>('H');
  const margin = 2;

  // Photo / Logo Embedding options
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [logoSizePercent, setLogoSizePercent] = useState<number>(22); // 15% - 32%
  const [logoShape, setLogoShape] = useState<'circle' | 'rounded' | 'square'>('circle');
  const logoBgPadding = 6;

  // Canvas ref for composite QR + Logo
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // QR outputs
  const [finalDataUrl, setFinalDataUrl] = useState<string>('');

  // Generate payload string
  const getPayload = (): string => {
    switch (type) {
      case 'url':
        return url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
      case 'text':
        return text;
      case 'email':
        return `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      case 'phone':
        return `tel:${phoneNumber.replace(/\s+/g, '')}`;
      case 'sms':
        return `sms:${smsNumber.replace(/\s+/g, '')}?body=${encodeURIComponent(smsMessage)}`;
      case 'wifi':
        return `WIFI:T:${wifiAuth};S:${wifiSsid};P:${wifiPassword};H:${wifiHidden ? 'true' : 'false'};;`;
      default:
        return url;
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast({ type: 'error', title: 'Invalid File', message: 'Please upload an image file (PNG, JPG, SVG, WebP).' });
      return;
    }

    try {
      const dataUrl = await readFileAsDataURL(file);
      setLogoDataUrl(dataUrl);
      setErrorCorrectionLevel('H'); // Auto set high recovery level for reliability
      showToast({ type: 'success', title: 'Photo Added', message: 'Logo photo successfully embedded in QR Code.' });
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to read image.' });
    }
  };

  const handleRemoveLogo = () => {
    setLogoDataUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    showToast({ type: 'info', title: 'Photo Removed', message: 'QR Code reverted to standard mode.' });
  };

  // Render QR Code with Logo on Canvas
  useEffect(() => {
    const payload = getPayload();
    if (!payload) return;

    // First generate base QR onto an offscreen canvas
    const qrCanvas = document.createElement('canvas');
    QRCode.toCanvas(qrCanvas, payload, {
      width: size,
      margin,
      color: {
        dark: fgColor,
        light: bgColor,
      },
      errorCorrectionLevel: logoDataUrl ? 'H' : errorCorrectionLevel,
    })
      .then(() => {
        const previewCanvas = previewCanvasRef.current;
        if (!previewCanvas) return;

        previewCanvas.width = size;
        previewCanvas.height = size;
        const ctx = previewCanvas.getContext('2d');
        if (!ctx) return;

        // Draw base QR
        ctx.drawImage(qrCanvas, 0, 0, size, size);

        // If logo is present, draw it in the center
        if (logoDataUrl) {
          const logoImg = new Image();
          logoImg.onload = () => {
            const logoPixelSize = (size * logoSizePercent) / 100;
            const logoX = (size - logoPixelSize) / 2;
            const logoY = (size - logoPixelSize) / 2;
            const bgPad = logoBgPadding;

            // Draw white/background badge behind logo
            ctx.save();
            ctx.fillStyle = bgColor;
            ctx.strokeStyle = fgColor;
            ctx.lineWidth = 2;

            if (logoShape === 'circle') {
              ctx.beginPath();
              ctx.arc(size / 2, size / 2, (logoPixelSize / 2) + bgPad, 0, Math.PI * 2);
              ctx.fill();
              ctx.stroke();

              // Clip circular logo
              ctx.beginPath();
              ctx.arc(size / 2, size / 2, logoPixelSize / 2, 0, Math.PI * 2);
              ctx.clip();
              ctx.drawImage(logoImg, logoX, logoY, logoPixelSize, logoPixelSize);
            } else if (logoShape === 'rounded') {
              const radius = 12;
              const boxX = logoX - bgPad;
              const boxY = logoY - bgPad;
              const boxSize = logoPixelSize + (bgPad * 2);

              ctx.beginPath();
              ctx.roundRect(boxX, boxY, boxSize, boxSize, radius);
              ctx.fill();
              ctx.stroke();

              ctx.beginPath();
              ctx.roundRect(logoX, logoY, logoPixelSize, logoPixelSize, radius - 2);
              ctx.clip();
              ctx.drawImage(logoImg, logoX, logoY, logoPixelSize, logoPixelSize);
            } else {
              // Square
              ctx.fillRect(logoX - bgPad, logoY - bgPad, logoPixelSize + (bgPad * 2), logoPixelSize + (bgPad * 2));
              ctx.strokeRect(logoX - bgPad, logoY - bgPad, logoPixelSize + (bgPad * 2), logoPixelSize + (bgPad * 2));
              ctx.drawImage(logoImg, logoX, logoY, logoPixelSize, logoPixelSize);
            }

            ctx.restore();
            setFinalDataUrl(previewCanvas.toDataURL('image/png'));
          };
          logoImg.src = logoDataUrl;
        } else {
          setFinalDataUrl(previewCanvas.toDataURL('image/png'));
        }
      })
      .catch((err) => console.error('QR Canvas error:', err));
  }, [
    type,
    url,
    text,
    emailTo,
    emailSubject,
    emailBody,
    phoneNumber,
    smsNumber,
    smsMessage,
    wifiSsid,
    wifiPassword,
    wifiAuth,
    wifiHidden,
    fgColor,
    bgColor,
    size,
    errorCorrectionLevel,
    logoDataUrl,
    logoSizePercent,
    logoShape,
    logoBgPadding,
    margin,
  ]);

  const handleDownloadPng = () => {
    if (!finalDataUrl) return;
    const byteString = atob(finalDataUrl.split(',')[1]);
    const mimeString = finalDataUrl.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeString });
    downloadBlob(blob, `toolboxx_qr_${type}_${size}px.png`);

    confetti({ particleCount: 60, spread: 60, origin: { y: 0.8 } });
    showToast({
      type: 'success',
      title: 'QR Code Downloaded',
      message: `Saved high-res ${size}×${size}px image with photo.`,
    });
  };

  const TYPE_TABS = [
    { id: 'url', label: 'URL / Link', icon: LinkIcon },
    { id: 'text', label: 'Plain Text', icon: Type },
    { id: 'wifi', label: 'Wi-Fi Network', icon: Wifi },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'phone', label: 'Phone Number', icon: Phone },
    { id: 'sms', label: 'SMS Message', icon: MessageSquare },
  ];

  return (
    <div className="space-y-8">
      {/* Type Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 bg-zinc-50 dark:bg-zinc-900/50 p-2 rounded-2xl border border-zinc-200 dark:border-zinc-800">
        {TYPE_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = type === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setType(tab.id as QrType)}
              className={`p-3 rounded-xl flex flex-col items-center gap-1.5 transition-all text-xs font-bold ${
                isActive
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Inputs + Options on Left, Live QR on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Content & Customization */}
        <div className="lg:col-span-7 space-y-6">
          {/* Content Inputs */}
          <div className="bg-zinc-50 dark:bg-zinc-900/40 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-4">
            <h4 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
              <QrIcon className="w-4 h-4 text-zinc-500" />
              QR Content Details
            </h4>

            {type === 'url' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Target Website URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:ring-2 focus:ring-zinc-500"
                />
              </div>
            )}

            {type === 'text' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Text Content
                </label>
                <textarea
                  rows={4}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter message or data..."
                  className="w-full p-3 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:ring-2 focus:ring-zinc-500"
                />
              </div>
            )}

            {type === 'wifi' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                      Network Name (SSID)
                    </label>
                    <input
                      type="text"
                      value={wifiSsid}
                      onChange={(e) => setWifiSsid(e.target.value)}
                      placeholder="MyHomeWiFi"
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:ring-2 focus:ring-zinc-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                      Wi-Fi Password
                    </label>
                    <input
                      type="text"
                      value={wifiPassword}
                      onChange={(e) => setWifiPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:ring-2 focus:ring-zinc-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">Security:</span>
                    {(['WPA', 'WEP', 'nopass'] as const).map((auth) => (
                      <label key={auth} className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="wifiAuth"
                          checked={wifiAuth === auth}
                          onChange={() => setWifiAuth(auth)}
                        />
                        <span>{auth === 'nopass' ? 'Open' : auth}</span>
                      </label>
                    ))}
                  </div>

                  <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={wifiHidden}
                      onChange={(e) => setWifiHidden(e.target.checked)}
                      className="rounded"
                    />
                    <span>Hidden SSID</span>
                  </label>
                </div>
              </div>
            )}

            {type === 'email' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Recipient Email
                  </label>
                  <input
                    type="email"
                    value={emailTo}
                    onChange={(e) => setEmailTo(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Email Body
                  </label>
                  <textarea
                    rows={3}
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    className="w-full p-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            {type === 'phone' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1 555 123 4567"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                />
              </div>
            )}

            {type === 'sms' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={smsNumber}
                    onChange={(e) => setSmsNumber(e.target.value)}
                    placeholder="+1 555 123 4567"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    SMS Message
                  </label>
                  <textarea
                    rows={3}
                    value={smsMessage}
                    onChange={(e) => setSmsMessage(e.target.value)}
                    className="w-full p-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* NEW: Add Photo / Logo to QR Section */}
          <div className="bg-zinc-50 dark:bg-zinc-900/40 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-zinc-500" />
                Embed Photo / Logo in QR
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                Custom Branding
              </span>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />

            {!logoDataUrl ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-5 rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-zinc-500 dark:hover:border-zinc-500 bg-white dark:bg-zinc-900 cursor-pointer flex flex-col items-center justify-center text-center gap-2 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
              >
                <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-900 dark:text-white">
                    Click to upload Logo or Photo
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    PNG, JPG, SVG, WebP supported. Stays 100% private in your browser.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
                  <div className="flex items-center gap-3">
                    <img
                      src={logoDataUrl}
                      alt="Logo preview"
                      className="w-10 h-10 object-contain rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white"
                    />
                    <div>
                      <div className="text-xs font-bold text-zinc-900 dark:text-white">
                        Photo Loaded
                      </div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Error Correction boosted to High (30%)
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="p-2 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> Remove
                  </button>
                </div>

                {/* Logo Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                      Photo Size: {logoSizePercent}%
                    </label>
                    <input
                      type="range"
                      min="15"
                      max="30"
                      value={logoSizePercent}
                      onChange={(e) => setLogoSizePercent(Number(e.target.value))}
                      className="w-full accent-zinc-900 dark:accent-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                      Photo Badge Shape
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(['circle', 'rounded', 'square'] as const).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setLogoShape(s)}
                          className={`py-1 px-2 rounded-lg text-xs capitalize font-semibold transition-all border ${
                            logoShape === s
                              ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-transparent shadow-xs'
                              : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Color & Resolution Customization */}
          <div className="bg-zinc-50 dark:bg-zinc-900/40 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-4">
            <h4 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-zinc-500" />
              Custom Colors & Resolution
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1.5">
                  Foreground QR Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-9 h-9 rounded-lg cursor-pointer border-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="px-3 py-1.5 text-xs font-mono rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white w-28"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1.5">
                  Background Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-9 h-9 rounded-lg cursor-pointer border-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="px-3 py-1.5 text-xs font-mono rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white w-28"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1.5">
                  Export Size ({size}×{size}px)
                </label>
                <select
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                >
                  <option value="360">360 × 360 px (Standard)</option>
                  <option value="512">512 × 512 px (High-Res)</option>
                  <option value="1024">1024 × 1024 px (Print 4K HD)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1.5">
                  Error Correction Level
                </label>
                <select
                  disabled={Boolean(logoDataUrl)}
                  value={logoDataUrl ? 'H' : errorCorrectionLevel}
                  onChange={(e) => setErrorCorrectionLevel(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white disabled:opacity-60"
                >
                  <option value="L">L - Low (7% recovery)</option>
                  <option value="M">M - Medium (15% recovery)</option>
                  <option value="Q">Q - Quartile (25% recovery)</option>
                  <option value="H">H - High (30% recovery - Best for Logos)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live Interactive QR Preview */}
        <div className="lg:col-span-5 flex flex-col items-center justify-between p-6 sm:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 text-center space-y-6">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
            <CheckCircle2 className="w-4 h-4" />
            <span>Permanent QR Code (100% Free & Private)</span>
          </div>

          {/* QR Container Canvas */}
          <div
            className="p-4 rounded-3xl shadow-xl transition-all border border-zinc-200/80 dark:border-zinc-700 inline-block bg-white"
          >
            <canvas
              ref={previewCanvasRef}
              className="w-64 h-64 object-contain rounded-xl max-w-full"
            />
          </div>

          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            Scan with any phone camera or lens to preview.
          </div>

          {/* Download Buttons */}
          <div className="w-full">
            <button
              onClick={handleDownloadPng}
              disabled={!finalDataUrl}
              className="w-full py-3.5 px-5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 disabled:opacity-50 text-white dark:text-zinc-900 font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <Download className="w-4 h-4" />
              Download High-Res QR Code (PNG)
            </button>
          </div>
        </div>
      </div>

      {/* Post Completion */}
      <PostCompletionRecommendations
        currentToolId="qr-code-generator"
      />
    </div>
  );
};
