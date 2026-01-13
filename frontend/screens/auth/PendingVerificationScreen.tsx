import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock } from 'lucide-react-native';

export default function PendingVerificationScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Clock size={64} color="#3b82f6" />
      </View>
      
      <Text style={styles.title}>Verification Pending</Text>
      
      <Text style={styles.text}>
        Your business account is currently under review by our admin team.
        {"\n"}{"\n"}
        This process typically takes 24-48 hours. You will be able to log in once your account is approved.
      </Text>

      <TouchableOpacity 
        style={styles.btn} 
        onPress={() => navigation.replace('SignIn')}
      >
        <Text style={styles.btnText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', padding: 30 },
  iconCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 12 },
  text: { fontSize: 16, color: '#6b7280', textAlign: 'center', lineHeight: 24, marginBottom: 40 },
  btn: { width: '100%', height: 50, backgroundColor: '#1f2937', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});