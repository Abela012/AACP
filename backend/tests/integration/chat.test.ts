import { describe, expect, it } from 'vitest';
import * as chatService from '../../src/modules/chat/chat.service';
import { api } from '../helpers/app';
import { authHeaderForUser } from '../helpers/auth';
import { createTestUser, seedPlatformSettings } from '../helpers/fixtures';

describe('Chat', () => {
  it('creates conversation and persists messages via service', async () => {
    await seedPlatformSettings();
    const userA = await createTestUser({ role: 'business_owner' });
    const userB = await createTestUser({ role: 'advertiser' });

    const conversation = await chatService.getOrCreateConversation([
      String(userA._id),
      String(userB._id),
    ]);

    const message = await chatService.saveMessage({
      conversationId: String(conversation._id),
      senderId: String(userA._id),
      text: 'Hello — interested in your rates for a campaign.',
    });

    expect(message.text).toContain('interested');
    const messages = await chatService.getConversationMessages(String(conversation._id));
    expect(messages.length).toBe(1);
  });

  it('lists conversations for authenticated user via API', async () => {
    await seedPlatformSettings();
    const userA = await createTestUser({ role: 'business_owner' });
    const userB = await createTestUser({ role: 'advertiser' });

    await chatService.getOrCreateConversation([String(userA._id), String(userB._id)]);

    authHeaderForUser(userA, 'clerk');
    const res = await api().get('/api/v1/chat/conversations');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('starts conversation via POST /chat/conversations', async () => {
    await seedPlatformSettings();
    const userA = await createTestUser({ role: 'advertiser' });
    const userB = await createTestUser({ role: 'business_owner' });

    authHeaderForUser(userA, 'clerk');
    const res = await api()
      .post('/api/v1/chat/conversations')
      .send({ recipientId: String(userB._id) });

    expect(res.status).toBe(200);
    expect(res.body.data?.participants?.length).toBeGreaterThanOrEqual(2);
  });
});
