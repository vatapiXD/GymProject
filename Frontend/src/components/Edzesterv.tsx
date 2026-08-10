import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Alert, Badge, Button, Card, Col, Container, Form, Row, Spinner, Table, Tab, Tabs } from 'react-bootstrap';

const API_URL = 'http://localhost:3000';

interface CurrentUser {
  id: number;
  nev: string;
  email: string;
}

interface AvailableUser {
  id: number;
  nev: string;
  email: string;
}

interface ExerciseCatalogItem {
  id: number;
  nev: string;
  elsodleges_izomcsoport_id: number;
  masodlagos_izomcsoport_id: number | null;
  izomcsoportok_gyakorlatok_elsodleges_izomcsoport_idToizomcsoportok?: {
    id: number;
    nev: string;
  };
  izomcsoportok_gyakorlatok_masodlagos_izomcsoport_idToizomcsoportok?: {
    id: number;
    nev: string;
  } | null;
}

interface SavedPlan {
  id: number;
  user_id: number;
  nev: string;
  leiras?: string | null;
  aktiv?: boolean | null;
  publikus?: boolean | null;
  letrehozva?: string;
  userek?: AvailableUser;
}

interface SavedDay {
  id: number;
  edzesterv_id: number;
  nev: string;
  sorrend: number;
}

interface SavedPlanExercise {
  id: number;
  edzes_nap_id: number;
  gyakorlat_id: number;
  sorrend: number;
  sorozatszam?: number | null;
  ismetlesszam_min?: number | null;
  ismetlesszam_max?: number | null;
  piheno_masodperc?: number | null;
  megjegyzese?: string | null;
  gyakorlatok?: ExerciseCatalogItem;
}

interface DraftExercise {
  draftId: string;
  gyakorlatId: string;
  sorozatszam: string;
  ismetlesszamMin: string;
  ismetlesszamMax: string;
  pihenoMasodperc: string;
  megjegyzese: string;
}

interface DraftDay {
  draftId: string;
  nev: string;
  pendingGyakorlatId: string;
  exercises: DraftExercise[];
}

type EdzestervProps = {
  currentUser?: CurrentUser | null;
};

type ActiveTab = 'create' | 'list';

const asErrorObject = (errorText: string) => JSON.parse(errorText) as { message?: string | string[] };

const extractFriendlyErrorMessage = async (response: Response, fallbackMessage: string) => {
  const errorText = await response.text();

  if (!errorText) {
    return fallbackMessage;
  }

  try {
    const parsedError = asErrorObject(errorText);

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

const formatDate = (value?: string) => {
  if (!value) {
    return 'Ismeretlen dátum';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('hu-HU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

const makeId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const makeDraftExercise = (gyakorlatId = ''): DraftExercise => ({
  draftId: makeId(),
  gyakorlatId,
  sorozatszam: '3',
  ismetlesszamMin: '8',
  ismetlesszamMax: '12',
  pihenoMasodperc: '90',
  megjegyzese: '',
});

const makeDraftDays = (count: number, previousDays: DraftDay[] = [], defaultExerciseId = '') => {
  return Array.from({ length: count }, (_, index) => {
    const previousDay = previousDays[index];

    return {
      draftId: previousDay?.draftId ?? makeId(),
      nev: previousDay?.nev || `${index + 1}. Nap`,
      pendingGyakorlatId: previousDay?.pendingGyakorlatId || defaultExerciseId,
      exercises: previousDay?.exercises ?? [],
    } satisfies DraftDay;
  });
};

const formatMuscleGroups = (exercise?: ExerciseCatalogItem) => {
  if (!exercise) {
    return 'Ismeretlen izomcsoport';
  }

  const primary = exercise.izomcsoportok_gyakorlatok_elsodleges_izomcsoport_idToizomcsoportok?.nev;
  const secondary = exercise.izomcsoportok_gyakorlatok_masodlagos_izomcsoport_idToizomcsoportok?.nev;

  if (primary && secondary) {
    return `${primary} · ${secondary}`;
  }

  return primary ?? secondary ?? 'Ismeretlen izomcsoport';
};

export function Edzesterv({ currentUser }: EdzestervProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('create');
  const [plans, setPlans] = useState<SavedPlan[]>([]);
  const [days, setDays] = useState<SavedDay[]>([]);
  const [planExercises, setPlanExercises] = useState<SavedPlanExercise[]>([]);
  const [gyakorlatok, setGyakorlatok] = useState<ExerciseCatalogItem[]>([]);
  const [users, setUsers] = useState<AvailableUser[]>([]);
  const [selectedPlanIdForList, setSelectedPlanIdForList] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [planName, setPlanName] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [planDayCount, setPlanDayCount] = useState(3);
  const [planUserId, setPlanUserId] = useState<string>('');
  const [planActive, setPlanActive] = useState(true);
  const [planPublic, setPlanPublic] = useState(false);
  const [draftDays, setDraftDays] = useState<DraftDay[]>(() => makeDraftDays(3));
  const [editingPlanId, setEditingPlanId] = useState<number | null>(null);

  const defaultExerciseId = useMemo(() => gyakorlatok[0]?.id.toString() ?? '', [gyakorlatok]);

  const selectedPlan = useMemo(() => {
    return plans.find((plan) => plan.id === selectedPlanIdForList) ?? plans[0] ?? null;
  }, [plans, selectedPlanIdForList]);

  const selectedPlanDays = useMemo(() => {
    if (!selectedPlan) {
      return [] as SavedDay[];
    }

    return days.filter((day) => day.edzesterv_id === selectedPlan.id).sort((left, right) => left.sorrend - right.sorrend);
  }, [days, selectedPlan]);

  const selectedPlanExercises = useMemo(() => {
    if (!selectedPlan) {
      return [] as SavedPlanExercise[];
    }

    return planExercises
      .filter((exercise) => selectedPlanDays.some((day) => day.id === exercise.edzes_nap_id))
      .sort((left, right) => left.sorrend - right.sorrend);
  }, [planExercises, selectedPlan, selectedPlanDays]);

  const exerciseLookup = useMemo(() => {
    return new Map(gyakorlatok.map((exercise) => [exercise.id, exercise]));
  }, [gyakorlatok]);

  const editingPlan = useMemo(() => {
    return plans.find((plan) => plan.id === editingPlanId) ?? null;
  }, [editingPlanId, plans]);

  const activePlans = plans.filter((plan) => plan.aktiv !== false).length;

  const loadData = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    if (!currentUser?.id) {
      setPlans([]);
      setDays([]);
      setPlanExercises([]);
      setIsLoading(false);
      return;
    }

    const authHeaders = {
      'X-User-Id': String(currentUser.id),
    };

    try {
      const [planResponse, dayResponse, exerciseResponse, exerciseCatalogResponse, userResponse] = await Promise.all([
        fetch(`${API_URL}/edzestervek`, { headers: authHeaders }),
        fetch(`${API_URL}/edzes-napok`),
        fetch(`${API_URL}/edzesterv-gyakorlatok`),
        fetch(`${API_URL}/gyakorlatok`),
        fetch(`${API_URL}/userek`),
      ]);

      if (!planResponse.ok) {
        throw new Error(await extractFriendlyErrorMessage(planResponse, 'Nem sikerült betölteni az edzésterveket.'));
      }

      if (!dayResponse.ok) {
        throw new Error(await extractFriendlyErrorMessage(dayResponse, 'Nem sikerült betölteni az edzésnapokat.'));
      }

      if (!exerciseResponse.ok) {
        throw new Error(await extractFriendlyErrorMessage(exerciseResponse, 'Nem sikerült betölteni a tervgyakorlatokat.'));
      }

      if (!exerciseCatalogResponse.ok) {
        throw new Error(await extractFriendlyErrorMessage(exerciseCatalogResponse, 'Nem sikerült betölteni a gyakorlatokat.'));
      }

      if (!userResponse.ok) {
        throw new Error(await extractFriendlyErrorMessage(userResponse, 'Nem sikerült betölteni a felhasználókat.'));
      }

      const [plansData, daysData, exercisesData, exerciseCatalogData, usersData] = (await Promise.all([
        planResponse.json(),
        dayResponse.json(),
        exerciseResponse.json(),
        exerciseCatalogResponse.json(),
        userResponse.json(),
      ])) as [SavedPlan[], SavedDay[], SavedPlanExercise[], ExerciseCatalogItem[], AvailableUser[]];

      setPlans(plansData);
      setDays(daysData);
      setPlanExercises(exercisesData);
      setGyakorlatok(exerciseCatalogData);
      setUsers(usersData);

      if (!planUserId && (currentUser?.id || usersData[0]?.id)) {
        setPlanUserId(String(currentUser?.id ?? usersData[0].id));
      }

      if (!selectedPlanIdForList && plansData.length > 0) {
        setSelectedPlanIdForList(plansData[0].id);
      }

      if (selectedPlanIdForList && !plansData.some((plan) => plan.id === selectedPlanIdForList) && plansData.length > 0) {
        setSelectedPlanIdForList(plansData[0].id);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Nem sikerült betölteni az edzésterv adatokat.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
    // The first render loads the full reference set for the form and list.
    // Re-runs whenever the logged-in user changes so the visible plans update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  useEffect(() => {
    if (currentUser?.id) {
      setPlanUserId(String(currentUser.id));
    }
  }, [currentUser?.id]);

  useEffect(() => {
    setDraftDays((currentDays) => makeDraftDays(planDayCount, currentDays, defaultExerciseId));
  }, [defaultExerciseId, planDayCount]);

  useEffect(() => {
    if (!planUserId && users.length > 0) {
      setPlanUserId(String(currentUser?.id ?? users[0].id));
    }
  }, [currentUser?.id, planUserId, users]);

  const updateDraftDay = (dayId: string, updater: (day: DraftDay) => DraftDay) => {
    setDraftDays((currentDays) => currentDays.map((day) => (day.draftId === dayId ? updater(day) : day)));
  };

  const updateDraftExercise = (dayId: string, exerciseId: string, updater: (exercise: DraftExercise) => DraftExercise) => {
    setDraftDays((currentDays) =>
      currentDays.map((day) => {
        if (day.draftId !== dayId) {
          return day;
        }

        return {
          ...day,
          exercises: day.exercises.map((exercise) => (exercise.draftId === exerciseId ? updater(exercise) : exercise)),
        };
      }),
    );
  };

  const addExerciseToDay = (dayId: string) => {
    setDraftDays((currentDays) =>
      currentDays.map((day) => {
        if (day.draftId !== dayId) {
          return day;
        }

        return {
          ...day,
          exercises: [...day.exercises, makeDraftExercise(day.pendingGyakorlatId || defaultExerciseId)],
        };
      }),
    );
  };

  const removeExerciseFromDay = (dayId: string, exerciseId: string) => {
    setDraftDays((currentDays) =>
      currentDays.map((day) => {
        if (day.draftId !== dayId) {
          return day;
        }

        return {
          ...day,
          exercises: day.exercises.filter((exercise) => exercise.draftId !== exerciseId),
        };
      }),
    );
  };

  const moveExercise = (dayId: string, exerciseIndex: number, direction: -1 | 1) => {
    setDraftDays((currentDays) =>
      currentDays.map((day) => {
        if (day.draftId !== dayId) {
          return day;
        }

        const nextExercises = [...day.exercises];
        const targetIndex = exerciseIndex + direction;

        if (targetIndex < 0 || targetIndex >= nextExercises.length) {
          return day;
        }

        const [item] = nextExercises.splice(exerciseIndex, 1);
        nextExercises.splice(targetIndex, 0, item);

        return {
          ...day,
          exercises: nextExercises,
        };
      }),
    );
  };

  const handleStartEdit = (plan: SavedPlan) => {
    if (!currentUser?.id || plan.user_id !== currentUser.id) {
      setErrorMessage('Csak a saját edzéstervedet módosíthatod.');
      return;
    }

    const planDays = days
      .filter((day) => day.edzesterv_id === plan.id)
      .sort((left, right) => left.sorrend - right.sorrend);

    const loadedDays: DraftDay[] =
      planDays.length > 0
        ? planDays.map((day) => {
            const dayExercises = planExercises
              .filter((exercise) => exercise.edzes_nap_id === day.id)
              .sort((left, right) => left.sorrend - right.sorrend);

            return {
              draftId: makeId(),
              nev: day.nev,
              pendingGyakorlatId: dayExercises[0]?.gyakorlat_id.toString() ?? defaultExerciseId,
              exercises: dayExercises.map((exercise) => ({
                draftId: makeId(),
                gyakorlatId: exercise.gyakorlat_id.toString(),
                sorozatszam: exercise.sorozatszam?.toString() ?? '3',
                ismetlesszamMin: exercise.ismetlesszam_min?.toString() ?? '8',
                ismetlesszamMax: exercise.ismetlesszam_max?.toString() ?? '12',
                pihenoMasodperc: exercise.piheno_masodperc?.toString() ?? '90',
                megjegyzese: exercise.megjegyzese ?? '',
              })),
            } satisfies DraftDay;
          })
        : makeDraftDays(Math.max(planDayCount, 1), [], defaultExerciseId);

    setEditingPlanId(plan.id);
    setPlanName(plan.nev);
    setPlanDescription(plan.leiras ?? '');
    setPlanDayCount(Math.max(planDays.length, 1));
    setPlanUserId(String(plan.user_id));
    setPlanActive(plan.aktiv !== false);
    setPlanPublic(plan.publikus === true);
    setDraftDays(loadedDays);
    setErrorMessage(null);
    setStatusMessage(null);
    setActiveTab('create');
  };

  const handleCancelEdit = () => {
    setEditingPlanId(null);
    setPlanName('');
    setPlanDescription('');
    setPlanDayCount(3);
    setPlanActive(true);
    setPlanPublic(false);
    setDraftDays(makeDraftDays(3, [], defaultExerciseId));
    setErrorMessage(null);
    setStatusMessage(null);
  };

  const handleDelete = async (planId: number) => {
    if (!currentUser?.id) {
      setErrorMessage('Bejelentkezés szükséges az edzésterv törléséhez.');
      return;
    }

    const plan = plans.find((candidate) => candidate.id === planId);
    const isConfirmed = window.confirm(
      `Biztosan törölni szeretnéd a(z) "${plan?.nev ?? `#${planId}`}" edzéstervet? A művelet nem visszavonható.`,
    );

    if (!isConfirmed) {
      return;
    }

    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const response = await fetch(`${API_URL}/edzestervek/${planId}`, {
        method: 'DELETE',
        headers: {
          'X-User-Id': String(currentUser.id),
        },
      });

      if (!response.ok) {
        throw new Error(await extractFriendlyErrorMessage(response, 'Nem sikerült törölni az edzéstervet.'));
      }

      if (editingPlanId === planId) {
        handleCancelEdit();
      }

      setStatusMessage('Az edzésterv sikeresen törölve.');
      await loadData();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Nem sikerült törölni az edzéstervet.');
    }
  };

  const handleCreateSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!currentUser?.id) {
      setErrorMessage('Bejelentkezés szükséges az edzésterv létrehozásához.');
      return;
    }

    if (!planUserId) {
      setErrorMessage('Válassz egy felhasználót az edzésterv mentéséhez.');
      return;
    }

    if (planName.trim().length === 0) {
      setErrorMessage('Az edzésterv neve kötelező.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      let targetPlanId: number;

      if (editingPlanId !== null) {
        const planResponse = await fetch(`${API_URL}/edzestervek/${editingPlanId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': String(currentUser.id),
          },
          body: JSON.stringify({
            user_id: Number(planUserId),
            nev: planName.trim(),
            leiras: planDescription.trim() || undefined,
            aktiv: planActive,
            publikus: planPublic,
          }),
        });

        if (!planResponse.ok) {
          throw new Error(await extractFriendlyErrorMessage(planResponse, 'Nem sikerült módosítani az edzéstervet.'));
        }

        targetPlanId = editingPlanId;

        const existingDays = days.filter((day) => day.edzesterv_id === editingPlanId);

        for (const dayToDelete of existingDays) {
          const dayDeleteResponse = await fetch(`${API_URL}/edzes-napok/${dayToDelete.id}`, {
            method: 'DELETE',
          });

          if (!dayDeleteResponse.ok) {
            throw new Error(
              await extractFriendlyErrorMessage(dayDeleteResponse, 'Nem sikerült törölni a régi edzésnapokat.'),
            );
          }
        }
      } else {
        const planResponse = await fetch(`${API_URL}/edzestervek`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': String(currentUser.id),
          },
          body: JSON.stringify({
            user_id: Number(planUserId),
            nev: planName.trim(),
            leiras: planDescription.trim() || undefined,
            aktiv: planActive,
            publikus: planPublic,
          }),
        });

        if (!planResponse.ok) {
          throw new Error(await extractFriendlyErrorMessage(planResponse, 'Nem sikerült létrehozni az edzéstervet.'));
        }

        const createdPlan = (await planResponse.json()) as SavedPlan;
        targetPlanId = createdPlan.id;
      }

      for (let dayIndex = 0; dayIndex < draftDays.length; dayIndex += 1) {
        const draftDay = draftDays[dayIndex];
        const dayResponse = await fetch(`${API_URL}/edzes-napok`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            edzesterv_id: targetPlanId,
            nev: draftDay.nev.trim() || `${dayIndex + 1}. Nap`,
            sorrend: dayIndex + 1,
          }),
        });

        if (!dayResponse.ok) {
          throw new Error(await extractFriendlyErrorMessage(dayResponse, 'Nem sikerült létrehozni az edzésnapot.'));
        }

        const createdDay = (await dayResponse.json()) as SavedDay;

        for (let exerciseIndex = 0; exerciseIndex < draftDay.exercises.length; exerciseIndex += 1) {
          const draftExercise = draftDay.exercises[exerciseIndex];

          if (!draftExercise.gyakorlatId) {
            continue;
          }

          const exerciseResponse = await fetch(`${API_URL}/edzesterv-gyakorlatok`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              edzes_nap_id: createdDay.id,
              gyakorlat_id: Number(draftExercise.gyakorlatId),
              sorrend: exerciseIndex + 1,
              sorozatszam: draftExercise.sorozatszam ? Number(draftExercise.sorozatszam) : undefined,
              ismetlesszam_min: draftExercise.ismetlesszamMin ? Number(draftExercise.ismetlesszamMin) : undefined,
              ismetlesszam_max: draftExercise.ismetlesszamMax ? Number(draftExercise.ismetlesszamMax) : undefined,
              piheno_masodperc: draftExercise.pihenoMasodperc ? Number(draftExercise.pihenoMasodperc) : undefined,
              megjegyzese: draftExercise.megjegyzese.trim() || undefined,
            }),
          });

          if (!exerciseResponse.ok) {
            throw new Error(
              await extractFriendlyErrorMessage(exerciseResponse, 'Nem sikerült létrehozni az edzésterv gyakorlatot.'),
            );
          }
        }
      }

      const wasEditing = editingPlanId !== null;

      handleCancelEdit();

      if (wasEditing) {
        setStatusMessage('Az edzésterv sikeresen módosítva és elmentve a backendbe.');
      } else {
        setStatusMessage('Az edzésterv sikeresen létrejött és elmentve a backendbe.');
      }

      setSelectedPlanIdForList(targetPlanId);
      setActiveTab('list');

      await loadData();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Nem sikerült menteni az edzéstervet.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderExerciseCard = (exercise: SavedPlanExercise, rowIndex: number) => {
    const catalogItem = exerciseLookup.get(exercise.gyakorlat_id) ?? exercise.gyakorlatok;
    const exerciseTitle = catalogItem?.nev ?? `Gyakorlat #${exercise.gyakorlat_id}`;

    return (
      <Card key={exercise.id} className="mb-2 border-0 shadow-sm">
        <Card.Body className="py-2">
          <div className="d-flex justify-content-between gap-3">
            <div>
              <div className="fw-semibold">{exerciseTitle}</div>
              <div className="text-secondary small">{formatMuscleGroups(catalogItem)}</div>
              <div className="text-secondary small">
                Sorozat: {exercise.sorozatszam ?? '—'} · Ism.: {exercise.ismetlesszam_min ?? '—'}-
                {exercise.ismetlesszam_max ?? '—'} · Pihenő: {exercise.piheno_masodperc ?? '—'} mp
              </div>
            </div>
            <Badge bg="light" text="dark" className="align-self-start">
              #{rowIndex + 1}
            </Badge>
          </div>
        </Card.Body>
      </Card>
    );
  };

  return (
    <section className="plan-section py-5">
      <div className="plan-section__glow" />
      <Container className="position-relative">
        <Row className="align-items-end g-4 mb-4">
          <Col lg={8}>
            
          </Col>
          <Col lg={4} className="text-lg-end">
            <Button variant="dark" className="px-4" onClick={() => void loadData()} disabled={isLoading}>
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

        {!currentUser && (
          <Alert variant="warning" className="shadow-sm">
            Az edzéstervek megtekintéséhez és létrehozásához be kell jelentkezned. Kattints a <strong>Profilom</strong> menüpontra a bejelentkezéshez.
          </Alert>
        )}

        <Tabs activeKey={activeTab} onSelect={(key) => setActiveTab((key as ActiveTab) ?? 'create')} className="mb-4">
          <Tab eventKey="create" title="Edzésterv létrehozása">
            <Card className="plan-panel border-0">
              <Card.Body>
                {editingPlan && (
                  <Alert variant="info" className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                    <div className="mb-0">
                      <strong>Módosítás alatt:</strong> {editingPlan.nev}
                    </div>
                    <Button variant="outline-secondary" size="sm" type="button" onClick={handleCancelEdit}>
                      Módosítás megszakítása
                    </Button>
                  </Alert>
                )}
                <Form onSubmit={handleCreateSubmit}>
                  <Row className="g-4 mb-4">
                    <Col lg={4}>
                      <Form.Group controlId="planName">
                        <Form.Label>Terv neve</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Például: Push-Pull-Legs"
                          value={planName}
                          onChange={(event) => setPlanName(event.target.value)}
                          maxLength={100}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col lg={4}>
                      <Form.Group controlId="planDescription">
                        <Form.Label>Leírás</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Rövid leírás a terv céljáról"
                          value={planDescription}
                          onChange={(event) => setPlanDescription(event.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col lg={2}>
                      <Form.Group controlId="planDayCount">
                        <Form.Label>Hány napos legyen?</Form.Label>
                        <Form.Select
                          value={planDayCount}
                          onChange={(event) => setPlanDayCount(Number(event.target.value))}
                          required
                        >
                          {[1, 2, 3, 4, 5, 6, 7].map((count) => (
                            <option key={count} value={count}>
                              {count} nap
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col lg={2}>
                      <Form.Group controlId="planUserId">
                        <Form.Label>Felhasználó</Form.Label>
                        <Form.Select value={planUserId} onChange={(event) => setPlanUserId(event.target.value)} required>
                          <option value="">Válassz</option>
                          {users.map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.nev} · ID {user.id}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="d-flex gap-4 mb-4">
                    <Form.Check
                      type="switch"
                      id="plan-active-switch"
                      label="Aktív terv"
                      checked={planActive}
                      onChange={(event) => setPlanActive(event.target.checked)}
                    />
                    <Form.Check
                      type="switch"
                      id="plan-public-switch"
                      label="Publikus (mindenki láthatja)"
                      checked={planPublic}
                      onChange={(event) => setPlanPublic(event.target.checked)}
                    />
                  </div>

                  <Row className="g-4">
                    {draftDays.map((day, dayIndex) => (
                      <Col key={day.draftId} lg={4} md={6}>
                        <Card className="day-card border-0 shadow-sm h-100">
                          <Card.Header className="bg-dark text-white">
                            <div className="fw-semibold">{dayIndex + 1}. Nap</div>
                            
                          </Card.Header>
                          <Card.Body>
                            <Form.Control
                              className="mb-3"
                              type="text"
                              value={day.nev}
                              onChange={(event) =>
                                updateDraftDay(day.draftId, (current) => ({
                                  ...current,
                                  nev: event.target.value,
                                }))
                              }
                              placeholder={`${dayIndex + 1}. Nap neve`}
                            />

                            <div className="d-flex justify-content-center mb-3">
                              <Button
                                variant="outline-primary"
                                onClick={() => addExerciseToDay(day.draftId)}
                                disabled={gyakorlatok.length === 0}
                                title="Gyakorlat hozzáadása"
                              >
                                +
                              </Button>
                            </div>

                            {day.exercises.length === 0 ? (
                              <div className="plan-empty">Még nincs gyakorlat hozzáadva ehhez a naphoz.</div>
                            ) : (
                              <div className="d-grid gap-2">
                                {day.exercises.map((exercise, exerciseIndex) => (
                                  <Card key={exercise.draftId} className="day-card border-0 shadow-sm">
                                    <Card.Body className="p-3">
                                      <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
                                        <Badge bg="dark">#{exerciseIndex + 1}</Badge>
                                        <div className="btn-group btn-group-sm">
                                          <Button
                                            variant="outline-secondary"
                                            type="button"
                                            onClick={() => moveExercise(day.draftId, exerciseIndex, -1)}
                                            disabled={exerciseIndex === 0}
                                          >
                                            Fel
                                          </Button>
                                          <Button
                                            variant="outline-secondary"
                                            type="button"
                                            onClick={() => moveExercise(day.draftId, exerciseIndex, 1)}
                                            disabled={exerciseIndex === day.exercises.length - 1}
                                          >
                                            Le
                                          </Button>
                                          <Button
                                            variant="outline-danger"
                                            type="button"
                                            onClick={() => removeExerciseFromDay(day.draftId, exercise.draftId)}
                                          >
                                            Törlés
                                          </Button>
                                        </div>
                                      </div>

                                      <Form.Select
                                        className="mb-3"
                                        value={exercise.gyakorlatId || defaultExerciseId}
                                        onChange={(event) =>
                                          updateDraftExercise(day.draftId, exercise.draftId, (current) => ({
                                            ...current,
                                            gyakorlatId: event.target.value,
                                          }))
                                        }
                                        disabled={gyakorlatok.length === 0}
                                      >
                                        {gyakorlatok.length === 0 ? (
                                          <option value="">Nincs betöltött gyakorlat</option>
                                        ) : (
                                          gyakorlatok.map((catalogExercise) => (
                                            <option key={catalogExercise.id} value={catalogExercise.id}>
                                              {catalogExercise.nev}
                                            </option>
                                          ))
                                        )}
                                      </Form.Select>

                                      <Row className="g-2 mb-2">
                                        <Col xs={4}>
                                          <Form.Control
                                            type="number"
                                            min={1}
                                            value={exercise.sorozatszam}
                                            onChange={(event) =>
                                              updateDraftExercise(day.draftId, exercise.draftId, (current) => ({
                                                ...current,
                                                sorozatszam: event.target.value,
                                              }))
                                            }
                                            placeholder="Set"
                                          />
                                        </Col>
                                        <Col xs={4}>
                                          <Form.Control
                                            type="number"
                                            min={1}
                                            value={exercise.ismetlesszamMin}
                                            onChange={(event) =>
                                              updateDraftExercise(day.draftId, exercise.draftId, (current) => ({
                                                ...current,
                                                ismetlesszamMin: event.target.value,
                                              }))
                                            }
                                            placeholder="Reps min"
                                          />
                                        </Col>
                                        <Col xs={4}>
                                          <Form.Control
                                            type="number"
                                            min={1}
                                            value={exercise.ismetlesszamMax}
                                            onChange={(event) =>
                                              updateDraftExercise(day.draftId, exercise.draftId, (current) => ({
                                                ...current,
                                                ismetlesszamMax: event.target.value,
                                              }))
                                            }
                                            placeholder="Reps max"
                                          />
                                        </Col>
                                      </Row>

                                      <Row className="g-2">
                                        <Col xs={6}>
                                          <Form.Control
                                            type="number"
                                            min={0}
                                            value={exercise.pihenoMasodperc}
                                            onChange={(event) =>
                                              updateDraftExercise(day.draftId, exercise.draftId, (current) => ({
                                                ...current,
                                                pihenoMasodperc: event.target.value,
                                              }))
                                            }
                                            placeholder="Pihenő (mp)"
                                          />
                                        </Col>
                                        <Col xs={6}>
                                          <Form.Control
                                            type="text"
                                            value={exercise.megjegyzese}
                                            onChange={(event) =>
                                              updateDraftExercise(day.draftId, exercise.draftId, (current) => ({
                                                ...current,
                                                megjegyzese: event.target.value,
                                              }))
                                            }
                                            placeholder="Megjegyzés"
                                          />
                                        </Col>
                                      </Row>
                                    </Card.Body>
                                  </Card>
                                ))}
                              </div>
                            )}
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>

                  <div className="d-flex justify-content-end gap-2">
                    {editingPlanId !== null && (
                      <Button
                        type="button"
                        variant="outline-secondary"
                        size="lg"
                        onClick={handleCancelEdit}
                        disabled={isSaving}
                      >
                        Mégse
                      </Button>
                    )}
                    <Button type="submit" variant="primary" size="lg" disabled={isSaving || gyakorlatok.length === 0}>
                      {isSaving ? 'Mentés...' : editingPlanId !== null ? 'Módosítás mentése' : 'Edzésterv mentése'}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Tab>

          <Tab eventKey="list" title="Mentett edzéstervek">
            <Row className="g-4">
              <Col xl={4} lg={5}>
                <Card className="plan-panel h-100">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-4">
                      <div>
                        <div className="text-uppercase text-secondary small fw-semibold">Összes terv</div>
                        <div className="display-6 fw-bold mb-0">{plans.length}</div>
                      </div>
                      <Badge bg="dark" className="rounded-pill px-3 py-2">
                        Aktív {activePlans}
                      </Badge>
                    </div>

                    <div className="plan-list">
                      <div className="d-flex align-items-center justify-content-between mb-3 gap-3">
                        <h3 className="h5 mb-0">Mentett tervek</h3>
                        <span className="text-secondary small">Kattints egy tervre a részletekhez</span>
                      </div>

                      {isLoading && plans.length === 0 ? (
                        <div className="plan-empty">
                          <Spinner animation="border" size="sm" className="me-2" /> Betöltés...
                        </div>
                      ) : plans.length === 0 ? (
                        <div className="plan-empty">Még nincs mentett edzésterv.</div>
                      ) : (
                        plans.map((plan) => {
                          const planDays = days.filter((day) => day.edzesterv_id === plan.id);
                          const exerciseCount = planExercises.filter((exercise) =>
                            planDays.some((day) => day.id === exercise.edzes_nap_id),
                          ).length;

                          return (
                            <button
                              key={plan.id}
                              type="button"
                              className={`plan-card ${selectedPlan?.id === plan.id ? 'is-selected' : ''}`}
                              onClick={() => {
                                setSelectedPlanIdForList(plan.id);
                                setActiveTab('list');
                              }}
                            >
                              <div className="d-flex justify-content-between align-items-start gap-3">
                                <div>
                                  <div className="fw-semibold fs-6">{plan.nev}</div>
                                  <div className="plan-card__meta">
                                    {plan.userek?.nev ?? `User #${plan.user_id}`} · {formatDate(plan.letrehozva)}
                                  </div>
                                </div>
                                <div className="d-flex flex-column align-items-end gap-1">
                                  <Badge bg={plan.aktiv === false ? 'secondary' : 'success'}>
                                    {plan.aktiv === false ? 'Inaktív' : 'Aktív'}
                                  </Badge>
                                  {plan.publikus === true && (
                                    <Badge bg="info" text="dark">
                                      Publikus
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="plan-card__stats mt-3">
                                <span>{planDays.length} nap</span>
                                <span>{exerciseCount} gyakorlat</span>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col xl={8} lg={7}>
                <Card className="plan-detail h-100">
                  <Card.Body>
                    {!selectedPlan ? (
                      <div className="plan-empty plan-empty--large">Válassz egy tervet a bal oldali listából.</div>
                    ) : (
                      <>
                        <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
                          <div>
                            <Badge bg={selectedPlan.aktiv === false ? 'secondary' : 'success'} className="mb-3">
                              {selectedPlan.aktiv === false ? 'Inaktív terv' : 'Aktív terv'}
                            </Badge>
                            <h3 className="h2 fw-bold mb-2">{selectedPlan.nev}</h3>
                            <p className="text-secondary mb-0">{selectedPlan.leiras || 'Ehhez a tervhez még nincs leírás.'}</p>
                          </div>
                          <div className="d-flex flex-column align-items-end gap-3">
                            <div className="plan-detail__date text-end">
                              <div className="text-uppercase small text-secondary fw-semibold">Létrehozva</div>
                              <div className="fs-5 fw-semibold">{formatDate(selectedPlan.letrehozva)}</div>
                              <div className="text-secondary small mt-1">User ID: {selectedPlan.user_id}</div>
                            </div>
                            <div className="d-flex gap-2">
                              <Button
                                type="button"
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleStartEdit(selectedPlan)}
                              >
                                Módosítás
                              </Button>
                              <Button
                                type="button"
                                variant="outline-danger"
                                size="sm"
                                onClick={() => void handleDelete(selectedPlan.id)}
                              >
                                Törlés
                              </Button>
                            </div>
                          </div>
                        </div>

                        <Row className="g-3 mb-4">
                          <Col md={4}>
                            <div className="metric-card">
                              <div className="metric-card__label">Edzésnapok</div>
                              <div className="metric-card__value">{selectedPlanDays.length}</div>
                            </div>
                          </Col>
                          <Col md={4}>
                            <div className="metric-card">
                              <div className="metric-card__label">Gyakorlatok</div>
                              <div className="metric-card__value">{selectedPlanExercises.length}</div>
                            </div>
                          </Col>
                          <Col md={4}>
                            <div className="metric-card">
                              <div className="metric-card__label">Tulajdonos</div>
                              <div className="metric-card__value metric-card__value--small">
                                {selectedPlan.userek?.nev ?? currentUser?.nev ?? 'Ismeretlen'}
                              </div>
                            </div>
                          </Col>
                        </Row>

                        {selectedPlanDays.length === 0 ? (
                          <div className="plan-empty plan-empty--large">Ehhez a tervhez még nincs felvett edzésnap.</div>
                        ) : (
                          <Table responsive bordered className="align-middle">
                            <thead>
                              <tr>
                                <th style={{ width: '18%' }}>Mező</th>
                                {selectedPlanDays.map((day) => (
                                  <th key={day.id} className="text-center">
                                    {day.sorrend}. Nap
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <th scope="row">Gyakorlat neve</th>
                                {selectedPlanDays.map((day) => {
                                  const dayExercises = selectedPlanExercises
                                    .filter((exercise) => exercise.edzes_nap_id === day.id)
                                    .sort((left, right) => left.sorrend - right.sorrend);

                                  return (
                                    <td key={day.id} className="align-top">
                                      {dayExercises.length === 0 ? (
                                        <span className="text-secondary">Nincs gyakorlat.</span>
                                      ) : (
                                        <div className="d-grid gap-2">
                                          {dayExercises.map((exercise, rowIndex) => renderExerciseCard(exercise, rowIndex))}
                                        </div>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                              <tr>
                                <th scope="row">Célzott izomcsoport</th>
                                {selectedPlanDays.map((day) => {
                                  const dayExercises = selectedPlanExercises
                                    .filter((exercise) => exercise.edzes_nap_id === day.id)
                                    .sort((left, right) => left.sorrend - right.sorrend);

                                  return (
                                    <td key={day.id} className="align-top">
                                      {dayExercises.length === 0 ? (
                                        <span className="text-secondary">—</span>
                                      ) : (
                                        <div className="d-grid gap-2">
                                          {dayExercises.map((exercise) => {
                                            const catalogItem = exerciseLookup.get(exercise.gyakorlat_id) ?? exercise.gyakorlatok;

                                            return (
                                              <div key={exercise.id} className="exercise-item">
                                                {formatMuscleGroups(catalogItem)}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                              <tr>
                                <th scope="row">Sorozat x Ismétlés</th>
                                {selectedPlanDays.map((day) => {
                                  const dayExercises = selectedPlanExercises
                                    .filter((exercise) => exercise.edzes_nap_id === day.id)
                                    .sort((left, right) => left.sorrend - right.sorrend);

                                  return (
                                    <td key={day.id} className="align-top">
                                      {dayExercises.length === 0 ? (
                                        <span className="text-secondary">—</span>
                                      ) : (
                                        <div className="d-grid gap-2">
                                          {dayExercises.map((exercise) => (
                                            <div key={exercise.id} className="exercise-item">
                                              {exercise.sorozatszam ?? '—'} x {exercise.ismetlesszam_min ?? '—'}-
                                              {exercise.ismetlesszam_max ?? '—'}
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                              <tr>
                                <th scope="row">Pihenőidő</th>
                                {selectedPlanDays.map((day) => {
                                  const dayExercises = selectedPlanExercises
                                    .filter((exercise) => exercise.edzes_nap_id === day.id)
                                    .sort((left, right) => left.sorrend - right.sorrend);

                                  return (
                                    <td key={day.id} className="align-top">
                                      {dayExercises.length === 0 ? (
                                        <span className="text-secondary">—</span>
                                      ) : (
                                        <div className="d-grid gap-2">
                                          {dayExercises.map((exercise) => (
                                            <div key={exercise.id} className="exercise-item">
                                              {exercise.piheno_masodperc ?? '—'} mp
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            </tbody>
                          </Table>
                        )}
                      </>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab>
        </Tabs>
      </Container>
    </section>
  );
}