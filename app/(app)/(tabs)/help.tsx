import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from 'react-native';
import { trackEvent } from '../../../lib/analytics';

const FAQS = [
  {
    q: 'How do I cancel a booking?',
    a: 'Go to the Bookings tab, find your booking, and tap "Cancel Booking". You can only cancel bookings with Pending or Confirmed status.',
  },
  {
    q: 'How is the total price calculated?',
    a: 'Total price = Daily rate × Number of days. The number of days is calculated from your pick-up date to your return date.',
  },
  {
    q: 'What date format should I use for bookings?',
    a: 'Use the YYYY-MM-DD format. For example, June 15, 2026 should be entered as 2026-06-15.',
  },
  {
    q: 'Can I book a car that is marked as Engaged?',
    a: 'No, cars marked as Engaged are currently rented out. Please check back later or choose another available car.',
  },
  {
    q: 'How do I update my display name?',
    a: 'Go to the Profile tab, tap on your display name, enter the new name, and tap Save.',
  },
  {
    q: 'Who do I contact for urgent support?',
    a: 'For urgent support, call us at +92-300-1234567 or email support@hitch.pk. Our team is available Mon–Sat, 9am–6pm.',
  },
];

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
};

function getBotReply(msg: string): string {
  const lower = msg.toLowerCase();
  if (lower.includes('cancel'))
    return 'To cancel a booking, go to the Bookings tab, open the booking, and tap "Cancel Booking". Only Pending or Confirmed bookings can be cancelled.';
  if (lower.includes('price') || lower.includes('cost') || lower.includes('total'))
    return 'The total price is Daily Rate × Number of days. Check the Booking Summary screen for a full breakdown before confirming.';
  if (lower.includes('date') || lower.includes('format'))
    return 'Please enter dates in YYYY-MM-DD format, e.g. 2026-06-15 for June 15, 2026.';
  if (lower.includes('available') || lower.includes('engaged'))
    return 'Available cars can be booked immediately. Cars marked "Engaged" are currently rented — please choose another car or check back later.';
  if (lower.includes('name') || lower.includes('profile'))
    return 'To change your display name, go to Profile → tap your name → edit → Save.';
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey'))
    return 'Hello! How can I help you today? You can ask me about bookings, pricing, or how to use the app.';
  if (lower.includes('thank'))
    return "You're welcome! Is there anything else I can help you with?";
  if (lower.includes('contact') || lower.includes('phone') || lower.includes('email'))
    return 'You can reach us at +92-300-1234567 or support@hitch.pk. We are available Mon–Sat, 9am–6pm.';
  return "I'm not sure about that. Please check our FAQ section above, or contact us at support@hitch.pk for further assistance.";
}

export default function HelpScreen() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      text: 'Hi! I\'m the Hitch support assistant. Ask me anything about the app or your bookings.',
      sender: 'bot',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<FlatList>(null);

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
    trackEvent('faq_opened', { index });
  };

  const sendMessage = () => {
    const text = inputText.trim();
    if (!text) return;

    const userMsg: Message = { id: Date.now().toString(), text, sender: 'user' };
    const botMsg: Message = {
      id: (Date.now() + 1).toString(),
      text: getBotReply(text),
      sender: 'bot',
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInputText('');
    trackEvent('chat_message_sent');

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.bubble,
        item.sender === 'user' ? styles.userBubble : styles.botBubble,
      ]}
      accessibilityLabel={`${item.sender === 'user' ? 'You' : 'Support'}: ${item.text}`}
    >
      <Text
        style={[
          styles.bubbleText,
          item.sender === 'user' ? styles.userBubbleText : styles.botBubbleText,
        ]}
      >
        {item.text}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Help & Support</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <ScrollView
          style={styles.scrollArea}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 16 }}
        >
          {/* FAQ Section */}
          <Text style={styles.sectionLabel}>Frequently Asked Questions</Text>
          {FAQS.map((faq, i) => (
            <TouchableOpacity
              key={i}
              style={styles.faqItem}
              onPress={() => toggleFaq(i)}
              accessibilityRole="button"
              accessibilityLabel={faq.q}
              accessibilityHint={expandedFaq === i ? 'Tap to collapse' : 'Tap to expand answer'}
            >
              <View style={styles.faqHeader}>
                <Text style={styles.faqQ}>{faq.q}</Text>
                <Text style={styles.faqChevron}>
                  {expandedFaq === i ? '▲' : '▼'}
                </Text>
              </View>
              {expandedFaq === i && (
                <Text style={styles.faqA}>{faq.a}</Text>
              )}
            </TouchableOpacity>
          ))}

          {/* Contact */}
          <View style={styles.contactCard}>
            <Text style={styles.contactTitle}>Still need help?</Text>
            <Text style={styles.contactLine}>📞  +92-300-1234567</Text>
            <Text style={styles.contactLine}>✉️  support@hitch.pk</Text>
            <Text style={styles.contactHours}>Mon – Sat, 9am – 6pm</Text>
          </View>

          {/* Chat */}
          <Text style={styles.sectionLabel}>Live Chat</Text>
          <View style={styles.chatBox}>
            <FlatList
              ref={scrollRef}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={renderMessage}
              style={styles.chatMessages}
              scrollEnabled={false}
            />
          </View>
        </ScrollView>

        {/* Chat Input */}
        <View style={styles.chatInputRow}>
          <TextInput
            style={styles.chatInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor="#444"
            returnKeyType="send"
            onSubmitEditing={sendMessage}
            accessibilityLabel="Chat message input"
            accessibilityHint="Type your question and press send"
          />
          <TouchableOpacity
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            onPress={sendMessage}
            disabled={!inputText.trim()}
            accessibilityRole="button"
            accessibilityLabel="Send message"
          >
            <Text style={styles.sendBtnText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#181818',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#D4AF37',
    letterSpacing: 1,
  },
  scrollArea: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },

  sectionLabel: {
    color: '#888',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 12,
    marginTop: 8,
  },

  faqItem: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1e1e1e',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQ: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  faqChevron: { color: '#D4AF37', fontSize: 12 },
  faqA: {
    color: '#888',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 12,
  },

  contactCard: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#D4AF3722',
    gap: 8,
  },
  contactTitle: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 4 },
  contactLine: { color: '#ccc', fontSize: 14 },
  contactHours: { color: '#555', fontSize: 12, marginTop: 4 },

  chatBox: {
    backgroundColor: '#0f0f0f',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e1e1e',
    padding: 12,
    marginBottom: 8,
    minHeight: 120,
  },
  chatMessages: { flexGrow: 0 },
  bubble: {
    maxWidth: '80%',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 8,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#D4AF37',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#1a1a1a',
    borderBottomLeftRadius: 4,
  },
  bubbleText: { fontSize: 13, lineHeight: 19 },
  userBubbleText: { color: '#0a0a0a', fontWeight: '600' },
  botBubbleText: { color: '#ccc' },

  chatInputRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
    backgroundColor: '#0a0a0a',
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#252525',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 14,
  },
  sendBtn: {
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    paddingHorizontal: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText: { color: '#0a0a0a', fontWeight: '800', fontSize: 13 },
});
