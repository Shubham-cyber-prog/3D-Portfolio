import * as React from "react"

const MOBILE_BREAKPOINT = 768
const TABLET_BREAKPOINT = 1024

// Types define karo
interface DeviceInfo {
  isMobile: boolean | undefined
  isTablet: boolean | undefined
  isDesktop: boolean | undefined
  screenSize: { width: number; height: number } | undefined
  orientation: string | undefined
  touchSupported: boolean | undefined
}

interface MotionData {
  alpha: number
  beta: number
  gamma: number
}

interface BatteryData {
  level: number
  charging: boolean
}

interface NetworkData {
  isOnline: boolean
  effectiveType: string
}

// Enhanced device detection hook
export function useDevice(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = React.useState<DeviceInfo>({
    isMobile: undefined,
    isTablet: undefined,
    isDesktop: undefined,
    screenSize: undefined,
    orientation: undefined,
    touchSupported: undefined
  })

  React.useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      setDeviceInfo({
        isMobile: width < MOBILE_BREAKPOINT,
        isTablet: width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT,
        isDesktop: width >= TABLET_BREAKPOINT,
        screenSize: { width, height },
        orientation: width > height ? 'landscape' : 'portrait',
        touchSupported: 'ontouchstart' in window || navigator.maxTouchPoints > 0
      })
    }

    // Initial check
    checkDevice()

    // Debounced resize handler
    let resizeTimeout: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(checkDevice, 100)
    }

    // Orientation change handler
    const handleOrientation = () => {
      setTimeout(checkDevice, 100)
    }

    // Event listeners
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleOrientation)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleOrientation)
      clearTimeout(resizeTimeout)
    }
  }, [])

  return deviceInfo
}

// Simplified mobile-only hook (backward compatible)
export function useIsMobile(): boolean {
  const { isMobile } = useDevice()
  return !!isMobile
}

// Hook for responsive values
export function useResponsiveValue<T>(mobileValue: T, tabletValue: T, desktopValue: T): T {
  const { isMobile, isTablet, isDesktop } = useDevice()
  
  if (isMobile) return mobileValue
  if (isTablet) return tabletValue
  if (isDesktop) return desktopValue
  
  return desktopValue // default fallback
}

// Hook for conditional rendering based on screen size
export function useBreakpoint(breakpoint: number = MOBILE_BREAKPOINT): boolean {
  const [isBelow, setIsBelow] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const checkBreakpoint = () => {
      setIsBelow(window.innerWidth < breakpoint)
    }

    checkBreakpoint()

    let resizeTimeout: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(checkBreakpoint, 50)
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(resizeTimeout)
    }
  }, [breakpoint])

  return !!isBelow
}

// Hook for scroll direction detection
export function useScrollDirection(): { direction: string; position: number } {
  const [scrollDirection, setScrollDirection] = React.useState('up')
  const [scrollY, setScrollY] = React.useState(0)

  React.useEffect(() => {
    let lastScrollY = window.scrollY
    
    const updateScrollDirection = () => {
      const scrollY = window.scrollY
      const direction = scrollY > lastScrollY ? 'down' : 'up'
      
      if (direction !== scrollDirection && Math.abs(scrollY - lastScrollY) > 10) {
        setScrollDirection(direction)
      }
      
      setScrollY(scrollY)
      lastScrollY = scrollY > 0 ? scrollY : 0
    }

    // Throttled scroll handler
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateScrollDirection()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [scrollDirection])

  return { direction: scrollDirection, position: scrollY }
}

// Hook for viewport visibility
export function useViewportVisibility(threshold: number = 0.1): [React.RefObject<HTMLDivElement>, boolean] {
  const [isVisible, setIsVisible] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [threshold])

  return [ref, isVisible]
}

// Hook for device motion (gyroscope)
export function useDeviceMotion(): MotionData {
  const [motion, setMotion] = React.useState<MotionData>({ alpha: 0, beta: 0, gamma: 0 })

  React.useEffect(() => {
    const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
      setMotion({
        alpha: event.alpha || 0, // rotation around z-axis
        beta: event.beta || 0,   // rotation around x-axis
        gamma: event.gamma || 0  // rotation around y-axis
      })
    }

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleDeviceOrientation)
    }

    return () => {
      if (window.DeviceOrientationEvent) {
        window.removeEventListener('deviceorientation', handleDeviceOrientation)
      }
    }
  }, [])

  return motion
}

// Hook for network status
export function useNetworkStatus(): NetworkData {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine)
  const [effectiveType, setEffectiveType] = React.useState('')

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    // Connection API (if available)
    const updateConnection = () => {
      const connection = (navigator as any).connection
      if (connection) {
        setEffectiveType(connection.effectiveType)
      }
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    const connection = (navigator as any).connection
    if (connection) {
      connection.addEventListener('change', updateConnection)
      updateConnection()
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      
      if (connection) {
        connection.removeEventListener('change', updateConnection)
      }
    }
  }, [])

  return { isOnline, effectiveType }
}

// Hook for battery status
export function useBatteryStatus(): BatteryData {
  const [battery, setBattery] = React.useState<BatteryData>({ level: 1, charging: false })

  React.useEffect(() => {
    const updateBattery = (battery: any) => {
      setBattery({
        level: battery.level,
        charging: battery.charging
      })
    }

    if ((navigator as any).getBattery) {
      (navigator as any).getBattery().then((battery: any) => {
        updateBattery(battery)
        battery.addEventListener('levelchange', () => updateBattery(battery))
        battery.addEventListener('chargingchange', () => updateBattery(battery))
      })
    }
  }, [])

  return battery
}

// Helper component for info items
interface InfoItemProps {
  label: string
  value: React.ReactNode
}

function InfoItem({ label, value }: InfoItemProps) {
  return (
    <div className="bg-black/30 rounded-lg p-4">
      <div className="text-sm text-gray-400 font-medium">{label}</div>
      <div className="text-white font-semibold mt-1">{value}</div>
    </div>
  )
}

// Demo component showing all hooks in action
export function DeviceDemo() {
  const device = useDevice()
  const scroll = useScrollDirection()
  const [ref, isVisible] = useViewportVisibility()
  const motion = useDeviceMotion()
  const network = useNetworkStatus()
  const battery = useBatteryStatus()
  
  const buttonSize = useResponsiveValue('small', 'medium', 'large')
  const isBelow1024 = useBreakpoint(1024)

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-purple-900 to-black text-white min-h-screen">
      {/* Device Info Card */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <h2 className="text-2xl font-bold mb-4 text-purple-300">📱 Device Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <InfoItem label="Device Type" value={
            device.isMobile ? "📱 Mobile" : 
            device.isTablet ? "📟 Tablet" : 
            "💻 Desktop"
          } />
          <InfoItem label="Screen Size" value={
            device.screenSize ? `${device.screenSize.width} × ${device.screenSize.height}` : 'Loading...'
          } />
          <InfoItem label="Orientation" value={device.orientation || 'Loading...'} />
          <InfoItem label="Touch Support" value={device.touchSupported ? "✅ Yes" : "❌ No"} />
          <InfoItem label="Scroll Direction" value={`${scroll.direction} (${scroll.position}px)`} />
          <InfoItem label="Viewport Visible" value={isVisible ? "✅ Yes" : "❌ No"} />
        </div>
      </div>

      {/* Motion & Sensors Card */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <h2 className="text-2xl font-bold mb-4 text-green-300">🎮 Motion & Sensors</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InfoItem label="Alpha (Z-axis)" value={motion.alpha.toFixed(2)} />
          <InfoItem label="Beta (X-axis)" value={motion.beta.toFixed(2)} />
          <InfoItem label="Gamma (Y-axis)" value={motion.gamma.toFixed(2)} />
        </div>
      </div>

      {/* Network & Battery Card */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <h2 className="text-2xl font-bold mb-4 text-blue-300">🌐 Network & Battery</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoItem label="Online Status" value={
            network.isOnline ? 
            <span className="text-green-400">✅ Online ({network.effectiveType})</span> : 
            <span className="text-red-400">❌ Offline</span>
          } />
          <InfoItem label="Battery" value={
            <div className="flex items-center space-x-2">
              <div className="w-20 bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${battery.level * 100}%` }}
                />
              </div>
              <span>{battery.charging ? "⚡" : ""}{(battery.level * 100).toFixed(0)}%</span>
            </div>
          } />
        </div>
      </div>

      {/* Responsive Demo Card */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <h2 className="text-2xl font-bold mb-4 text-yellow-300">🎨 Responsive Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoItem label="Button Size" value={buttonSize} />
          <InfoItem label="Below 1024px" value={isBelow1024 ? "✅ Yes" : "❌ No"} />
          <InfoItem label="Responsive Text" value={
            <p className={useResponsiveValue("text-sm", "text-base", "text-lg")}>
              This text changes size based on screen!
            </p>
          } />
        </div>
      </div>

      {/* Visibility Test Element */}
      <div ref={ref} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center">
        <h3 className="text-xl font-bold mb-2">
          {isVisible ? "🎉 I'm visible on screen!" : "👀 Scroll to see me..."}
        </h3>
        <p className="text-gray-300">This card detects when it's in the viewport</p>
      </div>

      {/* Interactive Demo */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <h2 className="text-2xl font-bold mb-4 text-pink-300">🎯 Interactive Demo</h2>
        <div className="flex flex-wrap gap-4">
          <button className={`
            px-6 py-3 rounded-full font-semibold transition-all duration-300
            bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105
            ${useResponsiveValue("text-sm", "text-base", "text-lg")}
          `}>
            Responsive Button
          </button>
          
          <button className={`
            px-6 py-3 rounded-full font-semibold transition-all duration-300
            bg-gradient-to-r from-blue-500 to-cyan-500 hover:scale-105
            ${useResponsiveValue("text-xs", "text-sm", "text-base")}
          `}>
            {useResponsiveValue("Small", "Medium", "Large")} Text
          </button>
        </div>
      </div>
    </div>
  )
}