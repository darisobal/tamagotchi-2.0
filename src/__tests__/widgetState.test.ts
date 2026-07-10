import {
  buildWidgetTimelineEntries,
  livesToWidgetScene,
  moodToWidgetScene,
  widgetSceneAtTime,
} from '../widgetState';

describe('widgetState', () => {
  const DAY = 24 * 60 * 60 * 1000;
  const imageUris = {
    well: 'file:///well.png',
    neutral: 'file:///neutral.png',
    sad: 'file:///sad.png',
    fail: 'file:///fail.png',
  };

  test('happy mood maps to well', () => {
    expect(moodToWidgetScene('happy')).toBe('well');
  });

  test('okay mood maps to neutral', () => {
    expect(moodToWidgetScene('okay')).toBe('neutral');
  });

  test('sad mood maps to sad', () => {
    expect(moodToWidgetScene('sad')).toBe('sad');
  });

  test('dead mood maps to fail', () => {
    expect(moodToWidgetScene('dead')).toBe('fail');
  });

  test('lives map to widget scenes', () => {
    expect(livesToWidgetScene(3)).toBe('well');
    expect(livesToWidgetScene(2)).toBe('neutral');
    expect(livesToWidgetScene(1)).toBe('sad');
    expect(livesToWidgetScene(0)).toBe('fail');
  });

  test('widgetSceneAtTime transitions at 1/3, 2/3, and 100% of period', () => {
    const start = Date.now() - DAY / 6;
    const lastCheckInAt = new Date(start).toISOString();

    expect(widgetSceneAtTime(lastCheckInAt, DAY, start + 1)).toBe('well');
    expect(widgetSceneAtTime(lastCheckInAt, DAY, start + DAY * 0.5)).toBe('neutral');
    expect(widgetSceneAtTime(lastCheckInAt, DAY, start + DAY * 0.75)).toBe('sad');
    expect(widgetSceneAtTime(lastCheckInAt, DAY, start + DAY)).toBe('fail');
  });

  test('no check-in is always fail', () => {
    expect(widgetSceneAtTime(null, DAY, Date.now())).toBe('fail');
  });

  test('buildWidgetTimelineEntries schedules future transitions', () => {
    const now = Date.now();
    const lastCheckInAt = new Date(now - DAY / 6).toISOString();
    const entries = buildWidgetTimelineEntries(lastCheckInAt, DAY, imageUris, now);

    expect(entries.length).toBeGreaterThanOrEqual(3);
    expect(entries[0].props.scene).toBe('well');
    expect(entries.some((entry) => entry.props.scene === 'neutral')).toBe(true);
    expect(entries.some((entry) => entry.props.scene === 'sad')).toBe(true);
    expect(entries.some((entry) => entry.props.scene === 'fail')).toBe(true);
  });
});
