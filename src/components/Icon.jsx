import {
  Wind,
  Droplets,
  Wheat,
  Zap,
  Shield,
  HeartPulse,
  Sprout,
  Sun,
  FlaskConical,
  Rocket,
  Satellite,
  Radio,
  Moon,
  Globe,
} from 'lucide-react';

const ICONS = { Wind, Droplets, Wheat, Zap, Shield, HeartPulse, Sprout, Sun, FlaskConical, Rocket, Satellite, Radio, Moon, Globe };

/** Look up a lucide icon by the name used in missionConfig. */
export default function Icon({ name, size = 20, className = '', color }) {
  const Cmp = ICONS[name] || Rocket;
  return <Cmp size={size} className={className} color={color} aria-hidden="true" />;
}
