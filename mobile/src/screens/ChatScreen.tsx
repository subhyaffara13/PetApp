import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Colors, Spacing, Typography } from '../theme/theme';
import { ChatApi } from '../services/api';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  isEmergency?: boolean;
  time: string;
}

const QUICK_SYMPTOMS = [
  '🚨 Ingested Poison / Chocolate',
  '🫁 Breathing Difficulty',
  '🤮 Severe Vomiting',
  '🩸 Open Wound / Trauma',
  '🐾 Limping & Pain',
  '👁️ Eye Injury / Swelling',
];

export const ChatScreen = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: "👋 Hello! I am your 24/7 AI Pet Health Assistant. Tell me what symptoms your pet is experiencing, or choose a common symptom below. If this is a life-threatening emergency, please proceed immediately to the nearest ER.",
      time: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: Message = {
      id: String(Date.now()),
      sender: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    try {
      const response = await ChatApi.sendTriageMessage(text);
      const aiMsg: Message = {
        id: String(Date.now() + 1),
        sender: 'ai',
        text: response.reply || "I've analyzed the symptoms. Please observe your pet closely. If symptoms worsen, consult a veterinary specialist.",
        isEmergency: response.isEmergency,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errorMsg: Message = {
        id: String(Date.now() + 1),
        sender: 'ai',
        text: "⚠️ If your pet has pale gums, breathing distress, or severe bleeding, please contact a 24/7 emergency veterinarian immediately.",
        isEmergency: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header Info */}
      <View style={styles.chatHeader}>
        <View style={styles.aiAvatar}>
          <Text style={{ fontSize: 18 }}>🤖</Text>
        </View>
        <View>
          <Text style={styles.aiName}>Gemini AI Pet Triage Assistant</Text>
          <Text style={styles.aiStatus}>🟢 Online 24/7 · Powered by Google AI</Text>
        </View>
      </View>

      {/* Quick Symptom Chips */}
      <View style={styles.quickChipsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
          {QUICK_SYMPTOMS.map((sym, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.chipButton}
              onPress={() => handleSend(`My pet is experiencing: ${sym}`)}
            >
              <Text style={styles.chipText}>{sym}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Messages Feed */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesScroll}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg) => {
          const isAi = msg.sender === 'ai';

          return (
            <View
              key={msg.id}
              style={[
                styles.messageBubble,
                isAi ? styles.bubbleAi : styles.bubbleUser,
                msg.isEmergency && styles.bubbleEmergency,
              ]}
            >
              {msg.isEmergency && (
                <View style={styles.emergencyTag}>
                  <Text style={styles.emergencyTagText}>🚨 URGENT VET ATTENTION RECOMMENDED</Text>
                </View>
              )}
              <Text style={styles.messageText}>{msg.text}</Text>
              <Text style={styles.messageTime}>{msg.time}</Text>
            </View>
          );
        })}

        {isTyping && (
          <View style={[styles.messageBubble, styles.bubbleAi, styles.typingBubble]}>
            <ActivityIndicator size="small" color={Colors.primaryLight} />
            <Text style={styles.typingText}>Analyzing veterinary symptoms...</Text>
          </View>
        )}
      </ScrollView>

      {/* Input Row */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.textInput}
          placeholder="Describe pet symptoms or ask a question..."
          placeholderTextColor={Colors.textMuted}
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={() => handleSend()}
          disabled={!inputText.trim()}
        >
          <Text style={styles.sendButtonText}>➔</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  aiAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  aiName: { fontSize: 13, fontWeight: '800', color: Colors.text },
  aiStatus: { fontSize: 10, color: Colors.successLight, marginTop: 1 },
  quickChipsWrap: {
    backgroundColor: Colors.surface,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  chipsScroll: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.xs,
  },
  chipButton: {
    backgroundColor: Colors.surfaceCard,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  chipText: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },
  messagesScroll: { flex: 1 },
  messagesContent: { padding: Spacing.md, paddingBottom: 16 },
  messageBubble: {
    maxWidth: '82%',
    padding: Spacing.md - 2,
    borderRadius: 16,
    marginBottom: Spacing.sm,
  },
  bubbleUser: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleAi: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bubbleEmergency: {
    borderColor: Colors.danger,
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
  },
  emergencyTag: {
    backgroundColor: Colors.danger,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  emergencyTagText: { color: '#fff', fontSize: 9, fontWeight: '900' },
  messageText: { fontSize: 13, color: Colors.text, lineHeight: 19 },
  messageTime: { fontSize: 9, color: Colors.textMuted, marginTop: 4, alignSelf: 'flex-end' },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 10,
  },
  typingText: { fontSize: 11, color: Colors.textMuted },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.xs,
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.surfaceCard,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    color: Colors.text,
    fontSize: 13,
    maxHeight: 90,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: { opacity: 0.4 },
  sendButtonText: { color: '#fff', fontSize: 16, fontWeight: '900' },
});
