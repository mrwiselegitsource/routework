import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search, Loader2, ShieldCheck, AlertTriangle } from 'lucide-react';
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
  const [errorMsg, setErrorMsg] = useState(null);

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
    setErrorMsg(null);

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
      setErrorMsg('Something went wrong. Please check your tracking number and try again.');
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
      const orderData = await db.getOrder(oid);
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

  // Claim handled via Cart flow now
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

  let formattedEta = 'To be updated';
  let formattedEtaTime = null;
  
  let activeEta = order?.estimated_delivery;
  if (order?.payment_status === 'unpaid' && order?.delivery_duration_hours) {
    const d = new Date();
    d.setHours(d.getHours() + order.delivery_duration_hours);
    activeEta = d;
  }

  if (activeEta && activeEta !== 'To be updated') {
    const d = activeEta instanceof Date ? activeEta : new Date(activeEta);
    if (!isNaN(d.getTime())) {
      formattedEta = d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' });
      formattedEtaTime = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (typeof activeEta === 'string') {
      formattedEta = activeEta;
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      <Helmet>
        <title>Track & Trace | RouteWorks</title>
        <meta name="description" content="Track your shipment in real-time with RouteWorks secure tracking." />
      </Helmet>

      {/* Search Header */}
      <div className="relative py-8 md:py-12 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/track-hero.jpg"
            alt="Track & Trace"
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
          />
          <div className="hidden w-full h-full bg-[#001b57] flex-col items-center justify-center text-white/50 border border-white/20">
            Missing Image: public/images/track-hero.jpg
          </div>
          <div className="absolute inset-0 bg-[#001b57]/90"></div>
        </div>
        <div className="container mx-auto max-w-2xl text-center relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Track & Trace</h1>
          <p className="text-sm md:text-base text-blue-100 max-w-xl mx-auto font-light">
            Monitor the status and location of your shipments in real-time.
          </p>
        </div>
      </div>

      {/* Edge-to-Edge Tracking Bar */}
      <div className="w-full bg-white border-b border-gray-200 animate-[fadeIn_1.1s_ease-out]">
        <div className="container mx-auto max-w-4xl px-4 py-6 md:py-8">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tracking Number (e.g. RW-DEMO)"
              className="flex-1 px-4 py-3 rounded text-base text-gray-800 bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:border-[#0033a0]"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-[#0033a0] text-white font-bold px-6 py-3 rounded flex items-center justify-center disabled:opacity-70 whitespace-nowrap"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Track'}
            </button>
          </form>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto max-w-4xl px-4 relative z-20 py-6 md:py-10">
        {order && (
          <div className="bg-orange-50 border border-orange-200 text-orange-800 p-4 rounded-xl flex gap-3 items-start mb-6">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-bold mb-1">Important Anti-Fraud Warning</p>
              <p>Please ensure that you are only tracking and claiming orders that rightfully belong to you. Attempting to claim or pay for someone else's shipment is considered theft. All claims are securely logged and fraudulent activities will be reported to the authorities.</p>
            </div>
          </div>
        )}

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
          <div className="glass-card rounded-3xl p-10 text-center border-t-4 border-t-brand-orange mt-8 animate-[fadeIn_0.5s_ease-out]">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-brand-orange" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2 font-display">Shipment not found</h3>
            <p className="text-gray-500 mb-6">
              {errorMsg || `We couldn't find any shipment matching '${searchInput}'. Please double-check it with the sender and try again.`}
            </p>
            <button
              onClick={() => { setStep(STEP.SEARCH); setSearchInput(''); setErrorMsg(null); }}
              className="premium-button text-white font-bold px-8 py-3.5 rounded-xl"
            >
              Try Again
            </button>
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
              status={(order.current_status || 'pending').replace(/_/g, ' ')}
              location={isClaimed ? (order.current_location || 'Pending update') : (order.sender_country ? `${order.sender_country} (Origin Port - Pending Delivery Details)` : 'Origin Port (Pending Delivery Details)')}
              eta={formattedEta}
              etaTime={formattedEtaTime}
            />

            {!isClaimed && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-8 flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-red-800 font-bold">Action Required: Shipment at Origin</h4>
                  <p className="text-red-700 text-sm mt-1">
                    This shipment is currently held at our origin facility. To arrange delivery to your location, please provide your delivery details and complete the shipping payment below.
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col lg:flex-row gap-8">
              <div className="w-full lg:w-1/2">
                <Timeline steps={generateTimelineSteps()} />
              </div>

              <div className="w-full lg:w-1/2 flex flex-col gap-8">
                <MediaGallery media={media} />

                <DetailsPanel
                  trackingId={order.order_id}
                  origin={order.sender_country || 'Origin Port'}
                  destination="Ghana"
                  location={isClaimed ? (order.current_location || 'Pending update') : 'Origin Port (Pending Delivery Details)'}
                  method="Standard Logistics"
                  eta={formattedEta}
                  paymentStatus={order.payment_status}
                />

                <ClaimGate
                  trackingId={order.order_id}
                  paymentStatus={order.payment_status === 'unpaid' ? 'Unpaid' : 'Paid'}
                  claimStatus={isClaimed ? 'Claimed' : 'Unclaimed'}
                  amountDue={order.amount_due}
                  recipientDetails={{
                    recipient_name: order.recipient_name,
                    recipient_phone: order.recipient_phone,
                    recipient_address: order.recipient_address,
                    recipient_region: order.recipient_region
                  }}
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
