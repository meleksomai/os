import {
  Alert02Icon,
  AlertDiamondIcon,
  ArrowRight02Icon,
  CheckmarkCircle02Icon,
  ComputerIcon as ComputerIconPrimitive,
  Copy01Icon,
  FavouriteIcon,
  InformationSquareIcon,
  Loading02Icon,
  Location01Icon,
  Mail02Icon,
  Moon02Icon,
  MultiplicationSignIcon,
  SparklesIcon as SparklesIconPrimitive,
  Sun01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type HugeiconsIconProps } from "@hugeicons/react";
import { cn } from "../lib/utils";

interface IconProps extends Omit<HugeiconsIconProps, "icon"> {}

const BaseIcon = ({
  icon,
  strokeWidth = 2,
  className,
  ...props
}: HugeiconsIconProps) => (
  <HugeiconsIcon
    className={cn(
      "pointer-events-none flex size-4 items-center justify-self-center",
      className
    )}
    icon={icon}
    strokeWidth={strokeWidth}
    {...props}
  />
);

export function GitHubIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      fill="currentcolor"
      height="18"
      viewBox="0 0 18 18"
      width="18"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>GitHub</title>
      <path d="M9.375 0C4.6095 0 0.75 3.8595 0.75 8.625C0.75 12.4418 3.219 15.6652 6.64725 16.8075C7.0785 16.8832 7.23975 16.6245 7.23975 16.398C7.23975 16.1933 7.22925 15.5145 7.22925 14.7915C5.0625 15.1905 4.50225 14.2635 4.32975 13.779C4.23225 13.5308 3.81225 12.765 3.44475 12.5602C3.14325 12.3982 2.712 11.9993 3.43425 11.9888C4.11375 11.9783 4.599 12.6142 4.761 12.873C5.53725 14.178 6.777 13.8105 7.27275 13.584C7.34775 13.0237 7.57425 12.6465 7.8225 12.4305C5.90325 12.2153 3.8985 11.4713 3.8985 8.172C3.8985 7.2345 4.23225 6.45825 4.782 5.8545C4.69575 5.6385 4.39425 4.75425 4.86825 3.5685C4.86825 3.5685 5.5905 3.342 7.2405 4.45275C7.9305 4.2585 8.66325 4.16175 9.39675 4.16175C10.1295 4.16175 10.863 4.25925 11.553 4.45275C13.203 3.3315 13.9245 3.5685 13.9245 3.5685C14.3993 4.75425 14.097 5.6385 14.0107 5.8545C14.5605 6.45825 14.895 7.22325 14.895 8.172C14.895 11.4818 12.879 12.2145 10.9598 12.4305C11.2725 12.7005 11.5417 13.218 11.5417 14.0265C11.5417 15.18 11.5312 16.107 11.5312 16.398C11.5312 16.6245 11.6933 16.8945 12.1238 16.8083C15.5318 15.6652 18 12.4305 18 8.625C18 3.8595 14.1405 0 9.375 0Z" />
    </svg>
  );
}

export const InfoIcon = (props: IconProps) => (
  <BaseIcon icon={InformationSquareIcon} {...props} />
);

export const LoveIcon = (props: IconProps) => (
  <BaseIcon icon={FavouriteIcon} {...props} />
);

export const AlertIcon = (props: IconProps) => (
  <BaseIcon icon={Alert02Icon} {...props} />
);

export const ErrorIcon = (props: IconProps) => (
  <BaseIcon icon={AlertDiamondIcon} {...props} />
);

export const SuccessIcon = (props: IconProps) => (
  <BaseIcon icon={CheckmarkCircle02Icon} {...props} />
);

export const SunIcon = (props: IconProps) => (
  <BaseIcon icon={Sun01Icon} {...props} />
);

export const MoonIcon = (props: IconProps) => (
  <BaseIcon icon={Moon02Icon} {...props} />
);

export const ArrowRightIcon = (props: IconProps) => (
  <BaseIcon icon={ArrowRight02Icon} {...props} />
);

export const SparklesIcon = (props: IconProps) => (
  <BaseIcon icon={SparklesIconPrimitive} {...props} />
);

export const LoadingIcon = (props: IconProps) => (
  <BaseIcon icon={Loading02Icon} {...props} />
);

export const CloseIcon = (props: IconProps) => (
  <BaseIcon icon={MultiplicationSignIcon} {...props} />
);

export const ComputerIcon = (props: IconProps) => (
  <BaseIcon icon={ComputerIconPrimitive} {...props} />
);

export const CheckIcon = (props: IconProps) => (
  <BaseIcon icon={Tick02Icon} {...props} />
);

export const CopyIcon = (props: IconProps) => (
  <BaseIcon icon={Copy01Icon} {...props} />
);

export const MailIcon = (props: IconProps) => (
  <BaseIcon icon={Mail02Icon} {...props} />
);

export const LocationIcon = (props: IconProps) => (
  <BaseIcon icon={Location01Icon} {...props} />
);
