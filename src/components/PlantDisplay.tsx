import './PlantAnimation.css';

type PlantType = 'sunflower' | 'cactus' | 'tree' | 'flower' | 'bonsai' | 'none';

interface PlantDisplayProps {
  type: PlantType;
  level: number;
  size?: 'small' | 'default' | 'large';
}

export function PlantDisplay({ type, level, size = 'default' }: PlantDisplayProps) {
  if (type === 'none') return null;
  
  // Size class mapping
  const sizeClasses = {
    small: 'h-16 w-16',
    default: 'h-24 w-24',
    large: 'h-36 w-36'
  };
  
  // Plant emojis for each level
  const plantEmojis: Record<PlantType, string[]> = {
    sunflower: ['🌱', '🌿', '🌻', '🌻', '🌻', '🌻'],
    cactus: ['🌱', '🪴', '🌵', '🌵', '🌵', '🌵'],
    tree: ['🌱', '🌿', '🪴', '🌲', '🌳', '🌳'],
    flower: ['🌱', '🌿', '🪴', '🌷', '🌹', '🌺'],
    bonsai: ['🌱', '🌿', '🪴', '🎋', '🎍', '🎍'],
    none: []
  };
  
  // Plant growth descriptions for each level
  const plantDescriptions: Record<PlantType, string[]> = {
    sunflower: [
      'A tiny seed',
      'A small sprout',
      'A growing sunflower plant',
      'A tall sunflower with a bud',
      'A beautiful blooming sunflower',
      'A magnificent sunflower in full bloom'
    ],
    cactus: [
      'A tiny seed',
      'A small cactus sprout',
      'A growing cactus',
      'A sturdy cactus',
      'A tall desert cactus',
      'A magnificent flowering cactus'
    ],
    tree: [
      'A tiny seed',
      'A small sprout',
      'A young sapling',
      'A growing tree',
      'A strong tree with branches',
      'A magnificent full-grown tree'
    ],
    flower: [
      'A tiny seed',
      'A small sprout',
      'A growing stem',
      'A flower bud',
      'A blooming flower',
      'A magnificent colorful flower'
    ],
    bonsai: [
      'A tiny seed',
      'A small sprout',
      'A young bonsai',
      'A shaped bonsai tree',
      'An elegant bonsai',
      'A magnificent ancient bonsai'
    ],
    none: []
  };
  
  // Get the correct emoji and description based on level
  const safeLevel = Math.min(Math.max(0, level), 5); // Ensure level is between 0-5
  const emoji = plantEmojis[type][safeLevel];
  const description = plantDescriptions[type][safeLevel];
  
  // Background colors for plant containers
  const bgColors: Record<PlantType, string> = {
    sunflower: 'bg-yellow-900/20',
    cactus: 'bg-green-900/20',
    tree: 'bg-emerald-900/20',
    flower: 'bg-pink-900/20', 
    bonsai: 'bg-amber-900/20',
    none: ''
  };

  // Calculate progress to next level (0-100%)
  const maxLevel = 5;
  const progress = safeLevel < maxLevel ? ((level - Math.floor(level)) * 100) : 100;
  
  return (
    <div className="flex flex-col items-center">
      <div className={`plant-container ${sizeClasses[size]} ${bgColors[type]} rounded-full flex items-center justify-center mb-2`}>
        <span className={`plant-emoji ${size === 'large' ? 'text-5xl' : size === 'small' ? 'text-xl' : 'text-3xl'}`}>
          {emoji}
        </span>
        <div className="plant-growth"></div>
      </div>
      {size === 'large' && (
        <div className="text-center mt-1 w-full max-w-[200px]">
          <p className="text-sm text-gray-400">{description}</p>
          <p className="text-xs mt-1">Level {safeLevel}{safeLevel < maxLevel ? ` (${Math.round(progress)}% to level ${safeLevel + 1})` : " (Max)"}</p>
          {safeLevel < maxLevel && (
            <div className="level-progress mt-2">
              <div 
                className="level-progress-bar" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
