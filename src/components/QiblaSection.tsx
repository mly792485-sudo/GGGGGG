/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Compass, 
  MapPin, 
  Navigation, 
  CheckCircle2, 
  AlertTriangle,
  LocateFixed,
  Sparkles,
  RotateCw,
  Sliders,
  Radio,
  HelpCircle
} from 'lucide-react';

interface QiblaSectionProps {
  latitude: number | null;
  longitude: number | null;
  isEn?: boolean;
}

// Kaaba Coordinates (Makkah Al-Mukarramah)
const KAABA_LAT = 21.422487;
const KAABA_LNG = 39.826206;

// Formula to calculate Qibla direction from any latitude & longitude (Great Circle Bearing)
export function calculateQiblaBearing(lat: number, lng: number): number {
  const phiK = (KAABA_LAT * Math.PI) / 180.0;
  const lambdaK = (KAABA_LNG * Math.PI) / 180.0;
  const phi = (lat * Math.PI) / 180.0;
  const lambda = (lng * Math.PI) / 180.0;

  const deltaLambda = lambdaK - lambda;

  const y = Math.sin(deltaLambda) * Math.cos(phiK);
  const x = Math.cos(phi) * Math.sin(phiK) - Math.sin(phi) * Math.cos(phiK) * Math.cos(deltaLambda);

  let qibla = (Math.atan2(y, x) * 180.0) / Math.PI;
  return (qibla + 360.0) % 360.0;
}

// Formula to calculate distance to Kaaba in kilometers (Haversine Formula)
export function calculateDistanceToKaaba(lat: number, lng: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((KAABA_LAT - lat) * Math.PI) / 180;
  const dLng = ((KAABA_LNG - lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat * Math.PI) / 180) *
      Math.cos((KAABA_LAT * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export default function QiblaSection({ latitude: propLat, longitude: propLng, isEn = false }: QiblaSectionProps) {
  // Live GPS Coordinates
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(() => {
    if (propLat && propLng) return { lat: propLat, lng: propLng };
    return { lat: 24.7136, lng: 46.6753 }; // Default Riyadh
  });

  const [gpsStatus, setGpsStatus] = useState<'locating' | 'ready' | 'error'>('ready');
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [locationName, setLocationName] = useState<string>(isEn ? 'Satellite GPS Coordinates' : 'موقعك الفعلي عبر الأقمار الصناعية (GPS)');
  const [watchId, setWatchId] = useState<number | null>(null);

  // Compass Sensor Heading
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);
  const [sensorType, setSensorType] = useState<'magnetometer' | 'absolute' | 'ios' | 'standard' | 'manual'>('manual');
  const [isSensorActive, setIsSensorActive] = useState<boolean>(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [manualRotateAngle, setManualRotateAngle] = useState<number>(0);
  const [showCalibrationTip, setShowCalibrationTip] = useState<boolean>(false);

  // Filtered heading to prevent jitter
  const lastHeadingRef = useRef<number>(0);

  // Calculate live Qibla bearing based on current coordinates
  const qiblaAngle = currentCoords 
    ? Math.round(calculateQiblaBearing(currentCoords.lat, currentCoords.lng))
    : 255;

  const distanceKm = currentCoords
    ? calculateDistanceToKaaba(currentCoords.lat, currentCoords.lng)
    : 800;

  // Active angle relative to user's heading
  const currentHeading = deviceHeading !== null ? deviceHeading : manualRotateAngle;
  const relativeQiblaAngle = (qiblaAngle - currentHeading + 360) % 360;

  // Is phone aligned within 3 degrees of Kaaba
  const angleDiff = Math.abs((relativeQiblaAngle + 180) % 360 - 180);
  const isAligned = angleDiff <= 3;
  const hasVibratedRef = useRef<boolean>(false);

  // Haptic feedback when aligned
  useEffect(() => {
    if (isAligned && !hasVibratedRef.current) {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate([70, 50, 70]);
        } catch {
          // ignore
        }
      }
      hasVibratedRef.current = true;
    } else if (!isAligned) {
      hasVibratedRef.current = false;
    }
  }, [isAligned]);

  // Request & Watch High Accuracy GPS Location
  const requestLiveGPS = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGpsStatus('error');
      return;
    }

    setGpsStatus('locating');

    // Single precise fetch
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setCurrentCoords({ lat: latitude, lng: longitude });
        setGpsAccuracy(Math.round(accuracy));
        setGpsStatus('ready');
        setLocationName(isEn ? 'Live Satellite GPS' : 'موقعك المباشر عبر الأقمار الصناعية (GPS)');
      },
      (err) => {
        console.warn('GPS location error:', err);
        setGpsStatus('error');
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0
      }
    );

    // Also continuously watch position if user is moving
    if (watchId === null) {
      try {
        const id = navigator.geolocation.watchPosition(
          (pos) => {
            const { latitude, longitude, accuracy } = pos.coords;
            setCurrentCoords({ lat: latitude, lng: longitude });
            setGpsAccuracy(Math.round(accuracy));
            setGpsStatus('ready');
          },
          (err) => console.warn('Watch GPS error:', err),
          { enableHighAccuracy: true, maximumAge: 2000 }
        );
        setWatchId(id);
      } catch {
        // ignore
      }
    }
  }, [isEn, watchId]);

  // Cleanup watchPosition on unmount
  useEffect(() => {
    return () => {
      if (watchId !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  // Low pass filter for smoothing compass angle
  const applySmoothing = (rawAngle: number) => {
    let diff = rawAngle - lastHeadingRef.current;
    while (diff < -180) diff += 360;
    while (diff > 180) diff -= 360;
    const smoothed = (lastHeadingRef.current + diff * 0.35 + 360) % 360;
    lastHeadingRef.current = smoothed;
    return Math.round(smoothed);
  };

  // Orientation Handler callback
  const handleDeviceOrientation = useCallback((e: DeviceOrientationEvent) => {
    let heading: number | null = null;

    // 1. iOS Safari true compass heading
    if ((e as any).webkitCompassHeading !== undefined && (e as any).webkitCompassHeading !== null) {
      heading = (e as any).webkitCompassHeading;
      setSensorType('ios');
    } 
    // 2. Android absolute device orientation (deviceorientationabsolute or absolute: true)
    else if ((e as any).absolute === true && e.alpha !== null) {
      heading = (360 - e.alpha) % 360;
      setSensorType('absolute');
    }
    // 3. Standard alpha fallback
    else if (e.alpha !== null) {
      heading = (360 - e.alpha) % 360;
      setSensorType('standard');
    }

    if (heading !== null && !isNaN(heading)) {
      const smoothedHeading = applySmoothing(heading);
      setDeviceHeading(smoothedHeading);
      setIsSensorActive(true);
      setPermissionError(null);
    }
  }, []);

  // Request Orientation Sensor Permissions (Dynamic Permission Flow)
  const requestOrientationPermission = async () => {
    setPermissionError(null);

    // iOS 13+ requires explicit user gesture permission
    if (typeof (DeviceOrientationEvent as any)?.requestPermission === 'function') {
      try {
        const response = await (DeviceOrientationEvent as any).requestPermission();
        if (response === 'granted') {
          attachOrientationListeners();
          setIsSensorActive(true);
        } else {
          setPermissionError(isEn ? 'Permission was denied. Please allow motion sensor access in browser settings.' : 'تم رفض الإذن. يرجى تفعيل إذن مستشعرات الحركة من إعدادات المتصفح.');
          setIsSensorActive(false);
        }
      } catch (err: any) {
        console.warn('iOS motion permission error:', err);
        setPermissionError(isEn ? 'Unable to request motion permission.' : 'تعذر الحصول على إذن الحركة من المتصفح.');
        attachOrientationListeners();
      }
    } else {
      // Android / Other Browsers
      attachOrientationListeners();
    }
  };

  const attachOrientationListeners = () => {
    if (typeof window === 'undefined') return;

    // Check if deviceorientationabsolute is supported (Android Chrome with true north)
    if ('ondeviceorientationabsolute' in window) {
      window.addEventListener('deviceorientationabsolute', handleDeviceOrientation as any, true);
    }
    
    // Always attach standard deviceorientation as backup
    window.addEventListener('deviceorientation', handleDeviceOrientation, true);
    setIsSensorActive(true);
  };

  // Initial Auto-Request Hook
  useEffect(() => {
    requestLiveGPS();

    // If browser supports orientation without explicit requestPermission (e.g. Android)
    if (typeof window !== 'undefined' && typeof (DeviceOrientationEvent as any)?.requestPermission !== 'function') {
      attachOrientationListeners();
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('deviceorientation', handleDeviceOrientation, true);
        if ('ondeviceorientationabsolute' in window) {
          window.removeEventListener('deviceorientationabsolute', handleDeviceOrientation as any, true);
        }
      }
    };
  }, [requestLiveGPS, handleDeviceOrientation]);

  return (
    <div className="w-full bg-[#061214] border border-emerald-500/20 rounded-3xl p-4 sm:p-7 space-y-6 text-right font-sans shadow-2xl relative overflow-hidden">
      
      {/* Background glowing ambience */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-emerald-500/5 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-amber-400/5 blur-3xl pointer-events-none rounded-full" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-4 border-b border-emerald-500/20 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-900/30 text-white">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span>{isEn ? 'Live Accurate Qibla Compass' : 'بوصلة القبلة الذكية والمستشعر اللحظي'}</span>
              {isSensorActive && (
                <span className="flex items-center gap-1 text-[10px] bg-emerald-900/80 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40">
                  <Radio className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
                  <span>{isEn ? 'Sensor Live' : 'مستشعر حي'}</span>
                </span>
              )}
            </h3>
            <p className="text-[11px] text-emerald-400 font-medium">
              {isEn ? 'Real-time magnetometer & satellite GPS azimuth' : 'تحديد فوري فائق الدقة باتجاه الكعبة المشرفة عبر المستشعرات والأقمار الصناعية'}
            </p>
          </div>
        </div>

        {/* Action Controls: Refresh GPS & Sensor Request */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            id="refresh-gps-btn"
            onClick={requestLiveGPS}
            disabled={gpsStatus === 'locating'}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 text-xs font-bold rounded-xl border border-emerald-500/30 transition-all cursor-pointer active:scale-95 shadow-xs"
            title={isEn ? 'Update GPS Location' : 'تحديث إحداثيات GPS'}
          >
            <LocateFixed className={`w-3.5 h-3.5 ${gpsStatus === 'locating' ? 'animate-spin text-amber-400' : 'text-emerald-400'}`} />
            <span>{gpsStatus === 'locating' ? (isEn ? 'Locating...' : 'جارٍ التحديث...') : (isEn ? 'GPS' : 'تحديث الموقع')}</span>
          </button>

          {!isSensorActive && (
            <button
              id="activate-sensor-btn"
              onClick={requestOrientationPermission}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-black rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>{isEn ? 'Activate Sensor' : 'تشغيل البوصلة الحية'}</span>
            </button>
          )}

          <button
            onClick={() => setShowCalibrationTip(!showCalibrationTip)}
            className="p-1.5 bg-[#091B1F] hover:bg-[#0E272D] text-slate-400 hover:text-amber-300 rounded-xl border border-emerald-500/20 text-xs transition-all cursor-pointer"
            title={isEn ? 'Calibration help' : 'إرشادات المعايرة'}
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Permission Error or Calibration Banner */}
      {permissionError && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{permissionError}</span>
          </div>
          <button
            onClick={requestOrientationPermission}
            className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold text-xs shrink-0"
          >
            {isEn ? 'Retry' : 'إعادة المحاولة'}
          </button>
        </div>
      )}

      {showCalibrationTip && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-amber-200 text-xs flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">{isEn ? 'Compass Calibration Tip:' : '💡 نصيحة لتحسين دقة البوصلة:'}</p>
            <p className="text-[11px] text-amber-300/80 mt-0.5">
              {isEn 
                ? 'Hold your phone flat in the palm of your hand and move it in a figure-8 pattern for 3-5 seconds away from magnetic cases or laptops.' 
                : 'ضع هاتفك بشكل أفقي ومسطح على راحة يدك، ثم حركه في الهواء على شكل رقم (8) لمدة 3 ثوانٍ بعيداً عن الأجسام المغناطيسية لتحصل على أقصى دقة.'}
            </p>
          </div>
        </div>
      )}

      {/* Main Grid: Visual Compass + Information Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
        
        {/* Visual Animated Compass Dial (Span 7) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center p-2 sm:p-4">
          <div className="relative w-68 h-68 sm:w-80 sm:h-80 flex items-center justify-center">
            
            {/* Outer Glowing Degree Ring */}
            <div className={`absolute inset-0 rounded-full border-4 transition-all duration-300 ${
              isAligned 
                ? 'border-emerald-400 shadow-[0_0_50px_rgba(52,211,153,0.7)] ring-8 ring-emerald-500/25 animate-pulse scale-102' 
                : 'border-emerald-500/20 shadow-[0_0_25px_rgba(6,78,59,0.3)]'
            }`} />

            {/* Degree Ticks around the circle */}
            <div className="absolute inset-2 rounded-full border border-emerald-500/10 pointer-events-none" />

            {/* Inner Dark Dial */}
            <div className="w-[88%] h-[88%] rounded-full bg-gradient-to-b from-[#091D21] to-[#03090B] border border-emerald-500/30 flex items-center justify-center relative shadow-inner overflow-hidden">
              
              {/* Subtle crosshair grid */}
              <div className="absolute inset-0 border-t border-b border-emerald-500/10 top-1/2 -translate-y-1/2" />
              <div className="absolute inset-0 border-l border-r border-emerald-500/10 left-1/2 -translate-x-1/2" />

              {/* Cardinal directions (N, E, S, W) rotated by current device heading */}
              <div 
                className="absolute inset-0 w-full h-full transition-transform duration-150 ease-out"
                style={{ transform: `rotate(${-currentHeading}deg)` }}
              >
                <span className="absolute top-2.5 left-1/2 -translate-x-1/2 text-xs font-black text-rose-400 font-mono tracking-widest">N (شمال)</span>
                <span className="absolute bottom-2.5 left-1/2 -translate-x-1/2 text-xs font-black text-slate-400 font-mono tracking-widest">S (جنوب)</span>
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400 font-mono tracking-widest">E (شرق)</span>
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400 font-mono tracking-widest">W (غرب)</span>
              </div>

              {/* Kaaba Direction Indicator Arrow (Pointing to Kaaba) */}
              <div 
                className="absolute inset-0 w-full h-full flex flex-col items-center justify-center transition-transform duration-150 ease-out"
                style={{ transform: `rotate(${relativeQiblaAngle}deg)` }}
              >
                {/* Kaaba Icon at the tip */}
                <div className="absolute top-3.5 flex flex-col items-center z-30">
                  <div className={`w-9 h-9 rounded-xl bg-black border-2 transition-all flex items-center justify-center text-sm shadow-xl ${
                    isAligned 
                      ? 'border-emerald-400 shadow-emerald-400/60 scale-110' 
                      : 'border-amber-400 shadow-amber-400/40'
                  }`}>
                    🕋
                  </div>
                  <div className={`w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] mt-0.5 ${
                    isAligned ? 'border-b-emerald-400' : 'border-b-amber-400'
                  }`} />
                </div>

                {/* Needle Spine */}
                <div className={`w-1.5 h-40 rounded-full transition-colors ${
                  isAligned 
                    ? 'bg-gradient-to-t from-transparent via-emerald-400 to-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.8)]' 
                    : 'bg-gradient-to-t from-transparent via-amber-400 to-amber-300'
                }`} />
              </div>

              {/* Center Core Display */}
              <div className={`w-20 h-20 rounded-full bg-[#061416] border-2 flex flex-col items-center justify-center shadow-xl relative z-20 transition-all ${
                isAligned ? 'border-emerald-400 ring-4 ring-emerald-500/30' : 'border-emerald-500/30'
              }`}>
                <span className="text-base font-black text-amber-300 font-mono tracking-tight">
                  {qiblaAngle}°
                </span>
                <span className="text-[9px] text-emerald-300 font-bold">
                  {isEn ? 'Qibla' : 'القبلة'}
                </span>
              </div>
            </div>
          </div>

          {/* Alignment Status Banner */}
          <div className={`mt-5 py-2.5 px-6 rounded-full text-xs font-black flex items-center gap-2 border transition-all ${
            isAligned
              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-xl shadow-emerald-950/60 scale-105'
              : 'bg-slate-900/70 border-slate-800 text-slate-300'
          }`}>
            {isAligned ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-bounce" />
                <span>{isEn ? '🎯 Aligned with Kaaba! You are facing Qibla' : '🎯 وجهتك الآن صحيحة تماماً باتجاه الكعبة المشرفة'}</span>
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>{isEn ? `Rotate phone ${Math.round(relativeQiblaAngle)}° to face Qibla` : `أدِر هاتفك بمقدار ${Math.round(relativeQiblaAngle)}° باتجاه الرمز 🕋`}</span>
              </>
            )}
          </div>
        </div>

        {/* Informational Panel & Accuracy Stats (Span 5) */}
        <div className="lg:col-span-5 space-y-3.5">
          
          {/* GPS Coordinates Box */}
          <div className="p-4 rounded-2xl bg-[#091B1F] border border-emerald-500/20 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>{locationName}</span>
              </span>
              {gpsAccuracy !== null && (
                <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30 font-mono">
                  {isEn ? `Accuracy: ±${gpsAccuracy}m` : `الدقة: ±${gpsAccuracy}م`}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-[#050F11] p-2.5 rounded-xl border border-emerald-500/10 text-slate-300">
              <div>
                <span className="text-slate-500 block text-[9px]">خط العرض (Latitude)</span>
                <span className="font-bold text-white">{currentCoords?.lat.toFixed(4)}° N</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px]">خط الطول (Longitude)</span>
                <span className="font-bold text-white">{currentCoords?.lng.toFixed(4)}° E</span>
              </div>
            </div>
          </div>

          {/* Kaaba Info Card */}
          <div className="p-4 rounded-2xl bg-[#091B1F] border border-emerald-500/20 space-y-2">
            <h4 className="text-xs font-black text-amber-300 flex items-center gap-1.5">
              <span>🕋</span>
              <span>{isEn ? 'Kaaba Coordinates & Distance' : 'بيانات الكعبة المشرفة ومسافة البعد'}</span>
            </h4>
            
            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex items-center justify-between py-1 border-b border-emerald-500/10">
                <span className="text-slate-400">{isEn ? 'Exact Qibla Azimuth:' : 'زاوية القبلة من الشمال الحقيقي:'}</span>
                <span className="font-mono font-bold text-amber-400">{qiblaAngle}°</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-emerald-500/10">
                <span className="text-slate-400">{isEn ? 'Distance to Makkah:' : 'المسافة المباشرة إلى مكة:'}</span>
                <span className="font-mono font-bold text-emerald-300">{distanceKm.toLocaleString()} {isEn ? 'km' : 'كم'}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">{isEn ? 'Compass Mode:' : 'حالة بوصلة المستشعر:'}</span>
                <span className={`font-bold flex items-center gap-1.5 ${isSensorActive ? 'text-emerald-400' : 'text-amber-400'}`}>
                  <span className={`w-2 h-2 rounded-full ${isSensorActive ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                  <span>
                    {isSensorActive 
                      ? (sensorType === 'ios' ? 'iOS Magnetometer' : sensorType === 'absolute' ? 'Android Absolute' : 'Live Sensor') 
                      : (isEn ? 'Manual Slider' : 'يدوي / انقر لتفعيل البوصلة')}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Manual rotation fallback slider if sensor not granted or previewing */}
          <div className="p-3.5 rounded-2xl bg-[#091B1F] border border-emerald-500/20 space-y-2">
            <label className="text-[11px] font-bold text-slate-300 flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Sliders className="w-3.5 h-3.5" />
                <span>{isSensorActive ? (isEn ? 'Manual Heading Test:' : 'اختبار الزاوية يدوياً:') : (isEn ? 'Manual Compass Slider:' : 'تدوير البوصلة يدوياً:')}</span>
              </span>
              <span className="font-mono text-amber-400 font-bold">{currentHeading}°</span>
            </label>
            <input
              id="qibla-manual-slider"
              type="range"
              min="0"
              max="359"
              value={currentHeading}
              onChange={(e) => {
                setDeviceHeading(null);
                setManualRotateAngle(Number(e.target.value));
              }}
              className="w-full accent-amber-400 cursor-pointer h-1.5 bg-[#050F11] rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[9px] text-slate-500 font-mono">
              <span>0° N</span>
              <span>90° E</span>
              <span>180° S</span>
              <span>270° W</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
