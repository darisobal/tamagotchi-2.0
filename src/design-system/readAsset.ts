import { Asset } from 'expo-asset';
import { File } from 'expo-file-system';

export async function readAsset(source: number): Promise<string> {
  const asset = await Asset.fromModule(source).downloadAsync();
  return new File(asset.localUri ?? asset.uri).text();
}
