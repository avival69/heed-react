import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

export default function SignInScreen({ navigation, onLogin }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Heed</Text>
      <Text style={styles.subtitle}>Welcome back</Text>

      <TextInput placeholder="Email" style={styles.input} />
      <TextInput placeholder="Password" secureTextEntry style={styles.input} />

      <TouchableOpacity style={styles.primaryBtn} onPress={onLogin}>
        <Text style={styles.primaryText}>Sign In</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.googleBtn}>
        <Text style={styles.googleText}>Continue with Google</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.link}>Create new account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  logo: {
    fontSize: 42,
    textAlign: 'center',
    fontFamily: 'DancingScript_700Bold', // 🖌️ Brush script
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: 32,
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  primaryBtn: {
    height: 48,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryText: {
    color: '#fff',
    fontWeight: '700',
  },
  googleBtn: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  googleText: {
    fontWeight: '600',
  },
  link: {
    marginTop: 20,
    textAlign: 'center',
    color: '#3b82f6',
  },
});
