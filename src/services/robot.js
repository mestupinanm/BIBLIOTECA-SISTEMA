function getQiSession() {
  return typeof window !== 'undefined' ? window.QiSession : undefined;
}

class RobotService {
  constructor() {
    this.session = null;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    this.initialized = true;

    const QiSession = getQiSession();
    if (!QiSession) {
      console.log('[Robot] No QiSession, running in dev mode');
      return;
    }

    try {
      QiSession(
        (session) => {
          this.session = session;
          this.subscribePeopleDetection();
        },
        () => {
          console.log('[Robot] QiSession connection failed, running in dev mode');
        }
      );
    } catch (error) {
      console.log('[Robot] QiSession not available, running in dev mode');
    }
  }

  subscribePeopleDetection() {
    if (!this.session) return;

    this.session
      .service('ALMemory')
      .then((memory) => memory.subscriber('PeoplePerception/PeopleDetected'))
      .then((subscriber) => {
        subscriber.signal.connect(() => {
          window.dispatchEvent(new CustomEvent('robot:presence'));
        });
      })
      .catch((error) => {
        console.log('[Robot] People detection subscription failed:', error);
      });
  }

  callLibrarian() {
    if (!this.session) return;

    this.session
      .service('ALMemory')
      .then((memory) => memory.raiseEvent('PepperLibrary/HelpRequested', true))
      .catch((error) => {
        console.log('[Robot] callLibrarian failed:', error);
      });
  }

  navigateTo(destinationId) {
    if (!this.session) {
      console.log('[Robot] Would navigate to:', destinationId);
      return;
    }

    this.session
      .service('ALMemory')
      .then((memory) => memory.raiseEvent('PepperLibrary/NavigateTo', destinationId))
      .catch((error) => {
        console.log('[Robot] navigateTo failed:', error);
      });
  }

  speak(text) {
    if (!this.session) {
      console.log('[Robot] Would say:', text);
      return;
    }

    this.session
      .service('ALTextToSpeech')
      .then((tts) => tts.say(text))
      .catch((error) => {
        console.log('[Robot] speak failed:', error);
      });
  }
}

export const Robot = new RobotService();
