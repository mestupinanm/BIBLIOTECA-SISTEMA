import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Analytics, clearCurrentGeneralId } from '../services/analytics.js';
import { Robot } from '../services/robot.js';
import { SCREEN_TITLES, STRINGS, TOPBAR_SCREENS } from '../legacyData.js';

const SCREENS = {
  IDLE: 'idle',
  GREETING: 'greeting',
  MENU: 'menu',
  NAVIGATION: 'navigation',
  NAVIGATION_GUIDE: 'navigation-guide',
  SHELVES: 'shelves',
  BOOKS: 'books',
  INFO: 'info',
  EVENTS: 'events',
  FEEDBACK: 'feedback'
};

const HELP_CONFIG = {
  provider: 'formsubmit',
  recipient: 'm.estupinanm@uniandes.edu.co',
  senderName: 'Nova',
  formsubmit: {
    endpointBase: 'https://formsubmit.co/ajax/'
  }
};

const AppContext = createContext(null);

function createSession(language) {
  return {
    id: `S${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
    startTime: new Date().toISOString(),
    language,
    screensVisited: [],
    destinationsRequested: []
  };
}

export function AppProvider({ children }) {
  const [currentScreen, setCurrentScreen] = useState(SCREENS.IDLE);
  const [screenParams, setScreenParams] = useState({});
  const [history, setHistory] = useState([]);
  const [language, setLanguage] = useState('es');
  const [session, setSession] = useState(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [lastAction, setLastActionState] = useState({
    label: null,
    item: null,
    category: null
  });

  const inactivityTimerRef = useRef(null);
  const currentScreenRef = useRef(currentScreen);
  const screenParamsRef = useRef(screenParams);
  const sessionRef = useRef(session);
  const languageRef = useRef(language);
  const lastActionRef = useRef(lastAction);

  const stopInactivity = useCallback(() => {
    clearTimeout(inactivityTimerRef.current);
    inactivityTimerRef.current = null;
  }, []);

  const endSession = useCallback(() => {
    if (sessionRef.current) {
      Analytics.log(
        'session_end',
        { duration: Date.now() - new Date(sessionRef.current.startTime).getTime() },
        { session: sessionRef.current, language: languageRef.current }
      );
      Analytics.flush();
    }

    stopInactivity();
    clearCurrentGeneralId();
    setSession(null);
    setHistory([]);
    setLastActionState({ label: null, item: null, category: null });
  }, [stopInactivity]);

  const onTimeout = useCallback(() => {
    const screen = currentScreenRef.current;

    if (screen !== SCREENS.IDLE && screen !== SCREENS.GREETING && screen !== SCREENS.FEEDBACK) {
      setCurrentScreen(SCREENS.FEEDBACK);
      setScreenParams({});
      return;
    }

    endSession();
    setCurrentScreen(SCREENS.IDLE);
    setScreenParams({});
  }, [endSession]);

  const resetInactivity = useCallback(() => {
    clearTimeout(inactivityTimerRef.current);

    const screen = currentScreenRef.current;
    if (screen === SCREENS.IDLE || screen === SCREENS.GREETING) return;

    inactivityTimerRef.current = window.setTimeout(() => {
      onTimeout();
    }, 120000);
  }, [onTimeout]);

  const t = useCallback(
    (key, lang = language) => STRINGS[lang]?.[key] ?? STRINGS.es[key] ?? key,
    [language]
  );

  const goTo = useCallback((screen, params = {}, options = {}) => {
    const pushHistory = options.pushHistory !== false;

    setCurrentScreen((prevScreen) => {
      if (prevScreen === screen) return prevScreen;

      if (pushHistory && prevScreen && prevScreen !== SCREENS.IDLE && prevScreen !== SCREENS.GREETING) {
        setHistory((prevHistory) => [...prevHistory, { screen: prevScreen, params: screenParamsRef.current }]);
      }

      return screen;
    });

    setScreenParams(params);
  }, []);

  const back = useCallback(() => {
    setHistory((prevHistory) => {
      if (prevHistory.length === 0) {
        setCurrentScreen(SCREENS.MENU);
        setScreenParams({});
        return prevHistory;
      }

      const nextHistory = prevHistory.slice(0, -1);
      const previous = prevHistory[prevHistory.length - 1];
      setCurrentScreen(previous.screen);
      setScreenParams(previous.params || {});
      return nextHistory;
    });
  }, []);

  const startSession = useCallback((langOverride = languageRef.current) => {
    const nextSession = createSession(langOverride);
    setSession(nextSession);
    clearCurrentGeneralId();
    Analytics.log('session_start', {}, { session: nextSession, language: langOverride });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => {
      const next = prev === 'es' ? 'en' : 'es';
      Analytics.log('language_change', { language: next }, { session: sessionRef.current, language: next });
      return next;
    });
  }, []);

  const setLastAction = useCallback((label, item = null, category = null) => {
    setLastActionState({ label, item, category });
  }, []);

  const getLocationLabel = useCallback(() => {
    if (lastActionRef.current?.label) return lastActionRef.current.label;

    if (currentScreenRef.current === SCREENS.NAVIGATION_GUIDE) {
      return t('nav.directions');
    }

    return t(SCREEN_TITLES[currentScreenRef.current] || 'menu.title');
  }, [t]);

  const buildHelpEmailPayload = useCallback(() => {
    const lastActionLabel = getLocationLabel() || t('help.location_unknown');

    return {
      recipient: HELP_CONFIG.recipient,
      lastAction: lastActionLabel,
      message: `Soy ${HELP_CONFIG.senderName} y necesito ayuda. Mi ultima peticion fue: ${lastActionLabel}.`
    };
  }, [getLocationLabel, t]);

  const sendHelpEmail = useCallback(async () => {
    const payload = buildHelpEmailPayload();
    const url = `${HELP_CONFIG.formsubmit.endpointBase}${encodeURIComponent(payload.recipient)}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        name: HELP_CONFIG.senderName,
        subject: `Nova necesita ayuda - ${payload.lastAction || ''}`,
        message: payload.message,
        _captcha: 'false',
        _template: 'box'
      })
    });

    if (!response.ok) {
      throw new Error('help_email_request_failed');
    }

    return response.json();
  }, [buildHelpEmailPayload]);

  const openHelp = useCallback(() => {
    setHelpOpen(true);
    Analytics.log('help_requested', {}, { session: sessionRef.current, language: languageRef.current });
    Robot.callLibrarian();
    sendHelpEmail()
      .then(() => {
        Analytics.log('help_email_sent', buildHelpEmailPayload(), {
          session: sessionRef.current,
          language: languageRef.current
        });
      })
      .catch((error) => {
        Analytics.log(
          'help_email_failed',
          { reason: error?.message || 'unknown' },
          { session: sessionRef.current, language: languageRef.current }
        );
      });
    resetInactivity();
  }, [buildHelpEmailPayload, resetInactivity, sendHelpEmail]);

  const closeHelp = useCallback(() => {
    setHelpOpen(false);
    resetInactivity();
  }, [resetInactivity]);

  useEffect(() => {
    currentScreenRef.current = currentScreen;
  }, [currentScreen]);

  useEffect(() => {
    screenParamsRef.current = screenParams;
  }, [screenParams]);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  useEffect(() => {
    lastActionRef.current = lastAction;
  }, [lastAction]);

  useEffect(() => {
    Robot.init();

    const handlePresence = () => {
      if (currentScreenRef.current === SCREENS.IDLE) {
        setCurrentScreen(SCREENS.GREETING);
        setScreenParams({});
      }
    };

    window.addEventListener('robot:presence', handlePresence);

    return () => {
      window.removeEventListener('robot:presence', handlePresence);
    };
  }, []);

  useEffect(() => {
    const resetOnActivity = () => {
      resetInactivity();
    };

    document.addEventListener('touchstart', resetOnActivity);
    document.addEventListener('click', resetOnActivity);

    return () => {
      document.removeEventListener('touchstart', resetOnActivity);
      document.removeEventListener('click', resetOnActivity);
    };
  }, [resetInactivity]);

  useEffect(() => {
    Analytics.log('screen_view', { screen: currentScreen, params: screenParams }, { session, language });

    if (currentScreen === SCREENS.IDLE || currentScreen === SCREENS.GREETING || currentScreen === SCREENS.FEEDBACK) {
      stopInactivity();
      return;
    }

    resetInactivity();
  }, [currentScreen, screenParams, session, language, resetInactivity, stopInactivity]);

  const value = useMemo(
    () => ({
      SCREENS,
      currentScreen,
      screenParams,
      language,
      session,
      history,
      helpOpen,
      lastAction,
      topbarVisible: TOPBAR_SCREENS.includes(currentScreen),
      showBackButton: currentScreen !== SCREENS.MENU && currentScreen !== SCREENS.FEEDBACK,
      screenTitle: SCREEN_TITLES[currentScreen] ? t(SCREEN_TITLES[currentScreen]) : '',
      t,
      setLanguage,
      toggleLanguage,
      goTo,
      back,
      startSession,
      endSession,
      clearHistory,
      resetInactivity,
      stopInactivity,
      setLastAction,
      openHelp,
      closeHelp,
      analyticsState: { session, language }
    }),
    [
      back,
      clearHistory,
      closeHelp,
      currentScreen,
      endSession,
      goTo,
      helpOpen,
      history,
      language,
      lastAction,
      openHelp,
      resetInactivity,
      screenParams,
      session,
      setLanguage,
      setLastAction,
      startSession,
      stopInactivity,
      t,
      toggleLanguage
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }

  return context;
}
