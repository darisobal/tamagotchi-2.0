import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { Alert } from 'react-native';

export async function pickAndResizeSelfie(useCamera: boolean): Promise<string | null> {
  const { status } = useCamera
    ? await ImagePicker.requestCameraPermissionsAsync()
    : await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (status !== 'granted') {
    Alert.alert('permission needed', 'please grant access to your camera or photo library.');
    return null;
  }

  const opts: ImagePicker.ImagePickerOptions = {
    allowsEditing: true,
    aspect: [1, 1] as [number, number],
    quality: 0.8,
  };

  const result = useCamera
    ? await ImagePicker.launchCameraAsync(opts)
    : await ImagePicker.launchImageLibraryAsync(opts);

  if (result.canceled || !result.assets.length) return null;

  const manipulated = await manipulateAsync(
    result.assets[0].uri,
    [{ resize: { width: 16, height: 16 } }],
    { base64: true, format: SaveFormat.PNG },
  );

  return manipulated.base64 ?? null;
}
