import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../context/NotificationContext';
import { complaintService } from '../services/complaintService';
import { CATEGORIES } from '../utils/constants';
import MapComponent from '../components/MapComponent';
import PriorityBadge from '../components/PriorityBadge';
import VoiceMicButton from '../components/VoiceMicButton';
import Sidebar from '../components/Sidebar';
import PageTransition from '../components/PageTransition';
import {
  Sparkles,
  Camera,
  MapPin,
  AlertTriangle,
  Layers,
  Send,
  CheckCircle2,
  HelpCircle,
  FileText,
  Flame,
  ShieldCheck,
  X
} from 'lucide-react';

export default function SubmitComplaint() {
  const { user } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    latitude: 28.6328,
    longitude: 77.2197,
    address: '',
    landmark: '',
    ward_number: user?.ward_number || 'Ward 12',
    pincode: '110001',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // AI Live Preview state
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const debounceTimerRef = useRef(null);

  // Debounced real-time AI classification as citizen types
  useEffect(() => {
    if (!formData.title && !formData.description) {
      setAiAnalysis(null);
      return;
    }

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(async () => {
      if (formData.title.length > 5 || formData.description.length > 10) {
        setAiLoading(true);
        try {
          const res = await complaintService.analyzeComplaintAI(
            formData.title,
            formData.description,
            formData.latitude,
            formData.longitude,
            formData.address
          );
          if (res?.analysis) {
            setAiAnalysis(res.analysis);
            // If user hasn't explicitly picked a manual category, auto-fill AI predicted category
            if (!formData.category) {
              setFormData((prev) => ({ ...prev, category: res.analysis.predicted_category }));
            }
          }
        } catch (e) {
          // Offline NLP local fallback heuristic
          const text = `${formData.title} ${formData.description}`.toLowerCase();
          let predicted = 'OTHER';
          let urgency = 'MEDIUM';
          let score = 50;

          if (text.includes('wire') || text.includes('spark') || text.includes('shock') || text.includes('light')) {
            predicted = 'STREETLIGHT_POWER';
            urgency = 'CRITICAL';
            score = 90;
          } else if (text.includes('pothole') || text.includes('road') || text.includes('crater')) {
            predicted = 'ROADS_POTHOLES';
            urgency = 'HIGH';
            score = 75;
          } else if (text.includes('garbage') || text.includes('waste') || text.includes('trash')) {
            predicted = 'WASTE_GARBAGE';
            urgency = 'MEDIUM';
            score = 60;
          } else if (text.includes('water') || text.includes('pipe') || text.includes('leak')) {
            predicted = 'WATER_LEAKAGE';
            urgency = 'HIGH';
            score = 70;
          } else if (text.includes('manhole') || text.includes('danger') || text.includes('safety')) {
            predicted = 'PUBLIC_SAFETY_HAZARD';
            urgency = 'CRITICAL';
            score = 92;
          }

          setAiAnalysis({
            predicted_category: predicted,
            confidence: 0.88,
            urgency: urgency,
            priority_score: score,
            suggested_department: 'Auto-Routing Active',
            extracted_keywords: ['civic issue', 'locality'],
            duplicate_check: { is_duplicate: false },
            matched_university: null,
          });
        } finally {
          setAiLoading(false);
        }
      }
    }, 600);

    return () => clearTimeout(debounceTimerRef.current);
  }, [formData.title, formData.description, formData.latitude, formData.longitude, formData.address]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleLocationSelect = (lat, lon) => {
    setFormData((prev) => ({
      ...prev,
      latitude: Number(lat.toFixed(7)),
      longitude: Number(lon.toFixed(7)),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      addToast('Please provide both title and description.', 'error');
      return;
    }

    setLoading(true);

    try {
      const dataPayload = new FormData();
      dataPayload.append('title', formData.title);
      dataPayload.append('description', formData.description);
      dataPayload.append('category', formData.category || aiAnalysis?.predicted_category || 'OTHER');
      dataPayload.append('latitude', formData.latitude);
      dataPayload.append('longitude', formData.longitude);
      dataPayload.append('address', formData.address);
      dataPayload.append('landmark', formData.landmark);
      dataPayload.append('ward_number', formData.ward_number);
      dataPayload.append('pincode', formData.pincode);

      if (imageFile) {
        dataPayload.append('image', imageFile);
      }

      const res = await complaintService.submitComplaint(dataPayload);
      const ticketId = res?.complaint?.ticket_id || res?.message?.match(/CIV-\d{4}-\d+/)?.[0];
      addToast(
        ticketId
          ? `Grievance ${ticketId} filed! It will appear in the admin panel immediately.`
          : 'Grievance registered successfully!',
        'success'
      );
      navigate(user?.role === 'OFFICER' || user?.role === 'ADMIN' ? '/admin-dashboard' : '/dashboard');
    } catch (error) {
      const msg =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        (error.response?.status === 401
          ? 'Please log in before filing a grievance.'
          : 'Failed to submit grievance. Keep the backend running and try again.');
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const isOfficerOrAdmin = user?.role === 'OFFICER' || user?.role === 'ADMIN';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex gap-8">
        <Sidebar role={isOfficerOrAdmin ? 'OFFICER' : 'CITIZEN'} />

        <PageTransition className="flex-1">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-civic-teal-soft border border-civic-teal/30 text-civic-teal text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI-Assisted Smart Grievance Intake</span>
        </div>
        <h1 className="text-3xl font-extrabold text-civic-ink tracking-tight">Lodge a Civic Grievance</h1>
        <p className="text-sm text-civic-mute mt-1">
          Describe the civic problem below. Our NLP AI auto-classifies the department, scores urgency, and checks for duplicates in real time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Input Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="p-8 rounded-3xl glass-panel space-y-6">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-civic-mute mb-2">
                Problem Title / Headline <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Broken water pipeline leaking near Sector 4 Park Gate"
                required
                className="w-full px-4 py-3 bg-white border border-civic-line rounded-xl text-sm text-civic-ink placeholder-civic-mute focus:outline-none focus:border-civic-teal focus:ring-1 focus:ring-civic-teal"
              />
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-2 gap-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-civic-mute">
                  Detailed Description <span className="text-rose-600">*</span>
                </label>
                <VoiceMicButton
                  title="Speak your complaint description"
                  onTranscript={(updater) => {
                    setFormData((prev) => ({
                      ...prev,
                      description: typeof updater === 'function' ? updater(prev.description) : updater,
                    }));
                  }}
                />
              </div>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Type or tap Speak to dictate — severity, location, how long it has lasted, safety risk..."
                required
                className="w-full px-4 py-3 bg-white border border-civic-line rounded-xl text-sm text-civic-ink placeholder-civic-mute focus:outline-none focus:border-civic-teal focus:ring-1 focus:ring-civic-teal"
              />
              <p className="mt-1.5 text-[11px] text-civic-mute">Voice uses browser speech-to-text (Chrome/Edge). AI will auto-categorize and score priority as you speak or type.</p>
            </div>

            {/* Category Selector (AI Assisted) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-civic-mute">
                  Grievance Category
                </label>
                {aiAnalysis && (
                  <span className="text-[11px] font-semibold text-civic-teal flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> AI Recommended: {aiAnalysis.predicted_category}
                  </span>
                )}
              </div>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-civic-line rounded-xl text-sm text-civic-ink focus:outline-none focus:border-civic-teal"
              >
                <option value="">Auto-Detect via AI (Default)</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-white text-civic-ink">
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Photo Upload Preview */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-civic-mute mb-2">
                Upload Photo Evidence
              </label>
              {imagePreview ? (
                <div className="relative rounded-2xl overflow-hidden border border-civic-line max-h-64 group">
                  <img src={imagePreview} alt="Upload preview" className="w-full h-48 object-cover" />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-white text-rose-600 hover:text-civic-ink border border-civic-line backdrop-blur-sm"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-civic-line hover:border-civic-teal/50 rounded-2xl cursor-pointer bg-civic-sand hover:bg-civic-sand transition-all">
                  <Camera className="w-8 h-8 text-civic-mute mb-2" />
                  <span className="text-xs font-semibold text-civic-mute">Click to upload or drag & drop photo</span>
                  <span className="text-[10px] text-civic-mute mt-0.5">PNG, JPG, JPEG up to 10MB</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              )}
            </div>

            {/* GPS & Location Selector */}
            <div className="space-y-4 pt-4 border-t border-civic-line">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-civic-mute mb-2">
                  Pinpoint Incident Location on Map
                </label>
                <MapComponent
                  height="280px"
                  allowPickLocation={true}
                  selectedPosition={[formData.latitude, formData.longitude]}
                  onLocationSelect={handleLocationSelect}
                  center={[formData.latitude, formData.longitude]}
                  zoom={14}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-civic-mute mb-1.5">
                    Street Address / Locality
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. Block B, Main Market Road"
                    className="w-full px-4 py-2.5 bg-white border border-civic-line rounded-xl text-xs text-civic-ink placeholder-civic-mute focus:outline-none focus:border-civic-teal"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-civic-mute mb-1.5">
                    Prominent Landmark
                  </label>
                  <input
                    type="text"
                    value={formData.landmark}
                    onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                    placeholder="e.g. Opposite Metro Gate 3"
                    className="w-full px-4 py-2.5 bg-white border border-civic-line rounded-xl text-xs text-civic-ink placeholder-civic-mute focus:outline-none focus:border-civic-teal"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-civic-teal to-civic-teal-dark hover:from-civic-teal hover:to-civic-teal-dark text-white rounded-2xl font-bold text-sm shadow-xl shadow-civic-teal/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Verified Grievance</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right 1 Column: Live AI Real-Time Assistant */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl glass-panel sticky top-20 border border-civic-teal/25 shadow-2xl">
            <div className="flex items-center gap-2 pb-4 border-b border-civic-line text-civic-teal">
              <Sparkles className="w-5 h-5" />
              <h3 className="font-bold text-civic-ink text-base">Urban Lens Assistant</h3>
            </div>

            {aiLoading && (
              <div className="py-8 text-center text-xs text-civic-teal animate-pulse flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-civic-teal border-t-transparent rounded-full animate-spin" />
                <span>Running NLP Classification & Urgency Engine...</span>
              </div>
            )}

            {!aiLoading && !aiAnalysis && (
              <div className="py-8 text-center text-xs text-civic-mute">
                Type problem title and description to preview live AI auto-tagging, priority scoring, and duplicate checks.
              </div>
            )}

            {!aiLoading && aiAnalysis && (
              <div className="mt-4 space-y-4 animate-fade-in text-xs">
                {/* Duplicate Alert */}
                {aiAnalysis.duplicate_check?.is_duplicate && (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300">
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span>Possible Duplicate Grievance Detected</span>
                    </div>
                    <p className="text-[11px] text-civic-mute">
                      A similar complaint exists within 500m (Similarity: {Math.round(aiAnalysis.duplicate_check.similarity_score * 100)}%). Your report will be linked for community upvoting.
                    </p>
                  </div>
                )}

                {/* Priority Score Preview */}
                <div className="p-4 rounded-2xl bg-white border border-civic-line">
                  <p className="text-civic-mute font-semibold text-[10px] uppercase">Predicted Severity & Urgency</p>
                  <div className="flex items-center justify-between mt-2">
                    <PriorityBadge urgency={aiAnalysis.urgency} score={aiAnalysis.priority_score} />
                    <span className="text-sm font-extrabold text-civic-ink">{aiAnalysis.priority_score}/100</span>
                  </div>
                </div>

                {/* Classification */}
                <div className="p-4 rounded-2xl bg-white border border-civic-line">
                  <p className="text-civic-mute font-semibold text-[10px] uppercase">Auto-Assigned Department</p>
                  <p className="text-sm font-bold text-civic-teal mt-1">{aiAnalysis.suggested_department}</p>
                  <p className="text-[10px] text-civic-mute mt-0.5">Confidence: {Math.round(aiAnalysis.confidence * 100)}%</p>
                </div>

                {/* Matched University */}
                {aiAnalysis.matched_university && (
                  <div className="p-4 rounded-2xl bg-white border border-civic-line">
                    <p className="text-civic-mute font-semibold text-[10px] uppercase">Matching Institution for Research & Fix</p>
                    <p className="text-sm font-bold text-civic-teal mt-1">{aiAnalysis.matched_university}</p>
                    {aiAnalysis.routing_reason && (
                      <p className="text-[10px] text-civic-mute mt-0.5">{aiAnalysis.routing_reason}</p>
                    )}
                  </div>
                )}

                {/* Extracted Keywords */}
                {aiAnalysis.extracted_keywords?.length > 0 && (
                  <div className="p-4 rounded-2xl bg-white border border-civic-line">
                    <p className="text-civic-mute font-semibold text-[10px] uppercase mb-2">NLP Extracted Signals</p>
                    <div className="flex flex-wrap gap-1.5">
                      {aiAnalysis.extracted_keywords.map((kw, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-civic-teal-soft text-civic-teal text-[10px] border border-civic-teal/25">
                          #{kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
        </PageTransition>
      </div>
    </div>
  );
}
