import { Asset } from 'expo-asset';

export async function readAsset(source: number): Promise<string> {
  const response = await fetch(Asset.fromModule(source).uri);
  if (!response.ok) throw new Error('could not load pet artwork');
  return response.text();
}
