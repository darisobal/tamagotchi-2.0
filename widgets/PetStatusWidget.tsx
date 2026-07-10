import { Image, Text, VStack, ZStack } from '@expo/ui/swift-ui';
import {
  background,
  font,
  foregroundStyle,
  frame,
  padding,
} from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

type WidgetPetScene = 'well' | 'neutral' | 'sad' | 'fail';

type PetStatusWidgetProps = {
  scene: WidgetPetScene;
  petImageUri: string;
};

const SCENE_BG: Record<WidgetPetScene, string> = {
  well: '#DCFFD8',
  neutral: '#FFEDD8',
  sad: '#FFDCC8',
  fail: '#FF8484',
};

const SCENE_LABEL: Record<WidgetPetScene, string> = {
  well: 'Well',
  neutral: 'Neutral',
  sad: 'Sad',
  fail: 'Fail',
};

const PetStatusWidget = (props: PetStatusWidgetProps, environment: WidgetEnvironment) => {
  'widget';

  const bg = SCENE_BG[props.scene];
  const label = SCENE_LABEL[props.scene];
  const isCircular = environment.widgetFamily === 'accessoryCircular';
  const petSize = isCircular ? 28 : environment.widgetFamily === 'systemMedium' ? 110 : 90;

  return (
    <ZStack modifiers={[frame({ maxWidth: Infinity, maxHeight: Infinity }), background(bg)]}>
      <VStack
        spacing={isCircular ? 2 : 6}
        modifiers={[padding({ all: isCircular ? 4 : 10 }), frame({ maxWidth: Infinity, maxHeight: Infinity })]}
      >
        {props.petImageUri ? (
          <Image
            uiImage={props.petImageUri}
            modifiers={[frame({ width: petSize, height: petSize })]}
          />
        ) : null}
        {!isCircular ? (
          <Text
            modifiers={[
              font({ size: 14, weight: 'bold' }),
              foregroundStyle('#000000'),
            ]}
          >
            {label}
          </Text>
        ) : null}
      </VStack>
    </ZStack>
  );
};

export default createWidget('PetStatusWidget', PetStatusWidget);
