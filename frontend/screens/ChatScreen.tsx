import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Linking,
  Platform,
  KeyboardAvoidingView,
  SafeAreaView,
  ScrollView,
  StatusBar
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { 
  ArrowLeft, 
  Phone, 
  Send, 
  MoreVertical, 
  ShoppingBag,
  CheckCheck
} from 'lucide-react-native';

const SUGGESTED_QUESTIONS = [
  "Is this still available?",
  "What is the best price?",
  "Can you ship to my location?",
  "Is the condition new?"
];

export default function ChatScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  
  // Params from ItemScreen
  const { seller, product } = route.params || {};

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([
    { id: '1', text: "Hello! Thank you for checking out my item. Let me know if you have questions.", sender: 'seller', time: '10:00 AM' }
  ]);
  
  const flatListRef = useRef<FlatList>(null);

  // --- ACTIONS ---
  const handleCall = () => {
    if (seller?.phone) {
      Linking.openURL(`tel:${seller.phone}`);
    } else {
      Linking.openURL('tel:1234567890'); // Fallback
    }
  };

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    
    const newMsg = {
      id: Date.now().toString(),
      text: text,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    setMessage('');
    
    // Scroll to bottom
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  // --- RENDER MESSAGE ---
  const renderMessage = ({ item }: { item: any }) => {
    const isMe = item.sender === 'me';
    return (
      <View style={[styles.msgRow, isMe ? styles.msgRowMe : styles.msgRowSeller]}>
        {!isMe && (
          <Image 
            source={{ uri: seller?.profilePic || 'https://via.placeholder.com/32' }} 
            style={styles.msgAvatar} 
          />
        )}
        <View style={[styles.msgBubble, isMe ? styles.msgBubbleMe : styles.msgBubbleSeller]}>
          <Text style={[styles.msgText, isMe ? styles.msgTextMe : styles.msgTextSeller]}>
            {item.text}
          </Text>
          <View style={styles.msgFooter}>
            <Text style={[styles.msgTime, isMe ? { color: 'rgba(255,255,255,0.7)' } : { color: '#9ca3af' }]}>
              {item.time}
            </Text>
            {isMe && <CheckCheck size={14} color="rgba(255,255,255,0.7)" />}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* --- HEADER --- */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.iconBtn}
          >
            <ArrowLeft size={24} color="#1f2937" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.profileContainer} activeOpacity={0.7}>
            <View>
              <Image 
                source={{ uri: seller?.profilePic || 'https://via.placeholder.com/40' }} 
                style={styles.headerAvatar} 
              />
              {seller?.isVerified && <View style={styles.onlineBadge} />}
            </View>
            <View>
              <Text style={styles.headerTitle}>
                {seller?.username || "Seller"}
              </Text>
              <Text style={styles.headerSubtitle}>
                {seller?.isVerified ? "Verified Business" : "Online"}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity onPress={handleCall} style={styles.iconBtn}>
            <Phone size={22} color="#1f2937" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <MoreVertical size={22} color="#1f2937" />
          </TouchableOpacity>
        </View>
      </View>

      {/* --- PRODUCT CONTEXT CARD --- */}
      {product && (
        <View style={styles.productCard}>
          <View style={styles.productInner}>
            <Image 
              source={{ uri: product.image }} 
              style={styles.productThumb} 
              resizeMode="cover"
            />
            <View style={styles.productInfo}>
              <Text style={styles.productLabel}>Inquiry about:</Text>
              <Text style={styles.productTitle} numberOfLines={1}>{product.title}</Text>
              <Text style={styles.productPrice}>₹{product.price.toLocaleString()}</Text>
            </View>
          </View>
          <View style={styles.productBadge}>
             <ShoppingBag size={14} color="#3b82f6" />
          </View>
        </View>
      )}

      {/* --- CHAT LIST --- */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : undefined} 
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />

        {/* --- FOOTER AREA --- */}
        <View style={styles.footer}>
          
          {/* Suggested Chips */}
          <View style={{ height: 44 }}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.chipsContainer}
            >
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <TouchableOpacity 
                  key={i} 
                  style={styles.chip}
                  onPress={() => sendMessage(q)}
                >
                  <Text style={styles.chipText}>{q}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Input Bar */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor="#9ca3af"
              value={message}
              onChangeText={setMessage}
              multiline
            />
            <TouchableOpacity 
              style={[styles.sendBtn, !message.trim() && styles.sendBtnDisabled]} 
              onPress={() => sendMessage(message)}
              disabled={!message.trim()}
            >
              <Send size={20} color="#fff" style={{ marginLeft: 2 }} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  /* --- HEADER STYLES --- */
  header: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingTop: Platform.OS === 'android' ? 40 : 12,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: { padding: 8, borderRadius: 20, backgroundColor: '#f9fafb' },
  
  profileContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f3f4f6' },
  onlineBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: '#10b981', borderWidth: 2, borderColor: '#fff'
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  headerSubtitle: { fontSize: 12, color: '#6b7280', fontWeight: '500' },

  /* --- PRODUCT CARD --- */
  productCard: {
    margin: 16,
    marginBottom: 0,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  productInner: { flexDirection: 'row', gap: 12, alignItems: 'center', flex: 1 },
  productThumb: { width: 48, height: 48, borderRadius: 8, backgroundColor: '#e2e8f0' },
  productInfo: { flex: 1 },
  productLabel: { fontSize: 10, color: '#64748b', fontWeight: '600', textTransform: 'uppercase' },
  productTitle: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  productPrice: { fontSize: 13, fontWeight: '600', color: '#3b82f6', marginTop: 2 },
  productBadge: { padding: 8, backgroundColor: '#dbeafe', borderRadius: 20 },

  /* --- CHAT LIST --- */
  listContent: { padding: 16, paddingBottom: 20 },
  msgRow: { marginBottom: 16, flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  msgRowMe: { justifyContent: 'flex-end' },
  msgRowSeller: { justifyContent: 'flex-start' },
  
  msgAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#f3f4f6', marginBottom: 4 },
  
  msgBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  msgBubbleMe: { 
    backgroundColor: '#3b82f6', // App Primary Blue
    borderBottomRightRadius: 4 
  },
  msgBubbleSeller: { 
    backgroundColor: '#f3f4f6', 
    borderBottomLeftRadius: 4 
  },
  
  msgText: { fontSize: 15, lineHeight: 22 },
  msgTextMe: { color: '#fff' },
  msgTextSeller: { color: '#1f2937' },
  
  msgFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 4 },
  msgTime: { fontSize: 10 },

  /* --- FOOTER --- */
  footer: {
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  chipsContainer: { paddingHorizontal: 16, gap: 8, paddingBottom: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  chipText: { fontSize: 13, color: '#374151', fontWeight: '500' },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    color: '#111827',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  sendBtnDisabled: {
    backgroundColor: '#9ca3af',
    shadowOpacity: 0,
    elevation: 0,
  }
});