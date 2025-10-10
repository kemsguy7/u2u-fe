'use client';

import { useState, useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout';
import {
  Search,
  MapPin,
  Clock,
  CheckCircle,
  Phone,
  User,
  Package,
  Truck,
  Star,
  Calendar,
} from 'lucide-react';

import LiveMap from './LiveMap';

interface TrackingOrder {
  id: string;
  status: 'in-transit' | 'collected' | 'verified';
  category: string;
  weight: string;
  agent: string;
  eta: string;
}

interface OrderTimelineStep {
  title: string;
  description: string;
  timestamp: string;
  completed: boolean;
  current?: boolean;
}

interface AgentInfo {
  name: string;
  vehicle: string;
  capacity: string;
  rating: number;
  pickups: number;
}
interface OrderHistoryItem {
  id: string;
  amount: string;
  type: string;
  date: string;
  status: string;
}

interface PickupData {
  riderId: number;
  pickupAddress: string;
  pickupCoordinates?: {
    lat: number;
    lng: number;
  };
}

export default function TrackingPage() {
  const [activeTab, setActiveTab] = useState('active-orders');
  const [trackingId, setTrackingId] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  // Sample tracking data
  const activeOrders: TrackingOrder[] = [
    {
      id: 'REC123456',
      status: 'in-transit',
      category: 'Plastic Bottles & Containers',
      weight: '3.2kg',
      agent: 'John Adebayo',
      eta: '15 mins',
    },
    {
      id: 'REC123455',
      status: 'collected',
      category: 'Electronic Waste',
      weight: '5.1kg',
      agent: 'Sarah Okolie',
      eta: 'Processing',
    },
    {
      id: 'REC123454',
      status: 'verified',
      category: 'Metal Scrap',
      weight: '2.8kg',
      agent: 'Mike Johnson',
      eta: 'Payment pending',
    },
  ];

  const orderHistory = [
    {
      id: 'REC123453',
      amount: '5.2kg',
      type: 'recycled',
      date: '2025-01-15T10:30:00Z',
      status: 'pending',
    },
    {
      id: 'REC123452',
      amount: '12.5kg',
      type: 'recycled',
      date: '2025-01-18T09:15:00Z',
      status: 'collected',
    },
    {
      id: 'REC123451',
      amount: '2.8kg',
      type: 'recycled',
      date: '2025-01-20T16:00:00Z',
      status: 'completed',
    },
  ];

  const orderTimeline: OrderTimelineStep[] = [
    {
      title: 'Request Submitted',
      description: 'Your recycling request has been received',
      timestamp: '2025-08-15 09:00',
      completed: true,
    },
    {
      title: 'Agent Assigned',
      description: 'Verified agent assigned to your pickup',
      timestamp: '2025-08-19 09:30',
      completed: true,
    },
    {
      title: 'Agent En Route',
      description: 'Agent is on the way to pickup location',
      timestamp: '2025-08-20 14:15',
      completed: true,
      current: true,
    },
    {
      title: 'Items Collected',
      description: 'Items collected and being transported',
      timestamp: 'Expected: 15:00',
      completed: false,
    },
    {
      title: 'Weight Verified',
      description: 'Items weighed and verified at facility',
      timestamp: 'Expected: 16:00',
      completed: false,
    },
    {
      title: 'Payment Processed',
      description: 'ECO tokens credited to your wallet',
      timestamp: 'Expected: 16:30',
      completed: false,
    },
  ];

  const agentInfo: AgentInfo = {
    name: 'Emeka Nwankwo',
    vehicle: 'Van',
    capacity: '500kg',
    rating: 4.8,
    pickups: 342,
  };

  const tabs = [
    { id: 'active-orders', label: 'Active Orders' },
    { id: 'detailed-tracking', label: 'Detailed Tracking' },
    { id: 'order-history', label: 'Order History' },
  ];

  const handleTrack = () => {
    if (trackingId) {
      setSelectedOrder(trackingId);
      setActiveTab('detailed-tracking');
    }
  };

  return (
    <AppLayout showHeader={true} showSidebar={true} showFooter={true}>
      <div className="min-h-screen bg-gradient-to-br from-teal-900 via-slate-900 to-black p-4 lg:p-6">
        <div className="mx-auto max-w-6xl space-y-6 lg:space-y-8">
          {/* Header */}
          <div className="mb-8 text-center lg:mb-12">
            <h1 className="text-primary font-space-grotesk mb-4 flex items-center justify-center gap-3 text-3xl font-bold md:text-4xl lg:text-5xl">
              Track Your Orders <MapPin className="h-8 w-8 text-green-400 lg:h-10 lg:w-10" />
            </h1>
            <p className="secondary-text font-inter text-lg">
              Real-time tracking for your recycling pickups and deliveries
            </p>
          </div>

          {/* Search Bar */}
          <div className="mx-auto mb-8 max-w-2xl">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter tracking ID (e.g., REC12345)"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  className="w-full rounded-lg border border-slate-600 bg-slate-800 py-3 pr-4 pl-10 text-white placeholder-gray-400 transition-colors focus:border-green-500 focus:outline-none"
                />
              </div>
              <button
                onClick={handleTrack}
                className="gradient-button rounded-lg px-6 py-3 font-semibold text-black transition-all duration-200 hover:shadow-lg"
              >
                Track
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="tab-nav flex gap-1 overflow-x-auto rounded-lg bg-[#1a2928] p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`min-w-0 flex-1 rounded-md px-4 py-3 text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'text-primary bg-[#EDFFF3]'
                    : 'lighter-green-text hover:bg-white/10 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === 'active-orders' && <ActiveOrdersTab orders={activeOrders} />}
            {activeTab === 'detailed-tracking' &&
              (selectedOrder ? (
                <DetailedTrackingTab
                  orderId={selectedOrder}
                  timeline={orderTimeline}
                  agent={agentInfo}
                />
              ) : (
                <NoActiveTrackingTab />
              ))}
            {activeTab === 'order-history' && <OrderHistoryTab orders={orderHistory} />}
          </div>
        </div>
      </div>
    </AppLayout>
  );

  // Tab Components
  function ActiveOrdersTab({ orders }: { orders: TrackingOrder[] }) {
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'in-transit':
          return 'bg-blue-500/20 text-blue-400';
        case 'collected':
          return 'bg-yellow-500/20 text-yellow-400';
        case 'verified':
          return 'bg-green-500/20 text-green-400';
        default:
          return 'bg-gray-500/20 text-gray-400';
      }
    };

    const getStatusIcon = (status: string) => {
      switch (status) {
        case 'in-transit':
          return <Truck className="h-5 w-5" />;
        case 'collected':
          return <Package className="h-5 w-5" />;
        case 'verified':
          return <CheckCircle className="h-5 w-5" />;
        default:
          return <Clock className="h-5 w-5" />;
      }
    };

    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {orders.map((order) => (
          <div key={order.id} className="rounded-xl border border-[#A5D6A74D] bg-black p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-space-grotesk font-semibold text-white">{order.id}</h3>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(order.status)}`}
              >
                {order.status}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-300">{order.category}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Weight:</span>
                <span className="font-medium text-white">{order.weight}</span>
              </div>

              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-300">{order.agent}</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-300">ETA: {order.eta}</span>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  setSelectedOrder(order.id);
                  setActiveTab('detailed-tracking');
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-medium text-white transition-colors hover:bg-green-700"
              >
                {getStatusIcon(order.status)}
                Track
              </button>
              <button className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700">
                <Phone className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  function DetailedTrackingTab({
    orderId,
    timeline,
    agent,
  }: {
    orderId: string;
    timeline: OrderTimelineStep[];
    agent: AgentInfo;
  }) {
    const [pickupData, setPickupData] = useState<PickupData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchPickupData = async () => {
        try {
          const response = await fetch(`/api/v1/pickups/tracking/${orderId}`);
          if (response.ok) {
            const data = await response.json();
            setPickupData(data.data);
          }
        } catch (error) {
          console.error('Error fetching pickup:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchPickupData();
    }, [orderId]);

    if (loading) {
      return <div className="text-center text-white">Loading tracking data...</div>;
    }

    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-[#A5D6A74D] bg-black p-6 lg:col-span-2">
          <h3 className="font-space-grotesk mb-6 flex items-center gap-2 font-semibold text-white">
            <Clock className="h-5 w-5" />
            Order Timeline - {orderId}
          </h3>
          <div className="space-y-6">
            {timeline.map((step, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      step.completed
                        ? 'bg-green-500 text-white'
                        : step.current
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-600 text-gray-300'
                    }`}
                  >
                    {step.completed ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <div className="h-2 w-2 rounded-full bg-current" />
                    )}
                  </div>
                  {index < timeline.length - 1 && (
                    <div
                      className={`mt-2 h-8 w-0.5 ${step.completed ? 'bg-green-500' : 'bg-gray-600'}`}
                    />
                  )}
                </div>
                <div className="flex-1 pb-8">
                  <h4
                    className={`font-medium ${step.completed || step.current ? 'text-white' : 'text-gray-400'}`}
                  >
                    {step.title}
                  </h4>
                  <p className="mt-1 text-sm text-gray-400">{step.description}</p>
                  <p className="mt-2 text-xs text-gray-500">{step.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-[#A5D6A74D] bg-black p-6">
            <h3 className="font-space-grotesk mb-4 flex items-center gap-2 font-semibold text-white">
              <User className="h-5 w-5" />
              Assigned Agent
            </h3>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-white">{agent.name}</h4>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm text-yellow-400">{agent.rating}</span>
                  <span className="text-sm text-gray-400">({agent.pickups} pickups)</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white">
                <Phone className="h-4 w-4" />
                Call
              </button>
              <button className="rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white">
                Message
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-[#A5D6A74D] bg-black p-6">
            <h3 className="font-space-grotesk mb-4 flex items-center gap-2 font-semibold text-white">
              <MapPin className="h-5 w-5" />
              Live Location
            </h3>
            <div className="h-48 overflow-hidden rounded-lg">
              {pickupData && (
                <LiveMap
                  riderId={pickupData.riderId}
                  pickupAddress={pickupData.pickupAddress}
                  pickupCoordinates={pickupData.pickupCoordinates}
                />
              )}
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Current:</span>
                <span className="text-white">Victoria Island</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">ETA:</span>
                <span className="font-medium text-green-400">15 min</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function NoActiveTrackingTab() {
    return (
      <div className="rounded-xl border border-[#A5D6A74D] bg-black p-12 text-center">
        <MapPin className="mx-auto mb-4 h-16 w-16 text-gray-400" />
        <h3 className="font-space-grotesk mb-2 text-xl font-semibold text-white">
          No Active Tracking
        </h3>
        <p className="mb-6 text-gray-400">
          Enter a tracking ID above or select an active order to view detailed tracking information.
        </p>
        <button
          onClick={() => setActiveTab('active-orders')}
          className="gradient-button rounded-lg px-6 py-2 font-semibold text-black transition-all duration-200 hover:shadow-lg"
        >
          View Active Orders
        </button>
      </div>
    );
  }

  function OrderHistoryTab({ orders }: { orders: OrderHistoryItem[] }) {
    return (
      <div className="rounded-xl border border-[#A5D6A74D] bg-black p-6">
        <h3 className="font-space-grotesk mb-6 flex items-center gap-2 font-semibold text-white">
          <Calendar className="h-5 w-5" />
          Order History
        </h3>

        <div className="space-y-4">
          {orders.map((order, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg border border-[#D9D9D933] p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DCFCE7]">
                  <Package className="text-primary h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-white">
                    {order.amount} {order.type}
                  </p>
                  <p className="text-sm text-gray-400">
                    {new Date(order.date).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-500">{order.id}</p>
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`font-roboto rounded-lg px-2 py-1 text-xs font-medium ${
                    order.status === 'completed'
                      ? 'text-info-purple bg-[#EEEEEE]'
                      : order.status === 'collected'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                  }`}
                >
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
}
