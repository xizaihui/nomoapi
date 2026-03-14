// Compat layer: Semi Design Illustrations → lightweight SVG replacements
// Replaces @douyinfe/semi-illustrations with lucide-react based empty states
import React from 'react';
import { Construction, ShieldOff, Inbox, SearchX, FileQuestion } from 'lucide-react';

const makeIllustration = (Icon, label) => {
  const Comp = ({ style, className, ...rest }) => (
    <div className={className} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style }} aria-label={label} {...rest}>
      <Icon className='h-24 w-24 text-muted-foreground/40' strokeWidth={1} />
    </div>
  );
  Comp.displayName = label;
  return Comp;
};

export const IllustrationConstruction = makeIllustration(Construction, 'IllustrationConstruction');
export const IllustrationConstructionDark = makeIllustration(Construction, 'IllustrationConstructionDark');
export const IllustrationNoAccess = makeIllustration(ShieldOff, 'IllustrationNoAccess');
export const IllustrationNoAccessDark = makeIllustration(ShieldOff, 'IllustrationNoAccessDark');
export const IllustrationNoContent = makeIllustration(Inbox, 'IllustrationNoContent');
export const IllustrationNoContentDark = makeIllustration(Inbox, 'IllustrationNoContentDark');
export const IllustrationNoResult = makeIllustration(SearchX, 'IllustrationNoResult');
export const IllustrationNoResultDark = makeIllustration(SearchX, 'IllustrationNoResultDark');
export const IllustrationNotFound = makeIllustration(FileQuestion, 'IllustrationNotFound');
export const IllustrationNotFoundDark = makeIllustration(FileQuestion, 'IllustrationNotFoundDark');
