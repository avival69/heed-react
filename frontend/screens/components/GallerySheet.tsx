import * as ImagePicker from 'expo-image-picker';

export async function openGallery(max = 4): Promise<string[] | null> {
  await ImagePicker.requestMediaLibraryPermissionsAsync();

  const res = await ImagePicker.launchImageLibraryAsync({
    allowsMultipleSelection: true,
    selectionLimit: max,
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 1,
  });

  if (res.canceled) return null;
  return res.assets.map(a => a.uri);
}
