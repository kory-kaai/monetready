import Image from "next/image";

const LOGO_SRC = "/monetready_logo.png";

interface BrandLogoProps {
  size?: number;
  className?: string;
  priority?: boolean;
}

export function BrandLogo({ size = 36, className, priority = false }: BrandLogoProps) {
  return (
    <Image
      src={LOGO_SRC}
      alt=""
      width={size}
      height={size}
      className={className ?? "logo-img"}
      priority={priority}
      aria-hidden
    />
  );
}

interface BrandLockupProps {
  name: string;
  size?: number;
  className?: string;
  priority?: boolean;
}

export function BrandLockup({ name, size = 36, className, priority = false }: BrandLockupProps) {
  return (
    <span className={className ?? "logo"}>
      <BrandLogo size={size} priority={priority} />
      <span>{name}</span>
    </span>
  );
}
