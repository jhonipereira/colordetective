import React, { useState } from 'react';

interface AggregatedMatch {
  selector: string;
  tagName: string;
  properties: Array<{ property: string; value: string }>;
}

const Popup: React.FC = () => {
  const [hexColor, setHexColor] = useState('');
  const [matches, setMatches] = useState<AggregatedMatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validateHexColor = (color: string): boolean => {
    return /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
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
      });

      if (response && response.matches) {
        setMatches(response.matches);
      }
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

  return (
    <div className="popup-container">
      <h1>ColorDetective</h1>
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
      </div>

      {error && <div className="error">{error}</div>}

      {matches.length > 0 && (
        <div className="results">
          <h2>Found {matches.length} element{matches.length !== 1 ? 's' : ''}</h2>
          <p className="hint">💡 Click to highlight, hover to preview</p>
          <ul className="matches-list">
            {matches.map((match, index) => (
              <li
                key={index}
                className="match-item"
                onClick={() => handleElementClick(index)}
                onMouseEnter={() => handleElementHover(index)}
                onMouseLeave={handleElementMouseLeave}
              >
                <div className="match-tag">{match.tagName}</div>
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
    </div>
  );
};

export default Popup;
