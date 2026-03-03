import { icons, type LucideProps } from 'lucide-react';
import { Package } from 'lucide-react';

/**
 * Convert a kebab-case icon name (e.g. "wifi", "air-vent") to the
 * PascalCase key used by lucide-react's `icons` map (e.g. "Wifi", "AirVent").
 */
function toPascalCase(str: string): string {
  return str
    .split('-')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join('');
}

/**
 * Parse an icon string that may use the `"lucide:name"` convention
 * (from the old project) or just a plain icon name like `"wifi"`.
 * Returns the kebab-case icon name portion.
 */
function parseIconName(icon: string): string {
  const parts = icon.split(':');
  return parts.length > 1 ? parts[1] : parts[0];
}

type DynamicIconProps = LucideProps & {
  /** Icon identifier, e.g. "lucide:wifi", "wifi", "air-vent". */
  name?: string | null;
  /** Fallback rendered when the icon name is missing or not found. */
  fallback?: React.ReactNode;
};

/**
 * Renders a lucide-react icon dynamically from a string name.
 *
 * Supports the `"lucide:iconname"` format stored in the database
 * as well as plain kebab-case names (e.g. `"wifi"`, `"air-vent"`).
 *
 * @example
 * <DynamicIcon name="lucide:wifi" className="h-5 w-5" />
 * <DynamicIcon name="air-vent" size={20} />
 */
export function DynamicIcon({ name, fallback, ...props }: DynamicIconProps) {
  if (!name) {
    return <>{fallback ?? <Package {...props} />}</>;
  }

  const kebabName = parseIconName(name.trim());
  const pascalName = toPascalCase(kebabName);
  const IconComponent = (icons as Record<string, React.ComponentType<LucideProps>>)[pascalName];

  if (!IconComponent) {
    return <>{fallback ?? <Package {...props} />}</>;
  }

  return <IconComponent {...props} />;
}
