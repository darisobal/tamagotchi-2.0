import { Mood, PET_LIVES_MAX } from './types';
import { moodToScene, StateScene } from './stateTheme';

/** Four-state label shown on the home-screen widget (mirrors lives). */
export type WidgetPetScene = 'well' | 'neutral' | 'sad' | 'fail';

export const WIDGET_GROUP_ID = 'group.com.tamagotchi.app';

export const WIDGET_SCENE_BG: Record<WidgetPetScene, string> = {
  well: '#DCFFD8',
  neutral: '#FFEDD8',
  sad: '#FFDCC8',
  fail: '#FF8484',
};

export const WIDGET_SCENE_LABEL: Record<WidgetPetScene, string> = {
  well: 'well',
  neutral: 'neutral',
  sad: 'sad',
  fail: 'fail',
};

export function sceneToWidgetScene(scene: StateScene): WidgetPetScene {
  switch (scene) {
    case 'allGood':
      return 'well';
    case 'sad':
      return 'sad';
    case 'failed':
      return 'fail';
    default:
      return 'neutral';
  }
}

export function moodToWidgetScene(mood: Mood): WidgetPetScene {
  return sceneToWidgetScene(moodToScene(mood));
}

export function livesToWidgetScene(lives: number): WidgetPetScene {
  switch (lives) {
    case 3:
      return 'well';
    case 2:
      return 'neutral';
    case 1:
      return 'sad';
    default:
      return 'fail';
  }
}

/** Widget scene at a point in time — one heart lost per full missed period. */
export function widgetSceneAtTime(
  lastCheckInAt: string | null,
  periodMs: number,
  atMs: number,
): WidgetPetScene {
  if (!lastCheckInAt) return 'fail';

  const startMs = new Date(lastCheckInAt).getTime();
  const elapsedMs = Math.max(atMs - startMs, 0);
  const missedDeadlines = Math.floor(elapsedMs / periodMs);
  const lives = Math.max(0, PET_LIVES_MAX - missedDeadlines);

  return livesToWidgetScene(lives);
}

export type PetStatusWidgetProps = {
  scene: WidgetPetScene;
  petImageUri: string;
};

export type WidgetTimelineEntry = {
  date: Date;
  props: PetStatusWidgetProps;
};

/** Schedule future widget updates at each life transition while the app is closed. */
export function buildWidgetTimelineEntries(
  lastCheckInAt: string | null,
  periodMs: number,
  imageUris: Record<WidgetPetScene, string>,
  nowMs: number = Date.now(),
): WidgetTimelineEntry[] {
  const makeProps = (scene: WidgetPetScene): PetStatusWidgetProps => ({
    scene,
    petImageUri: imageUris[scene],
  });

  if (!lastCheckInAt) {
    return [{ date: new Date(nowMs), props: makeProps('fail') }];
  }

  const startMs = new Date(lastCheckInAt).getTime();
  const transitionTimes = [
    { atMs: nowMs, scene: widgetSceneAtTime(lastCheckInAt, periodMs, nowMs) },
    { atMs: startMs + periodMs, scene: 'neutral' as const },
    { atMs: startMs + periodMs * 2, scene: 'sad' as const },
    { atMs: startMs + periodMs * 3, scene: 'fail' as const },
  ];

  const seen = new Set<number>();
  const entries: WidgetTimelineEntry[] = [];

  for (const { atMs, scene } of transitionTimes) {
    if (atMs < nowMs - 60_000) continue;
    const bucket = Math.floor(atMs / 1000);
    if (seen.has(bucket)) continue;
    seen.add(bucket);
    entries.push({ date: new Date(atMs), props: makeProps(scene) });
  }

  entries.sort((a, b) => a.date.getTime() - b.date.getTime());
  return entries.length > 0 ? entries : [{ date: new Date(nowMs), props: makeProps('fail') }];
}
