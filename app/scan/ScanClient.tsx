'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Camera,
  CheckCircle2,
  Keyboard,
  RefreshCw,
  ScanBarcode,
  ShieldAlert,
  Sparkles,
  X,
} from 'lucide-react'
import { BottomNav } from '@/components/layout/BottomNav'
import { PageHeader } from '@/components/layout/PageHeader'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { cn } from '@/lib/utils/cn'

type CameraPermissionState = 'idle' | 'prompt' | 'granted' | 'denied' | 'unsupported'

interface BarcodeDetectionResult {
  rawValue?: string
  format?: string
}

interface BarcodeDetectorInstance {
  detect: (source: ImageBitmapSource) => Promise<BarcodeDetectionResult[]>
}

interface BarcodeDetectorConstructor {
  new (options?: { formats?: string[] }): BarcodeDetectorInstance
  getSupportedFormats?: () => Promise<string[]>
}

declare global {
  interface Window {
    BarcodeDetector?: BarcodeDetectorConstructor
  }
}

const SCAN_TIPS = [
  '밝은 곳에서 바코드를 정면으로 맞춰주세요.',
  '초점이 흐리면 카메라 렌즈를 한 번 닦아주세요.',
  '권한이 차단돼도 아래에서 다시 요청하거나 브라우저 설정에서 허용할 수 있습니다.',
]

const BARCODE_FORMATS = [
  'ean_13',
  'ean_8',
  'upc_a',
  'upc_e',
  'code_128',
  'code_39',
  'qr_code',
]

function getCameraErrorMessage(error: unknown) {
  if (!(error instanceof DOMException)) {
    return '카메라를 시작하지 못했습니다.'
  }

  if (error.name === 'NotAllowedError') {
    return '카메라 권한이 차단되었습니다. 아래 안내에 따라 브라우저 설정에서 허용해주세요.'
  }

  if (error.name === 'NotFoundError') {
    return '사용 가능한 카메라를 찾지 못했습니다.'
  }

  if (error.name === 'NotReadableError') {
    return '다른 앱이 이미 카메라를 사용 중입니다. 다른 앱을 종료한 뒤 다시 시도해주세요.'
  }

  if (error.name === 'SecurityError') {
    return '보안 정책으로 카메라 접근이 차단되었습니다. HTTPS 또는 로컬 환경에서 다시 시도해주세요.'
  }

  return '카메라를 시작하지 못했습니다.'
}

export function ScanClient() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const detectorRef = useRef<BarcodeDetectorInstance | null>(null)
  const detectIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const permissionStatusRef = useRef<PermissionStatus | null>(null)

  const [isScanning, setIsScanning] = useState(false)
  const [isStartingCamera, setIsStartingCamera] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [permissionState, setPermissionState] = useState<CameraPermissionState>('idle')
  const [supportsBarcodeDetection, setSupportsBarcodeDetection] = useState(false)
  const [detectedCode, setDetectedCode] = useState<string | null>(null)
  const [detectedFormat, setDetectedFormat] = useState<string | null>(null)

  const stopDetection = useCallback(() => {
    if (detectIntervalRef.current) {
      clearInterval(detectIntervalRef.current)
      detectIntervalRef.current = null
    }
  }, [])

  const stopCamera = useCallback(() => {
    stopDetection()

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    setCameraReady(false)
    setIsScanning(false)
  }, [stopDetection])

  const syncPermissionState = useCallback(async () => {
    if (!('mediaDevices' in navigator) || !navigator.mediaDevices?.getUserMedia) {
      setPermissionState('unsupported')
      return
    }

    if (!navigator.permissions?.query) {
      setPermissionState((current) => (current === 'idle' ? 'prompt' : current))
      return
    }

    try {
      const status = await navigator.permissions.query({
        name: 'camera' as PermissionName,
      })

      permissionStatusRef.current = status
      setPermissionState(status.state as CameraPermissionState)
      status.onchange = () => {
        setPermissionState(status.state as CameraPermissionState)
      }
    } catch {
      setPermissionState((current) => (current === 'idle' ? 'prompt' : current))
    }
  }, [])

  const startDetection = async () => {
    if (!videoRef.current || !window.BarcodeDetector) {
      setSupportsBarcodeDetection(false)
      return
    }

    try {
      const supportedFormats = window.BarcodeDetector.getSupportedFormats
        ? await window.BarcodeDetector.getSupportedFormats()
        : BARCODE_FORMATS

      const formats = supportedFormats.filter((format) => BARCODE_FORMATS.includes(format))
      detectorRef.current = new window.BarcodeDetector(
        formats.length > 0 ? { formats } : undefined,
      )
      setSupportsBarcodeDetection(true)
    } catch {
      detectorRef.current = new window.BarcodeDetector()
      setSupportsBarcodeDetection(true)
    }

    stopDetection()

    detectIntervalRef.current = setInterval(async () => {
      if (!videoRef.current || !detectorRef.current || videoRef.current.readyState < 2) {
        return
      }

      try {
        const barcodes = await detectorRef.current.detect(videoRef.current)
        const match = barcodes.find((barcode) => barcode.rawValue?.trim())

        if (!match?.rawValue) {
          return
        }

        setDetectedCode(match.rawValue)
        setDetectedFormat(match.format ?? null)
        setError(null)
        stopCamera()
      } catch {
        setSupportsBarcodeDetection(false)
        stopDetection()
      }
    }, 500)
  }

  const requestCameraAccess = async () => {
    if (!('mediaDevices' in navigator) || !navigator.mediaDevices?.getUserMedia) {
      setPermissionState('unsupported')
      setError('이 브라우저는 카메라 접근을 지원하지 않습니다.')
      return
    }

    setIsStartingCamera(true)
    setError(null)
    setDetectedCode(null)
    setDetectedFormat(null)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
        },
        audio: false,
      })

      streamRef.current = stream
      setPermissionState('granted')
      setIsScanning(true)

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      setCameraReady(true)
      await startDetection()
    } catch (cameraError) {
      stopCamera()
      setPermissionState(
        cameraError instanceof DOMException && cameraError.name === 'NotAllowedError'
          ? 'denied'
          : permissionState,
      )
      setError(getCameraErrorMessage(cameraError))
    } finally {
      setIsStartingCamera(false)
    }
  }

  const handleRetryPermission = async () => {
    await syncPermissionState()
    await requestCameraAccess()
  }

  useEffect(() => {
    void syncPermissionState()

    return () => {
      if (permissionStatusRef.current) {
        permissionStatusRef.current.onchange = null
      }
      stopCamera()
    }
  }, [stopCamera, syncPermissionState])

  const permissionBadgeVariant =
    permissionState === 'granted'
      ? 'success'
      : permissionState === 'denied'
        ? 'danger'
        : 'primary'

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col bg-background sm:min-h-[calc(100dvh-4rem)]">
      <main className="container mx-auto flex-1 max-w-3xl px-4 py-6 pb-[calc(5rem+env(safe-area-inset-bottom))]">
        <PageHeader
          title="바코드 스캔"
          description="카메라 권한을 허용하면 실시간으로 바코드를 인식하고 물품 추가 화면으로 넘길 수 있습니다."
          onBack={() => router.back()}
          actions={
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Keyboard className="h-4 w-4" />}
              onClick={() => router.push('/items/add', { scroll: false })}
            >
              수동 등록
            </Button>
          }
        />

        {error && (
          <Alert
            variant={permissionState === 'denied' ? 'warning' : 'info'}
            title={permissionState === 'denied' ? '카메라 권한 필요' : '안내'}
            className="mb-6"
          >
            {error}
          </Alert>
        )}

        {detectedCode && (
          <Alert variant="success" title="바코드를 인식했습니다" className="mb-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-foreground">{detectedCode}</p>
                {detectedFormat ? (
                  <p className="text-xs text-muted-foreground">형식: {detectedFormat}</p>
                ) : null}
              </div>
              <Button
                size="sm"
                variant="success"
                onClick={() =>
                  router.push(
                    `/items/add?barcode=${encodeURIComponent(detectedCode)}`,
                    { scroll: false },
                  )
                }
              >
                이 값으로 등록
              </Button>
            </div>
          </Alert>
        )}

        <section className="mb-6">
          <Card className="overflow-hidden border-primary/10 bg-gradient-to-br from-card via-card to-primary/5 p-0">
            <div className="grid gap-0 md:grid-cols-[1.1fr_0.9fr]">
              <CardContent className="p-6 sm:p-8">
                <Badge variant={permissionBadgeVariant} size="sm" dot className="mb-4">
                  {permissionState === 'granted'
                    ? '카메라 허용됨'
                    : permissionState === 'denied'
                      ? '권한 차단됨'
                      : permissionState === 'unsupported'
                        ? '브라우저 미지원'
                        : '권한 확인 필요'}
                </Badge>

                <h2 className="mb-3 text-2xl font-bold text-foreground sm:text-3xl">
                  {isScanning
                    ? '바코드를 프레임 안에 맞춰주세요'
                    : '카메라를 켜고 바코드를 바로 인식하세요'}
                </h2>
                <p className="mb-6 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                  {supportsBarcodeDetection
                    ? '지원 브라우저에서는 자동 인식 후 바로 물품 추가 화면으로 연결됩니다.'
                    : '카메라 프리뷰는 동작하며, 자동 인식은 지원 브라우저에서만 활성화됩니다.'}
                </p>

                <div className="flex flex-wrap gap-3">
                  {isScanning ? (
                    <Button
                      variant="outline"
                      size="lg"
                      leftIcon={<X className="h-5 w-5" />}
                      onClick={stopCamera}
                    >
                      스캔 중지
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      isLoading={isStartingCamera}
                      loadingText="카메라 연결 중..."
                      leftIcon={<Camera className="h-5 w-5" />}
                      onClick={() => {
                        void requestCameraAccess()
                      }}
                    >
                      카메라 켜기
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="lg"
                    leftIcon={<RefreshCw className="h-5 w-5" />}
                    onClick={() => {
                      void handleRetryPermission()
                    }}
                  >
                    권한 다시 확인
                  </Button>
                </div>
              </CardContent>

              <div className="flex items-center justify-center p-6 pt-0 md:p-8 md:pl-0">
                <div className="relative w-full max-w-sm">
                  <div className="rounded-[28px] border border-border/70 bg-background p-4 shadow-soft">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-[20px] bg-secondary/40">
                      <video
                        ref={videoRef}
                        className={cn(
                          'h-full w-full object-cover transition-opacity duration-200',
                          cameraReady ? 'opacity-100' : 'opacity-0',
                        )}
                        autoPlay
                        muted
                        playsInline
                      />

                      {!cameraReady && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
                          <div className="mb-4 rounded-full border border-primary/20 bg-primary/10 p-5 text-primary">
                            {permissionState === 'denied' ? (
                              <ShieldAlert className="h-10 w-10" />
                            ) : (
                              <ScanBarcode className="h-10 w-10" />
                            )}
                          </div>
                          <p className="text-sm font-semibold text-foreground">
                            {permissionState === 'denied'
                              ? '권한이 차단되어 있습니다'
                              : '카메라 프리뷰 대기 중'}
                          </p>
                          <p className="mt-2 text-xs leading-5 text-muted-foreground">
                            {permissionState === 'denied'
                              ? '주소창 옆 사이트 설정에서 카메라를 허용한 뒤, 아래 버튼으로 다시 연결할 수 있습니다.'
                              : '카메라를 시작하면 이 영역에 실시간 미리보기가 표시됩니다.'}
                          </p>
                        </div>
                      )}

                      <div className="absolute inset-6 rounded-3xl border border-dashed border-primary/60" />
                      <div className="pointer-events-none absolute inset-x-10 top-1/2 h-px -translate-y-1/2 bg-primary/80 shadow-[0_0_24px_rgba(0,0,0,0.12)]" />
                      <div
                        className={cn(
                          'absolute bottom-5 left-5 right-5 rounded-2xl p-3 backdrop-blur',
                          cameraReady ? 'bg-background/85' : 'bg-background/90',
                        )}
                      >
                        <p className="text-sm font-semibold text-foreground">
                          {cameraReady ? '실시간 카메라 연결됨' : '카메라 미리보기'}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                          {cameraReady
                            ? supportsBarcodeDetection
                              ? '바코드를 찾는 중입니다. 인식되면 자동으로 결과가 저장됩니다.'
                              : '이 브라우저에서는 자동 인식이 제한될 수 있습니다.'
                            : '후면 카메라를 우선 요청하며, 차단된 경우에도 다시 허용 절차를 진행할 수 있습니다.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="absolute -right-3 -top-3 rounded-full border border-border bg-card p-3 shadow-soft">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">권한 허용 방법</CardTitle>
              <CardDescription>차단된 뒤에도 아래 순서로 다시 허용할 수 있습니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                '주소창 왼쪽의 자물쇠 또는 사이트 아이콘을 누릅니다.',
                '사이트 설정에서 카메라를 허용으로 변경합니다.',
                '이 페이지로 돌아와 권한 다시 확인을 누릅니다.',
              ].map((step) => (
                <div
                  key={step}
                  className="flex items-start gap-3 rounded-xl bg-secondary/30 px-4 py-3"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" />
                  <p className="text-sm leading-6 text-muted-foreground">{step}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">스캔 팁</CardTitle>
              <CardDescription>인식률을 높이기 위한 기본 가이드입니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {SCAN_TIPS.map((tip) => (
                <div
                  key={tip}
                  className="flex items-start gap-3 rounded-xl bg-secondary/30 px-4 py-3"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" />
                  <p className="text-sm leading-6 text-muted-foreground">{tip}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </main>

      <BottomNav />
    </div>
  )
}
