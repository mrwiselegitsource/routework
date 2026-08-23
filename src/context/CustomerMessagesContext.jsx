import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../lib/db';
import { useCustomerAuth } from './CustomerAuthContext';

const CustomerMessagesContext = createContext();

export function CustomerMessagesProvider({ children }) {
  const { profile } = useCustomerAuth();
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshMessages = async () => {
    if (!profile) {
      setMessages([]);
      setUnreadCount(0);
      return;
    }
    try {
      const msgs = await db.getCustomerMessages(profile.id);
      
      // SMART SYSTEM: Check for unpaid/stuck orders and auto-generate messages
      try {
        const orders = await db.getCustomerOrders(profile.id);
        let newMessagesCreated = false;
        
        for (const order of orders) {
          if (order.payment_status === 'unpaid') {
            // Check if we already sent a payment reminder for this order
            const hasReminder = msgs.some(m => m.order_id === order.order_id && m.type === 'payment');
            
            if (!hasReminder) {
              await db.createCustomerMessage({
                customer_id: profile.id,
                order_id: order.order_id,
                title: 'Pending Payment Required',
                content: `Your order ${order.item_name} (Tracking: ${order.order_id}) is currently on hold due to a pending payment. Please complete your payment to ensure a timely delivery.`,
                type: 'payment',
                is_read: false
              });
              newMessagesCreated = true;
            }
          } else if (!order.recipient_address && order.payment_status !== 'unpaid') {
             // Paid but stuck waiting for claim
             const hasAlert = msgs.some(m => m.order_id === order.order_id && m.type === 'alert' && m.title.includes('Action Required'));
             
             if (!hasAlert) {
               await db.createCustomerMessage({
                 customer_id: profile.id,
                 order_id: order.order_id,
                 title: 'Action Required: Claim Shipment',
                 content: `Your shipment ${order.item_name} (Tracking: ${order.order_id}) is ready to be delivered, but we need your delivery address. Please claim the shipment to proceed.`,
                 type: 'alert',
                 is_read: false
               });
               newMessagesCreated = true;
             }
          }
        }
        
        // If we created new messages, fetch again
        if (newMessagesCreated) {
          const updatedMsgs = await db.getCustomerMessages(profile.id);
          setMessages(updatedMsgs);
          setUnreadCount(updatedMsgs.filter(m => !m.is_read).length);
          return;
        }
      } catch (smartErr) {
        console.error('Smart messaging failed:', smartErr);
      }

      setMessages(msgs);
      setUnreadCount(msgs.filter(m => !m.is_read).length);
    } catch (err) {
      console.error('Failed to load messages', err);
    }
  };

  useEffect(() => {
    refreshMessages();
    // Set up a simple polling for new messages every 30s
    const interval = setInterval(refreshMessages, 30000);
    return () => clearInterval(interval);
  }, [profile]);

  const markAsRead = async (messageId) => {
    try {
      await db.markMessageRead(messageId);
      await refreshMessages();
    } catch (err) {
      console.error('Failed to mark message read', err);
    }
  };

  return (
    <CustomerMessagesContext.Provider value={{ messages, unreadCount, refreshMessages, markAsRead }}>
      {children}
    </CustomerMessagesContext.Provider>
  );
}

export const useCustomerMessages = () => useContext(CustomerMessagesContext);
