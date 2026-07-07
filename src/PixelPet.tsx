import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { PetType, Mood } from './types';
import { Colors } from './theme';

const PX = 7;
const DEFAULT_PET_COLOR = Colors.pet;

/** Low-FPS idle animation: cycle every 500ms (~2 FPS) to keep it light. */
const IDLE_FRAME_MS = 500;

type Sprite = number[][];

/** Returns a copy of the sprite with one row zeroed (for blink). */
function blinkFrame(sprite: Sprite, eyeRowIndex: number): Sprite {
  return sprite.map((row, y) =>
    y === eyeRowIndex ? row.map(() => 0) : [...row]
  );
}

/**
 * 16x16 sprites for each pet + mood combination.
 * 1 = black pixel, 0 = transparent.
 * Designed to resemble original 1996 Tamagotchi LCD sprites.
 * Animation: 2 frames per mood (base + blink) for low-FPS idle.
 */
const DINO_SPRITES: Record<Mood, Sprite> = {
  // Happy: two open eye dots + small smile curve
  happy: [
    [0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0],
    [0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0],
    [0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0],
    [0,0,1,0,1,0,0,1,0,0,0,1,1,0,0,0],
    [0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0],
    [0,0,1,0,0,1,0,1,0,0,0,0,1,0,0,0],
    [0,0,0,1,0,0,1,0,0,0,0,1,0,0,0,0],
    [0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0],
    [0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,1,0,1,0,0,0,0,1,0,0,1,0,0,0],
    [0,0,1,0,0,1,1,1,1,0,0,0,1,0,0,0],
    [0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0],
    [0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0],
    [0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0],
    [0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0],
    [0,0,0,0,1,1,0,0,1,1,0,0,0,0,0,0],
  ],
  // Okay: flat straight-line eyes, neutral expression
  okay: [
    [0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0],
    [0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0],
    [0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0],
    [0,0,1,0,1,0,0,1,0,0,0,1,1,0,0,0],
    [0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0],
    [0,0,1,0,0,1,1,1,0,0,0,0,1,0,0,0],
    [0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0],
    [0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0],
    [0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,1,0,1,0,0,0,0,1,0,0,1,0,0,0],
    [0,0,1,0,0,1,1,1,1,0,0,0,1,0,0,0],
    [0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0],
    [0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0],
    [0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0],
    [0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0],
    [0,0,0,0,1,1,0,0,1,1,0,0,0,0,0,0],
  ],
  // Sad: closed/teary eyes + wavy frown
  sad: [
    [0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0],
    [0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0],
    [0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0],
    [0,0,1,0,1,0,0,1,0,0,0,1,1,0,0,0],
    [0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0],
    [0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0],
    [0,0,0,1,0,0,1,1,0,0,0,1,0,0,0,0],
    [0,0,0,0,1,1,0,0,1,0,1,0,0,0,0,0],
    [0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,1,0,1,0,0,0,0,1,0,0,1,0,0,0],
    [0,0,1,0,0,1,1,1,1,0,0,0,1,0,0,0],
    [0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0],
    [0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0],
    [0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0],
    [0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0],
    [0,0,0,0,1,1,0,0,1,1,0,0,0,0,0,0],
  ],
  // Dead: X eyes + tongue sticking out — worst mood, habit overdue
  dead: [
    [0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0],
    [0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0],
    [0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0],
    [0,0,1,0,1,0,0,1,0,0,0,1,1,0,0,0],
    [0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0],
    [0,0,1,0,1,0,1,0,1,0,1,0,1,0,0,0],
    [0,0,0,1,0,1,0,0,0,1,0,1,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0],
    [0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,1,0,1,0,0,0,0,1,0,0,1,0,0,0],
    [0,0,1,0,0,1,1,1,1,0,0,0,1,0,0,0],
    [0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0],
    [0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0],
    [0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0],
    [0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0],
    [0,0,0,0,1,1,0,0,1,1,0,0,0,0,0,0],
  ],
};

const BIRD_SPRITES: Record<Mood, Sprite> = {
  // Happy: two open eye dots + small smile
  happy: [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0],
    [0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0],
    [0,0,0,1,0,1,0,0,1,0,1,0,0,0,0,0],
    [0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0],
    [0,0,0,1,0,1,0,1,0,0,1,0,0,0,0,0],
    [0,0,0,0,1,0,1,0,0,1,0,0,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0],
    [0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0],
    [0,0,0,1,0,1,1,1,1,0,1,0,0,0,0,0],
    [0,0,1,0,0,0,1,1,0,0,0,1,0,0,0,0],
    [0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0],
    [0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0],
    [0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0],
    [0,0,0,0,1,1,0,0,1,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],
  // Okay: flat straight-line eyes, neutral expression
  okay: [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0],
    [0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0],
    [0,0,0,1,0,1,0,0,1,0,1,0,0,0,0,0],
    [0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0],
    [0,0,0,1,0,1,1,1,0,0,1,0,0,0,0,0],
    [0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0],
    [0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0],
    [0,0,0,1,0,1,1,1,1,0,1,0,0,0,0,0],
    [0,0,1,0,0,0,1,1,0,0,0,1,0,0,0,0],
    [0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0],
    [0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0],
    [0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0],
    [0,0,0,0,1,1,0,0,1,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],
  // Sad: closed/teary eyes + wavy frown
  sad: [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0],
    [0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0],
    [0,0,0,1,0,1,0,0,1,0,1,0,0,0,0,0],
    [0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0],
    [0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0],
    [0,0,0,0,1,0,1,1,0,1,0,0,0,0,0,0],
    [0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0],
    [0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0],
    [0,0,0,1,0,1,1,1,1,0,1,0,0,0,0,0],
    [0,0,1,0,0,0,1,1,0,0,0,1,0,0,0,0],
    [0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0],
    [0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0],
    [0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0],
    [0,0,0,0,1,1,0,0,1,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],
  // Dead: X eyes + tongue sticking out — worst mood, habit overdue
  dead: [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0],
    [0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0],
    [0,0,0,1,0,1,0,0,1,0,1,0,0,0,0,0],
    [0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0],
    [0,0,0,1,1,0,1,0,1,0,1,0,0,0,0,0],
    [0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0],
    [0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0],
    [0,0,0,1,0,1,1,1,1,0,1,0,0,0,0,0],
    [0,0,1,0,0,0,1,1,0,0,0,1,0,0,0,0],
    [0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0],
    [0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0],
    [0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0],
    [0,0,0,0,1,1,0,0,1,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],
};

const SPRITES: Record<string, Record<Mood, Sprite>> = {
  dino: DINO_SPRITES,
  bird: BIRD_SPRITES,
};

/** Dino eyes are on row 4 (0-indexed); bird eyes on row 3. */
const DINO_EYE_ROW = 4;
const BIRD_EYE_ROW = 3;

/** Two frames per mood: [base, blink] for low-FPS idle animation. */
const DINO_ANIM: Record<Mood, Sprite[]> = Object.fromEntries(
  (Object.entries(DINO_SPRITES) as [Mood, Sprite][]).map(([mood, base]) => [
    mood,
    [base, blinkFrame(base, DINO_EYE_ROW)],
  ])
) as Record<Mood, Sprite[]>;
const BIRD_ANIM: Record<Mood, Sprite[]> = Object.fromEntries(
  (Object.entries(BIRD_SPRITES) as [Mood, Sprite][]).map(([mood, base]) => [
    mood,
    [base, blinkFrame(base, BIRD_EYE_ROW)],
  ])
) as Record<Mood, Sprite[]>;

const ANIM_SPRITES: Record<string, Record<Mood, Sprite[]>> = {
  dino: DINO_ANIM,
  bird: BIRD_ANIM,
};

interface PixelPetProps {
  petType: PetType;
  mood: Mood;
  customSprite?: string | null;
  pixelSize?: number;
  color?: string;
}

export default function PixelPet({ petType, mood, customSprite, pixelSize = PX, color = DEFAULT_PET_COLOR }: PixelPetProps) {
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    if (petType === 'selfie' && customSprite) {
      return;
    }
    const id = setInterval(() => {
      setFrameIndex((i) => (i + 1) % 2);
    }, IDLE_FRAME_MS);
    return () => clearInterval(id);
  }, [petType, customSprite]);

  let sprite: Sprite;

  if (petType === 'selfie' && customSprite) {
    try {
      sprite = JSON.parse(customSprite);
    } catch {
      sprite = DINO_SPRITES.okay;
    }
  } else {
    const frames = ANIM_SPRITES[petType]?.[mood];
    sprite = frames ? frames[frameIndex] : (SPRITES[petType]?.[mood] ?? DINO_SPRITES.okay);
  }

  return <SpriteGrid sprite={sprite} pixelSize={pixelSize} color={color} />;
}

export function CustomPixelPet({ sprite, pixelSize = PX, color = DEFAULT_PET_COLOR }: { sprite: Sprite; pixelSize?: number; color?: string }) {
  return <SpriteGrid sprite={sprite} pixelSize={pixelSize} color={color} />;
}

function SpriteGrid({ sprite, pixelSize, color = DEFAULT_PET_COLOR }: { sprite: Sprite; pixelSize: number; color?: string }) {
  return (
    <View style={styles.container}>
      {sprite.map((row, y) => (
        <View key={y} style={styles.row}>
          {row.map((cell, x) => (
            <View
              key={x}
              style={{
                width: pixelSize,
                height: pixelSize,
                backgroundColor: cell === 1 ? color : 'transparent',
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const MINI_DINO: Sprite = [
  [0,0,1,1,1,0,0,0],
  [0,1,0,0,0,1,1,0],
  [0,1,1,0,1,0,0,0],
  [0,1,0,0,0,1,0,0],
  [0,0,1,1,1,0,0,0],
  [0,0,1,0,1,0,0,0],
  [0,0,1,0,1,0,0,0],
  [0,1,1,0,1,1,0,0],
];

const MINI_BIRD: Sprite = [
  [0,0,1,1,1,0,0,0],
  [0,1,0,0,0,1,0,0],
  [0,1,1,0,1,1,0,0],
  [0,1,0,0,0,1,0,0],
  [0,0,1,1,1,0,0,0],
  [0,1,0,1,0,1,0,0],
  [0,0,1,0,1,0,0,0],
  [0,1,1,0,1,1,0,0],
];

export function MiniPixelPet({ petType, pixelSize = 4, color = DEFAULT_PET_COLOR }: { petType: PetType; pixelSize?: number; color?: string }) {
  const sprite = petType === 'dino' ? MINI_DINO : MINI_BIRD;

  return (
    <View style={styles.container}>
      {sprite.map((row, y) => (
        <View key={y} style={styles.row}>
          {row.map((cell, x) => (
            <View
              key={x}
              style={{
                width: pixelSize,
                height: pixelSize,
                backgroundColor: cell === 1 ? color : 'transparent',
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
  },
});
