import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Colors, Spacing, Typography } from '../theme/theme';
import { apiClient } from '../services/api';

export const ChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Hello! I am your PetSOS AI Assistant. Ask me anything about your pet’s behavior, nutrition, or first aid guidance 🐾',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;
    const text = inputText.trim();
    const userMsg = { id: Date.now().toString(), sender: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const history = messages
        .slice(-20)
        .map((m) => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text }));
      const res = await apiClient.post('/chat/message', {
        message: text,
        history,
      });
      const aiReply = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: res.data.message || 'I’m not sure how to answer that. Could you rephrase?',
        emergency: !!res.data.emergency,
      };
      setMessages((prev) => [...prev, aiReply]);
    } catch {
      const aiReply = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: 'Sorry, I couldn’t reach the PetSOS assistant right now. Please check your connection and try again.',
      };
      setMessages((prev) => [...prev, aiReply]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>💬 Pet Medical AI Assistant</Text>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 10 }}
        renderItem={({ item }) => (
          <View
            style={[
              styles.msgBubble,
              item.sender === 'user' ? styles.userBubble : styles.aiBubble,
            ]}
          >
            <Text style={[styles.msgText, item.sender === 'user' ? styles.userText : styles.aiText]}>
              {item.text}
            </Text>
            {item.emergency && (
              <TouchableOpacity
                style={styles.emergencyCta}
                onPress={() => {
                  // Emergency tab is tab index 0 (SOS ER) — navigate there
                }}
              >
                <Text style={styles.emergencyCtaText}>🚨 Go to Emergency</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.textInput}
          placeholder="Ask a pet health or diet question..."
          placeholderTextColor={Colors.textMuted}
          value={inputText}
          onChangeText={setInputText}
          editable={!isLoading}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.sendBtnText}>Send</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: Spacing.md },
  headerTitle: { ...Typography.h1, marginBottom: Spacing.sm },
  msgBubble: { padding: 12, borderRadius: 12, marginBottom: 8, maxWidth: '85%' },
  userBubble: { alignSelf: 'flex-end', backgroundColor: Colors.primary },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  msgText: { fontSize: 14, lineHeight: 20 },
  userText: { color: '#ffffff' },
  aiText: { color: Colors.text },
  emergencyCta: {
    marginTop: 8,
    backgroundColor: Colors.danger,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  emergencyCtaText: { color: '#ffffff', fontWeight: '700', fontSize: 12 },
  inputRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  textInput: {
    flex: 1,
    backgroundColor: Colors.surface,
    color: Colors.text,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendBtn: { backgroundColor: Colors.primary, paddingHorizontal: 16, justifyContent: 'center', borderRadius: 8, minWidth: 64, alignItems: 'center' },
  sendBtnText: { color: '#ffffff', fontWeight: '700' },
});
