import React, { useState, useRef, useContext } from 'react'; // Import useContext
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  Image,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

// Import AuthContext
import { AuthContext } from 'src/context/AuthContext';

const { width } = Dimensions.get('window');
const API_URL = "http://192.168.1.2:5000/api"; 

// --- Options Data ---
const INTERESTS_LIST = ['Technology', 'Fashion', 'Health', 'Finance', 'Art', 'Travel', 'Food', 'Gaming', 'Music', 'Sports'];
const ID_TYPES = ['PAN Card', 'Aadhar Card', 'Driving License'];
const GENDER_OPTS = ['Male', 'Female', 'Other'];

export default function SignUpScreen({ navigation }: any) {
  // Consume Context
  const { login } = useContext(AuthContext);

  // Animation State
  const [step, setStep] = useState(0);
  const fade = useRef(new Animated.Value(1)).current;
  
  // Logic State
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<any>({}); 

  // Form Data
  const [form, setForm] = useState({
    userType: '', 
    username: '', password: '', email: '', phone: '',
    name: '', bio: '', location: '',
    age: '', gender: '',
    companyName: '', country: '', address: '', gstNumber: '',
    productType: '', cashOnDelivery: false,
    idType: '', idDoc: '', 
    interests: [] as string[],
    profilePic: { local: '', remote: '' }, 
    bannerImg: { local: '', remote: '' }, 
  });

  const update = (k: string, v: any) => {
    setForm(p => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((prev: any) => ({ ...prev, [k]: null }));
  };

  // --- Animation Helper ---
  const animateNext = (cb: () => void) => {
    Animated.sequence([
      Animated.timing(fade, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      cb();
      Animated.timing(fade, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    });
  };

  // --- Actions ---

  const handleSmartImagePick = async (field: 'profilePic' | 'bannerImg') => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
      });

      if (result.canceled) return;
      const asset = result.assets[0];

      setForm(prev => ({
        ...prev,
        [field]: { ...prev[field], local: asset.uri }
      }));

      setUploading(true);

      const res = await fetch(`${API_URL}/auth/upload-url?folder=profiles&fileType=image/jpeg`);
      const { uploadUrl, publicUrl } = await res.json();

      const imgResp = await fetch(asset.uri);
      const blob = await imgResp.blob();
      await fetch(uploadUrl, { method: "PUT", body: blob });

      setForm(prev => ({
        ...prev,
        [field]: { local: asset.uri, remote: publicUrl }
      }));
      
      setUploading(false);
    } catch (err) {
      console.error(err);
      setUploading(false);
      setErrors((p: any) => ({...p, [field]: "Upload failed"}));
    }
  };

  const handleDocPick = async () => {
    try {
        const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
        if (result.canceled) return;
        
        const asset = result.assets[0];
        const res = await fetch(`${API_URL}/auth/upload-url?folder=documents&fileType=image/jpeg`);
        const { uploadUrl, publicUrl } = await res.json();
        
        const imgResp = await fetch(asset.uri);
        const blob = await imgResp.blob();
        await fetch(uploadUrl, { method: "PUT", body: blob });
        
        update('idDoc', publicUrl);
    } catch(e) { console.error(e) }
  };

  const handleLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrors((p:any) => ({...p, location: "Permission denied"}));
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      update('location', `${loc.coords.latitude},${loc.coords.longitude}`);
    } catch (err) {
      setErrors((p:any) => ({...p, location: "Could not fetch location"}));
    }
  };

  const validateStep = () => {
    let newErrors: any = {};
    let isValid = true;

    if (step === 1) {
      if (!form.username) newErrors.username = "Username is required";
      if (!form.email) newErrors.email = "Email is required";
      if (!form.password) newErrors.password = "Password is required";
      if (form.phone.length !== 10) newErrors.phone = "Enter valid 10-digit phone";
    }
    if (step === 2) {
       if(!form.name) newErrors.name = "Full name is required";
    }
    if (step === 3 && form.userType === 'business') {
      if (!form.companyName) newErrors.companyName = "Company name is required";
      if (!form.idDoc) newErrors.idDoc = "ID Proof is mandatory";
      if (!form.idType) newErrors.idType = "Select an ID Type";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      isValid = false;
    }
    return isValid;
  };

  const nextStep = () => {
    if (validateStep()) animateNext(() => setStep(s => s + 1));
  };

  // 4. Final Submission
  const submit = async () => {
    setLoading(true);
    try {
      const payload = {
          ...form,
          profilePic: form.profilePic.remote || form.profilePic.local, 
          bannerImg: form.bannerImg.remote || form.bannerImg.local
      };

      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      /* FIXED NAVIGATION LOGIC HERE */
      if (form.userType === 'business' && !data.user.isVerified) {
        // Navigate within the same AuthStack
        navigation.reset({ index: 0, routes: [{ name: 'PendingVerification' }] });
      } else {
        // Log in directly. AuthContext updates state -> App.tsx re-renders -> MainTabs (Home) is shown.
        if (data.token && data.user) {
            await login(data.user, data.token);
        } else {
            // Fallback for cases where token might not be returned immediately
            navigation.navigate('SignIn');
        }
      }
    } catch (err: any) {
      setErrors({ form: err.message });
    } finally {
      setLoading(false);
    }
  };

  // --- Render ---
  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        
        {/* Progress Bar */}
        <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(step/4)*100}%` }]} />
        </View>

        <Animated.View style={[styles.card, { opacity: fade }]}>
          
          {step > 0 && (
            <TouchableOpacity onPress={() => setStep(s => s - 1)} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color="#1f2937" />
            </TouchableOpacity>
          )}

          {/* STEP 0: Account Type */}
          {step === 0 && (
            <View style={styles.centerContent}>
              <Text style={styles.headerTitle}>Welcome to Heed</Text>
              <Text style={styles.headerSub}>Select your account type</Text>

              <View style={styles.typeRow}>
                <TypeCard title="General" icon="person" selected={form.userType === 'general'} onPress={() => update('userType', 'general')} />
                <TypeCard title="Business" icon="briefcase" selected={form.userType === 'business'} onPress={() => update('userType', 'business')} />
              </View>
              {form.userType !== '' && <PrimaryButton label="Continue" onPress={() => animateNext(() => setStep(1))} />}
            </View>
          )}

          {/* STEP 1: Credentials */}
          {step === 1 && (
            <>
              <Text style={styles.sectionTitle}>Login Details</Text>
              <Input label="Username" value={form.username} onChange={(v:any) => update('username', v)} error={errors.username} />
              <Input label="Email" value={form.email} onChange={(v:any) => update('email', v)} error={errors.email} keyboardType="email-address" />
              <Input label="Password" value={form.password} onChange={(v:any) => update('password', v)} isSecure error={errors.password} />
              <Input label="Phone" value={form.phone} onChange={(v:any) => update('phone', v)} keyboardType="numeric" maxLength={10} error={errors.phone} />
              <PrimaryButton label="Next" onPress={nextStep} />
            </>
          )}

          {/* STEP 2: Profile (Using Improved Styles) */}
          {step === 2 && (
            <>
               <Text style={styles.sectionTitle}>Profile Setup</Text>
               
               {/* 2.1 Profile Avatar - Center Circle */}
               <TouchableOpacity style={styles.avatarBox} onPress={() => handleSmartImagePick('profilePic')}>
                  {form.profilePic.local ? (
                     <Image source={{ uri: form.profilePic.local }} style={styles.avatarImg} />
                  ) : (
                     <Ionicons name="person" size={44} color="#9ca3af" />
                  )}
                  <View style={styles.cameraBadge}>
                     <Ionicons name="camera" size={14} color="#fff" />
                  </View>
                  {uploading && <ActivityIndicator style={styles.loaderCenter} color="#2563eb" />}
               </TouchableOpacity>

               {/* 2.2 Banner Image */}
               <TouchableOpacity style={styles.bannerBox} onPress={() => handleSmartImagePick('bannerImg')}>
                  {form.bannerImg.local ? (
                     <Image source={{ uri: form.bannerImg.local }} style={styles.bannerImg} />
                  ) : (
                     <View style={{alignItems:'center', gap: 5}}>
                        <Ionicons name="image-outline" size={24} color="#6b7280" />
                        <Text style={{ color: "#6b7280" }}>Upload Cover Image</Text>
                     </View>
                  )}
               </TouchableOpacity>
               
               <Input label="Full Name" value={form.name} onChange={(v:any) => update('name', v)} error={errors.name} />
               <Input label="Bio" value={form.bio} onChange={(v:any) => update('bio', v)} multiline />
               
               {/* Location */}
               <Text style={styles.label}>Location</Text>
               <TouchableOpacity style={[styles.locationBtn, errors.location && styles.errorBorder]} onPress={handleLocation}>
                  <Ionicons name="location" size={18} color={form.location ? "#10b981" : "#6b7280"} />
                  <Text style={[styles.locationText, form.location && {color: '#10b981'}]}>
                      {form.location ? "Location Captured" : "Use Current Location"}
                  </Text>
               </TouchableOpacity>
               {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}

               <PrimaryButton label="Next" onPress={nextStep} />
            </>
          )}

          {/* STEP 3: Specifics */}
          {step === 3 && (
            <>
               <Text style={styles.sectionTitle}>{form.userType === 'business' ? 'Business Details' : 'Personal Info'}</Text>
               
               {form.userType === 'general' ? (
                   <>
                     <Input label="Age" value={form.age} onChange={(v:any) => update('age', v)} keyboardType="numeric" />
                     <Text style={styles.label}>Gender</Text>
                     <View style={styles.pillRow}>
                        {GENDER_OPTS.map(g => <Pill key={g} label={g} selected={form.gender === g} onPress={() => update('gender', g)} />)}
                     </View>
                   </>
               ) : (
                   <>
                     <Input label="Company Name" value={form.companyName} onChange={(v:any) => update('companyName', v)} error={errors.companyName} />
                     <Input label="Full Address" value={form.address} onChange={(v:any) => update('address', v)} multiline />
                     <View style={{flexDirection:'row', gap: 10}}>
                         <Input label="Country" value={form.country} onChange={(v:any) => update('country', v)} style={{flex:1}} />
                         <Input label="GST (Optional)" value={form.gstNumber} onChange={(v:any) => update('gstNumber', v)} style={{flex:1}} />
                     </View>

                     <Text style={styles.label}>ID Verification (Required)</Text>
                     <View style={styles.pillRow}>
                        {ID_TYPES.map(id => <Pill key={id} label={id} selected={form.idType === id} onPress={() => update('idType', id)} />)}
                     </View>
                     {errors.idType && <Text style={styles.errorText}>{errors.idType}</Text>}

                     <ImageUploader label="Upload ID Document" value={form.idDoc} onPress={handleDocPick} wide />
                     {errors.idDoc && <Text style={styles.errorText}>{errors.idDoc}</Text>}

                     <TouchableOpacity style={styles.checkbox} onPress={() => update('cashOnDelivery', !form.cashOnDelivery)}>
                        <Ionicons name={form.cashOnDelivery ? "checkbox" : "square-outline"} size={22} color="#2563eb" />
                        <Text style={styles.checkboxText}>Available for Cash On Delivery</Text>
                     </TouchableOpacity>
                   </>
               )}
               <PrimaryButton label="Next" onPress={nextStep} />
            </>
          )}

          {/* STEP 4: Interests & Submit */}
          {step === 4 && (
             <>
                <Text style={styles.sectionTitle}>Interests</Text>
                <Text style={styles.subText}>Select at least 3 topics</Text>
                
                <View style={styles.grid}>
                    {INTERESTS_LIST.map(i => {
                        const active = form.interests.includes(i);
                        return (
                            <TouchableOpacity key={i} style={[styles.gridItem, active && styles.gridItemActive]} onPress={() => {
                                const newVal = active ? form.interests.filter(x => x!==i) : [...form.interests, i];
                                update('interests', newVal);
                            }}>
                                <Text style={[styles.gridText, active && {color: '#2563eb', fontWeight: '700'}]}>{i}</Text>
                            </TouchableOpacity>
                        )
                    })}
                </View>
                
                {errors.form && <View style={styles.errorBox}><Text style={styles.errorBoxText}>{errors.form}</Text></View>}

                <PrimaryButton label={loading ? "Creating Account..." : "Submit Application"} onPress={submit} />
             </>
          )}

        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// --- Professional Components ---

const Input = ({ label, value, onChange, isSecure, keyboardType, multiline, style, error }: any) => (
  <View style={[styles.inputWrapper, style]}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, multiline && {height: 80, paddingTop: 10, textAlignVertical: 'top'}, error && styles.errorBorder]}
      value={value}
      onChangeText={onChange}
      secureTextEntry={isSecure}
      keyboardType={keyboardType}
      multiline={multiline}
      placeholderTextColor="#9ca3af"
    />
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

// Used for ID Doc (Simple Box)
const ImageUploader = ({ label, value, onPress, wide }: any) => (
    <TouchableOpacity style={[styles.imgUpload, wide && {width: '100%'}, value && {borderColor: '#10b981', borderStyle: 'solid'}]} onPress={onPress}>
        {value ? (
            <Image source={{ uri: value }} style={styles.imgPreview} />
        ) : (
            <View style={{alignItems: 'center'}}>
                <Ionicons name="cloud-upload-outline" size={24} color="#6b7280" />
                <Text style={styles.imgText}>{label}</Text>
            </View>
        )}
        {value && <View style={styles.checkBadge}><Ionicons name="checkmark" size={12} color="#fff" /></View>}
    </TouchableOpacity>
);

const TypeCard = ({ title, icon, selected, onPress }: any) => (
    <TouchableOpacity style={[styles.typeCard, selected && styles.typeCardActive]} onPress={onPress}>
        <View style={[styles.iconCircle, selected && {backgroundColor: '#dbeafe'}]}>
             <Ionicons name={icon} size={24} color={selected ? "#2563eb" : "#6b7280"} />
        </View>
        <Text style={[styles.typeTitle, selected && {color: '#2563eb'}]}>{title}</Text>
    </TouchableOpacity>
);

const Pill = ({ label, selected, onPress }: any) => (
    <TouchableOpacity style={[styles.pill, selected && styles.pillActive]} onPress={onPress}>
        <Text style={[styles.pillText, selected && {color: '#fff'}]}>{label}</Text>
    </TouchableOpacity>
);

const PrimaryButton = ({ label, onPress }: any) => (
    <TouchableOpacity style={styles.btn} onPress={onPress}>
        <Text style={styles.btnText}>{label}</Text>
    </TouchableOpacity>
);

// --- Styles ---

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, paddingBottom: 50 },
  progressBar: { height: 4, backgroundColor: '#e5e7eb', position: 'absolute', top: 0, left: 0, right: 0 },
  progressFill: { height: '100%', backgroundColor: '#2563eb' },
  
  card: { marginTop: 20 },
  backBtn: { marginBottom: 20, alignSelf: 'flex-start' },

  // Typography
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 8 },
  headerSub: { fontSize: 16, color: '#6b7280', textAlign: 'center', marginBottom: 32 },
  sectionTitle: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 20 },
  subText: { fontSize: 14, color: '#6b7280', marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },

  // Inputs
  inputWrapper: { marginBottom: 16 },
  input: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 14, fontSize: 16, color: '#1f2937' },
  errorBorder: { borderColor: '#ef4444', backgroundColor: '#fef2f2' },
  errorText: { color: '#ef4444', fontSize: 12, marginTop: 4, marginLeft: 2 },
  errorBox: { backgroundColor: '#fef2f2', padding: 12, borderRadius: 8, marginBottom: 16 },
  errorBoxText: { color: '#ef4444', textAlign: 'center' },

  // Type Selection
  centerContent: { alignItems: 'center', marginTop: 40 },
  typeRow: { flexDirection: 'row', gap: 16, marginBottom: 30, width: '100%' },
  typeCard: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 16, padding: 20, alignItems: 'center', justifyContent: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05 },
  typeCardActive: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  iconCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  typeTitle: { fontSize: 16, fontWeight: '600', color: '#374151' },

  // NEW STYLES FROM CHATGPT (Avatar & Banner)
  avatarBox: { width: 120, height: 120, borderRadius: 60, backgroundColor: "#f3f4f6", alignSelf: "center", alignItems: "center", justifyContent: "center", marginBottom: 24 },
  avatarImg: { width: "100%", height: "100%", borderRadius: 60 },
  cameraBadge: { position: "absolute", bottom: 6, right: 6, backgroundColor: "#2563eb", padding: 6, borderRadius: 20 },
  loaderCenter: { position: 'absolute' },

  bannerBox: { height: 120, borderRadius: 16, backgroundColor: "#f3f4f6", alignItems: "center", justifyContent: "center", overflow: "hidden", marginBottom: 20, borderWidth: 1, borderColor: '#e5e7eb', borderStyle: 'dashed' },
  bannerImg: { width: "100%", height: "100%", resizeMode: 'cover' },

  // Old ID Upload Style
  imgUpload: { flex: 1, height: 120, backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderStyle: 'dashed', borderRadius: 16, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  imgPreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  imgText: { fontSize: 12, color: '#6b7280', marginTop: 8 },
  checkBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: '#10b981', padding: 4, borderRadius: 10 },

  // Location
  locationBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, backgroundColor: '#f3f4f6', borderRadius: 12, gap: 8 },
  locationText: { color: '#4b5563', fontWeight: '600' },

  // Components
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  pill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f3f4f6' },
  pillActive: { backgroundColor: '#2563eb' },
  pillText: { color: '#4b5563', fontWeight: '500' },

  checkbox: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20, padding: 4 },
  checkboxText: { color: '#1f2937', fontWeight: '500' },

  // Grid
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  gridItem: { width: '48%', padding: 16, borderRadius: 12, backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center' },
  gridItemActive: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  gridText: { color: '#4b5563', fontWeight: '600' },

  // Main Button
  btn: { width: '100%', backgroundColor: '#2563eb', padding: 16, borderRadius: 14, alignItems: 'center', shadowColor: '#2563eb', shadowOpacity: 0.3, shadowOffset: {width: 0, height: 4} },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' }
});