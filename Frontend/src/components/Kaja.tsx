import { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, Form, Row, Spinner, Table } from 'react-bootstrap';
import { API_BASE_URL } from '../config';

const API_URL = API_BASE_URL;

interface KajaItem {
  id: number;
  nev: string;
  kategoria: KajaKategoria;
  kaloria: string;
  feherje: string;
  szenhidrat: string;
  zsir: string;
}

type KajaKategoria =
  | 'hus'
  | 'hal_tengeri'
  | 'tejtermek_tojas'
  | 'zoldseg'
  | 'gyumolcs'
  | 'gabonafele_teszta'
  | 'huvelyes'
  | 'magvas_zsir';

const KATEGORIA_LABEL: Record<KajaKategoria, string> = {
  hus: 'Hús',
  hal_tengeri: 'Hal & Tengeri',
  tejtermek_tojas: 'Tejtermék & Tojás',
  zoldseg: 'Zöldség',
  gyumolcs: 'Gyümölcs',
  gabonafele_teszta: 'Gabonaféle & Tészta',
  huvelyes: 'Hüvelyes',
  magvas_zsir: 'Magvas & Zsír',
};

const KATEGORIA_BADGE: Record<KajaKategoria, string> = {
  hus: 'bg-danger',
  hal_tengeri: 'bg-info text-dark',
  tejtermek_tojas: 'bg-warning text-dark',
  zoldseg: 'bg-success',
  gyumolcs: 'bg-primary',
  gabonafele_teszta: 'bg-secondary',
  huvelyes: 'bg-dark',
  magvas_zsir: 'bg-warning text-dark',
};

const formatNumber = (value: string) => {
  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    return value;
  }

  return new Intl.NumberFormat('hu-HU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(parsed);
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

export function Kaja() {
  const [kajaLista, setKajaLista] = useState<KajaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [kategoriaFilter, setKategoriaFilter] = useState<'osszes' | KajaKategoria>('osszes');
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`${API_URL}/kaja`);

      if (!response.ok) {
        throw new Error(await extractFriendlyErrorMessage(response, 'Nem sikerült betölteni az élelmiszer adatokat.'));
      }

      const data = (await response.json()) as KajaItem[];
      setKajaLista(data);
      setStatusMessage(`${data.length} élelmiszer töltve az adatbázisból.`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Nem sikerült betölteni az élelmiszer adatokat.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const filteredKaja = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return kajaLista.filter((item) => {
      const matchesCategory = kategoriaFilter === 'osszes' || item.kategoria === kategoriaFilter;

      const matchesSearch =
        normalizedSearch.length === 0 || item.nev.toLowerCase().includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [kajaLista, kategoriaFilter, searchTerm]);

  return (
    <section className="kaja-section py-5">
      <Container>
        <Row className="align-items-end g-4 mb-4">
          <Col lg={8}>
            <h1 className="fw-bold mb-2 display-6">🥗 Kaja & Makrók</h1>
            <p className="text-muted mb-0">
              Az alapanyagok tápanyagtartalma 100 grammra vetítve.
            </p>
          </Col>
          <Col lg={4} className="text-lg-end">
            <Button
              variant="dark"
              className="px-4"
              onClick={() => void loadData()}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" className="me-2" /> Frissítés...
                </>
              ) : (
                'Adatok frissítése'
              )}
            </Button>
          </Col>
        </Row>

        {errorMessage && (
          <Alert variant="danger" className="shadow-sm">
            {errorMessage}
          </Alert>
        )}

        {statusMessage && (
          <Alert variant="success" className="shadow-sm">
            {statusMessage}
          </Alert>
        )}

        <Card className="border-0 shadow-sm mb-4">
          <Card.Body>
            <Row className="g-3 align-items-end">
              <Col md={6}>
                <Form.Group controlId="kaja-search">
                  <Form.Label>Keresés</Form.Label>
                  <Form.Control
                    type="search"
                    placeholder="Pl. csirke, rizs, túró..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="kaja-kategoria-filter">
                  <Form.Label>Kategória szűrés</Form.Label>
                  <Form.Select
                    value={kategoriaFilter}
                    onChange={(event) => setKategoriaFilter(event.target.value as 'osszes' | KajaKategoria)}
                  >
                    <option value="osszes">Összes kategória</option>
                    {(Object.keys(KATEGORIA_LABEL) as KajaKategoria[]).map((kategoria) => (
                      <option key={kategoria} value={kategoria}>
                        {KATEGORIA_LABEL[kategoria]}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Card className="border-0 shadow-sm">
          <Card.Body>
            {isLoading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="text-muted mt-3 mb-0">Élelmiszerek betöltése...</p>
              </div>
            ) : filteredKaja.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <p className="mb-0">Nincs találat a megadott szűrési feltételekkel.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <Table striped hover responsive className="align-middle kaja-table mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Élelmiszer</th>
                      <th scope="col">Kategória</th>
                      <th scope="col" className="text-end">Kalória (kcal)</th>
                      <th scope="col" className="text-end">Fehérje (g)</th>
                      <th scope="col" className="text-end">Szénhidrát (g)</th>
                      <th scope="col" className="text-end">Zsír (g)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredKaja.map((item) => (
                      <tr key={item.id}>
                        <td className="text-muted">{item.id}</td>
                        <td className="fw-semibold">{item.nev}</td>
                        <td>
                          <Badge bg={KATEGORIA_BADGE[item.kategoria]} className="text-uppercase small">
                            {KATEGORIA_LABEL[item.kategoria]}
                          </Badge>
                        </td>
                        <td className="text-end">{formatNumber(item.kaloria)}</td>
                        <td className="text-end fw-semibold text-success">{formatNumber(item.feherje)}</td>
                        <td className="text-end">{formatNumber(item.szenhidrat)}</td>
                        <td className="text-end">{formatNumber(item.zsir)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}

            {!isLoading && filteredKaja.length > 0 && (
              <div className="text-muted small mt-3 text-end">
                Összesen: {filteredKaja.length} élelmiszer
                {kategoriaFilter !== 'osszes' && ` · Kategória: ${KATEGORIA_LABEL[kategoriaFilter]}`}
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
    </section>
  );
}