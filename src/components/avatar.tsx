import { useEffect, useState } from "react";
import { Capacitor, CapacitorHttp } from "@capacitor/core";
import { getAccessToken } from "../lib/storage";
import { API_BASE_URL } from "../lib/config";

type Props = {
  src?: string | null;
  name?: string | null;
  size?: number;
  className?: string;
};

export function Avatar({ src, name, size = 44, className = "" }: Props) {
  const [failed, setFailed] = useState(false);
  const [resolvedSrc, setResolvedSrc] = useState<string | null>(null);

  useEffect(() => {
    setFailed(false);
  }, [src, resolvedSrc]);

  useEffect(() => {
    let active = true;
    let blobUrl: string | null = null;

    const loadProtectedImage = async () => {
      const raw = src?.trim();
      if (active) setFailed(false);
      if (!raw) {
        setResolvedSrc(null);
        return;
      }

      if (/^https?:\/\//i.test(raw)) {
        setResolvedSrc(raw);
        return;
      }

      if (raw.startsWith("//")) {
        setResolvedSrc(`https:${raw}`);
        return;
      }

      if (/^(content|file):\/\//i.test(raw)) {
        setResolvedSrc(raw);
        return;
      }

      if (!raw.startsWith("/")) {
        setResolvedSrc(raw);
        return;
      }

      const token = await getAccessToken();
      if (!token) {
        setResolvedSrc(`${API_BASE_URL}${raw}`);
        return;
      }

      try {
        if (Capacitor.isNativePlatform()) {
          const nativeResponse = await CapacitorHttp.request({
            url: `${API_BASE_URL}${raw}`,
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
            responseType: "arraybuffer",
          });
          if (nativeResponse.status < 200 || nativeResponse.status >= 300) {
            setResolvedSrc(`${API_BASE_URL}${raw}`);
            return;
          }
          const payload = nativeResponse.data as unknown;
          const contentTypeHeader = nativeResponse.headers?.["content-type"];
          const contentType =
            typeof contentTypeHeader === "string" && contentTypeHeader.length > 0
              ? contentTypeHeader
              : "image/webp";
          let buffer: Uint8Array;
          if (payload instanceof ArrayBuffer) {
            buffer = new Uint8Array(payload);
          } else if (Array.isArray(payload)) {
            buffer = new Uint8Array(payload);
          } else if (typeof payload === "string") {
            const decoded = atob(payload);
            buffer = Uint8Array.from(decoded, (char) => char.charCodeAt(0));
          } else {
            setResolvedSrc(`${API_BASE_URL}${raw}`);
            return;
          }
          const binary = buffer.buffer.slice(
            buffer.byteOffset,
            buffer.byteOffset + buffer.byteLength,
          ) as ArrayBuffer;
          const blob = new Blob([binary], { type: contentType });
          blobUrl = URL.createObjectURL(blob);
          if (active) setResolvedSrc(blobUrl);
          return;
        }
        const response = await fetch(`${API_BASE_URL}${raw}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          setResolvedSrc(`${API_BASE_URL}${raw}`);
          return;
        }
        const blob = await response.blob();
        blobUrl = URL.createObjectURL(blob);
        if (active) setResolvedSrc(blobUrl);
      } catch {
        if (active) setResolvedSrc(`${API_BASE_URL}${raw}`);
      }
    };

    void loadProtectedImage();

    return () => {
      active = false;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [src]);

  const initial = (name?.trim()?.[0] ?? "N").toUpperCase();
  const showImage = resolvedSrc && !failed;

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-rose-200 shadow-cozy ${className}`}
      style={{ width: size, height: size }}
    >
      {showImage ? (
        <img
          src={resolvedSrc}
          alt=""
          width={size}
          height={size}
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="text-base font-semibold text-rose-500">{initial}</span>
      )}
    </div>
  );
}
