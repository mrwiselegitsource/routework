import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search, Loader2, ShieldCheck } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import StatusHeader from '../components/tracking/StatusHeader';
import Timeline from '../components/tracking/Timeline';
import DetailsPanel from '../components/tracking/DetailsPanel';
import ClaimGate from '../components/tracking/ClaimGate';
import MediaGallery from '../components/tracking/MediaGallery';
import GlobalNetwork from '../components/tracking/GlobalNetwork';
import TrackingPasswordGate from '../components/tracking/TrackingPasswordGate';
import GuestPreview from '../components/tracking/GuestPreview';
import { db } from '../lib/db';

/*
  Tracking Flow (per PRD §5):
  1. Enter tracking number → search
  2. If protected → show TrackingPasswordGate
  3. On password success → show GuestPreview (limited)
  4. If customer is logged in → show full details
  5. If not logged in → prompt signup/login
*/

// Flow states
const STEP = {
  SEARCH: 'search',          // Initial — show search bar
  PASSWORD: 'password',       // Protected order — ask for password
  GUEST_PREVIEW: 'guest',     // Password verified — show limited preview
  FULL_VIEW: 'full',          // Authenticated — show everything
  NOT_FOUND: 'not_found',     // No order found
};

export default function Track() {
  const [searchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [step, setStep] = useState(STEP.SEARCH);
  const [isLoading, setIsLoading] = useState(false);

  // Data
  const [orderInfo, setOrderInfo] = useState(null);    // Security/basic info
  const [preview, setPreview] = useState(null);         // Guest preview data
  const [order, setOrder] = useState(null);              // Full order data
  const [events, setEvents] = useState([]);
  const [media, setMedia] = useState([]);

  // Check URL for tracking ID on mount
  useEffect(() => {
    const idParam = searchParams.get('id');
    if (idParam) {
      setSearchInput(idParam);
      handleLookup(idParam);
    }
  }, []);

  const handleLookup = async (inputId) => {
    const id = (inputId || searchInput).trim().toUpperCase();
    if (id.length < 3) return;

    setIsLoading(true);
    setTrackingNumber(id);

    try {
      // First check if the order exists and get security info
      const security = await db.getOrderSecurity(id);

      if (!security) {
        setStep(STEP.NOT_FOUND);
        setIsLoading(false);
        return;
      }

      // If the order is protected, show password gate
      if (security.protected) {
        setOrderInfo(security);
        setStep(STEP.PASSWORD);
      } else {
        // Not protected — go straight to full view
        await loadFullOrder(id);
      }
    } catch (err) {
      console.error('Tracking lookup failed:', err);
      setStep(STEP.NOT_FOUND);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    handleLookup();
  };

  const handlePasswordUnlocked = async () => {
    // Password verified — load guest preview
    try {
      const guestData = await db.getGuestOrderPreview(trackingNumber);
      const mediaData = await db.getOrderMedia(trackingNumber);
      setPreview(guestData);
      // For guest, only show first image
      setMedia(mediaData.length > 0 ? [mediaData[0]] : []);
      setStep(STEP.GUEST_PREVIEW);
    } catch (err) {
      console.error('Failed to load preview:', err);
    }
  };

  const loadFullOrder = async (id) => {
    const oid = id || trackingNumber;
    try {
      const orderData = await db.getPublicOrder(oid);
      if (!orderData) {
        setStep(STEP.NOT_FOUND);
        return;
      }
      const eventsData = await db.getTrackingEvents(oid);
      const mediaData = await db.getOrderMedia(oid);
      setOrder(orderData);
      setEvents(eventsData);
      setMedia(mediaData);
      setStep(STEP.FULL_VIEW);
    } catch (err) {
      console.error('Failed to load full order:', err);
      setStep(STEP.NOT_FOUND);
    }
  };

  const handleCancelPassword = () => {
    setStep(STEP.SEARCH);
    setTrackingNumber('');
    setSearchInput('');
  };

  const handleClaim = async (form) => {
    await db.submitDeliveryDetails(order.order_id, {
      recipient_name: form.name,
      recipient_phone: form.phone,
      recipient_address: form.address,
      recipient_region: form.region
    });
    await db.addTrackingEvent(order.order_id, {
      status: 'delivery_arranged',
      location: 'Dispatch Center',
      description: 'Recipient submitted delivery details. Arranging dispatch.'
    }, null);
    await loadFullOrder(order.order_id);
  };

  // Convert raw DB events to Timeline component format
  const generateTimelineSteps = () => {
    if (!events.length) return [];

    const StandardFlow = [
      'order_confirmed',
      'package_prepared',
      'picked_up',
      'departed_origin',
      'in_transit',
      'arrived_destination',
      'customs_clearance',
      'released_from_customs',
      'delivery_arranged',
      'out_for_delivery',
      'delivered'
    ];

    const currentIdx = StandardFlow.indexOf(order.current_status);
    const chronologicalEvents = [...events].reverse();

    const completedSteps = chronologicalEvents.map((e, idx) => {
      const isCurrent = e.status === order.current_status && idx === chronologicalEvents.length - 1;
      const isException = ['delivery_attempt_failed', 'held_by_customs', 'address_issue', 'returned_to_sender'].includes(e.status);

      const d = new Date(e.event_time);
      return {
        label: e.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        date: d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
        time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        location: e.location,
        note: e.description,
        status: isException ? 'exception' : (isCurrent ? 'current' : 'completed'),
        source: e.source || 'manual'
      };
    });

    let futureSteps = [];
    if (currentIdx !== -1) {
      futureSteps = StandardFlow.slice(currentIdx + 1).map(status => ({
        label: status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        status: 'future'
      }));
    }

    return [...completedSteps, ...futureSteps];
  };

  const isClaimed = !!order?.recipient_address;

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      <Helmet>
        <title>Track & Trace | RouteWorks</title>
        <meta name="description" content="Track your shipment in real-time with RouteWorks secure tracking." />
      </Helmet>

      {/* Search Header */}
      <div className="relative pt-16 pb-24 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/track-hero.jpg"
            alt="Track & Trace"
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
          />
          <div className="hidden w-full h-full bg-[#0033a0] flex-col items-center justify-center text-white/50 border border-white/20 backdrop-blur-sm">
            Missing Image: public/images/track-hero.jpg
          </div>
          <div className="absolute inset-0 bg-[#001b57]/80 backdrop-blur-[2px]"></div>
        </div>
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <span className="text-orange-500 font-bold tracking-widest uppercase text-sm mb-4 block animate-[fadeIn_0.5s_ease-out]">LIVE UPDATES</span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-6 animate-[fadeIn_0.7s_ease-out]">Track & Trace</h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto font-light animate-[fadeIn_0.9s_ease-out]">
            Monitor the status and location of your shipments in real-time.
          </p>
        </div>
      </div>

      {/* Floating Tracking Bar */}
      <div className="container mx-auto px-4 relative z-20 -mt-10 mb-12 animate-[fadeIn_1.1s_ease-out]">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-4 md:p-6 border border-gray-100">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Enter Tracking Number (e.g. RW-DEMO01)"
              className="flex-1 px-6 py-5 rounded-xl text-lg text-gray-800 bg-gray-50 border-2 border-transparent focus:bg-white focus:outline-none focus:border-orange-500 transition-all shadow-inner"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-orange-500 text-white font-bold px-8 py-5 rounded-xl hover:bg-orange-600 transition-colors flex items-center justify-center disabled:opacity-70 shadow-lg shadow-orange-500/30 min-w-[160px]"
            >
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : <Search className="w-6 h-6 mr-2" />}
              {isLoading ? 'Searching...' : 'Track'}
            </button>
          </form>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto max-w-4xl px-4 relative z-20">

        {/* SEARCH state — show global network */}
        {step === STEP.SEARCH && (
          <GlobalNetwork />
        )}

        {/* PASSWORD state — show password gate */}
        {step === STEP.PASSWORD && (
          <TrackingPasswordGate
            trackingNumber={trackingNumber}
            onUnlocked={handlePasswordUnlocked}
            onCancel={handleCancelPassword}
          />
        )}

        {/* GUEST PREVIEW state — limited view + signup/login CTA */}
        {step === STEP.GUEST_PREVIEW && preview && (
          <GuestPreview
            preview={preview}
            media={media[0] || null}
          />
        )}

        {/* NOT FOUND state */}
        {step === STEP.NOT_FOUND && (
          <div className="bg-white rounded-3xl shadow-xl p-10 text-center border border-gray-100 mt-8 animate-[fadeIn_0.5s_ease-out]">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Shipment not found</h3>
            <p className="text-gray-500">We couldn't find any shipment matching '{searchInput}'. Please double-check it with the sender and try again.</p>
          </div>
        )}

        {/* FULL VIEW state — authenticated user */}
        {step === STEP.FULL_VIEW && order && (
          <>
            {/* Verified Badge */}
            <div className="flex items-center gap-2 mb-6 justify-center">
              <ShieldCheck className="w-5 h-5 text-green-500" />
              <span className="text-green-600 font-bold text-sm">Shipment Verified & Unlocked</span>
            </div>

            <StatusHeader
              trackingId={order.order_id}
              status={order.current_status.replace(/_/g, ' ')}
              location={order.current_location || 'Pending update'}
              eta={order.estimated_delivery || 'To be updated'}
            />

            <div className="flex flex-col lg:flex-row gap-8">
              <div className="w-full lg:w-1/2">
                <Timeline steps={generateTimelineSteps()} />
              </div>

              <div className="w-full lg:w-1/2 flex flex-col gap-8">
                <MediaGallery media={media} />

                <DetailsPanel
                  trackingId={order.order_id}
                  origin={order.sender_country || 'Not specified'}
                  destination="Ghana"
                  location={order.current_location || 'Pending update'}
                  method="Standard Logistics"
                  eta={order.estimated_delivery || 'To be updated'}
                  paymentStatus={order.payment_status}
                />

                <ClaimGate
                  paymentStatus={order.payment_status === 'unpaid' ? 'Unpaid' : 'Paid'}
                  claimStatus={isClaimed ? 'Claimed' : 'Unclaimed'}
                  amountDue={order.amount_due}
                  onSubmitClaim={handleClaim}
                />

                {/* Support Section */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 text-center">
                  <p className="text-sm text-gray-500 mb-3 uppercase tracking-wider font-semibold">Need Help?</p>
                  <p className="text-gray-800 font-bold mb-1">Support: {order.support_phone || '+233 302 668 138'}</p>
                  <a href="#" className="text-green-600 font-bold hover:underline">WhatsApp Us</a>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
