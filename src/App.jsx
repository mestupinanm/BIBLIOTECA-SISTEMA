import React from 'react';
import TopBar from './components/TopBar.jsx';
import HelpModal from './components/HelpModal.jsx';
import IdleScreen from './screens/IdleScreen.jsx';
import GreetingScreen from './screens/GreetingScreen.jsx';
import MenuScreen from './screens/MenuScreen.jsx';
import NavigationScreen from './screens/NavigationScreen.jsx';
import NavigationGuideScreen from './screens/NavigationGuideScreen.jsx';
import ShelvesScreen from './screens/ShelvesScreen.jsx';
import BooksScreen from './screens/BooksScreen.jsx';
import InfoScreen from './screens/InfoScreen.jsx';
import EventsScreen from './screens/EventsScreen.jsx';
import FeedbackScreen from './screens/FeedbackScreen.jsx';

export default function App() {
  return (
    <>
      <main id="app">
        <TopBar />
        <IdleScreen />
        <GreetingScreen />
        <MenuScreen />
        <NavigationScreen />
        <NavigationGuideScreen />
        <ShelvesScreen />
        <BooksScreen />
        <InfoScreen />
        <EventsScreen />
        <FeedbackScreen />
      </main>
      <HelpModal />
    </>
  );
}
