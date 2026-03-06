const EDS_STATES = {
  calm: {
    emoji: '😌',
    message: "You're doing great!",
    subMessage: 'Everything feels steady and calm right now.',
    color: 'nc-blue-mid',
    ringColor: '#5B8DB8',
    bgTint: 'bg-nc-blue-tint',
  },
  moderate: {
    emoji: '😐',
    message: "Let's take a breath",
    subMessage: "It's okay to feel this way. Let's try something together.",
    color: 'nc-amber',
    ringColor: '#C49A3A',
    bgTint: 'bg-nc-amber-tint',
  },
  elevated: {
    emoji: '🤗',
    message: "I'm here with you",
    subMessage: "You're not alone. Let's find something that helps.",
    color: 'nc-terra',
    ringColor: '#B5705A',
    bgTint: 'bg-nc-terra-tint',
  },
  critical: {
    emoji: '🫂',
    message: "Let's find calm together",
    subMessage: "I know this is hard. I'm right here with you.",
    color: 'nc-terra',
    ringColor: '#B5705A',
    bgTint: 'bg-nc-terra-tint',
  },
};

export default function StateDisplay({ eds, edsState }) {
  const state = EDS_STATES[edsState] || EDS_STATES.calm;
  const edsNorm = Math.max(0, Math.min(100, eds || 0));
  const circumference = 2 * Math.PI * 88;
  const dashOffset = circumference - (edsNorm / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-[88px] leading-none animate-float">{state.emoji}</div>

      <div className="text-center">
        <h2 className={`text-2xl font-bold text-${state.color}`}>{state.message}</h2>
        <p className="text-nc-grey-mid mt-2">{state.subMessage}</p>
      </div>

      <div className="relative w-[200px] h-[200px]">
        <svg width="200" height="200" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="88" fill="none"
            stroke="#EAE6E2" strokeWidth="16" />
          <circle cx="100" cy="100" r="88" fill="none"
            stroke={state.ringColor} strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 100 100)"
            style={{ transition: 'stroke-dashoffset 900ms ease-in-out, stroke 600ms ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl">{state.emoji}</span>
        </div>
      </div>
    </div>
  );
}
