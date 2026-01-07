import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

const interestsList = ['Design', 'Tech', 'Doctor', 'Legal', 'Fitness'];

export default function SignUpScreen({ navigation, route }: any) {
  const [step, setStep] = useState(0);
  const [accountType, setAccountType] =
    useState<'general' | 'business' | null>(null);
  const [interests, setInterests] = useState<string[]>([]);

  const next = () => setStep((s) => s + 1);

  return (
    <View style={styles.container}>
      {/* ---------- STEP 0 ---------- */}
      {step === 0 && (
        <>
          <Text style={styles.logo}>Heed</Text>
          <Text style={styles.title}>Choose account type</Text>

          <TouchableOpacity
            style={styles.card}
            onPress={() => {
              setAccountType('general');
              next();
            }}
          >
            <Text style={styles.cardTitle}>General Account</Text>
            <Text style={styles.cardDesc}>For individuals</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => {
              setAccountType('business');
              next();
            }}
          >
            <Text style={styles.cardTitle}>Business Account</Text>
            <Text style={styles.cardDesc}>For companies & brands</Text>
          </TouchableOpacity>
        </>
      )}

      {/* ---------- STEP 1 ---------- */}
      {step === 1 && (
        <>
          <Text style={styles.title}>Basic details</Text>
          <TextInput placeholder="Name" style={styles.input} />
          <TextInput placeholder="Email" style={styles.input} />
          <TextInput placeholder="Phone number" style={styles.input} />

          <TouchableOpacity style={styles.primaryBtn} onPress={next}>
            <Text style={styles.primaryText}>Next</Text>
          </TouchableOpacity>
        </>
      )}

      {/* ---------- STEP 2 ---------- */}
      {step === 2 && accountType === 'general' && (
        <>
          <Text style={styles.title}>About you</Text>
          <TextInput placeholder="Age" style={styles.input} />
          <TextInput placeholder="Gender" style={styles.input} />
          <TextInput
            placeholder="Bio"
            style={[styles.input, { height: 80 }]}
            multiline
          />

          <TouchableOpacity style={styles.primaryBtn} onPress={next}>
            <Text style={styles.primaryText}>Next</Text>
          </TouchableOpacity>
        </>
      )}

      {step === 2 && accountType === 'business' && (
        <>
          <Text style={styles.title}>Business details</Text>
          <TextInput placeholder="Company name" style={styles.input} />
          <TextInput placeholder="Address" style={styles.input} />
          <TextInput placeholder="PAN / Aadhaar / GST" style={styles.input} />

          <TouchableOpacity style={styles.primaryBtn} onPress={next}>
            <Text style={styles.primaryText}>Next</Text>
          </TouchableOpacity>
        </>
      )}

      {/* ---------- STEP 3 ---------- */}
      {step === 3 && accountType === 'general' && (
        <>
          <Text style={styles.title}>Pick your interests</Text>

          <View style={styles.chipWrap}>
            {interestsList.map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.chip,
                  interests.includes(item) && styles.chipActive,
                ]}
                onPress={() =>
                  setInterests((prev) =>
                    prev.includes(item)
                      ? prev.filter((i) => i !== item)
                      : [...prev, item]
                  )
                }
              >
                <Text>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.replace('SignIn')}
          >
            <Text style={styles.primaryText}>Finish</Text>
          </TouchableOpacity>
        </>
      )}

      {step === 3 && accountType === 'business' && (
        <>
          <Text style={styles.title}>Verification pending</Text>
          <Text style={styles.desc}>
            Your business account will be reviewed by admin.
          </Text>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.replace('SignIn')}
          >
            <Text style={styles.primaryText}>Done</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  logo: {
    fontSize: 40,
    textAlign: 'center',
    fontFamily: 'DancingScript_700Bold',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
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
    marginTop: 8,
  },
  primaryText: {
    color: '#fff',
    fontWeight: '700',
  },
  card: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#f9fafb',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  cardDesc: {
    color: '#6b7280',
    marginTop: 4,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#e5e7eb',
    borderRadius: 20,
  },
  chipActive: {
    backgroundColor: '#93c5fd',
  },
  desc: {
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
});
