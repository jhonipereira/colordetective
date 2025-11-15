import React, { useState, useEffect } from 'react';

interface AggregatedMatch {
  selector: string;
  tagName: string;
  properties: Array<{ property: string; value: string }>;
  depth?: number;
}

type View = 'home' | 'settings';
type Theme = 'light' | 'dark' | 'auto';

interface Settings {
  theme: Theme;
  showNestedElements: boolean;
  showFullPath: boolean;
}

const defaultSettings: Settings = {
  theme: 'light',
  showNestedElements: true,
  showFullPath: false,
};

const Popup: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [hexColor, setHexColor] = useState('');
  const [matches, setMatches] = useState<AggregatedMatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    chrome.storage.local.get('settings', (result) => {
      if (result.settings) {
        setSettings({ ...defaultSettings, ...result.settings });
      }
    });
  }, []);

  useEffect(() => {
    const applyTheme = () => {
      let theme = settings.theme;
      if (theme === 'auto') {
        theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      document.documentElement.setAttribute('data-theme', theme);
    };
    applyTheme();
  }, [settings.theme]);

  const updateSettings = async (newSettings: Partial<Settings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    chrome.storage.local.set({ settings: updated });

    if (('showNestedElements' in newSettings || 'showFullPath' in newSettings) && hexColor && matches.length > 0) {
      await refreshSearch(updated.showNestedElements, updated.showFullPath);
    }
  };

  const validateHexColor = (color: string): boolean => {
    return /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  };

  const refreshSearch = async (showNested: boolean, showFullPath: boolean) => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.id) return;

      const normalizedColor = hexColor.startsWith('#') ? hexColor : `#${hexColor}`;
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'detectColor',
        color: normalizedColor,
        showNestedElements: showNested,
        showFullPath: showFullPath,
      });

      if (response && response.matches) {
        setMatches(response.matches);
      }
    } catch (err) {
      // Silently fail on refresh
    }
  };

  const handleSearch = async () => {
    setError('');
    setMatches([]);

    if (!validateHexColor(hexColor)) {
      setError('Please enter a valid hex color (e.g., #FF5733 or #F57)');
      return;
    }

    setIsLoading(true);

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab.id) {
        throw new Error('No active tab found');
      }

      if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
        throw new Error('Cannot analyze Chrome internal pages. Please open a regular webpage.');
      }

      const normalizedColor = hexColor.startsWith('#') ? hexColor : `#${hexColor}`;

      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'detectColor',
        color: normalizedColor,
        showNestedElements: settings.showNestedElements,
        showFullPath: settings.showFullPath,
      });

      if (response && response.matches) {
        setMatches(response.matches);
      }
      setHasSearched(true);
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('Receiving end does not exist')) {
          setError('Could not connect to page. Try refreshing the page.');
        } else {
          setError(err.message);
        }
      } else {
        setError('An error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleElementClick = async (index: number) => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.id) return;

      await chrome.tabs.sendMessage(tab.id, {
        action: 'highlightElement',
        index: index,
        temporary: false,
      });
    } catch (err) {
      // Silently fail for highlight actions
    }
  };

  const handleElementHover = async (index: number) => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.id) return;

      await chrome.tabs.sendMessage(tab.id, {
        action: 'highlightElement',
        index: index,
        temporary: true,
      });
    } catch (err) {
      // Silently fail for highlight actions
    }
  };

  const handleElementMouseLeave = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.id) return;

      await chrome.tabs.sendMessage(tab.id, {
        action: 'removeHighlight',
      });
    } catch (err) {
      // Silently fail for highlight actions
    }
  };

  const handleCopySelector = async (selector: string, index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(selector);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = selector;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  const handleClear = async () => {
    setHexColor('');
    setMatches([]);
    setError('');
    setHasSearched(false);

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab.id) {
        await chrome.tabs.sendMessage(tab.id, { action: 'removeHighlight' });
      }
    } catch (err) {
      // Silently fail
    }
  };

  return (
    <div className="popup-container">
      <header className="app-header">
        <h1>ColorDetective</h1>
        <nav className="nav-links">
          <button
            className={`nav-link ${currentView === 'home' ? 'active' : ''}`}
            onClick={() => setCurrentView('home')}
            title="Home"
          >
            🏠
          </button>
          <button
            className={`nav-link ${currentView === 'settings' ? 'active' : ''}`}
            onClick={() => setCurrentView('settings')}
            title="Settings"
          >
            ⚙️
          </button>
        </nav>
      </header>

      {currentView === 'home' && (
        <>
          <div className="input-section">
            <input
              type="text"
              placeholder="Enter hex color (e.g., #FF5733)"
              value={hexColor}
              onChange={(e) => setHexColor(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? 'Searching...' : 'Search'}
            </button>
            {(hexColor || matches.length > 0 || hasSearched) && (
              <button className="clear-btn" onClick={handleClear} title="Clear">
                ✕
              </button>
            )}
          </div>

          {error && <div className="error">{error}</div>}

          {hasSearched && matches.length === 0 && !error && !isLoading && (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <p>No elements found with this color</p>
              <span className="empty-hint">Try a different hex code or check if the color exists on the page</span>
            </div>
          )}

          {matches.length > 0 && (
            <div className="results">
              <h2>Found {matches.length} element{matches.length !== 1 ? 's' : ''}</h2>
              <p className="hint">💡 Click to highlight, hover to preview</p>
              <ul className="matches-list">
                {matches.map((match, index) => (
                  <li
                    key={index}
                    className={`match-item ${match.depth ? `depth-${Math.min(match.depth, 3)}` : ''}`}
                    style={{ marginLeft: match.depth ? `${match.depth * 20}px` : '0' }}
                    onClick={() => handleElementClick(index)}
                    onMouseEnter={() => handleElementHover(index)}
                    onMouseLeave={handleElementMouseLeave}
                  >
                    <div className="match-header">
                      <div className="match-tag">
                        {match.depth ? '↳ ' : ''}{match.tagName}
                      </div>
                      <button
                        className="copy-btn"
                        onClick={(e) => handleCopySelector(match.selector, index, e)}
                        title="Copy selector"
                      >
                        {copiedIndex === index ? '✓' : '📋'}
                      </button>
                    </div>
                    <div className="match-selector">{match.selector}</div>
                    <div className="match-properties">
                      {match.properties.map((prop, i) => (
                        <div key={i} className="match-property">
                          {prop.property}: {prop.value}
                        </div>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {currentView === 'settings' && (
        <div className="settings-view">
          <h2>Settings</h2>

          <div className="setting-item">
            <label className="setting-label">Theme</label>
            <div className="theme-options">
              <button
                className={`theme-option ${settings.theme === 'light' ? 'active' : ''}`}
                onClick={() => updateSettings({ theme: 'light' })}
              >
                ☀️ Light
              </button>
              <button
                className={`theme-option ${settings.theme === 'dark' ? 'active' : ''}`}
                onClick={() => updateSettings({ theme: 'dark' })}
              >
                🌙 Dark
              </button>
              <button
                className={`theme-option ${settings.theme === 'auto' ? 'active' : ''}`}
                onClick={() => updateSettings({ theme: 'auto' })}
              >
                🔄 Auto
              </button>
            </div>
          </div>

          <div className="setting-item">
            <label className="setting-label">Show Nested Elements</label>
            <div className="toggle-wrapper">
              <button
                className={`toggle ${settings.showNestedElements ? 'active' : ''}`}
                onClick={() => updateSettings({ showNestedElements: !settings.showNestedElements })}
              >
                <span className="toggle-slider" />
              </button>
              <span className="toggle-status">
                {settings.showNestedElements ? 'On' : 'Off'}
              </span>
            </div>
          </div>

          <div className="setting-item">
            <label className="setting-label">Show Full Path</label>
            <div className="toggle-wrapper">
              <button
                className={`toggle ${settings.showFullPath ? 'active' : ''}`}
                onClick={() => updateSettings({ showFullPath: !settings.showFullPath })}
              >
                <span className="toggle-slider" />
              </button>
              <span className="toggle-status">
                {settings.showFullPath ? 'On' : 'Off'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Popup;
