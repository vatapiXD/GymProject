import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Alert, Button, Form, InputGroup, Modal, Nav, Navbar, Tab, Tabs } from 'react-bootstrap';
import { Edzesterv } from './components/Edzesterv';
import { HomePage } from './pages/HomePage';

const API_URL = 'http://localhost:3000';

type AuthMode = 'login' | 'register';

type LoggedInUser = {
  id: number;
  nev: string;
  email: string;
};

type PasswordVisibilityState = {
  login: boolean;
  register: boolean;
};

const extractFriendlyErrorMessage = async (response: Response, fallbackMessage: string) => {
  const errorText = await response.text();

  if (!errorText) {
    return fallbackMessage;
  }

  try {
    const parsedError = JSON.parse(errorText) as {
      message?: string | string[];
    };

    if (Array.isArray(parsedError.message)) {
      return parsedError.message.join(', ');
    }

    if (typeof parsedError.message === 'string' && parsedError.message.trim()) {
      return parsedError.message;
    }
  } catch {
    return errorText;
  }

  return fallbackMessage;
};

function App() {
  const [pathname, setPathname] = useState(window.location.pathname);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [loggedInUser, setLoggedInUser] = useState<LoggedInUser | null>(null);
  const [registerForm, setRegisterForm] = useState({
    nev: '',
    email: '',
    jelszo: '',
  });
  const [loginForm, setLoginForm] = useState({
    email: '',
    jelszo: '',
  });
  const [showPassword, setShowPassword] = useState<PasswordVisibilityState>({
    login: false,
    register: false,
  });
  const [loginStatus, setLoginStatus] = useState<{
    type: 'success' | 'danger';
    message: string;
  } | null>(null);
  const [registerStatus, setRegisterStatus] = useState<{
    type: 'success' | 'danger';
    message: string;
  } | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    const handlePopState = () => {
      setPathname(window.location.pathname);
      window.scrollTo(0, 0);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const navigateTo = (nextPath: string) => {
    if (window.location.pathname === nextPath) {
      return;
    }

    window.history.pushState({}, '', nextPath);
    setPathname(nextPath);
    window.scrollTo(0, 0);
  };

  const openAuthModal = () => {
    setAuthMode('login');
    setLoginStatus(null);
    setRegisterStatus(null);
    setShowAuthModal(true);
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
    setShowPassword({ login: false, register: false });
  };

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoggingIn(true);
    setLoginStatus(null);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginForm),
      });

      if (!response.ok) {
        throw new Error(
          await extractFriendlyErrorMessage(response, 'Sikertelen bejelentkezés.'),
        );
      }

      const user = (await response.json()) as LoggedInUser;
      setLoggedInUser(user);
      setLoginStatus({
        type: 'success',
        message: `Sikeres bejelentkezés: ${user.nev}`,
      });
      setLoginForm({ email: '', jelszo: '' });
      setShowAuthModal(false);
    } catch (error) {
      setLoginStatus({
        type: 'danger',
        message: error instanceof Error ? error.message : 'Sikertelen bejelentkezés.',
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegisterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsRegistering(true);
    setRegisterStatus(null);

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nev: registerForm.nev,
          email: registerForm.email,
          jelszo: registerForm.jelszo,
        }),
      });

      if (!response.ok) {
        throw new Error(
          await extractFriendlyErrorMessage(response, 'Sikertelen regisztráció.'),
        );
      }

      setRegisterStatus({
        type: 'success',
        message: 'A felhasználó létrehozva a backendben.',
      });
      setRegisterForm({ nev: '', email: '', jelszo: '' });
      setAuthMode('login');
    } catch (error) {
      setRegisterStatus({
        type: 'danger',
        message: error instanceof Error ? error.message : 'Sikertelen regisztráció.',
      });
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <>
      <div className="min-vh-100 bg-light">
        <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm">
          <Navbar.Brand
            href="/"
            onClick={(event) => {
              event.preventDefault();
              navigateTo('/');
            }}
            className="fw-bold text-uppercase"
          >
            💪 DZ Gym App
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="gym-navbar-nav" />
          <Navbar.Collapse id="gym-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link
                href="/"
                active={pathname === '/'}
                onClick={(event) => {
                  event.preventDefault();
                  navigateTo('/');
                }}
              >
                Főoldal
              </Nav.Link>
              <Nav.Link
                href="/edzestervek"
                active={pathname === '/edzestervek'}
                onClick={(event) => {
                  event.preventDefault();
                  navigateTo('/edzestervek');
                }}
              >
                Edzéstervek
              </Nav.Link>
              <Nav.Link href="#exercises">Gyakorlatok</Nav.Link>
              <Nav.Link href="#nutrition">Kaja & Makrók</Nav.Link>
              <Nav.Link href="#diet">Étrend</Nav.Link>
              <Nav.Link
                href="#profile"
                onClick={(event) => {
                  event.preventDefault();
                  openAuthModal();
                }}
              >
                {loggedInUser ? loggedInUser.nev : 'Profilom'}
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Navbar>

        {pathname === '/edzestervek' ? <Edzesterv currentUser={loggedInUser} /> : <HomePage navigateTo={navigateTo} />}

        <Modal show={showAuthModal} onHide={closeAuthModal} centered size="lg">
          <Modal.Header closeButton>
            <Modal.Title>{loggedInUser ? 'Profilom' : 'Profil hozzáférés'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Tabs
              activeKey={authMode}
              onSelect={(key) => setAuthMode((key as AuthMode) ?? 'login')}
              className="auth-tabs mb-3"
            >
              <Tab eventKey="login" title="Bejelentkezés">
                <Form className="mt-3" onSubmit={handleLoginSubmit}>
                  {loginStatus && (
                    <Alert variant={loginStatus.type} className="mb-3">
                      {loginStatus.message}
                    </Alert>
                  )}
                  <Form.Group className="mb-3" controlId="loginEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="pelda@email.com"
                      value={loginForm.email}
                      onChange={(event) =>
                        setLoginForm((current) => ({
                          ...current,
                          email: event.target.value,
                        }))
                      }
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="loginPassword">
                    <Form.Label>Jelszó</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type={showPassword.login ? 'text' : 'password'}
                        placeholder="Jelszó"
                        value={loginForm.jelszo}
                        onChange={(event) =>
                          setLoginForm((current) => ({
                            ...current,
                            jelszo: event.target.value,
                          }))
                        }
                        required
                      />
                      <Button
                        variant="outline-secondary"
                        type="button"
                        onClick={() =>
                          setShowPassword((current) => ({
                            ...current,
                            login: !current.login,
                          }))
                        }
                      >
                        {showPassword.login ? 'Elrejt' : 'Mutat'}
                      </Button>
                    </InputGroup>
                  </Form.Group>
                  <Button variant="primary" type="submit" className="w-100" disabled={isLoggingIn}>
                    {isLoggingIn ? 'Beléptetés...' : 'Bejelentkezés'}
                  </Button>
                </Form>
              </Tab>
              <Tab eventKey="register" title="Regisztráció">
                <Form className="mt-3" onSubmit={handleRegisterSubmit}>
                  {registerStatus && (
                    <Alert variant={registerStatus.type} className="mb-3">
                      {registerStatus.message}
                    </Alert>
                  )}
                  <Form.Group className="mb-3" controlId="registerName">
                    <Form.Label>Név</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Teljes név"
                      value={registerForm.nev}
                      onChange={(event) =>
                        setRegisterForm((current) => ({
                          ...current,
                          nev: event.target.value,
                        }))
                      }
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="registerEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="pelda@email.com"
                      value={registerForm.email}
                      onChange={(event) =>
                        setRegisterForm((current) => ({
                          ...current,
                          email: event.target.value,
                        }))
                      }
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="registerPassword">
                    <Form.Label>Jelszó</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type={showPassword.register ? 'text' : 'password'}
                        placeholder="Jelszó"
                        value={registerForm.jelszo}
                        onChange={(event) =>
                          setRegisterForm((current) => ({
                            ...current,
                            jelszo: event.target.value,
                          }))
                        }
                        required
                      />
                      <Button
                        variant="outline-secondary"
                        type="button"
                        onClick={() =>
                          setShowPassword((current) => ({
                            ...current,
                            register: !current.register,
                          }))
                        }
                      >
                        {showPassword.register ? 'Elrejt' : 'Mutat'}
                      </Button>
                    </InputGroup>
                  </Form.Group>
                  <Button variant="dark" type="submit" className="w-100" disabled={isRegistering}>
                    {isRegistering ? 'Mentés...' : 'Fiók létrehozása'}
                  </Button>
                </Form>
              </Tab>
            </Tabs>
          </Modal.Body>
        </Modal>
      </div>
    </>
  )
}

export default App
