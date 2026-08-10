import Container from 'react-bootstrap/Container';
import { Button, Card, Col, Row } from 'react-bootstrap';

type HomePageProps = {
  navigateTo: (path: string) => void;
};

export function HomePage({ navigateTo }: HomePageProps) {
  return (
    <Container className="my-5">
      <Row className="mb-5 align-items-center">
        <Col lg={8} className="mx-auto text-center">
          <h1 className="display-4 fw-bold mb-3">Személyre szabott edzéstervek</h1>
          <p className="lead text-muted mb-4">
            Hozd létre saját edzésnapjaidat, válaszd ki a gyakorlatokat az adatbázisból, és kövesd nyomon a fejlődésedet egyetlen helyen.
          </p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Button onClick={() => navigateTo('/edzestervek')} variant="primary" size="lg" className="px-4">
              + Új edzésterv készítése
            </Button>
            <Button onClick={() => navigateTo('/edzestervek')} variant="outline-secondary" size="lg" className="px-4">
              Edzéstervek megnyitása
            </Button>
          </div>
        </Col>
      </Row>

      <Row className="g-4">
        <Col md={4}>
          <Card className="h-100 shadow-sm border-0">
            <Card.Body className="d-flex flex-column">
              <Card.Title className="fw-bold mb-3">📋 Edzésterveim</Card.Title>
              <Card.Text className="text-muted flex-grow-1">
                Kezeld a létrehozott edzésnapokat, állítsd be a sorozatszámokat, ismétléseket és pihenőidőket.
              </Card.Text>
              <Button onClick={() => navigateTo('/edzestervek')} variant="outline-primary" className="mt-auto">
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
              <Button variant="outline-primary" className="mt-auto" disabled>
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
              <Button variant="outline-primary" className="mt-auto" disabled>
                Kaja adatbázis megnyitása
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}