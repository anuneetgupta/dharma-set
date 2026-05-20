import { emotionTagColors } from '../data/shlokas';

export default function EmotionTag({ emotion, onClick, active }) {
  const colors = emotionTagColors[emotion] || emotionTagColors.default;
  return (
    <button
      onClick={onClick}
      className={`emotion-tag ${colors.bg} ${colors.border} ${colors.text} transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:opacity-80 active:scale-95' : 'cursor-default'
      } ${active ? 'ring-1 ring-current opacity-100' : 'opacity-70'}`}
    >
      {emotion}
    </button>
  );
}
