'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface FeedbackData {
  type: 'bug' | 'missing' | 'improvement' | 'question';
  page: string;
  element?: string;
  description: string;
  screenshot?: string;
  timestamp: string;
  userAgent: string;
}

export function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [feedbackType, setFeedbackType] = useState<'bug' | 'missing' | 'improvement' | 'question'>('bug');
  const [description, setDescription] = useState('');
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedElement, setSelectedElement] = useState<string>('');
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null);
  const [feedbackHistory, setFeedbackHistory] = useState<FeedbackData[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    // Load feedback history from localStorage
    const saved = localStorage.getItem('feedbackHistory');
    if (saved) {
      setFeedbackHistory(JSON.parse(saved));
    }

    // Keyboard shortcut: Ctrl/Cmd + Shift + F
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        setIsMinimized(false);
        setIsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  useEffect(() => {
    if (!isSelecting) {
      setHoveredElement(null);
      return;
    }

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.feedback-widget')) return;
      
      setHoveredElement(target);
      target.style.outline = '2px solid #3b82f6';
      target.style.outlineOffset = '2px';
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.feedback-widget')) return;
      
      target.style.outline = '';
      target.style.outlineOffset = '';
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.feedback-widget')) return;
      
      e.preventDefault();
      e.stopPropagation();
      
      const elementInfo = getElementInfo(target);
      setSelectedElement(elementInfo);
      setIsSelecting(false);
      
      // Remove outline
      target.style.outline = '';
      target.style.outlineOffset = '';
    };

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      document.removeEventListener('click', handleClick, true);
      
      // Clean up any remaining outlines
      if (hoveredElement) {
        hoveredElement.style.outline = '';
        hoveredElement.style.outlineOffset = '';
      }
    };
  }, [isSelecting, hoveredElement]);

  const getElementInfo = (element: HTMLElement): string => {
    const tag = element.tagName.toLowerCase();
    const id = element.id ? `#${element.id}` : '';
    const classes = element.className ? `.${element.className.split(' ').join('.')}` : '';
    const text = element.textContent?.trim().substring(0, 50) || '';
    const path = getElementPath(element);
    
    return `
Element: ${tag}${id}${classes}
Text: "${text}"
Path: ${path}
Position: ${element.getBoundingClientRect().top}px from top
    `.trim();
  };

  const getElementPath = (element: HTMLElement): string => {
    const path = [];
    let current: HTMLElement | null = element;
    
    while (current && current !== document.body) {
      let selector = current.tagName.toLowerCase();
      if (current.id) {
        selector += `#${current.id}`;
        path.unshift(selector);
        break;
      } else if (current.className) {
        const classes = current.className.split(' ').filter(c => c).slice(0, 2).join('.');
        if (classes) selector += `.${classes}`;
      }
      path.unshift(selector);
      current = current.parentElement;
    }
    
    return path.join(' > ');
  };

  const takeScreenshot = async (): Promise<string> => {
    try {
      // Simple screenshot using html2canvas would go here
      // For now, we'll just return a placeholder
      return 'Screenshot would be captured here';
    } catch (error) {
      return 'Screenshot failed';
    }
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      alert('Lütfen açıklama girin');
      return;
    }

    const feedback: FeedbackData = {
      type: feedbackType,
      page: pathname,
      element: selectedElement || undefined,
      description: description.trim(),
      screenshot: await takeScreenshot(),
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    };

    // Save to localStorage
    const updated = [...feedbackHistory, feedback];
    setFeedbackHistory(updated);
    localStorage.setItem('feedbackHistory', JSON.stringify(updated));

    // Copy to clipboard for easy sharing
    const feedbackText = `
🐛 FEEDBACK RAPORU
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 TİP: ${getFeedbackTypeLabel(feedbackType)}
📍 SAYFA: ${pathname}
⏰ ZAMAN: ${new Date().toLocaleString('tr-TR')}

${selectedElement ? `🎯 ELEMENT:\n${selectedElement}\n` : ''}
📝 AÇIKLAMA:
${description}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
User Agent: ${navigator.userAgent}
    `.trim();

    try {
      await navigator.clipboard.writeText(feedbackText);
      alert('✅ Feedback kopyalandı! Şimdi bana yapıştırabilirsin.\n\nKısayol: Ctrl+V ile yapıştır');
    } catch (error) {
      console.log('Feedback:', feedbackText);
      alert('✅ Feedback konsola yazdırıldı! Kopyala ve bana gönder.');
    }

    // Reset form
    setDescription('');
    setSelectedElement('');
    setIsOpen(false);
  };

  const getFeedbackTypeLabel = (type: string) => {
    const labels = {
      bug: '🐛 Hata/Bug',
      missing: '❌ Eksik Özellik',
      improvement: '💡 İyileştirme',
      question: '❓ Soru',
    };
    return labels[type as keyof typeof labels];
  };

  const getFeedbackTypeColor = (type: string) => {
    const colors = {
      bug: 'bg-red-500',
      missing: 'bg-orange-500',
      improvement: 'bg-blue-500',
      question: 'bg-purple-500',
    };
    return colors[type as keyof typeof colors];
  };

  if (isMinimized) {
    return (
      <div className="feedback-widget fixed bottom-4 right-4 z-[9999]">
        <button
          onClick={() => {
            setIsMinimized(false);
            setIsOpen(true);
          }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 group"
          title="Feedback Gönder (Ctrl+Shift+F)"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {feedbackHistory.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {feedbackHistory.length}
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="feedback-widget fixed bottom-4 right-4 z-[9999]">
      <div className="bg-white rounded-lg shadow-2xl w-96 max-h-[600px] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            <h3 className="font-semibold">Hızlı Feedback</h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsMinimized(true)}
              className="hover:bg-white/20 p-1 rounded transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                setIsMinimized(true);
              }}
              className="hover:bg-white/20 p-1 rounded transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 overflow-y-auto">
          {isOpen ? (
            <div className="space-y-4">
              {/* Feedback Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Feedback Tipi
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['bug', 'missing', 'improvement', 'question'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setFeedbackType(type)}
                      className={`p-2 rounded-lg border-2 transition ${
                        feedbackType === type
                          ? `${getFeedbackTypeColor(type)} text-white border-transparent`
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="text-xs font-medium">
                        {getFeedbackTypeLabel(type)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Current Page */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-xs text-gray-600">Şu anki sayfa:</div>
                <div className="text-sm font-medium text-gray-900">{pathname}</div>
              </div>

              {/* Element Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Element Seç (Opsiyonel)
                </label>
                <button
                  onClick={() => setIsSelecting(!isSelecting)}
                  className={`w-full p-3 rounded-lg border-2 transition ${
                    isSelecting
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {isSelecting ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                      </svg>
                      <span>Sayfadan bir element seç...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                      </svg>
                      <span>Element Seçici Başlat</span>
                    </div>
                  )}
                </button>
                {selectedElement && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
                    <div className="font-medium text-green-900 mb-1">✓ Element seçildi:</div>
                    <pre className="text-green-700 whitespace-pre-wrap">{selectedElement}</pre>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Açıklama *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ne eksik, ne hatalı veya ne iyileştirilebilir? Detaylı anlat..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={4}
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={!description.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                📤 Feedback Gönder (Panoya Kopyala)
              </button>

              {/* Help Text */}
              <div className="text-xs text-gray-500 text-center">
                <div>Kısayol: <kbd className="px-1 py-0.5 bg-gray-200 rounded">Ctrl+Shift+F</kbd></div>
                <div className="mt-1">Feedback otomatik olarak panoya kopyalanacak</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <button
                onClick={() => setIsOpen(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
              >
                Yeni Feedback Gönder
              </button>
            </div>
          )}

          {/* Feedback History */}
          {feedbackHistory.length > 0 && (
            <div className="mt-6 pt-4 border-t">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-700">
                  Geçmiş ({feedbackHistory.length})
                </h4>
                <button
                  onClick={() => {
                    if (confirm('Tüm geçmişi silmek istediğinize emin misiniz?')) {
                      setFeedbackHistory([]);
                      localStorage.removeItem('feedbackHistory');
                    }
                  }}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  Temizle
                </button>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {feedbackHistory.slice().reverse().map((item, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded text-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-white ${getFeedbackTypeColor(item.type)}`}>
                        {getFeedbackTypeLabel(item.type).split(' ')[0]}
                      </span>
                      <span className="text-gray-500">
                        {new Date(item.timestamp).toLocaleTimeString('tr-TR')}
                      </span>
                    </div>
                    <div className="text-gray-700 truncate">{item.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
