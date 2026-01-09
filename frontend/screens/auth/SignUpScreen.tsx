import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');
const MAX_WIDTH = 420;

const interestsList = ['Design', 'Tech', 'Doctor', 'Legal', 'Fitness'];

export default function SignUpScreen({ navigation }: any) {
  const [step, setStep] = useState(0);
  const [userType, setUserType] =
    useState<'general' | 'standard' | null>(null);

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(30)).current;

  const [form, setForm] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
    phone: '',
    age: '',
    gender: '',
    bio: '',
    interests: [] as string[],
    companyName: '',
    address: '',
    PAN: '',
    Aadhar: '',
    GST: '',
  });

  const update = (k: string, v: any) =>
    setForm((p) => ({ ...p, [k]: v }));

  const next = () => setStep((s) => s + 1);

  useEffect(() => {
    fade.setValue(0);
    slide.setValue(30);

    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [step]);

  const submit = () => {
    const payload = {
      userType,
      username: form.username,
      name: form.name,
      email: form.email,
      password: form.password,
      phone: form.phone,
      age: form.age ? Number(form.age) : undefined,
      gender: form.gender || undefined,
      bio: form.bio || undefined,
      interests: form.interests,
      companyName: userType === 'standard' ? form.companyName : undefined,
      address: userType === 'standard' ? form.address : undefined,
      PAN: form.PAN || undefined,
      Aadhar: form.Aadhar || undefined,
      GST: form.GST || undefined,
    };

    console.log('SIGNUP PAYLOAD', payload);
    navigation.replace('SignIn');
  };

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Animated.View
        style={[
          styles.card,
          { opacity: fade, transform: [{ translateY: slide }] },
        ]}
      >
        {/* STEP 0 */}
        {step === 0 && (
          <>
            <Text style={styles.logo}>Heed</Text>
            <Text style={styles.title}>Choose account type</Text>

            <TouchableOpacity
              style={styles.option}
              onPress={() => {
                setUserType('general');
                next();
              }}
            >
              <Text style={styles.optionTitle}>General Account</Text>
              <Text style={styles.optionDesc}>Individuals & creators</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.option}
              onPress={() => {
                setUserType('standard');
                next();
              }}
            >
              <Text style={styles.optionTitle}>Business Account</Text>
              <Text style={styles.optionDesc}>Companies & brands</Text>
            </TouchableOpacity>
          </>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <Text style={styles.title}>Account credentials</Text>
            <TextInput
              placeholder="Username"
              style={styles.input}
              value={form.username}
              onChangeText={(v) => update('username', v)}
            />
            <TextInput
              placeholder="Password"
              secureTextEntry
              style={styles.input}
              value={form.password}
              onChangeText={(v) => update('password', v)}
            />
            <PrimaryButton label="Next" onPress={next} />
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <Text style={styles.title}>Basic details</Text>
            <TextInput
              placeholder="Full name"
              style={styles.input}
              value={form.name}
              onChangeText={(v) => update('name', v)}
            />
            <TextInput
              placeholder="Email"
              style={styles.input}
              value={form.email}
              onChangeText={(v) => update('email', v)}
            />
            <TextInput
              placeholder="Phone"
              style={styles.input}
              value={form.phone}
              onChangeText={(v) => update('phone', v)}
            />
            <PrimaryButton label="Next" onPress={next} />
          </>
        )}

        {/* STEP 3 GENERAL */}
        {step === 3 && userType === 'general' && (
          <>
            <Text style={styles.title}>About you</Text>

            <TextInput
              placeholder="Age"
              keyboardType="numeric"
              style={styles.input}
              value={form.age}
              onChangeText={(v) => update('age', v)}
            />
            <TextInput
              placeholder="Gender (male / female / other)"
              style={styles.input}
              value={form.gender}
              onChangeText={(v) => update('gender', v)}
            />
            <TextInput
              placeholder="Bio"
              multiline
              style={[styles.input, styles.textArea]}
              value={form.bio}
              onChangeText={(v) => update('bio', v)}
            />

            <Text style={styles.sub}>Interests</Text>
            <View style={styles.chips}>
              {interestsList.map((i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.chip,
                    form.interests.includes(i) && styles.chipActive,
                  ]}
                  onPress={() =>
                    update(
                      'interests',
                      form.interests.includes(i)
                        ? form.interests.filter((x) => x !== i)
                        : [...form.interests, i]
                    )
                  }
                >
                  <Text>{i}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <PrimaryButton label="Create account" onPress={submit} />
          </>
        )}

        {/* STEP 3 BUSINESS */}
        {step === 3 && userType === 'standard' && (
          <>
            <Text style={styles.title}>Business details</Text>

            <TextInput
              placeholder="Company name"
              style={styles.input}
              value={form.companyName}
              onChangeText={(v) => update('companyName', v)}
            />
            <TextInput
              placeholder="Address"
              style={styles.input}
              value={form.address}
              onChangeText={(v) => update('address', v)}
            />
            <TextInput
              placeholder="Business bio"
              multiline
              style={[styles.input, styles.textArea]}
              value={form.bio}
              onChangeText={(v) => update('bio', v)}
            />
            <TextInput
              placeholder="PAN"
              style={styles.input}
              value={form.PAN}
              onChangeText={(v) => update('PAN', v)}
            />
            <TextInput
              placeholder="Aadhar"
              style={styles.input}
              value={form.Aadhar}
              onChangeText={(v) => update('Aadhar', v)}
            />
            <TextInput
              placeholder="GST"
              style={styles.input}
              value={form.GST}
              onChangeText={(v) => update('GST', v)}
            />

            <PrimaryButton label="Submit for review" onPress={submit} />
          </>
        )}
      </Animated.View>
    </ScrollView>
  );
}

/* ---------- BUTTON ---------- */
function PrimaryButton({ label, onPress }: any) {
  return (
    <TouchableOpacity style={styles.btn} onPress={onPress}>
      <Text style={styles.btnText}>{label}</Text>
    </TouchableOpacity>
  );
}

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  page: {
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: MAX_WIDTH,
    alignSelf: 'center',
  },
  logo: {
    fontSize: 42,
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'DancingScript_700Bold',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 24,
  },
  input: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  textArea: {
    height: 90,
    paddingTop: 12,
  },
  btn: {
    height: 50,
    backgroundColor: '#3b82f6',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  option: {
    backgroundColor: '#f9fafb',
    padding: 20,
    borderRadius: 18,
    marginBottom: 16,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  optionDesc: {
    color: '#6b7280',
    marginTop: 4,
  },
  sub: {
    fontWeight: '700',
    marginBottom: 10,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
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
});
