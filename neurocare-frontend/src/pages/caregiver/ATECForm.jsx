import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const SUBSCALE_I_SPEECH = {
  title: 'I. Speech / Language / Communication',
  scoring: ['Not true', 'Somewhat true', 'Very true'],
  items: [
    'Knows own name',
    'Responds to "No" or "Stop"',
    'Can follow some commands',
    'Can use one word at a time (No!, Eat, Water, etc.)',
    'Can use 2 words at a time (Don\'t want, Go home)',
    'Can use 3 words at a time (Want more milk)',
    'Knows 10 or more words',
    'Can use sentences with 4 or more words',
    'Explains what he/she wants',
    'Asks meaningful questions',
    'Speech tends to be meaningful/relevant',
    'Often uses several successive sentences',
    'Carries on fairly good conversation',
    'Has normal ability to communicate for his/her age',
  ],
};

const SUBSCALE_II_SOCIABILITY = {
  title: 'II. Sociability',
  scoring: ['Not descriptive', 'Somewhat descriptive', 'Very descriptive'],
  items: [
    'Seems to be in a shell — you cannot reach him/her',
    'Ignores other people',
    'Pays little or no attention when addressed',
    'Uncooperative and resistant',
    'No eye contact',
    'Prefers to be left alone',
    'Shows no affection',
    'Fails to greet parents',
    'Avoids contact with others',
    'Does not imitate',
    'Dislikes being held/cuddled',
    'Does not share or show',
    'Does not wave "bye bye"',
    'Disagreeable / not compliant',
    'Temper tantrums',
    'Lacks friends/companions',
    'Rarely smiles',
    'Insensitive to other\'s feelings',
    'Indifferent to being liked',
    'Indifferent if parent(s) leave',
  ],
};

const SUBSCALE_III_SENSORY = {
  title: 'III. Sensory / Cognitive Awareness',
  scoring: ['Not descriptive', 'Somewhat descriptive', 'Very descriptive'],
  items: [
    'Responds to own name',
    'Responds to praise',
    'Looks at people and animals',
    'Looks at pictures (and T.V.)',
    'Does drawing, coloring, art',
    'Plays with toys appropriately',
    'Appropriate facial expression',
    'Understands stories on T.V.',
    'Understands explanations',
    'Aware of environment',
    'Aware of danger',
    'Shows imagination',
    'Initiates activities',
    'Dresses self',
    'Curious, interested',
    'Venturesome — explores',
    'Tuned in — Not spacey',
    'Looks where others are looking',
  ],
};

const SUBSCALE_IV_HEALTH = {
  title: 'IV. Health / Physical / Behavior',
  scoring: ['Not a problem', 'Minor problem', 'Moderate problem', 'Serious problem'],
  items: [
    'Bed-wetting',
    'Wets pants / diapers',
    'Soils pants / diapers',
    'Diarrhea',
    'Constipation',
    'Sleep problems',
    'Eats too much / too little',
    'Extremely limited diet',
    'Hyperactive',
    'Lethargic',
    'Hits or injures self',
    'Hits or injures others',
    'Destructive',
    'Sound-sensitive',
    'Anxious / fearful',
    'Unhappy / crying',
    'Seizures',
    'Obsessive speech',
    'Rigid routines',
    'Shouts / screams',
    'Demands sameness',
    'Often agitated',
    'Not sensitive to pain',
    'Hooked or fixated on certain objects / topics',
    'Repetitive movements (stimming, rocking, etc.)',
  ],
};

const ALL_SUBSCALES = [SUBSCALE_I_SPEECH, SUBSCALE_II_SOCIABILITY, SUBSCALE_III_SENSORY, SUBSCALE_IV_HEALTH];

export default function ATECForm() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [currentSubscale, setCurrentSubscale] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [scores, setScores] = useState(null);
  const navigate = useNavigate();
  const topRef = useRef(null);

  useEffect(() => {
    api.get('/patients').then(res => {
      const list = res.data.patients || [];
      setPatients(list);
      if (list.length === 1) setSelectedPatient(list[0]);
    });
  }, []);

  const subscale = ALL_SUBSCALES[currentSubscale];
  const subscaleKey = `s${currentSubscale}`;

  const setAnswer = (itemIdx, value) => {
    setAnswers(prev => ({
      ...prev,
      [`${subscaleKey}_${itemIdx}`]: value,
    }));
  };

  const getAnswer = (itemIdx) => answers[`${subscaleKey}_${itemIdx}`];

  const isSubscaleComplete = () =>
    subscale.items.every((_, idx) => getAnswer(idx) !== undefined);

  const allComplete = () =>
    ALL_SUBSCALES.every((sub, si) =>
      sub.items.every((_, ii) => answers[`s${si}_${ii}`] !== undefined)
    );

  const computeSubscaleScore = (subscaleIdx) => {
    const sub = ALL_SUBSCALES[subscaleIdx];
    let total = 0;
    sub.items.forEach((_, ii) => {
      const val = answers[`s${subscaleIdx}_${ii}`];
      if (val !== undefined) total += val;
    });
    return total;
  };

  const handleNext = () => {
    if (currentSubscale < 3) {
      setCurrentSubscale(currentSubscale + 1);
      topRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (currentSubscale > 0) {
      setCurrentSubscale(currentSubscale - 1);
      topRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (!allComplete()) return;
    setSubmitting(true);
    const speech = computeSubscaleScore(0);
    const sociability = computeSubscaleScore(1);
    const sensory = computeSubscaleScore(2);
    const health = computeSubscaleScore(3);
    try {
      const res = await api.post('/atec/submit', {
        patient_id: selectedPatient.id,
        speech_language_communication: speech,
        sociability: sociability,
        sensory_cognitive_awareness: sensory,
        health_physical_behavior: health,
      });
      setScores(res.data);
      setDone(true);
    } catch (err) {
      console.error('Failed to submit ATEC:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (done && scores) {
    return (
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="nc-card text-center">
          <div className="text-5xl mb-3">📋</div>
          <h2 className="text-xl font-bold text-nc-blue-deep mb-4">ATEC Assessment Complete</h2>
          <div className="space-y-2 text-left max-w-xs mx-auto">
            <div className="flex justify-between text-sm">
              <span className="text-nc-grey-mid">Speech/Language</span>
              <span className="font-bold">{scores.speech_language_communication}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-nc-grey-mid">Sociability</span>
              <span className="font-bold">{scores.sociability}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-nc-grey-mid">Sensory/Cognitive</span>
              <span className="font-bold">{scores.sensory_cognitive_awareness}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-nc-grey-mid">Health/Physical</span>
              <span className="font-bold">{scores.health_physical_behavior}</span>
            </div>
            <div className="border-t border-nc-grey-pale mt-2 pt-2 flex justify-between">
              <span className="font-bold text-nc-blue-deep">Total</span>
              <span className="font-bold text-nc-blue-deep text-lg">{scores.total_score}</span>
            </div>
          </div>
          <button onClick={() => navigate('/caregiver')}
            className="nc-btn-primary mt-6">
            Done
          </button>
        </div>
      </div>
    );
  }

  if (!selectedPatient) {
    return (
      <div className="max-w-lg mx-auto px-4 py-6">
        <button onClick={() => navigate('/caregiver')}
          className="text-nc-blue-mid mb-4 font-bold text-sm">← Back</button>
        <h1 className="text-2xl font-bold text-nc-blue-deep mb-4">ATEC Assessment</h1>
        <p className="text-nc-grey-mid mb-4">Select a child:</p>
        <div className="space-y-2">
          {patients.map(p => (
            <button key={p.id} onClick={() => setSelectedPatient(p)}
              className="nc-card w-full text-left font-bold text-nc-blue-deep transition-all duration-safe hover:shadow-md">
              {p.name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const progress = Object.keys(answers).length;
  const totalItems = ALL_SUBSCALES.reduce((a, s) => a + s.items.length, 0);
  const pct = Math.round((progress / totalItems) * 100);

  return (
    <div className="max-w-lg mx-auto px-4 py-6" ref={topRef}>
      <button onClick={() => navigate('/caregiver')}
        className="text-nc-blue-mid mb-4 font-bold text-sm">← Back</button>

      <h1 className="text-xl font-bold text-nc-blue-deep mb-1">ATEC Assessment</h1>
      <p className="text-nc-grey-mid text-sm mb-4">For {selectedPatient.name}</p>

      <div className="mb-4">
        <div className="flex justify-between text-xs text-nc-grey-mid mb-1">
          <span>{progress} / {totalItems} items</span>
          <span>{pct}%</span>
        </div>
        <div className="h-2 bg-nc-grey-pale rounded-full overflow-hidden">
          <div className="h-full bg-nc-blue-mid rounded-full transition-all duration-safe"
            style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {ALL_SUBSCALES.map((sub, idx) => (
          <button key={idx}
            onClick={() => setCurrentSubscale(idx)}
            className={`flex-1 text-xs py-2 rounded-xl font-bold transition-all duration-safe
              ${idx === currentSubscale
                ? 'bg-nc-blue-mid text-white'
                : 'bg-nc-beige text-nc-grey-mid hover:bg-nc-grey-pale'}`}
          >
            {idx === 0 ? 'I' : idx === 1 ? 'II' : idx === 2 ? 'III' : 'IV'}
          </button>
        ))}
      </div>

      <div className="nc-card mb-4">
        <h2 className="text-lg font-bold text-nc-blue-deep mb-4">{subscale.title}</h2>
        <div className="space-y-4">
          {subscale.items.map((item, idx) => {
            const selected = getAnswer(idx);
            return (
              <div key={idx} className="border-b border-nc-grey-pale pb-3 last:border-0 last:pb-0">
                <p className="text-sm font-bold text-nc-grey-dark mb-2">
                  {idx + 1}. {item}
                </p>
                <div className="flex flex-wrap gap-2">
                  {subscale.scoring.map((label, val) => (
                    <button key={val}
                      onClick={() => setAnswer(idx, val)}
                      className={`px-3 py-1.5 text-xs rounded-full font-bold transition-all duration-safe
                        ${selected === val
                          ? 'bg-nc-blue-mid text-white'
                          : 'bg-nc-beige text-nc-grey-dark hover:bg-nc-grey-pale'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3">
        {currentSubscale > 0 && (
          <button onClick={handlePrev} className="nc-btn-outline flex-1">
            ← Previous
          </button>
        )}
        {currentSubscale < 3 ? (
          <button onClick={handleNext}
            disabled={!isSubscaleComplete()}
            className="nc-btn-primary flex-1 disabled:opacity-40">
            Next →
          </button>
        ) : (
          <button onClick={handleSubmit}
            disabled={!allComplete() || submitting}
            className="nc-btn-primary flex-1 disabled:opacity-40">
            {submitting ? 'Submitting...' : '✓ Submit ATEC'}
          </button>
        )}
      </div>
    </div>
  );
}
