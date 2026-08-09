"use client";

import Image from "next/image";

const LOGO_SRC = "/monetready_logo.png";

interface PageLoaderProps {
  message?: string;
  submessage?: string;
}

export function PageLoader({
  message = "Forging your workspace",
  submessage = "Preparing your Monetready dashboard",
}: PageLoaderProps) {
  return (
    <div className="page-loader" role="status" aria-live="polite" aria-busy="true">
      <div className="page-loader-backdrop" aria-hidden />
      <div className="page-loader-stage">
        <div className="page-loader-rings" aria-hidden>
          <span className="page-loader-ring ring-1" />
          <span className="page-loader-ring ring-2" />
          <span className="page-loader-ring ring-3" />
        </div>

        <div className="page-loader-core">
          <div className="page-loader-logo-wrap">
            <Image
              src={LOGO_SRC}
              alt=""
              width={72}
              height={72}
              className="page-loader-logo"
              priority
              aria-hidden
            />
          </div>
          <div className="page-loader-shimmer" aria-hidden />
        </div>

        <div className="page-loader-copy">
          <p className="page-loader-message">{message}</p>
          <p className="page-loader-submessage">{submessage}</p>
          <div className="page-loader-progress" aria-hidden>
            <span className="page-loader-progress-bar" />
          </div>
        </div>
      </div>
    </div>
  );
}
