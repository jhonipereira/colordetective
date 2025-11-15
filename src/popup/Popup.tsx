import React, { useState, useEffect, useRef } from "react";
import { isValidNamedColor, namedColorToHex } from "../utils/colorUtils";

interface AggregatedMatch {
  selector: string;
  tagName: string;
  properties: Array<{ property: string; value: string }>;
  depth?: number;
}

type View = "home" | "settings";
type Theme = "light" | "dark" | "auto";

interface Settings {
  theme: Theme;
  showNestedElements: boolean;
  showFullPath: boolean;
}

const defaultSettings: Settings = {
  theme: "light",
  showNestedElements: true,
  showFullPath: false,
};

const Popup: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>("home");
  const [hexColor, setHexColor] = useState("");
  const [matches, setMatches] = useState<AggregatedMatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [focusedResultIndex, setFocusedResultIndex] = useState<number>(-1);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [currentHostname, setCurrentHostname] = useState<string>("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultsListRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const loadSettingsAndHistory = async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      let hostname = "";

      if (tab.url) {
        try {
          const url = new URL(tab.url);
          hostname = url.hostname;
          setCurrentHostname(hostname);
        } catch {
          hostname = "default";
        }
      }

      chrome.storage.local.get(["settings", "searchHistoryByHost"], (result) => {
        if (result.settings) {
          setSettings({ ...defaultSettings, ...result.settings });
        }
        if (result.searchHistoryByHost && hostname) {
          const historyByHost = result.searchHistoryByHost as Record<string, string[]>;
          if (historyByHost[hostname] && Array.isArray(historyByHost[hostname])) {
            setSearchHistory(historyByHost[hostname]);
          }
        }
      });
    };

    loadSettingsAndHistory();
  }, []);

  useEffect(() => {
    const applyTheme = () => {
      let theme = settings.theme;
      if (theme === "auto") {
        theme = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
      }
      document.documentElement.setAttribute("data-theme", theme);
    };
    applyTheme();
  }, [settings.theme]);

  const updateSettings = async (newSettings: Partial<Settings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    chrome.storage.local.set({ settings: updated });

    if (
      ("showNestedElements" in newSettings || "showFullPath" in newSettings) &&
      hexColor &&
      matches.length > 0
    ) {
      await refreshSearch(updated.showNestedElements, updated.showFullPath);
    }
  };

  const validateHexColor = (color: string): boolean => {
    return /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  };

  const validateColor = (color: string): boolean => {
    return validateHexColor(color) || isValidNamedColor(color);
  };

  const normalizeColorInput = (color: string): string => {
    if (isValidNamedColor(color)) {
      return namedColorToHex(color);
    }
    return color.startsWith("#") ? color : `#${color}`;
  };

  const refreshSearch = async (showNested: boolean, showFullPath: boolean) => {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tab.id) return;

      const normalizedColor = normalizeColorInput(hexColor);
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: "detectColor",
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
    setError("");
    setMatches([]);

    if (!validateColor(hexColor)) {
      setError("Please enter a valid color (e.g., #FF5733, #F57, or 'red')");
      return;
    }

    setIsLoading(true);

    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tab.id) {
        throw new Error("No active tab found");
      }

      if (
        !tab.url ||
        tab.url.startsWith("chrome://") ||
        tab.url.startsWith("chrome-extension://")
      ) {
        throw new Error(
          "Cannot analyze Chrome internal pages. Please open a regular webpage."
        );
      }

      const normalizedColor = normalizeColorInput(hexColor);

      const response = await chrome.tabs.sendMessage(tab.id, {
        action: "detectColor",
        color: normalizedColor,
        showNestedElements: settings.showNestedElements,
        showFullPath: settings.showFullPath,
      });

      if (response && response.matches) {
        setMatches(response.matches);
      }
      setHasSearched(true);

      if (currentHostname) {
        const normalizedForHistory = hexColor.startsWith("#")
          ? hexColor
          : `#${hexColor}`;
        const updatedHistory = [
          normalizedForHistory.toUpperCase(),
          ...searchHistory.filter(
            (h) => h !== normalizedForHistory.toUpperCase()
          ),
        ].slice(0, 10);
        setSearchHistory(updatedHistory);

        chrome.storage.local.get(["searchHistoryByHost"], (result) => {
          const historyByHost = (result.searchHistoryByHost as Record<string, string[]>) || {};
          historyByHost[currentHostname] = updatedHistory;
          chrome.storage.local.set({ searchHistoryByHost: historyByHost });
        });
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes("Receiving end does not exist")) {
          setError("Could not connect to page. Try refreshing the page.");
        } else {
          setError(err.message);
        }
      } else {
        setError("An error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleElementClick = async (index: number) => {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tab.id) return;

      await chrome.tabs.sendMessage(tab.id, {
        action: "highlightElement",
        index: index,
        temporary: false,
      });
    } catch (err) {
      // Silently fail for highlight actions
    }
  };

  const handleElementHover = async (index: number) => {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tab.id) return;

      await chrome.tabs.sendMessage(tab.id, {
        action: "highlightElement",
        index: index,
        temporary: true,
      });
    } catch (err) {
      // Silently fail for highlight actions
    }
  };

  const handleElementMouseLeave = async () => {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tab.id) return;

      await chrome.tabs.sendMessage(tab.id, {
        action: "removeHighlight",
      });
    } catch (err) {
      // Silently fail for highlight actions
    }
  };

  const handleCopySelector = async (
    selector: string,
    index: number,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(selector);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = selector;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  const handleClear = async () => {
    setHexColor("");
    setMatches([]);
    setError("");
    setHasSearched(false);
    setFocusedResultIndex(-1);

    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tab.id) {
        await chrome.tabs.sendMessage(tab.id, { action: "removeHighlight" });
      }
    } catch (err) {
      // Silently fail
    }

    searchInputRef.current?.focus();
  };

  const handleHistorySelect = async (color: string) => {
    setHexColor(color);
    setShowHistory(false);

    setError("");
    setMatches([]);
    setIsLoading(true);

    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tab.id) {
        throw new Error("No active tab found");
      }

      if (
        !tab.url ||
        tab.url.startsWith("chrome://") ||
        tab.url.startsWith("chrome-extension://")
      ) {
        throw new Error(
          "Cannot analyze Chrome internal pages. Please open a regular webpage."
        );
      }

      const response = await chrome.tabs.sendMessage(tab.id, {
        action: "detectColor",
        color: color,
        showNestedElements: settings.showNestedElements,
        showFullPath: settings.showFullPath,
      });

      if (response && response.matches) {
        setMatches(response.matches);
      }
      setHasSearched(true);
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes("Receiving end does not exist")) {
          setError("Could not connect to page. Try refreshing the page.");
        } else {
          setError(err.message);
        }
      } else {
        setError("An error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    setSearchHistory([]);
    if (currentHostname) {
      chrome.storage.local.get(['searchHistoryByHost'], (result) => {
        const historyByHost = (result.searchHistoryByHost as Record<string, string[]>) || {};
        historyByHost[currentHostname] = [];
        chrome.storage.local.set({ searchHistoryByHost: historyByHost });
      });
    }
  };

  const handleResultKeyDown = (e: React.KeyboardEvent, index: number) => {
    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        handleElementClick(index);
        break;
      case "ArrowDown":
        e.preventDefault();
        if (index < matches.length - 1) {
          setFocusedResultIndex(index + 1);
          const nextItem = resultsListRef.current?.children[
            index + 1
          ] as HTMLElement;
          nextItem?.focus();
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (index > 0) {
          setFocusedResultIndex(index - 1);
          const prevItem = resultsListRef.current?.children[
            index - 1
          ] as HTMLElement;
          prevItem?.focus();
        }
        break;
      case "Home":
        e.preventDefault();
        setFocusedResultIndex(0);
        const firstItem = resultsListRef.current?.children[0] as HTMLElement;
        firstItem?.focus();
        break;
      case "End":
        e.preventDefault();
        setFocusedResultIndex(matches.length - 1);
        const lastItem = resultsListRef.current?.children[
          matches.length - 1
        ] as HTMLElement;
        lastItem?.focus();
        break;
      case "c":
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          handleCopySelector(
            matches[index].selector,
            index,
            e as unknown as React.MouseEvent
          );
        }
        break;
    }
  };

  return (
    <div
      className="popup-container"
      role="application"
      aria-label="ColorDetective Extension"
    >
      <header className="app-header">
        <h1 id="app-title">ColorDetective</h1>
        <nav
          className="nav-links"
          role="navigation"
          aria-label="Main navigation"
        >
          <button
            className={`nav-link ${currentView === "home" ? "active" : ""}`}
            onClick={() => setCurrentView("home")}
            aria-label="Home - Search for colors"
            aria-current={currentView === "home" ? "page" : undefined}
          >
            🏠
          </button>
          <button
            className={`nav-link ${currentView === "settings" ? "active" : ""}`}
            onClick={() => setCurrentView("settings")}
            aria-label="Settings"
            aria-current={currentView === "settings" ? "page" : undefined}
          >
            ⚙️
          </button>
        </nav>
      </header>

      {currentView === "home" && (
        <main role="main" aria-labelledby="app-title">
          <div className="input-section" role="search">
            <label htmlFor="color-input" className="sr-only">
              Hex color code
            </label>
            <div className="input-wrapper">
              <input
                id="color-input"
                ref={searchInputRef}
                type="text"
                placeholder="Enter hex color (e.g., #FF5733)"
                value={hexColor}
                onChange={(e) => setHexColor(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                onFocus={() => searchHistory.length > 0 && setShowHistory(true)}
                onBlur={() => setTimeout(() => setShowHistory(false), 200)}
                aria-describedby={error ? "error-message" : undefined}
                aria-invalid={error ? "true" : "false"}
                aria-haspopup="listbox"
                aria-expanded={showHistory}
              />
              {showHistory && searchHistory.length > 0 && (
                <div
                  className="history-dropdown"
                  role="listbox"
                  aria-label="Search history"
                >
                  <div className="history-header">
                    <span>Recent searches</span>
                    <button
                      className="clear-history-btn"
                      onClick={clearHistory}
                      aria-label="Clear search history"
                    >
                      Clear
                    </button>
                  </div>
                  {searchHistory.map((color, index) => (
                    <button
                      key={index}
                      className="history-item"
                      onClick={() => handleHistorySelect(color)}
                      role="option"
                      aria-label={`Select color ${color}`}
                    >
                      <span
                        className="history-color-swatch"
                        style={{ backgroundColor: color }}
                        aria-hidden="true"
                      />
                      <span className="history-color-text">{color}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={handleSearch}
              disabled={isLoading}
              aria-label={
                isLoading
                  ? "Searching for elements"
                  : "Search for elements with this color"
              }
            >
              {isLoading ? "Searching..." : "Search"}
            </button>
            {(hexColor || matches.length > 0 || hasSearched) && (
              <button
                className="clear-btn"
                onClick={handleClear}
                aria-label="Clear search and results"
              >
                ✕
              </button>
            )}
          </div>

          {error && (
            <div
              id="error-message"
              className="error"
              role="alert"
              aria-live="assertive"
            >
              {error}
            </div>
          )}

          {hasSearched && matches.length === 0 && !error && !isLoading && (
            <div className="empty-state" role="status" aria-live="polite">
              <div className="empty-icon" aria-hidden="true">
                🔍
              </div>
              <p>No elements found with this color</p>
              <span className="empty-hint">
                Try a different hex code or check if the color exists on the
                page
              </span>
            </div>
          )}

          {matches.length > 0 && (
            <div className="results" role="region" aria-label="Search results">
              <h2 id="results-heading" aria-live="polite">
                Found {matches.length} element{matches.length !== 1 ? "s" : ""}
              </h2>
              <p className="hint" id="results-instructions">
                💡 Click to highlight, hover to preview. Use arrow keys to
                navigate, Enter to select, Ctrl+C to copy selector.
              </p>
              <ul
                className="matches-list"
                ref={resultsListRef}
                role="listbox"
                aria-labelledby="results-heading"
                aria-describedby="results-instructions"
              >
                {matches.map((match, index) => (
                  <li
                    key={index}
                    className={`match-item ${
                      match.depth ? `depth-${Math.min(match.depth, 3)}` : ""
                    }`}
                    style={{
                      marginLeft: match.depth ? `${match.depth * 20}px` : "0",
                    }}
                    onClick={() => handleElementClick(index)}
                    onMouseEnter={() => handleElementHover(index)}
                    onMouseLeave={handleElementMouseLeave}
                    onKeyDown={(e) => handleResultKeyDown(e, index)}
                    onFocus={() => setFocusedResultIndex(index)}
                    tabIndex={0}
                    role="option"
                    aria-selected={focusedResultIndex === index}
                    aria-label={`${
                      match.tagName
                    } element with ${match.properties
                      .map((p) => `${p.property} ${p.value}`)
                      .join(", ")}. Selector: ${match.selector}`}
                  >
                    <div className="match-header">
                      <div className="match-tag">
                        {match.depth ? "↳ " : ""}
                        {match.tagName}
                        {match.depth !== undefined && match.depth > 1 && (
                          <span className="depth-indicator">
                            (depth {match.depth})
                          </span>
                        )}
                      </div>
                      <button
                        className="copy-btn"
                        onClick={(e) =>
                          handleCopySelector(match.selector, index, e)
                        }
                        aria-label={
                          copiedIndex === index
                            ? "Selector copied"
                            : `Copy selector for ${match.tagName}`
                        }
                      >
                        {copiedIndex === index ? "✓" : "📋"}
                      </button>
                    </div>
                    <div className="match-selector" aria-hidden="true">
                      {match.selector}
                    </div>
                    <div className="match-properties" aria-hidden="true">
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
        </main>
      )}

      {currentView === "settings" && (
        <div className="settings-view" role="region" aria-label="Settings">
          <h2 id="settings-heading">Settings</h2>

          <div
            className="setting-item"
            role="group"
            aria-labelledby="theme-label"
          >
            <label id="theme-label" className="setting-label">
              Theme
            </label>
            <div
              className="theme-options"
              role="radiogroup"
              aria-labelledby="theme-label"
            >
              <button
                className={`theme-option ${
                  settings.theme === "light" ? "active" : ""
                }`}
                onClick={() => updateSettings({ theme: "light" })}
                role="radio"
                aria-checked={settings.theme === "light"}
                aria-label="Light theme"
              >
                ☀️ Light
              </button>
              <button
                className={`theme-option ${
                  settings.theme === "dark" ? "active" : ""
                }`}
                onClick={() => updateSettings({ theme: "dark" })}
                role="radio"
                aria-checked={settings.theme === "dark"}
                aria-label="Dark theme"
              >
                🌙 Dark
              </button>
              <button
                className={`theme-option ${
                  settings.theme === "auto" ? "active" : ""
                }`}
                onClick={() => updateSettings({ theme: "auto" })}
                role="radio"
                aria-checked={settings.theme === "auto"}
                aria-label="Auto theme based on system preference"
              >
                🔄 Auto
              </button>
            </div>
          </div>

          <div className="setting-item">
            <label id="nested-label" className="setting-label">
              Show Nested Elements
            </label>
            <div className="toggle-wrapper">
              <button
                className={`toggle ${
                  settings.showNestedElements ? "active" : ""
                }`}
                onClick={() =>
                  updateSettings({
                    showNestedElements: !settings.showNestedElements,
                  })
                }
                role="switch"
                aria-checked={settings.showNestedElements}
                aria-labelledby="nested-label"
              >
                <span className="toggle-slider" aria-hidden="true" />
              </button>
              <span className="toggle-status" aria-hidden="true">
                {settings.showNestedElements ? "On" : "Off"}
              </span>
            </div>
          </div>

          <div className="setting-item">
            <label id="fullpath-label" className="setting-label">
              Show Full Path
            </label>
            <div className="toggle-wrapper">
              <button
                className={`toggle ${settings.showFullPath ? "active" : ""}`}
                onClick={() =>
                  updateSettings({ showFullPath: !settings.showFullPath })
                }
                role="switch"
                aria-checked={settings.showFullPath}
                aria-labelledby="fullpath-label"
              >
                <span className="toggle-slider" aria-hidden="true" />
              </button>
              <span className="toggle-status" aria-hidden="true">
                {settings.showFullPath ? "On" : "Off"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Popup;
