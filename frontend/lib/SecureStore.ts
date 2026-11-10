import * as SecureStore from 'expo-secure-store';

export async function saveAuthKey(token: string) {
  try {
    await SecureStore.setItemAsync('user_auth_key', token);
  } catch (error) {
    console.error('Error saving the key', error);
  }
}

export async function getAuthKey() {
  try {
    const token = await SecureStore.getItemAsync('user_auth_key');
    if (token) {
      return token;
    } else {
      return false;
    }
  } catch (error) {
    console.error('Error fetching the key', error);
  }
}

export async function saveData(key: string, data: string) {
  if (data && key) {
    SecureStore.setItemAsync(key, data);
  }
}

export async function getDataAsync(key: string) {
  if (key) {
    const data = SecureStore.getItemAsync(key);
    if (data) {
      return data;
    } else {
      console.log("Error", "Data not found")
    }
  }
}

export async function deleteAuthKey() {
  await SecureStore.deleteItemAsync('user_auth_key');
}