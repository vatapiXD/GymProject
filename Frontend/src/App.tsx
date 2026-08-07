
import Container from 'react-bootstrap/esm/Container';
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Card, Col, Nav, Navbar, Row } from 'react-bootstrap';
function App() {


  return (
    <>
      <div className="min-vh-100 bg-light">
  {/* 1. Navigációs menü */}
  <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm">
    <Container>
      <Navbar.Brand href="#home" className="fw-bold text-uppercase">
        💪 DZ Gym App
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="gym-navbar-nav" />
      <Navbar.Collapse id="gym-navbar-nav">
        <Nav className="ms-auto">
          <Nav.Link href="#home" active>Főoldal</Nav.Link>
          <Nav.Link href="#plans">Edzéstervek</Nav.Link>
          <Nav.Link href="#exercises">Gyakorlatok</Nav.Link>
          <Nav.Link href="#nutrition">Kaja & Makrók</Nav.Link>
          <Nav.Link href="#profile">Profilom</Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Container>
  </Navbar>

  {/* 2. Főoldal Tartalom */}
  <Container className="my-5">
    {/* Hero / Üdvözlő Szekció */}
    <Row className="mb-5 align-items-center">
      <Col lg={8} className="mx-auto text-center">
        <h1 className="display-4 fw-bold mb-3">Személyre szabott edzéstervek</h1>
        <p className="lead text-muted mb-4">
          Hozd létre saját edzésnapjaidat, válaszd ki a gyakorlatokat az adatbázisból, és kövesd nyomon a fejlődésedet egyetlen helyen.
        </p>
        <div className="d-flex justify-content-center gap-3">
          <Button variant="primary" size="lg" className="px-4">
            + Új edzésterv készítése
          </Button>
          <Button variant="outline-secondary" size="lg" className="px-4">
            Gyakorlatok böngészése
          </Button>
        </div>
      </Col>
    </Row>

    {/* Gyors elérési kártyák */}
    <Row className="g-4">
      <Col md={4}>
        <Card className="h-100 shadow-sm border-0">
          <Card.Body className="d-flex flex-column">
            <Card.Title className="fw-bold mb-3">📋 Edzésterveim</Card.Title>
            <Card.Text className="text-muted flex-grow-1">
              Kezeld a létrehozott edzésnapokat, állítsd be a sorozatszámokat, ismétléseket és pihenőidőket.
            </Card.Text>
            <Button variant="outline-primary" className="mt-auto">
              Tervek megtekintése
            </Button>
          </Card.Body>
        </Card>
      </Col>

      <Col md={4}>
        <Card className="h-100 shadow-sm border-0">
          <Card.Body className="d-flex flex-column">
            <Card.Title className="fw-bold mb-3">🏋️‍♂️ Gyakorlat Adatbázis</Card.Title>
            <Card.Text className="text-muted flex-grow-1">
              Böngészd át az elsődleges és másodlagos izomcsoportok szerint szűrt gyakorlatok listáját.
            </Card.Text>
            <Button variant="outline-primary" className="mt-auto">
              Gyakorlatok listája
            </Button>
          </Card.Body>
        </Card>
      </Col>

      <Col md={4}>
        <Card className="h-100 shadow-sm border-0">
          <Card.Body className="d-flex flex-column">
            <Card.Title className="fw-bold mb-3">🥗 Étrend & Kalóriák</Card.Title>
            <Card.Text className="text-muted flex-grow-1">
              Válogass az alapanyagok között, és számold ki a napi fehérje-, szénhidrát- és zsírfogyasztásodat.
            </Card.Text>
            <Button variant="outline-primary" className="mt-auto">
              Kaja adatbázis megnyitása
            </Button>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </Container>
</div>
    </>
  )
}

export default App
