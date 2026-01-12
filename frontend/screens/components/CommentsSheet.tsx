import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  SafeAreaView,
} from 'react-native';
import { X, Send, Heart, MoreHorizontal } from 'lucide-react-native';

/* ---------- 1. DATABASE MODELS (Interfaces) ---------- */

export interface User {
  id: string;
  username: string;
  avatarUrl: string;
  isVerified?: boolean;
}

export interface CommentData {
  id: string;
  userId: string;
  text: string;
  createdAt: string; // ISO String in DB
  likesCount: number;
  isLikedByMe: boolean;
  parentId: string | null; // null = top level, string = reply
  replyCount?: number;
}

/* ---------- 2. DUMMY DATA (Simulating DB Response) ---------- */

const CURRENT_USER: User = {
  id: 'u1',
  username: 'aswin_tu',
  avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=100&q=80',
};

// The creator of the post (to show "Author" badge)
const POST_AUTHOR_ID = 'author_123';

const MOCK_COMMENTS: (CommentData & { user: User })[] = [
  {
    id: 'c1',
    userId: 'u2',
    user: { id: 'u2', username: 'alex_design', avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80' },
    text: 'Is the material breathable for summer?',
    createdAt: '2023-10-12T10:00:00Z',
    likesCount: 12,
    isLikedByMe: false,
    parentId: null,
    replyCount: 1,
  },
  {
    id: 'c2',
    userId: 'author_123', // This matches POST_AUTHOR_ID
    user: { id: 'author_123', username: 'studio_sdk', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80' },
    text: 'Yes! It is made of 100% organic cotton.',
    createdAt: '2023-10-12T10:05:00Z',
    likesCount: 45,
    isLikedByMe: true,
    parentId: 'c1', // This is a reply to c1
  },
  {
    id: 'c3',
    userId: 'u3',
    user: { id: 'u3', username: 'sarah_styles', avatarUrl: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=100&q=80' },
    text: 'Do you ship to Canada? 😍',
    createdAt: '2023-10-12T11:00:00Z',
    likesCount: 2,
    isLikedByMe: false,
    parentId: null,
  },
];

/* ---------- 3. SUB-COMPONENT: SINGLE COMMENT ROW ---------- */

const CommentItem = ({ 
  item, 
  onReply, 
  onLike 
}: { 
  item: CommentData & { user: User }, 
  onReply: (username: string, id: string) => void,
  onLike: (id: string) => void
}) => {
  const isAuthor = item.userId === POST_AUTHOR_ID;
  const isReply = item.parentId !== null;

  return (
    <View style={[styles.commentRow, isReply && styles.replyRow]}>
      <Image source={{ uri: item.user.avatarUrl }} style={styles.avatar} />
      
      <View style={styles.commentContent}>
        {/* Username & Badge */}
        <View style={styles.nameRow}>
          <Text style={styles.username}>{item.user.username}</Text>
          {isAuthor && (
            <View style={styles.authorBadge}>
              <Text style={styles.authorBadgeText}>Author</Text>
            </View>
          )}
          <Text style={styles.timeText}>2h</Text>
        </View>

        {/* Text */}
        <Text style={styles.commentText}>
          {item.text}
        </Text>

        {/* Action Footer (Reply / Like Count) */}
        <View style={styles.actionFooter}>
          <TouchableOpacity onPress={() => onReply(item.user.username, item.id)}>
            <Text style={styles.actionText}>Reply</Text>
          </TouchableOpacity>
          
          {item.likesCount > 0 && (
             <Text style={styles.statsText}>{item.likesCount} likes</Text>
          )}
        </View>
      </View>

      {/* Like Button */}
      <TouchableOpacity onPress={() => onLike(item.id)} style={styles.likeBtn}>
        <Heart 
          size={14} 
          color={item.isLikedByMe ? '#ef4444' : '#6b7280'} 
          fill={item.isLikedByMe ? '#ef4444' : 'transparent'} 
        />
      </TouchableOpacity>
    </View>
  );
};

/* ---------- 4. MAIN COMPONENT ---------- */

interface CommentsSheetProps {
  visible: boolean;
  onClose: () => void;
  postId?: string; // For DB fetching
}

export default function CommentsSheet({ visible, onClose, postId }: CommentsSheetProps) {
  const [comments, setComments] = useState(MOCK_COMMENTS);
  const [inputText, setInputText] = useState('');
  const [replyingTo, setReplyingTo] = useState<{username: string, id: string} | null>(null);
  const inputRef = useRef<TextInput>(null);

  // Focus input when replying
  const handleReply = (username: string, commentId: string) => {
    setReplyingTo({ username, id: commentId });
    inputRef.current?.focus();
  };

  // Toggle Like Logic
  const handleLike = (commentId: string) => {
    setComments(prev => prev.map(c => {
      if (c.id === commentId) {
        return {
          ...c,
          isLikedByMe: !c.isLikedByMe,
          likesCount: c.isLikedByMe ? c.likesCount - 1 : c.likesCount + 1
        };
      }
      return c;
    }));
    // TODO: DB Call -> await api.likeComment(commentId)
  };

  // Submit Logic
  const handleSubmit = () => {
    if (!inputText.trim()) return;

    const newComment: CommentData & { user: User } = {
      id: Date.now().toString(),
      userId: CURRENT_USER.id,
      user: CURRENT_USER,
      text: inputText,
      createdAt: new Date().toISOString(),
      likesCount: 0,
      isLikedByMe: false,
      parentId: replyingTo ? replyingTo.id : null,
    };

    // If simulating a real DB, you usually append to bottom or top
    setComments([...comments, newComment]); 
    setInputText('');
    setReplyingTo(null);
    Keyboard.dismiss();
    
    // TODO: DB Call -> await api.postComment(postId, newComment)
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalContainer}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Comments</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#1f2937" />
            </TouchableOpacity>
          </View>

          {/* List */}
          <FlatList
            data={comments}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <CommentItem 
                item={item} 
                onReply={handleReply} 
                onLike={handleLike} 
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />

          {/* Input Area */}
          <View style={styles.inputWrapper}>
            {/* Replying To Indicator */}
            {replyingTo && (
              <View style={styles.replyContext}>
                <Text style={styles.replyContextText}>
                  Replying to <Text style={{fontWeight: '700'}}>{replyingTo.username}</Text>
                </Text>
                <TouchableOpacity onPress={() => setReplyingTo(null)}>
                  <X size={14} color="#6b7280" />
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.inputRow}>
              <Image source={{ uri: CURRENT_USER.avatarUrl }} style={styles.currentUserAvatar} />
              <TextInput
                ref={inputRef}
                style={styles.textInput}
                placeholder={replyingTo ? `Reply to ${replyingTo.username}...` : "Add a comment..."}
                placeholderTextColor="#9ca3af"
                value={inputText}
                onChangeText={setInputText}
                multiline
              />
              <TouchableOpacity 
                onPress={handleSubmit} 
                disabled={!inputText.trim()}
                style={[styles.sendBtn, !inputText.trim() && { opacity: 0.5 }]}
              >
                <Text style={styles.postText}>Post</Text>
              </TouchableOpacity>
            </View>
          </View>
          <SafeAreaView edges={['bottom']} style={{backgroundColor: '#fff'}}/>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    height: '85%', // Tall sheet like Instagram
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  
  /* Header */
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    position: 'relative',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  closeBtn: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },

  /* List */
  listContent: {
    paddingBottom: 20,
  },
  
  /* Comment Row */
  commentRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'flex-start',
  },
  replyRow: {
    paddingLeft: 56, // Indent replies
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
    backgroundColor: '#e5e7eb',
  },
  commentContent: {
    flex: 1,
    marginRight: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  username: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  timeText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  authorBadge: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  authorBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#4B5563',
  },
  commentText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  
  /* Action Footer */
  actionFooter: {
    flexDirection: 'row',
    marginTop: 6,
    gap: 16,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  statsText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  likeBtn: {
    paddingTop: 4,
  },

  /* Input Area */
  inputWrapper: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  replyContext: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  replyContextText: {
    fontSize: 12,
    color: '#6b7280',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  currentUserAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e5e7eb',
  },
  textInput: {
    flex: 1,
    maxHeight: 100,
    fontSize: 15,
    color: '#111827',
    padding: 0, // Remove default padding for clean alignment
  },
  sendBtn: {
    paddingHorizontal: 8,
  },
  postText: {
    color: '#3b82f6',
    fontWeight: '700',
    fontSize: 15,
  },
});